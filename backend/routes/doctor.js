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
    const isDoc = req.user.role === "doctor";
    const docId = req.user.id;
    const hospId = req.user.hospital_id;

    let query = { status: "submitted" };
    if (isDoc) {
      // Find all patients in this hospital, or assigned to this doctor
      const pList = await Patient.find({
        $or: [{ hospital_id: hospId }, { doctor_id: docId }]
      }).select("_id");
      const patientIds = pList.map(p => p._id.toString());

      // Show sessions explicitly assigned to this doctor, or unassigned, or belonging to hospital
      query = {
        status: "submitted",
        $or: [
          { doctor_id: docId },
          { doctor_id: null },
          { patient_id: { $in: patientIds } }
        ]
      };
    } else {
      // Hospital Admin: show all submitted sessions for this hospital or unassigned
      const pList = await Patient.find({ hospital_id: hospId }).select("_id");
      const patientIds = pList.map(p => p._id.toString());
      query = {
        status: "submitted",
        $or: [
          { patient_id: { $in: patientIds } },
          { doctor_id: null }
        ]
      };
    }

    const sessions = await IntakeSession.find(query).sort({ red_flag: -1, submitted_at: 1 });

    const sessionPatientIds = [...new Set(sessions.map(s => s.patient_id?.toString()).filter(Boolean))];
    const patientList = await Patient.find({ _id: { $in: sessionPatientIds } });
    const patientMap = new Map();
    patientList.forEach(p => patientMap.set(p.id, p));

    const results = sessions.map(s => {
      const p = patientMap.get(s.patient_id?.toString()) || {};
      return {
        session_id: s.id,
        id: s.id,
        patient_id: s.patient_id,
        patientId: s.patient_id,
        doctor_id: s.doctor_id,
        doctorId: s.doctor_id,
        token: s.token,
        name: p.name || "Patient",
        patient_name: p.name || "Patient",
        chief_complaint: s.chief_complaint,
        summary: s.summary || null,
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
          summary: s.summary || null,
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
    const docHosp = req.user.hospital_id ? req.user.hospital_id.toString() : null;

    if (patient && docHosp && patient.hospital_id && patient.hospital_id.toString() !== docHosp) {
      // Auto-adopt session and patient to the reviewing doctor's hospital
      await Patient.findByIdAndUpdate(patient._id, { hospital_id: docHosp });
      await IntakeSession.findByIdAndUpdate(s._id, { hospital_id: docHosp });
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

    // Push to Central Mock ABHA Platform (Awaited with timeout for verified sync status!)
    let abhaSynced = false;
    let abhaRecordId = null;
    let abhaError = null;
    const targetAbhaId = patient?.abha_id || (patient?.phone ? `91-${patient.phone.slice(-4)}-${s.id.slice(-4)}-${Date.now().toString().slice(-4)}` : "12-3456-7890-1234");

    try {
      const axios = require("axios");
      const ABHA_SERVER_URL = process.env.ABHA_SERVER_URL || "http://localhost:8005";

      // Collect OCR documents and lab results for this session
      const sessionDocs = await Document.find({ session_id: s.id });
      const labReports = sessionDocs.map(d => ({
        filename: d.filename,
        labs: d.extracted_labs || [],
        medications: d.extracted_meds || [],
        summary: d.ocr_summary || (d.raw_ocr_text ? d.raw_ocr_text.slice(0, 300) : null)
      }));

      // Determine hospital name
      const hospId = req.user.hospital_id || "default";
      const hospName = hospId === "apollo"
        ? "Apollo Multispeciality Hospital, Delhi"
        : (hospId === "aiims"
          ? "AIIMS New Delhi, OPD Ward"
          : (req.user.hospital_name || "City Care General Hospital"));

      const pushPayload = {
        abha_id: targetAbhaId,
        session_id: s.id.toString(),
        hospital_id: hospId,
        hospital_name: hospName,
        doctor_id: req.user.id || req.user._id,
        doctor_name: req.user.name || "Dr. Attending Physician",
        doctor_specialization: req.user.specialization || "General Medicine",
        date: updates.reviewed_at,
        chief_complaint: chief_complaint || s.chief_complaint || "General Consultation",
        symptoms: s.chief_complaint ? [s.chief_complaint] : [],
        hpi_transcript: s.transcript || null,
        vitals: s.parameters || null,
        lab_reports: labReports,
        ai_summary: summary || s.summary || null,
        diagnosis: diagnosis || summary || "Clinical Consultation",
        prescription: prescription || "Prescription advised",
        clinical_notes: summary || null,
        ayush_mode: !!s.ayush_mode,
        ayush_fields: s.ayush_fields || null,
        fhir_bundle: s.fhir_bundle || null
      };

      const abhaResp = await axios.post(`${ABHA_SERVER_URL}/api/records`, pushPayload, { timeout: 4000 });
      if (abhaResp.data?.ok) {
        abhaSynced = true;
        abhaRecordId = abhaResp.data.record_id;
      }
    } catch (err) {
      console.warn("[ABHA Sync Notice] Central ABHA push notice:", err.message);
      abhaError = err.message;
    }

    res.json({
      ok: true,
      abha_synced: abhaSynced,
      abha_id: targetAbhaId,
      record_id: abhaRecordId,
      abha_error: abhaError
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to review session" });
  }
});

// ---------- Cross-Hospital Longitudinal ABHA Records ----------
router.get("/patients/:patientId/abha-history", requireAuth, requireRole("doctor", "hospital_admin"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const abhaId = patient.abha_id;
    if (!abhaId) {
      return res.json({ abha_id: null, count: 0, records: [] });
    }

    const axios = require("axios");
    const ABHA_SERVER_URL = process.env.ABHA_SERVER_URL || "http://localhost:8005";
    const abhaResp = await axios.get(`${ABHA_SERVER_URL}/api/records/${encodeURIComponent(abhaId)}`, { timeout: 4000 });

    res.json(abhaResp.data);
  } catch (err) {
    console.warn("[ABHA History Notice] Could not fetch central records:", err.message);
    res.json({ abha_id: null, count: 0, records: [], offline: true, error: err.message });
  }
});

// Direct lookup by raw ABHA ID
router.get("/abha-records/:abhaId", requireAuth, requireRole("doctor", "hospital_admin"), async (req, res) => {
  try {
    const axios = require("axios");
    const ABHA_SERVER_URL = process.env.ABHA_SERVER_URL || "http://localhost:8005";
    const abhaResp = await axios.get(`${ABHA_SERVER_URL}/api/records/${encodeURIComponent(req.params.abhaId)}`, { timeout: 4000 });
    res.json(abhaResp.data);
  } catch (err) {
    res.json({ abha_id: req.params.abhaId, count: 0, records: [], error: err.message });
  }
});

module.exports = router;
