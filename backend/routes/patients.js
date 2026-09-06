/**
 * Add patient / Find patient / Update patient / Get patient sessions (MongoDB / Mongoose).
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Patient, IntakeSession } = require("../db");
const { requireAuth, requireRole } = require("../auth");

const router = express.Router();
const ABHA_RE = /^\d{2}-?\d{4}-?\d{4}-?\d{4}$/;

function serializePatient(p) {
  if (!p) return null;
  const obj = typeof p.toJSON === "function" ? p.toJSON() : { ...p };
  delete obj.password_hash;
  return obj;
}

// ---------- List all patients (registration desk / receptionist / doctor) ----------
router.get("/", requireAuth, requireRole("hospital_admin", "doctor", "receptionist"), async (req, res) => {
  try {
    const patients = await Patient.find({ hospital_id: req.user.hospital_id }).sort({ created_at: -1 });
    res.json(patients.map(serializePatient));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch patients" });
  }
});

// ---------- Lookup patient (by abha_id or phone, for Kiosk / check-in) ----------
router.get("/lookup", async (req, res) => {
  try {
    const { abha_id, phone } = req.query;
    if (!abha_id && !phone) return res.status(400).json({ error: "abha_id or phone query param is required" });
    let patient = null;
    if (abha_id) {
      patient = await Patient.findOne({ abha_id: abha_id.trim() });
    }
    if (!patient && phone) {
      const clean = phone.replace(/[^0-9]/g, "").slice(-10);
      patient = await Patient.findOne({ phone: new RegExp(clean + "$") });
    }
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(serializePatient(patient));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to lookup patient" });
  }
});

// ---------- Add patient (registration desk) ----------
router.post("/", requireAuth, requireRole("hospital_admin", "doctor", "receptionist"), async (req, res) => {
  try {
    const { name, dob, aadhar_id, phone, abha_id, language, doctor_id, doctor_format, password, age, gender, address } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });
    if (abha_id && !ABHA_RE.test(abha_id)) {
      return res.status(400).json({ error: "ABHA ID format looks invalid (expected 14 digits)." });
    }

    const password_hash = password ? bcrypt.hashSync(password, 10) : null;
    const patient = await Patient.create({
      hospital_id: req.user.hospital_id,
      name,
      dob: dob || null,
      aadhar_id: aadhar_id || null,
      phone,
      abha_id: abha_id || null,
      language: language || "English",
      doctor_id: doctor_id || null,
      doctor_format: doctor_format || null,
      password_hash,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      address: address || null,
    });

    res.status(201).json({ patient: serializePatient(patient) });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create patient" });
  }
});

// ---------- Find patient (by phone number) ----------
router.get("/find", requireAuth, requireRole("hospital_admin", "doctor", "receptionist"), async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: "phone query param is required" });
    const clean = phone.replace(/[^0-9]/g, "");
    const patients = await Patient.find({
      hospital_id: req.user.hospital_id,
      phone: new RegExp(clean)
    });
    res.json(patients.map(serializePatient));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to find patient" });
  }
});

// ---------- Get patient by ID ----------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
      return res.status(403).json({ error: "Cannot view another patient's record" });
    }
    if (req.user.role !== "patient" && req.user.hospital_id.toString() !== patient.hospital_id.toString()) {
      return res.status(403).json({ error: "Patient belongs to a different hospital" });
    }
    res.json(serializePatient(patient));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get patient" });
  }
});

// ---------- Get patient's session history ----------
router.get("/:id/sessions", requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
      return res.status(403).json({ error: "Cannot view another patient's sessions" });
    }
    if (req.user.role !== "patient" && req.user.hospital_id.toString() !== patient.hospital_id.toString()) {
      return res.status(403).json({ error: "Patient belongs to a different hospital" });
    }
    const sessions = await IntakeSession.find({ patient_id: patient.id }).sort({ created_at: -1 });
    const { Doctor, Hospital, Document } = require("../db");

    const enrichedSessions = await Promise.all(sessions.map(async s => {
      let docName = "Dr. Soham Bhattacharya";
      let docSpec = "General Medicine";
      let hospName = "testHospital medical college";

      const docId = s.doctor_id || patient.doctor_id;
      if (docId) {
        const docObj = await Doctor.findById(docId).catch(() => null);
        if (docObj) {
          docName = docObj.name;
          docSpec = docObj.specialization || docObj.doctor_type || "General Medicine";
          if (docObj.hospital_id) {
            const hObj = await Hospital.findById(docObj.hospital_id).catch(() => null);
            if (hObj && hObj.name) hospName = hObj.name;
          }
        }
      }

      const docs = await Document.find({ session_id: s.id });
      const labReports = docs.map(d => ({
        filename: d.filename,
        labs: d.extracted_labs || [],
        medications: d.extracted_meds || []
      }));

      return {
        session_id: s.id,
        token: s.token,
        status: s.status,
        doctor_name: docName,
        doctor_specialization: docSpec,
        hospital_name: hospName,
        chief_complaint: s.chief_complaint || "OPD Consultation",
        red_flag: !!s.red_flag,
        ayush_mode: !!s.ayush_mode,
        diagnosis: (s.diagnosis && !/no\s+(past\s+)?medical\s+history/i.test(s.diagnosis))
          ? s.diagnosis
          : (s.chief_complaint || "Clinical Consultation"),
        prescription: s.prescription || "Clinical consultation completed",
        summary: s.summary,
        lab_reports: labReports,
        submitted_at: s.submitted_at,
        reviewed_at: s.reviewed_at,
        created_at: s.created_at
      };
    }));

    res.json(enrichedSessions);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch patient sessions" });
  }
});

// ---------- Update patient ----------
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
      return res.status(403).json({ error: "Cannot update another patient's record" });
    }
    if ((req.user.role === "hospital_admin" || req.user.role === "receptionist") && req.user.hospital_id.toString() !== patient.hospital_id.toString()) {
      return res.status(403).json({ error: "Patient belongs to a different hospital" });
    }
    if (req.user.role === "doctor") {
      return res.status(403).json({ error: "Doctors cannot edit patient demographic records" });
    }

    const fields = ["name", "dob", "aadhar_id", "phone", "abha_id", "language", "doctor_id", "doctor_format", "age", "gender", "address"];
    const updates = {};
    for (const f of fields) if (req.body[f] !== undefined) updates[f] = req.body[f];
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updatable fields provided" });

    const updated = await Patient.findByIdAndUpdate(patient.id, updates, { new: true });
    res.json(serializePatient(updated));
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update patient" });
  }
});


// ---------- Get patient's central ABHA records ----------
router.get("/:id/abha-records", requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (req.user.role === "patient" && req.user.id !== patient.id && req.user.id !== patient._id.toString()) {
      return res.status(403).json({ error: "Cannot view another patient's records" });
    }
    const abhaId = patient.abha_id;
    if (!abhaId) {
      return res.json({ abha_id: null, count: 0, records: [] });
    }
    const ABHA_SERVER_URL = process.env.ABHA_SERVER_URL || "http://localhost:8005";
    const abhaResp = await axios.get(`${ABHA_SERVER_URL}/api/records/${encodeURIComponent(abhaId)}`, { timeout: 4000 });
    res.json(abhaResp.data);
  } catch (err) {
    console.warn("[Patient ABHA Records] Error fetching:", err.message);
    res.json({ abha_id: null, count: 0, records: [], error: err.message });
  }
});

// ---------- Direct lookup by ABHA ID for authenticated patient ----------
router.get("/by-abha/:abhaId/records", requireAuth, async (req, res) => {
  try {
    const ABHA_SERVER_URL = process.env.ABHA_SERVER_URL || "http://localhost:8005";
    const abhaResp = await axios.get(`${ABHA_SERVER_URL}/api/records/${encodeURIComponent(req.params.abhaId)}`, { timeout: 4000 });
    res.json(abhaResp.data);
  } catch (err) {
    res.json({ abha_id: req.params.abhaId, count: 0, records: [], error: err.message });
  }
});

module.exports = router;
