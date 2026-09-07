/**
 * Kiosk intake flow -- symptom capture, HPI, AYUSH fields, document upload
 * + OCR, and submission (MongoDB / Mongoose).
 *
 * Changes from original:
 *  - RED_FLAG_RULES moved to ../redFlagRules.js (configurable, AYUSH-aware)
 *  - Multer: 10 MB fileSize limit with clean 413 response
 *  - POST /:id/submit: fire-and-forget AI summary via ../summarizer.js
 *  - POST /:id/summarize: on-demand summary (requireRole doctor/hospital_admin)
 */
const express  = require("express");
const path     = require("path");
const fs       = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer   = require("multer");

const { IntakeSession, Patient, Document, genToken } = require("../db");
const { requireAuth, requireRole } = require("../auth");
const { processDocument } = require("../ocr");
const { buildFhirBundle } = require("../fhirBuilder");
const { detectRedFlag } = require("../redFlagRules");
const { generateSummary } = require("../summarizer");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 10 MB limit -- returns 413 with a clear message when exceeded
const multerUpload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");

function multerMiddleware(req, res) {
  return new Promise((resolve, reject) => {
    multerUpload(req, res, (err) => { if (err) reject(err); else resolve(); });
  });
}

async function sessionOr404(id, res) {
  try {
    const s = await IntakeSession.findById(id);
    if (!s) { res.status(404).json({ error: "Session not found" }); return null; }
    return s;
  } catch (e) {
    res.status(404).json({ error: "Session not found" });
    return null;
  }
}

async function assertAccess(req, res, session) {
  const patient = await Patient.findById(session.patient_id);
  if (!patient) { res.status(404).json({ error: "Patient not found" }); return false; }

  if (req.user.role === "patient") {
    if (req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
      res.status(403).json({ error: "Cannot access another patient's session" });
      return false;
    }
    return true;
  }

  // Doctor or Hospital Admin access
  if (req.user.role === "doctor") {
    // If assigned to this doctor, permit immediately
    if (session.doctor_id && (session.doctor_id.toString() === req.user.id.toString() || session.doctor_id.toString() === req.user._id?.toString())) {
      return true;
    }
    // If patient is from same hospital, permit
    if (req.user.hospital_id && patient.hospital_id && req.user.hospital_id.toString() === patient.hospital_id.toString()) {
      return true;
    }
    // If unassigned kiosk session, permit doctor to view
    if (!session.doctor_id) {
      return true;
    }
    // Permissive fallback so doctors can review self-service patients
    return true;
  }

  return true;
}

// ---------- List sessions ----------
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, patient_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patient_id) filter.patient_id = patient_id;
    const sessions = await IntakeSession.find(filter).sort({ created_at: -1 }).limit(100);
    const results = await Promise.all(sessions.map(async (s) => {
      const p = await Patient.findById(s.patient_id);
      return {
        session_id: s.id, token: s.token, status: s.status,
        patient_name: p ? p.name : "Unknown Patient",
        patient_id: s.patient_id, chief_complaint: s.chief_complaint,
        red_flag: !!s.red_flag, ayush_mode: !!s.ayush_mode,
        submitted_at: s.submitted_at, created_at: s.created_at,
      };
    }));
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message || "Failed to list sessions" }); }
});

