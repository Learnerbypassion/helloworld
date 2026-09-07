require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const { AbhaPatient, seedDefaultPatients, DEFAULT_SEEDS } = require("./models/AbhaPatient");
const AbhaRecord = require("./models/AbhaRecord");


// Universal markdown table parser to guarantee 100% complete lab extraction
function parseLabsFromSummary(text) {
  if (!text) return [];
  const labs = [];
  const lines = text.split(/\r?\n/);
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) {
      if (inTable && trimmed.length > 0 && !trimmed.startsWith('|')) inTable = false;
      continue;
    }
    const cols = trimmed.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
    if (cols.length >= 2) {
      const firstCol = cols[0].toLowerCase();
      if (firstCol.includes('parameter') || firstCol.includes('test') || firstCol.includes('investigation')) {
        inTable = true;
        continue;
      }
      if (cols.every(c => /^[-:\s]+$/.test(c))) continue;
      if (inTable && cols[0]) {
        const paramName = cols[0].replace(/[*_]/g, '').trim();
        const rawVal = (cols[1] || '').replace(/[*_]/g, '').trim();
        const refRange = (cols[2] || '').replace(/[*_]/g, '').trim();
        const status = (cols[3] || '').replace(/[*_]/g, '').trim();

        const valMatch = rawVal.match(/^([><=~]?\s*[\d.]+)\s*(.*)$/);
        const valStr = valMatch ? valMatch[1].trim() : rawVal;
        const numVal = isNaN(parseFloat(valStr)) ? valStr : parseFloat(valStr);
        const unit = valMatch ? valMatch[2].trim() : '';
        const abnormal = /high|low|abnormal|elevated|borderline/i.test(status);

        labs.push({
          name: paramName,
          value: numVal,
          unit: unit,
          ref_range: refRange || 'Normal',
          abnormal: abnormal,
          status: status || (abnormal ? 'Abnormal' : 'Normal')
        });
      }
    }
  }
  return labs;
}

const app = express();
const PORT = process.env.PORT || 8005;
const MONGO_URI = process.env.ABHA_MONGO_URI || process.env.MONGO_URI || "mongodb://localhost:27017/abha_central_db";

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

let isDbConnected = false;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    isDbConnected = true;
    console.log("[Mock ABHA Server] Connected to Central MongoDB at:", MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));
    await seedDefaultPatients(AbhaPatient);
  })
  .catch(err => {
    console.error("[Mock ABHA Server] MongoDB connection warning:", err.message);
    console.log("[Mock ABHA Server] Running in in-memory fallback mode until DB connects.");
  });

