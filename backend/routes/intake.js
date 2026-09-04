/**
 * Kiosk intake flow — symptom capture, HPI, AYUSH fields, document upload
 * + OCR, and submission (MongoDB / Mongoose).
 */
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { IntakeSession, Patient, Document, genToken } = require("../db");
const { requireAuth } = require("../auth");
const { processDocument } = require("../ocr");
const { buildFhirBundle } = require("../fhirBuilder");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({ dest: UPLOAD_DIR });

// Expanded Red-Flag Engine — 8 emergency patterns
const RED_FLAG_RULES = {
  chest:       "Chest pain — possible cardiac / respiratory emergency. Seek immediate attention.",
  stroke:      "Sudden facial drooping / arm weakness / speech difficulty — FAST stroke criteria met.",
  breathless:  "Severe breathlessness — possible acute respiratory failure or pulmonary embolism.",
  unconscious: "Altered / loss of consciousness — requires immediate triage evaluation.",
  bleeding:    "Severe uncontrolled bleeding — haemodynamic instability risk.",
  seizure:     "Active or post-ictal seizure — requires urgent neurological assessment.",
  snakebite:   "Suspected envenomation — anti-venom administration may be time-critical.",
  poison:      "Suspected poisoning or overdose — poison control and emergency support needed.",
};

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
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return false;
  }
  if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
    res.status(403).json({ error: "Cannot access another patient's session" });
    return false;
  }
  if (req.user.role !== "patient" && req.user.hospital_id.toString() !== patient.hospital_id.toString()) {
    res.status(403).json({ error: "Session belongs to a different hospital" });
    return false;
  }
  return true;
}

// ---------- List sessions (doctor/hospital_admin view) ----------
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, patient_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (patient_id) filter.patient_id = patient_id;

    const sessions = await IntakeSession.find(filter).sort({ created_at: -1 }).limit(100);
    const results = await Promise.all(
      sessions.map(async (s) => {
        const p = await Patient.findById(s.patient_id);
        return {
          session_id: s.id,
          token: s.token,
          status: s.status,
          patient_name: p ? p.name : "Unknown Patient",
          patient_id: s.patient_id,
          chief_complaint: s.chief_complaint,
          red_flag: !!s.red_flag,
          ayush_mode: !!s.ayush_mode,
          submitted_at: s.submitted_at,
          created_at: s.created_at,
        };
      })
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to list sessions" });
  }
});

// ---------- Create session ----------
router.post("/", requireAuth, async (req, res) => {
  try {
    const { patient_id, doctor_id, ayush_mode = false, consent_given = true, status = "in_progress", chief_complaint } = req.body;
    const patient = await Patient.findById(patient_id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
      return res.status(403).json({ error: "Cannot start a session for another patient" });
    }

    const assignedDocId = doctor_id || patient.doctor_id;
    if (assignedDocId && assignedDocId !== patient.doctor_id) {
      await Patient.findByIdAndUpdate(patient.id, { doctor_id: assignedDocId });
    }

    const token = await genToken();
    const submitted_at = status === "submitted" ? new Date().toISOString() : null;
    const session = await IntakeSession.create({
      token,
      patient_id: patient.id,
      doctor_id: assignedDocId || null,
      ayush_mode: !!ayush_mode,
      consent_given: !!consent_given,
      status,
      chief_complaint: chief_complaint || null,
      submitted_at,
    });

    res.status(201).json({ session_id: session.id, token, status });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create session" });
  }
});

router.patch("/:id/symptom", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;

    const { symptom_id, chief_complaint, transcript } = req.body;
    let red_flag = false, red_flag_reason = null;
    if (symptom_id && RED_FLAG_RULES[symptom_id]) {
      red_flag = true;
      red_flag_reason = RED_FLAG_RULES[symptom_id];
    }
    // Scan text for emergency symptoms
    if (!red_flag && chief_complaint) {
      const cc = chief_complaint.toLowerCase();
      if (/chest\s+pain|heart\s+attack|cardiac/.test(cc)) { red_flag = true; red_flag_reason = RED_FLAG_RULES.chest; }
      else if (/stroke|face.*droop|arm.*weak|speech.*difficult/.test(cc)) { red_flag = true; red_flag_reason = RED_FLAG_RULES.stroke; }
      else if (/breathless|can.t breathe|difficulty breath/.test(cc)) { red_flag = true; red_flag_reason = RED_FLAG_RULES.breathless; }
      else if (/unconscious|fainted|not respond/.test(cc)) { red_flag = true; red_flag_reason = RED_FLAG_RULES.unconscious; }
      else if (/poison|overdose/.test(cc)) { red_flag = true; red_flag_reason = RED_FLAG_RULES.poison; }
      else if (/snake.*bit|bit.*snake/.test(cc)) { red_flag = true; red_flag_reason = RED_FLAG_RULES.snakebite; }
    }

    await IntakeSession.findByIdAndUpdate(s.id, {
      symptom_id,
      chief_complaint,
      transcript: transcript || null,
      red_flag,
      red_flag_reason,
    });

    res.json({ red_flag, red_flag_reason });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update symptoms" });
  }
});