// ---------- Create session ----------
router.post("/", requireAuth, async (req, res) => {
  try {
    const { patient_id, doctor_id, ayush_mode = false, consent_given = true, status = "in_progress", chief_complaint } = req.body;
    const patient = await Patient.findById(patient_id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString())
      return res.status(403).json({ error: "Cannot start a session for another patient" });

    const assignedDocId = doctor_id || patient.doctor_id;
    if (assignedDocId && assignedDocId !== patient.doctor_id)
      await Patient.findByIdAndUpdate(patient.id, { doctor_id: assignedDocId });

    const token = await genToken();
    const submitted_at = status === "submitted" ? new Date().toISOString() : null;
    const assignedHospId = req.body.hospital_id || patient.hospital_id || req.user.hospital_id;
    const assignedKioskId = req.body.kiosk_id || req.user.kiosk_id || "KIOSK-01";

    const session = await IntakeSession.create({
      token, patient_id: patient.id, doctor_id: assignedDocId || null,
      hospital_id: assignedHospId, kiosk_id: assignedKioskId,
      ayush_mode: !!ayush_mode, consent_given: !!consent_given, status,
      chief_complaint: chief_complaint || null, submitted_at,
    });
    res.status(201).json({ session_id: session.id, token, status });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to create session" }); }
});

// ---------- Symptom update (uses configurable redFlagRules.js) ----------
router.patch("/:id/symptom", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const { symptom_id, chief_complaint, transcript } = req.body;
    const { red_flag, red_flag_reason } = detectRedFlag(symptom_id, chief_complaint, !!s.ayush_mode);
    await IntakeSession.findByIdAndUpdate(s.id, {
      symptom_id, chief_complaint, transcript: transcript || null, red_flag, red_flag_reason,
    });
    res.json({ red_flag, red_flag_reason });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to update symptoms" }); }
});

router.patch("/:id/hpi", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const details = Array.isArray(req.body.details) ? req.body.details : [];
    await IntakeSession.findByIdAndUpdate(s.id, { hpi_details: details });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to update HPI" }); }
});

router.patch("/:id/ayush", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const AYUSH_FIELDS = ["prakriti","vikriti","agni","koshtha","satmya","sara","samhanana","ahara_shakti","vyayama_shakti","vaya"];
    const existing = s.ayush_fields || {};
    const fields = { ...existing };
    for (const f of AYUSH_FIELDS) { if (req.body[f] !== undefined) fields[f] = req.body[f]; }
    await IntakeSession.findByIdAndUpdate(s.id, { ayush_fields: fields });
    res.json({ ok: true, ayush_fields: fields });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to update AYUSH fields" }); }
});

router.patch("/:id/parameters", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const parameters = Array.isArray(req.body.parameters) ? req.body.parameters : [];
    await IntakeSession.findByIdAndUpdate(s.id, { parameters });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to update parameters" }); }
});

router.patch("/:id/notes", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const { pmh, allergies } = req.body;
    const updates = {};
    if (pmh !== undefined) updates.pmh = pmh;
    if (allergies !== undefined) updates.allergies = allergies;
    await IntakeSession.findByIdAndUpdate(s.id, updates);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to update notes" }); }
});

// ---------- Document upload with OCR (10 MB cap) ----------
router.post("/:id/document", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;

    try {
      await multerMiddleware(req, res);
    } catch (multerErr) {
      if (multerErr.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "File too large. Maximum allowed size is 10 MB. Please compress or crop the document."
        });
      }
      return res.status(400).json({ error: multerErr.message || "File upload failed" });
    }

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const ext = path.extname(req.file.originalname) || ".png";
    const fname = `${uuidv4()}${ext}`;
    const finalPath = path.join(UPLOAD_DIR, fname);
    fs.renameSync(req.file.path, finalPath);

    let result;
    try {
      result = await processDocument(finalPath);
    } catch (err) {
      try { fs.unlinkSync(finalPath); } catch (_) {}
      return res.status(503).json({ error: `OCR failed: ${err.message}` });
    }

    const doc = await Document.create({
      session_id: s.id, filename: fname,
      raw_ocr_text: result.raw_text,
      extracted_meds: result.medications,
      extracted_labs: result.labs,
    });

    res.json({ document_id: doc.id, raw_text: result.raw_text, medications: result.medications, labs: result.labs });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to process document" }); }
});

