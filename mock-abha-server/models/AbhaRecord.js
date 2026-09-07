const mongoose = require("mongoose");

const AbhaRecordSchema = new mongoose.Schema({
  record_id: { type: String, unique: true, index: true },
  abha_id: { type: String, required: true, index: true },
  session_id: { type: String, index: true },
  hospital_id: { type: String, default: "default" },
  hospital_name: { type: String, default: "City Care Hospital" },
  doctor_id: { type: String },
  doctor_name: { type: String, default: "Attending Doctor" },
  doctor_specialization: { type: String, default: "General Medicine" },
  date: { type: String, default: () => new Date().toISOString() },
  chief_complaint: { type: String },
  symptoms: [{ type: String }],
  hpi_transcript: { type: String },
  hpi_qa: [{ question: String, answer: String }],
  vitals: { type: mongoose.Schema.Types.Mixed },
  lab_reports: [{ type: mongoose.Schema.Types.Mixed }],
  ai_summary: { type: String },
  diagnosis: { type: String, required: true },
  prescription: { type: String, required: true },
  clinical_notes: { type: String },
  ayush_mode: { type: Boolean, default: false },
  ayush_fields: { type: mongoose.Schema.Types.Mixed },
  fhir_bundle: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
});

// Idempotency / Dedup guard: prevent duplicate visit entries on retries or double-clicks
AbhaRecordSchema.index({ abha_id: 1, session_id: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("AbhaRecord", AbhaRecordSchema);
