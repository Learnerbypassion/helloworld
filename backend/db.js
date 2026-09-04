/**
 * MediKiosk — MongoDB connection & Mongoose Schemas.
 */
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/medikiosk";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
}).then(() => {
  console.log("Connected to MongoDB database successfully.");
}).catch((err) => {
  console.error("MongoDB connection error:", err.message);
});

const schemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret.__v;
      return ret;
    },
  },
};

// 1. Hospital Schema
const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    registration_no: { type: String },
    hospital_type: { type: String, default: "Allopathic" },
    phone: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    city: { type: String },
    state: { type: String },
    pin_code: { type: String },
    address: { type: String },
    hfr_id: { type: String },
    password_hash: { type: String, required: true },
  },
  schemaOptions
);

// 2. Doctor Schema
const DoctorSchema = new mongoose.Schema(
  {
    hospital_id: { type: mongoose.Schema.Types.Mixed, required: true, ref: "Hospital" },
    name: { type: String, required: true },
    phone: { type: String },
    license: { type: String },
    education: { type: String },
    specialization: { type: String, default: "General Medicine" },
    hpr_id: { type: String },
    aadhar_id: { type: String },
    dob: { type: String },
    address: { type: String },
    doctor_type: { type: String, default: "General Medicine" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  schemaOptions
);

// 3. Receptionist Schema
const ReceptionistSchema = new mongoose.Schema(
  {
    hospital_id: { type: mongoose.Schema.Types.Mixed, required: true, ref: "Hospital" },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  schemaOptions
);

// 4. Patient Schema
const PatientSchema = new mongoose.Schema(
  {
    hospital_id: { type: mongoose.Schema.Types.Mixed, required: true, ref: "Hospital" },
    name: { type: String, required: true },
    dob: { type: String },
    aadhar_id: { type: String },
    phone: { type: String, required: true },
    abha_id: { type: String },
    language: { type: String, default: "English" },
    doctor_id: { type: mongoose.Schema.Types.Mixed, ref: "Doctor" },
    doctor_format: { type: String },
    password_hash: { type: String },
    age: { type: Number },
    gender: { type: String },
    address: { type: String },
  },
  schemaOptions
);

// 5. IntakeSession Schema
const IntakeSessionSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true },
    patient_id: { type: mongoose.Schema.Types.Mixed, required: true, ref: "Patient" },
    doctor_id: { type: mongoose.Schema.Types.Mixed, ref: "Doctor" },
    ayush_mode: { type: Boolean, default: false },
    symptom_id: { type: String },
    chief_complaint: { type: String },
    red_flag: { type: Boolean, default: false },
    red_flag_reason: { type: String },
    hpi_details: { type: Array, default: [] },
    ayush_fields: { type: Object, default: {} },
    parameters: { type: Array, default: [] },
    transcript: { type: String },
    pmh: { type: String, default: "No past medical history recorded." },
    allergies: { type: String, default: "No known drug allergies recorded." },
    diagnosis: { type: String },
    prescription: { type: String },
    summary: { type: String },
    status: { type: String, default: "in_progress" }, // in_progress | submitted | reviewed
    consent_given: { type: Boolean, default: true },
    submitted_at: { type: String },
    reviewed_at: { type: String },
    review_seconds: { type: Number },
    fhir_bundle: { type: Object },
  },
  schemaOptions
);

// 6. Document Schema
const DocumentSchema = new mongoose.Schema(
  {
    session_id: { type: mongoose.Schema.Types.Mixed, required: true, ref: "IntakeSession" },
    filename: { type: String },
    raw_ocr_text: { type: String },
    extracted_meds: { type: Array, default: [] },
    extracted_labs: { type: Array, default: [] },
  },
  schemaOptions
);

// Models
const Hospital = mongoose.model("Hospital", HospitalSchema);
const Doctor = mongoose.model("Doctor", DoctorSchema);
const Receptionist = mongoose.model("Receptionist", ReceptionistSchema);
const Patient = mongoose.model("Patient", PatientSchema);
const IntakeSession = mongoose.model("IntakeSession", IntakeSessionSchema);
const Document = mongoose.model("Document", DocumentSchema);

// Helper function to generate unique kiosk session token A-1, A-2...
async function genToken() {
  const count = await IntakeSession.countDocuments();
  return `A-${count + 14}`;
}

module.exports = {
  mongoose,
  Hospital,
  Doctor,
  Receptionist,
  Patient,
  IntakeSession,
  Document,
  genToken,
};