// ---------- Submit session (FHIR + fire-and-forget AI summary) ----------
router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const patient = await Patient.findById(s.patient_id);
    const docs    = await Document.find({ session_id: s.id });

    const { doctor_id } = req.body || {};
    const assignedDocId = doctor_id || s.doctor_id || patient.doctor_id || null;

    const submitted_at = new Date().toISOString();
    const sessionForBundle = { ...s.toObject(), id: s.id, doctor_id: assignedDocId, hpi_details: Array.isArray(s.hpi_details) ? s.hpi_details : [] };
    const bundle = buildFhirBundle({ ...patient.toObject(), id: patient.id }, sessionForBundle, docs.map(d => d.toObject()));

    const updateFields = { status: "submitted", submitted_at, fhir_bundle: bundle };
    if (assignedDocId) {
      updateFields.doctor_id = assignedDocId;
      await Patient.findByIdAndUpdate(patient.id, { doctor_id: assignedDocId });
    }

    await IntakeSession.findByIdAndUpdate(s.id, updateFields);

    // Respond immediately -- don't block on (potentially slow) LLM
    res.json({ ok: true, status: "submitted", token: s.token });

    // Fire-and-forget AI summary and enrich extracted_labs
    setImmediate(async () => {
      try {
        const summary = await generateSummary(s.toObject(), docs.map(d => d.toObject()));
        if (summary) {
          await IntakeSession.findByIdAndUpdate(s.id, { summary });
          const { extractLabs } = require("../extract");
          const summaryLabs = extractLabs(summary);
          if (summaryLabs.length > 0) {
            await Document.updateMany(
              { session_id: s.id },
              { $set: { extracted_labs: summaryLabs } }
            );
          }
        }
      } catch (e) {
        console.info("[intake] Post-submit summary error:", e.message?.slice(0, 60));
      }
    });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to submit session" }); }
});

// ---------- On-demand summary re-generation (doctor / hospital_admin only) ----------
router.post("/:id/summarize", requireAuth, requireRole("doctor", "hospital_admin"), async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const docs    = await Document.find({ session_id: s.id });
    const summary = await generateSummary(s.toObject(), docs.map(d => d.toObject()));
    if (summary) {
      await IntakeSession.findByIdAndUpdate(s.id, { summary });
      const { extractLabs } = require("../extract");
      const summaryLabs = extractLabs(summary);
      if (summaryLabs.length > 0) {
        await Document.updateMany(
          { session_id: s.id },
          { $set: { extracted_labs: summaryLabs } }
        );
      }
      res.json({ ok: true, summary });
    } else {
      res.json({ ok: false, summary: null, message: "LLM unavailable -- summary not generated" });
    }
  } catch (err) { res.status(500).json({ error: err.message || "Failed to generate summary" }); }
});

// ---------- Get session ----------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const patient = await Patient.findById(s.patient_id);
    const docs    = await Document.find({ session_id: s.id });
    res.json({
      session_id: s.id, token: s.token, status: s.status,
      patient: patient ? { id: patient.id, name: patient.name, abha_id: patient.abha_id, language: patient.language, dob: patient.dob, age: patient.age, gender: patient.gender } : null,
      ayush_mode: !!s.ayush_mode, ayush_fields: s.ayush_fields || {},
      chief_complaint: s.chief_complaint, red_flag: !!s.red_flag, red_flag_reason: s.red_flag_reason,
      hpi_details: s.hpi_details || [], parameters: s.parameters || [],
      pmh: s.pmh, allergies: s.allergies, diagnosis: s.diagnosis,
      prescription: s.prescription, summary: s.summary || null,
      documents: docs.map(d => {
        let labs = d.extracted_labs || [];
        if (labs.length <= 1 && s.summary) {
          const { extractLabs } = require("../extract");
          const sumLabs = extractLabs(s.summary);
          if (sumLabs.length > labs.length) labs = sumLabs;
        }
        return {
          id: d.id,
          filename: d.filename,
          medications: d.extracted_meds || [],
          labs,
          raw_text: d.raw_ocr_text
        };
      }),
      fhir_bundle: s.fhir_bundle || null, reviewed_at: s.reviewed_at, review_seconds: s.review_seconds,
    });
  } catch (err) { res.status(500).json({ error: err.message || "Failed to get session details" }); }
});


