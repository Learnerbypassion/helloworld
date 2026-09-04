/**
 * Doctor Interface — Dashboard (queue), stats, patient medicine records,
 * and Doctor Review (MongoDB / Mongoose).
 */
const express = require("express");
const { IntakeSession, Patient, Document } = require("../db");
const { requireAuth, requireRole } = require("../auth");

const router = express.Router();

// ---------- Doctor Dashboard Stats ----------
router.get("/stats", requireAuth, requireRole("doctor", "hospital_admin"), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    // Find all patients belonging to hospital
    const patientIds = (await Patient.find({ hospital_id: req.user.hospital_id }).select("_id")).map(p => p._id);

    const queue_count = await IntakeSession.countDocuments({
      patient_id: { $in: patientIds },
      status: "submitted"
    });

    const red_flag_count = await IntakeSession.countDocuments({
      patient_id: { $in: patientIds },
      status: "submitted",
      red_flag: true
    });

    const reviewed_today = await IntakeSession.countDocuments({
      patient_id: { $in: patientIds },
      status: "reviewed",
      reviewed_at: { $gte: today }
    });

    const total_patients = patientIds.length;

    res.json({ queue_count, red_flag_count, reviewed_today, total_patients });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch doctor stats" });
  }
});

// ---------- Doctor Dashboard: queue of submitted patients ----------
router.get("/queue", requireAuth, requireRole("doctor", "hospital_admin"), async (req, res) => {
  try {
    const patientList = await Patient.find({ hospital_id: req.user.hospital_id });
    const patientMap = new Map();
    patientList.forEach(p => patientMap.set(p.id, p));
    const patientIds = patientList.map(p => p.id);

    const sessions = await IntakeSession.find({
      patient_id: { $in: patientIds },
      status: "submitted"
    }).sort({ red_flag: -1, submitted_at: 1 });

    const results = sessions.map(s => {
      const p = patientMap.get(s.patient_id?.toString()) || {};
      return {
        session_id: s.id,
        id: s.id,
        patient_id: s.patient_id,
        patientId: s.patient_id,
        token: s.token,
        name: p.name || "Patient",
        patient_name: p.name || "Patient",
        chief_complaint: s.chief_complaint,
        red_flag: !!s.red_flag,
        red_flag_reason: s.red_flag_reason,
        ayush_mode: !!s.ayush_mode,
        submitted_at: s.submitted_at,
        language: p.language || "English",
        dob: p.dob,
        age: p.age,
        gender: p.gender,
        abha_id: p.abha_id,
        intake: {
          mode: s.ayush_mode ? "AYUSH" : "Allopathic",
          chiefComplaint: s.chief_complaint ? [s.chief_complaint] : [],
          hpi: s.transcript || "",
          ayushData: s.ayush_fields || {},
          redFlags: s.red_flag ? [s.red_flag_reason || "Emergency alert"] : [],
          documents: [],
          fhirBundle: s.fhir_bundle
        }
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch queue" });
  }
});

// ---------- Patient's current medicine records ----------
router.get("/patients/:patientId/medications", requireAuth, requireRole("doctor", "hospital_admin"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient || patient.hospital_id.toString() !== req.user.hospital_id.toString()) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const sessions = await IntakeSession.find({ patient_id: patient.id });
    const sessionMap = new Map();
    sessions.forEach(s => sessionMap.set(s.id, s));
    const sessionIds = sessions.map(s => s.id);

    const docs = await Document.find({ session_id: { $in: sessionIds } }).sort({ created_at: -1 });

    const medications = [];
    for (const d of docs) {
      const s = sessionMap.get(d.session_id?.toString()) || {};
      for (const m of (d.extracted_meds || [])) {
        medications.push({
          ...(typeof m === "string" ? { name: m } : m),
          session_id: d.session_id,
          recorded_at: d.created_at,
          context: s.chief_complaint,
        });
      }
    }

    res.json({ patient_id: patient.id, name: patient.name, medications });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch medications" });
  }
});

// ---------- Doctor Review: Profile | Reports | Diagnosis | Case | Prescribing ----------
router.post("/sessions/:id/review", requireAuth, requireRole("doctor"), async (req, res) => {
  try {
    const s = await IntakeSession.findById(req.params.id);
    if (!s) return res.status(404).json({ error: "Session not found" });

    const patient = await Patient.findById(s.patient_id);
    if (patient && patient.hospital_id.toString() !== req.user.hospital_id.toString()) {
      return res.status(403).json({ error: "Session belongs to a different hospital" });
    }

    const { chief_complaint, pmh, allergies, summary, diagnosis, prescription, review_seconds } = req.body;
    const updates = {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
      review_seconds: review_seconds || null,
    };

    if (chief_complaint !== undefined) updates.chief_complaint = chief_complaint;
    if (pmh !== undefined) updates.pmh = pmh;
    if (allergies !== undefined) updates.allergies = allergies;
    if (summary !== undefined) updates.summary = summary;
    if (diagnosis !== undefined) updates.diagnosis = diagnosis;
    if (prescription !== undefined) updates.prescription = prescription;

    await IntakeSession.findByIdAndUpdate(s.id, updates);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to review session" });
  }
});

module.exports = router;
