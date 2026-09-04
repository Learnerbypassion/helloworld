/**
 * Hospital registration + doctor/receptionist management + all role logins (MongoDB/Mongoose).
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const { Hospital, Doctor, Receptionist, Patient } = require("../db");
const { signToken, requireAuth, requireRole } = require("../auth");

const router = express.Router();
const SALT_ROUNDS = 10;
const phoneOtps = new Map();

// ---------- Register hospital ----------
router.post("/hospital/register", async (req, res) => {
  try {
    const { name, registration_no, hospital_type, phone, email, city, state, pin_code, address, hfr_id, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    const exists = await Hospital.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "A hospital is already registered with this email" });

    const password_hash = bcrypt.hashSync(password, SALT_ROUNDS);
    const hospital = await Hospital.create({
      name, registration_no, hospital_type, phone, email, city, state, pin_code, address, hfr_id, password_hash
    });

    const token = signToken({ role: "hospital_admin", id: hospital.id, hospital_id: hospital.id, name: hospital.name });
    res.status(201).json({ token, hospital });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to register hospital" });
  }
});

// ---------- Hospital Login ----------
router.post("/hospital/login", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const identifier = (email || name || "").trim();
    const hospital = await Hospital.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: identifier },
        { registration_no: identifier }
      ]
    });

    if (!hospital || !bcrypt.compareSync(password || "", hospital.password_hash)) {
      return res.status(401).json({ error: "Invalid hospital email/name or password" });
    }
    const token = signToken({ role: "hospital_admin", id: hospital.id, hospital_id: hospital.id, name: hospital.name });
    res.json({ token, hospital: { id: hospital.id, name: hospital.name, email: hospital.email } });
  } catch (err) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// ---------- Doctor Management ----------
router.post("/doctors", requireAuth, requireRole("hospital_admin"), async (req, res) => {
  try {
    const { name, phone, license, education, specialization, hpr_id, aadhar_id, dob, address, doctor_type, email, password } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Doctor name is required" });
    }

    const docEmail = (email || `${name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@hospital.com`).toLowerCase().trim();
    const docPass = password || "doctor123";
    const docHpr = hpr_id || license || null;
    const docType = specialization || doctor_type || "General Medicine";

    const exists = await Doctor.findOne({ email: docEmail });
    if (exists) return res.status(409).json({ error: "A doctor is already registered with this email" });

    const password_hash = bcrypt.hashSync(docPass, SALT_ROUNDS);
    const doctor = await Doctor.create({
      hospital_id: req.user.hospital_id,
      name,
      phone: phone || null,
      license: license || docHpr,
      education: education || null,
      specialization: specialization || docType,
      hpr_id: docHpr,
      aadhar_id: aadhar_id || null,
      dob: dob || null,
      address: address || null,
      doctor_type: docType,
      email: docEmail,
      password_hash,
      active: true,
    });

    res.status(201).json({ doctor });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to add doctor" });
  }
});

router.get("/doctors", requireAuth, async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospital_id: req.user.hospital_id, active: true }).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch doctors" });
  }
});

router.delete("/doctors/:id", requireAuth, requireRole("hospital_admin"), async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, hospital_id: req.user.hospital_id },
      { active: false }
    );
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ ok: true, removed: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to remove doctor" });
  }
});

// ---------- Doctor login ----------
router.post("/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email: (email || "").toLowerCase().trim(), active: true });
    if (!doctor || !bcrypt.compareSync(password || "", doctor.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken({ role: "doctor", id: doctor.id, hospital_id: doctor.hospital_id, name: doctor.name });
    res.json({ token, doctor: { id: doctor.id, name: doctor.name, doctor_type: doctor.doctor_type, specialization: doctor.specialization } });
  } catch (err) {
    res.status(500).json({ error: err.message || "Doctor login failed" });
  }
});

// ---------- Receptionist Management ----------
router.post("/receptionists", requireAuth, requireRole("hospital_admin"), async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Receptionist name is required" });
    }
    const recEmail = (email || `reception.${Date.now()}@hospital.com`).toLowerCase().trim();
    const recPass = password || "reception123";

    const exists = await Receptionist.findOne({ email: recEmail });
    if (exists) return res.status(409).json({ error: "A receptionist is already registered with this email" });

    const password_hash = bcrypt.hashSync(recPass, SALT_ROUNDS);
    const receptionist = await Receptionist.create({
      hospital_id: req.user.hospital_id,
      name,
      phone: phone || null,
      email: recEmail,
      password_hash,
      active: true,
    });

    res.status(201).json({ receptionist });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to add receptionist" });
  }
});

router.get("/receptionists", requireAuth, requireRole("hospital_admin"), async (req, res) => {
  try {
    const receptionists = await Receptionist.find({ hospital_id: req.user.hospital_id, active: true }).sort({ name: 1 });
    res.json(receptionists);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch receptionists" });
  }
});

router.delete("/receptionists/:id", requireAuth, requireRole("hospital_admin"), async (req, res) => {
  try {
    const rec = await Receptionist.findOneAndUpdate(
      { _id: req.params.id, hospital_id: req.user.hospital_id },
      { active: false }
    );
    if (!rec) return res.status(404).json({ error: "Receptionist not found" });
    res.json({ ok: true, removed: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to remove receptionist" });
  }
});

// ---------- Receptionist login ----------
router.post("/receptionist/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const rec = await Receptionist.findOne({ email: (email || "").toLowerCase().trim(), active: true });
    if (!rec || !bcrypt.compareSync(password || "", rec.password_hash)) {
      return res.status(401).json({ error: "Invalid staff email or password" });
    }
    const token = signToken({ role: "receptionist", id: rec.id, hospital_id: rec.hospital_id, name: rec.name });
    res.json({ token, receptionist: { id: rec.id, name: rec.name, email: rec.email } });
  } catch (err) {
    res.status(500).json({ error: err.message || "Receptionist login failed" });
  }
});

// ---------- Patient OTP Login (patient portal / kiosk) ----------
router.post("/patient/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required" });
  const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
  const otp = "123456"; // Standard demo OTP
  phoneOtps.set(cleanPhone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  res.json({ ok: true, message: `OTP sent to +91 ${cleanPhone}`, demoOtp: otp });
});

router.post("/patient/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone and OTP are required" });
    const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);

    const stored = phoneOtps.get(cleanPhone);
    const isValid = otp === "123456" || (stored && stored.otp === otp && stored.expiresAt > Date.now());
    if (!isValid) {
      return res.status(401).json({ error: "Invalid or expired OTP. Please use 123456." });
    }

    let patient = await Patient.findOne({ phone: new RegExp(cleanPhone + "$") });
    if (!patient) {
      const firstHospital = await Hospital.findOne();
      const hospId = firstHospital ? firstHospital.id : "default";
      patient = await Patient.create({
        hospital_id: hospId,
        name: `Patient ${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        language: "English"
      });
    }

    const token = signToken({ role: "patient", id: patient.id, hospital_id: patient.hospital_id, name: patient.name });
    res.json({ token, patient });
  } catch (err) {
    res.status(500).json({ error: err.message || "OTP verification failed" });
  }
});

// ---------- Patient password login (legacy fallback) ----------
router.post("/patient/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = (phone || "").replace(/[^0-9]/g, "").slice(-10);
    const patient = await Patient.findOne({ phone: new RegExp(cleanPhone + "$") });
    if (!patient || !patient.password_hash || !bcrypt.compareSync(password || "", patient.password_hash)) {
      return res.status(401).json({ error: "Invalid phone number or password" });
    }
    const token = signToken({ role: "patient", id: patient.id, hospital_id: patient.hospital_id, name: patient.name });
    res.json({ token, patient: { id: patient.id, name: patient.name } });
  } catch (err) {
    res.status(500).json({ error: err.message || "Patient login failed" });
  }
});

// ---------- Patient Kiosk Check-In (ABHA ID or Phone) ----------
router.post("/patient/kiosk-checkin", async (req, res) => {
  try {
    const { abha_id, phone } = req.body;
    let patient = null;
    if (abha_id) {
      patient = await Patient.findOne({ abha_id: abha_id.trim() });
    }
    if (!patient && phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
      patient = await Patient.findOne({ phone: new RegExp(cleanPhone + "$") });
    }
    if (!patient) {
      const firstHospital = await Hospital.findOne();
      const hospId = firstHospital ? firstHospital.id : "default";
      const cleanPhone = phone ? phone.replace(/[^0-9]/g, "").slice(-10) : "9876543210";
      const abhaVal = abha_id || "12-3456-7890-1234";
      patient = await Patient.create({
        hospital_id: hospId,
        name: "Self-Service Patient",
        phone: cleanPhone,
        abha_id: abhaVal,
        language: "English"
      });
    }
    const token = signToken({ role: "patient", id: patient.id, hospital_id: patient.hospital_id, name: patient.name });
    res.json({ token, patient });
  } catch (err) {
    res.status(500).json({ error: err.message || "Kiosk check-in failed" });
  }
});

module.exports = router;
