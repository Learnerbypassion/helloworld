/**
 * MediKiosk API -- Node.js / Express
 * Run: cd backend && npm run dev  (port 8000)
 *
 * Dev requires two extra processes:
 *   OCR sidecar: cd ocr-service && python main.py   (port 8001)
 *   Frontend:    cd frontend && npm run dev          (port 5173)
 */
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");

require("./db");

const { printStartupWarning } = require("./otpService");

const authRoutes    = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const intakeRoutes  = require("./routes/intake");
const doctorRoutes  = require("./routes/doctor");
const ayushRoutes   = require("./routes/ayush");

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

app.use("/api/auth",     authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/sessions", intakeRoutes);
app.use("/api/doctor",   doctorRoutes);
app.use("/api/ayush",    ayushRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MediKiosk API (Node.js)" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`MediKiosk API listening on http://localhost:${PORT}`);
  printStartupWarning();
});