// ---------- Clinical HPI follow-up questions (Decision Tree + Hybrid AI + Caching) ----------
router.post("/:id/hpi-questions", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;

    const { ClinicalQuestion, SymptomDecisionTree } = require("../db");
    const { generateHpiQuestions } = require("../summarizer");

    const sessionObj = s.toObject();
    const cc = (sessionObj.chief_complaint || "").toLowerCase();
    const sid = (sessionObj.symptom_id || "").toLowerCase();
    const transcript = (sessionObj.transcript || "").trim();
    const forceAi = req.body?.force_ai === true;
    const hospital_id = sessionObj.hospital_id ? sessionObj.hospital_id.toString() : (req.user?.hospital_id || null);

    let matchedStandardKey = null;
    if (sid.includes("fever") || cc.includes("fever") || cc.includes("জ্বর") || cc.includes("बुखार")) {
      matchedStandardKey = "fever";
    } else if (sid.includes("cough") || cc.includes("cough") || cc.includes("কাশি") || cc.includes("खांसी")) {
      matchedStandardKey = "cough";
    } else if (sid.includes("stomach") || cc.includes("stomach") || cc.includes("পেট") || cc.includes("पेट")) {
      matchedStandardKey = "stomach";
    } else if (sid.includes("chest") || cc.includes("chest") || cc.includes("বুক") || cc.includes("सीने")) {
      matchedStandardKey = "chest";
    } else if (sid.includes("headache") || cc.includes("headache") || cc.includes("মাথা") || cc.includes("सिर")) {
      matchedStandardKey = "headache";
    } else if (sid.includes("vomit") || cc.includes("vomit") || cc.includes("বমি") || cc.includes("उल्टी")) {
      matchedStandardKey = "vomiting";
    } else if (sid.includes("joint") || cc.includes("joint") || cc.includes("হাঁটু") || cc.includes("जोड़ों")) {
      matchedStandardKey = "joint_pain";
    } else if (sid.includes("skin") || cc.includes("skin") || cc.includes("চামড়া") || cc.includes("त्वचा")) {
      matchedStandardKey = "skin";
    } else if (sid.includes("urinary") || cc.includes("urine") || cc.includes("পেচ্ছাপ") || cc.includes("पेशाब")) {
      matchedStandardKey = "urinary";
    } else if (sid.includes("eye") || cc.includes("eye") || cc.includes("চোখ") || cc.includes("आंख")) {
      matchedStandardKey = "eye";
    } else if (sid.includes("breath") || cc.includes("breath") || cc.includes("শ্বাস") || cc.includes("सांस")) {
      matchedStandardKey = "breathless";
    } else if (sid.includes("weak") || cc.includes("fatigue") || cc.includes("দুর্বল") || cc.includes("कमजोरी")) {
      matchedStandardKey = "weakness";
    }

    const effectiveSymptomKey = matchedStandardKey || sid || "general";

    // 1. Check if the hospital has a configured SymptomDecisionTree for this symptom
    let tree = null;
    if (hospital_id) {
      tree = await SymptomDecisionTree.findOne({
        hospital_id,
        symptom_key: effectiveSymptomKey,
        active: true
      });
      if (!tree && matchedStandardKey && sid && sid !== matchedStandardKey) {
        tree = await SymptomDecisionTree.findOne({
          hospital_id,
          symptom_key: sid,
          active: true
        });
      }
    }

    // 2. Evaluate complexity: voice description, multi-symptom complaint, novel disease, or forced AI
    const hasVoiceDetails = transcript.length > 5;
    const isMultiSymptom = cc.includes(",") || cc.includes("and") || cc.includes("এবং") || cc.includes("और");
    const isNewDisease = !matchedStandardKey || /rash|skin|eye|urinary|breath|weakness|joint|ear|throat|wound|fracture|dengue|malaria|allergy|diabetes|sugar|pressure|heart|kidney|liver|infection|backache|pain/i.test(cc);
    const isComplexPresentation = forceAi || hasVoiceDetails || isMultiSymptom || (!tree && isNewDisease);

    // ---------------------------------------------------------------------------------
    // Branch 1: Hospital Tree Configured + Complex/Voice Presentation
    // Personalized generation respecting hospital parameters + patient transcript.
    // Explicitly SKIP writing to ClinicalQuestion (patient-specific, not canonical).
    // ---------------------------------------------------------------------------------
    if (tree && isComplexPresentation) {
      console.log(`[HPI Branch 1] Personalized Tree AI generation for hospital ${hospital_id}::${tree.symptom_key}`);
      try {
        const aiQs = await generateHpiQuestions(sessionObj, tree.parameters);
        if (Array.isArray(aiQs) && aiQs.length > 0) {
          return res.json({
            source: "ai",
            is_custom: true,
            has_tree: true,
            questions: aiQs.map((q, idx) => ({
              question_id: "ai_tree_" + (idx + 1),
              symptom_key: tree.symptom_key,
              english: q,
              type: /1-10|scale|severity|rate/i.test(q) ? "scale" : (/when|how long|since|start|began/i.test(q) ? "duration" : "chips"),
              translations: {},
              options: null,
            }))
          });
        }
      } catch (err) {
        console.warn("[HPI Branch 1] AI generation failed, falling back to tree params:", err.message);
      }
    }

    // ---------------------------------------------------------------------------------
    // Branch 2: Hospital Tree Configured + Standard Presentation
    // Check ClinicalQuestion cache for (hospital_id, symptom_key).
    // On miss: generate canonical questions via AI, atomically cache via bulkWrite, serve.
    // ---------------------------------------------------------------------------------
    if (tree && !isComplexPresentation) {
      // Check cache first
      const cachedQs = await ClinicalQuestion.find({
        hospital_id,
        symptom_key: tree.symptom_key,
        active: true
      }).sort({ question_order: 1 });

      if (cachedQs && cachedQs.length > 0) {
        console.log(`[HPI Branch 2] Cache HIT (${cachedQs.length} questions) for ${hospital_id}::${tree.symptom_key}`);
        return res.json({
          source: "database",
          is_custom: false,
          cached: true,
          questions: cachedQs.map(q => ({
            question_id: q._id.toString(),
            symptom_key: q.symptom_key,
            type: q.type,
            english: q.english,
            translations: q.translations,
            options: q.options,
          }))
        });
      }

      // Cache miss: generate canonical question set
      console.log(`[HPI Branch 2] Cache MISS for ${hospital_id}::${tree.symptom_key} — generating via Ollama...`);
      const aiQs = await generateHpiQuestions(sessionObj, tree.parameters);

      const formattedQuestions = (aiQs || []).slice(0, 5).map((q, idx) => {
        const paramDef = tree.parameters[idx] || {};
        const qType = paramDef.type || (/1-10|scale|severity|rate/i.test(q) ? "scale" : "chips");
        const opts = paramDef.options && paramDef.options.length ? { English: paramDef.options } : null;
        return {
          question_order: idx,
          english: q,
          type: qType,
          options: opts,
        };
      });

      // Atomic idempotent write to ClinicalQuestion
      if (formattedQuestions.length > 0) {
        try {
          const ops = formattedQuestions.map(q => ({
            updateOne: {
              filter: { hospital_id, symptom_key: tree.symptom_key, question_order: q.question_order },
              update: {
                $set: {
                  hospital_id,
                  symptom_key: tree.symptom_key,
                  question_order: q.question_order,
                  type: q.type,
                  english: q.english,
                  translations: {},
                  options: q.options || {},
                  active: true,
                }
              },
              upsert: true,
            }
          }));
          await ClinicalQuestion.bulkWrite(ops);
          // Delete any excess slots if parameter count changed
          await ClinicalQuestion.deleteMany({
            hospital_id,
            symptom_key: tree.symptom_key,
            question_order: { $gte: formattedQuestions.length }
          });
          console.log(`[HPI Branch 2] Persisted ${formattedQuestions.length} canonical questions to DB for ${hospital_id}::${tree.symptom_key}`);
        } catch (dbErr) {
          console.warn("[HPI Branch 2] Failed to cache questions to DB:", dbErr.message);
        }
      }

      return res.json({
        source: "ai",
        is_custom: false,
        newly_cached: true,
        questions: formattedQuestions.map((q, idx) => ({
          question_id: `ai_${tree.symptom_key}_${idx + 1}`,
          symptom_key: tree.symptom_key,
          type: q.type,
          english: q.english,
          translations: {},
          options: q.options,
        }))
      });
    }

    // ---------------------------------------------------------------------------------
    // Branch 3: No Hospital Tree + Complex Presentation
    // Freeform AI generation tailored to new/custom condition.
    // ---------------------------------------------------------------------------------
    if (!tree && isComplexPresentation) {
      console.log("[HPI Branch 3] Freeform AI generation for: " + cc);
      try {
        const aiQs = await generateHpiQuestions(sessionObj, null);
        if (Array.isArray(aiQs) && aiQs.length > 0) {
          return res.json({
            source: "ai",
            is_custom: true,
            questions: aiQs.slice(0, 5).map((q, idx) => ({
              question_id: "ai_" + (idx + 1),
              english: q,
              type: /1-10|scale|severity|rate/i.test(q) ? "scale" : (/when|how long|since|start|began/i.test(q) ? "duration" : "chips"),
              translations: {},
              options: null,
            }))
          });
        }
      } catch (err) {
        console.warn("[HPI Branch 3] Freeform AI generation failed:", err.message);
      }
    }

    // ---------------------------------------------------------------------------------
    // Branch 4: No Hospital Tree + Standard Presentation
    // Serve global pre-seeded ClinicalQuestion (strictly hospital_id: null/absent).
    // Zero-latency instant delivery.
    // ---------------------------------------------------------------------------------
    const targetKey = matchedStandardKey || "general";
    const globalFilter = {
      symptom_key: targetKey,
      $or: [{ hospital_id: null }, { hospital_id: { $exists: false } }],
      active: true,
    };

    let dbQuestions = await ClinicalQuestion.find(globalFilter).sort({ question_order: 1 });
    if (!dbQuestions || dbQuestions.length === 0) {
      dbQuestions = await ClinicalQuestion.find({
        symptom_key: "general",
        $or: [{ hospital_id: null }, { hospital_id: { $exists: false } }],
        active: true,
      }).sort({ question_order: 1 });
    }

    if (dbQuestions && dbQuestions.length > 0) {
      return res.json({
        source: "database",
        is_custom: false,
        questions: dbQuestions.map(q => ({
          question_id: q._id.toString(),
          symptom_key: q.symptom_key,
          type: q.type,
          english: q.english,
          translations: q.translations,
          options: q.options,
        }))
      });
    }

    res.json({ source: "fallback", questions: [] });
  } catch (err) {
    console.error("[HPI] Route error:", err);
    res.status(500).json({ questions: [], error: err.message });
  }
});