router.patch("/:id/hpi", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const details = Array.isArray(req.body.details) ? req.body.details : [];
    await IntakeSession.findByIdAndUpdate(s.id, { hpi_details: details });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update HPI" });
  }
});

router.patch("/:id/ayush", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;

    const AYUSH_FIELDS = ["prakriti", "vikriti", "agni", "koshtha", "satmya", "sara", "samhanana", "ahara_shakti", "vyayama_shakti", "vaya"];
    const existing = s.ayush_fields || {};
    const fields = { ...existing };
    for (const f of AYUSH_FIELDS) {
      if (req.body[f] !== undefined) fields[f] = req.body[f];
    }
    await IntakeSession.findByIdAndUpdate(s.id, { ayush_fields: fields });
    res.json({ ok: true, ayush_fields: fields });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update AYUSH fields" });
  }
});

router.patch("/:id/parameters", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const parameters = Array.isArray(req.body.parameters) ? req.body.parameters : [];
    await IntakeSession.findByIdAndUpdate(s.id, { parameters });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update parameters" });
  }
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
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update notes" });
  }
});

router.post("/:id/document", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const ext = path.extname(req.file.originalname) || ".png";
    const fname = `${uuidv4()}${ext}`;
    const finalPath = path.join(UPLOAD_DIR, fname);
    fs.renameSync(req.file.path, finalPath);

    let result;
    try {
      result = await processDocument(finalPath);
    } catch (err) {
      return res.status(500).json({ error: `OCR failed: ${err.message}` });
    }

    const doc = await Document.create({
      session_id: s.id,
      filename: fname,
      raw_ocr_text: result.raw_text,
      extracted_meds: result.medications,
      extracted_labs: result.labs,
    });

    res.json({
      document_id: doc.id,
      raw_text: result.raw_text,
      medications: result.medications,
      labs: result.labs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to process document" });
  }
});

router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const patient = await Patient.findById(s.patient_id);
    const docs = await Document.find({ session_id: s.id });

    const submitted_at = new Date().toISOString();
    const sessionForBundle = {
      ...s.toObject(),
      id: s.id,
      hpi_details: Array.isArray(s.hpi_details) ? s.hpi_details : []
    };
    const patientForBundle = { ...patient.toObject(), id: patient.id };
    const bundle = buildFhirBundle(patientForBundle, sessionForBundle, docs.map(d => d.toObject()));

    await IntakeSession.findByIdAndUpdate(s.id, {
      status: "submitted",
      submitted_at,
      fhir_bundle: bundle,
    });

    res.json({ ok: true, status: "submitted", token: s.token });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to submit session" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const s = await sessionOr404(req.params.id, res);
    if (!s) return;
    if (!(await assertAccess(req, res, s))) return;
    const patient = await Patient.findById(s.patient_id);
    const docs = await Document.find({ session_id: s.id });

    res.json({
      session_id: s.id,
      token: s.token,
      status: s.status,
      patient: patient ? {
        id: patient.id,
        name: patient.name,
        abha_id: patient.abha_id,
        language: patient.language,
        dob: patient.dob,
        age: patient.age,
        gender: patient.gender,
      } : null,
      ayush_mode: !!s.ayush_mode,
      ayush_fields: s.ayush_fields || {},
      chief_complaint: s.chief_complaint,
      red_flag: !!s.red_flag,
      red_flag_reason: s.red_flag_reason,
      hpi_details: s.hpi_details || [],
      parameters: s.parameters || [],
      pmh: s.pmh,
      allergies: s.allergies,
      diagnosis: s.diagnosis,
      prescription: s.prescription,
      summary: s.summary,
      documents: docs.map(d => ({
        id: d.id,
        filename: d.filename,
        medications: d.extracted_meds || [],
        labs: d.extracted_labs || [],
        raw_text: d.raw_ocr_text,
      })),
      fhir_bundle: s.fhir_bundle || null,
      reviewed_at: s.reviewed_at,
      review_seconds: s.review_seconds,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get session details" });
  }
});

module.exports = router;