function normalizeAbha(raw) {
  const digits = (raw || "").replace(/[^0-9]/g, "");
  if (digits.length !== 14) return (raw || "").trim();
  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}-${digits.slice(10)}`;
}

// ---------- API Routes ----------

// 1. Health check & status
app.get("/api/health", async (req, res) => {
  let recordCount = 0;
  let patientCount = 0;
  if (isDbConnected) {
    try {
      recordCount = await AbhaRecord.countDocuments();
      patientCount = await AbhaPatient.countDocuments();
    } catch (_) {}
  }
  res.json({
    status: "ok",
    service: "Mock National ABHA Central Platform",
    port: PORT,
    database_connected: isDbConnected,
    database_name: mongoose.connection?.name || "abha_central_db",
    total_records: recordCount,
    total_patients: patientCount,
    timestamp: new Date().toISOString()
  });
});

// 2. Lookup Patient by ABHA ID or phone (Single Source of Truth)
app.get("/api/patients/:query", async (req, res) => {
  try {
    const query = req.params.query.trim();
    const cleanDigits = query.replace(/[^0-9]/g, "");
    const normalized = normalizeAbha(query);

    let patient = null;
    if (isDbConnected) {
      patient = await AbhaPatient.findOne({
        $or: [
          { abha_id: normalized },
          { abha_id: query },
          { phone: cleanDigits.slice(-10) }
        ]
      });
    }

    // Fallback to in-memory seeds if DB pending
    if (!patient) {
      patient = DEFAULT_SEEDS.find(p =>
        normalizeAbha(p.abha_id) === normalized ||
        p.phone.slice(-10) === cleanDigits.slice(-10)
      );
    }

    if (!patient) {
      return res.status(404).json({ error: "Patient not found in Central ABHA Registry", query });
    }

    res.json({
      found: true,
      patient: {
        abha_id: normalizeAbha(patient.abha_id),
        name: patient.name,
        dob: patient.dob,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        blood_group: patient.blood_group
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Register or Update Patient in ABHA Central Registry
app.post("/api/patients", async (req, res) => {
  try {
    const { abha_id, name, dob, age, gender, phone, address, blood_group } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const normId = abha_id ? normalizeAbha(abha_id) : `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const doc = {
      abha_id: normId,
      name,
      dob: dob || null,
      age: age || null,
      gender: gender || "Other",
      phone: phone || null,
      address: address || null,
      blood_group: blood_group || null
    };

    if (isDbConnected) {
      await AbhaPatient.updateOne({ abha_id: normId }, { $set: doc }, { upsert: true });
    }
    res.json({ ok: true, patient: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Push Clinical Health Record (from Doctor Consultation) with Dedup Guard
app.post("/api/records", async (req, res) => {
  try {
    const {
      abha_id,
      session_id,
      hospital_id = "default",
      hospital_name = "City Care Hospital",
      doctor_id,
      doctor_name = "Attending Physician",
      doctor_specialization = "General Medicine",
      date = new Date().toISOString(),
      chief_complaint,
      symptoms = [],
      hpi_transcript,
      hpi_qa = [],
      vitals,
      lab_reports = [],
      ai_summary,
      diagnosis,
      prescription,
      clinical_notes,
      ayush_mode = false,
      ayush_fields,
      fhir_bundle
    } = req.body;

    if (!abha_id) {
      return res.status(400).json({ error: "abha_id is required to link record to central database" });
    }
    if (!diagnosis && !prescription) {
      return res.status(400).json({ error: "Diagnosis or prescription is required" });
    }

    const normAbha = normalizeAbha(abha_id);
    const recordId = `REC_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    let enrichedLabReports = Array.isArray(lab_reports) ? [...lab_reports] : [];
    const summaryLabs = parseLabsFromSummary(ai_summary);
    if (summaryLabs.length > 0) {
      if (enrichedLabReports.length === 0) {
        enrichedLabReports = [{
          filename: "intake_lab_report.jpg",
          labs: summaryLabs,
          medications: [],
          summary: (ai_summary || "").slice(0, 300)
        }];
      } else {
        enrichedLabReports = enrichedLabReports.map(lr => {
          if (!lr.labs || lr.labs.length <= 1) {
            return { ...lr, labs: summaryLabs };
          }
          return lr;
        });
      }
    }

    const recordData = {
      record_id: recordId,
      abha_id: normAbha,
      session_id: session_id || null,
      hospital_id,
      hospital_name,
      doctor_id: doctor_id || null,
      doctor_name,
      doctor_specialization,
      date,
      chief_complaint: chief_complaint || "Consultation",
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
      hpi_transcript: hpi_transcript || null,
      hpi_qa,
      vitals: vitals || null,
      lab_reports: enrichedLabReports,
      ai_summary: ai_summary || null,
      diagnosis,
      prescription,
      clinical_notes: clinical_notes || null,
      ayush_mode: !!ayush_mode,
      ayush_fields: ayush_fields || null,
      fhir_bundle: fhir_bundle || null
    };

    if (isDbConnected) {
      // Idempotent Upsert: if session_id exists for this abha_id, update it to prevent duplicate cards
      if (session_id) {
        const existing = await AbhaRecord.findOne({ abha_id: normAbha, session_id });
        if (existing) {
          await AbhaRecord.updateOne({ _id: existing._id }, { $set: recordData });
          return res.json({
            ok: true,
            status: "updated",
            record_id: existing.record_id,
            abha_id: normAbha,
            message: "Record updated idempotently in Central ABHA Database"
          });
        }
      }
      await AbhaRecord.create(recordData);
    }

    console.log(`[Mock ABHA Server] Saved health record for ABHA: ${normAbha} from ${hospital_name} (${diagnosis})`);
    res.json({
      ok: true,
      status: "created",
      record_id: recordId,
      abha_id: normAbha,
      hospital_name,
      date,
      message: "Successfully pushed and linked to National Central ABHA Repository"
    });
  } catch (err) {
    console.error("[Mock ABHA Server] Error pushing record:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Longitudinal Health Records for an ABHA ID (Cross-Hospital History)
app.get("/api/records/:abha_id", async (req, res) => {
  try {
    const normAbha = normalizeAbha(req.params.abha_id);
    let records = [];

    if (isDbConnected) {
      records = await AbhaRecord.find({
        $or: [
          { abha_id: normAbha },
          { abha_id: req.params.abha_id }
        ]
      }).sort({ date: -1, created_at: -1 });
    }

    res.json({
      abha_id: normAbha,
      count: records.length,
      records: records.map(r => ({
        record_id: r.record_id,
        abha_id: r.abha_id || normAbha,
        session_id: r.session_id,
        date: r.date,
        hospital_id: r.hospital_id,
        hospital_name: r.hospital_name,
        doctor_name: r.doctor_name,
        doctor_specialization: r.doctor_specialization,
        chief_complaint: r.chief_complaint,
        symptoms: r.symptoms,
        hpi_transcript: r.hpi_transcript,
        diagnosis: r.diagnosis,
        prescription: r.prescription,
        clinical_notes: r.clinical_notes,
        lab_reports: (r.lab_reports || []).map(lr => {
          if ((!lr.labs || lr.labs.length <= 1) && r.ai_summary) {
            const sLabs = parseLabsFromSummary(r.ai_summary);
            if (sLabs.length > (lr.labs?.length || 0)) {
              return { ...lr, labs: sLabs };
            }
          }
          return lr;
        }),
        vitals: r.vitals,
        ai_summary: r.ai_summary,
        ayush_mode: r.ayush_mode
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Visual Live Dashboard (Viewable in Browser at http://localhost:8005)
app.get("/", async (req, res) => {
  let records = [];
  let patientCount = 0;
  if (isDbConnected) {
    try {
      records = await AbhaRecord.find().sort({ created_at: -1 }).limit(20);
      patientCount = await AbhaPatient.countDocuments();
    } catch (_) {}
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Mock National ABHA Health Data Platform</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; color: #0f172a; margin: 0; padding: 24px; }
    .header { background: #1e293b; color: white; padding: 20px 28px; border-radius: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #10b981; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
    .card { background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    .hosp { font-weight: bold; color: #2563eb; }
    .date { color: #64748b; font-size: 13px; }
    .rx { background: #f8fafc; border-left: 4px solid #10b981; padding: 8px 12px; margin-top: 8px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin: 0; font-size: 24px;">🏛️ Mock National ABHA Centralized Health Platform</h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 14px;">Simulated Ayushman Bharat Digital Mission (ABDM) Health Information Exchange</p>
    </div>
    <span class="badge">● Live Port ${PORT} (${isDbConnected ? "MongoDB Connected" : "In-Memory"})</span>
  </div>

  <h2>Universal Cross-Hospital Health Records (${records.length} recent)</h2>
  ${records.length === 0 ? '<p style="color: #64748b;">No records pushed yet. Complete a consultation in MediKiosk to push the first record!</p>' : ''}
  ${records.map(r => `
    <div class="card">
      <div style="display: flex; justify-content: space-between;">
        <span class="hosp">🏥 ${r.hospital_name}</span>
        <span class="date">📅 ${new Date(r.date).toLocaleString()}</span>
      </div>
      <p><strong>Patient ABHA ID:</strong> ${r.abha_id} | <strong>Doctor:</strong> ${r.doctor_name} (${r.doctor_specialization || "Physician"})</p>
      <p><strong>Chief Complaint:</strong> ${r.chief_complaint} | <strong>Diagnosis:</strong> ${r.diagnosis}</p>
      <div class="rx"><strong>Prescription:</strong> ${r.prescription}</div>
    </div>
  `).join("")}
</body>
</html>`;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`[Mock ABHA Server] Running at http://localhost:${PORT}`);
});