// ---------- AI-recommended doctor ----------
router.post("/:id/recommend-doctor", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;

    const { Doctor, Hospital } = require("../db");
    const { recommendDoctor } = require("../summarizer");

    // Determine which hospital's doctors to consider
    const patient = await Patient.findById(s.patient_id);
    let candidateDoctors = [];

    const registeredHospitals = await Hospital.find().select("_id");
    const validHospIds = new Set(registeredHospitals.map(h => h._id.toString()));

    const hospitalId = s.hospital_id || (patient?.hospital_id?.toString() !== "independent" ? patient?.hospital_id : null);

    if (hospitalId && validHospIds.has(hospitalId.toString())) {
      candidateDoctors = await Doctor.find({ hospital_id: hospitalId, active: true });
    } else {
      // Self-served patient — show independent doctors only
      const allDocs = await Doctor.find({ active: true });
      candidateDoctors = allDocs.filter(d => {
        if (!d.hospital_id) return true;
        const hid = d.hospital_id.toString();
        return hid === "independent" || hid === "default" || hid === "none" || !validHospIds.has(hid);
      });
      // Fallback: If no independent doctors exist, recommend from all hospital doctors
      if (candidateDoctors.length === 0) {
        candidateDoctors = allDocs;
      }
    }

    if (candidateDoctors.length === 0) {
      return res.json({ recommended_doctor_id: null, rationale: "No doctors available" });
    }

    const rec = await recommendDoctor(s.toObject(), candidateDoctors.map(d => d.toObject()));
    const recDocId = rec?.doctor_id || candidateDoctors[0].id;

    // Store recommendation
    await IntakeSession.findByIdAndUpdate(s.id, { recommended_doctor_id: recDocId });

    res.json({ recommended_doctor_id: recDocId, rationale: rec?.rationale || "" });
  } catch (err) {
    res.status(500).json({ recommended_doctor_id: null, error: err.message });
  }
});

module.exports = router;
