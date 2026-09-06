/**
 * MediKiosk — ABHA Registry Client (Single Source of Truth)
 *
 * Proxies lookup queries directly to the Mock National ABHA Central Server (Port 8005),
 * with graceful in-memory fallback if the central server is booting or offline.
 */
const axios = require("axios");

const ABHA_SERVER_URL = process.env.ABHA_SERVER_URL || "http://localhost:8005";

const ABHA_PATIENTS = [
  { abha_id: "12-3456-7890-1234", name: "Ananya Sharma",   dob: "1990-05-15", age: 35, gender: "Female", phone: "9876543210", address: "42 MG Road, Bengaluru, Karnataka", blood_group: "B+" },
  { abha_id: "98-7654-3210-5678", name: "Rajesh Kumar",    dob: "1978-11-22", age: 47, gender: "Male",   phone: "9123456789", address: "15 Park Street, Kolkata, West Bengal", blood_group: "O+" },
  { abha_id: "11-2233-4455-6677", name: "Priya Patel",     dob: "2002-03-08", age: 24, gender: "Female", phone: "9988776655", address: "8 Navrang Society, Ahmedabad, Gujarat", blood_group: "A+" },
  { abha_id: "55-6677-8899-0011", name: "Vikram Singh",    dob: "1965-07-30", age: 61, gender: "Male",   phone: "9871234560", address: "Plot 22, Sector 14, Faridabad, Haryana", blood_group: "AB-" },
  { abha_id: "22-3344-5566-7788", name: "Meera Nair",      dob: "1995-12-01", age: 30, gender: "Female", phone: "9656565656", address: "Kakkanad, Kochi, Kerala", blood_group: "O-" },
  { abha_id: "33-4455-6677-8800", name: "Arjun Reddy",     dob: "1988-09-14", age: 37, gender: "Male",   phone: "9700000001", address: "Jubilee Hills, Hyderabad, Telangana", blood_group: "A-" },
  { abha_id: "44-5566-7788-9900", name: "Sunita Devi",     dob: "1972-01-25", age: 53, gender: "Female", phone: "9511111111", address: "Civil Lines, Allahabad, Uttar Pradesh", blood_group: "B-" },
  { abha_id: "66-7788-9900-1122", name: "Mohammed Aslam",  dob: "1983-06-18", age: 43, gender: "Male",   phone: "9422222222", address: "Aminabad, Lucknow, Uttar Pradesh", blood_group: "AB+" },
  { abha_id: "77-8899-0011-2233", name: "Kavita Joshi",    dob: "1999-08-07", age: 26, gender: "Female", phone: "9333333333", address: "Shivajinagar, Pune, Maharashtra", blood_group: "O+" },
  { abha_id: "88-9900-1122-3344", name: "Deepak Verma",    dob: "1956-02-14", age: 70, gender: "Male",   phone: "9244444444", address: "Model Town, Delhi", blood_group: "A+" },
];

function normaliseAbhaId(raw) {
  const digits = (raw || "").replace(/[^0-9]/g, "");
  if (digits.length !== 14) return (raw || "").trim();
  return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6,10)}-${digits.slice(10)}`;
}

async function lookupAbha({ abha_id, phone } = {}) {
  const query = abha_id || phone;
  if (query) {
    try {
      const res = await axios.get(`${ABHA_SERVER_URL}/api/patients/${encodeURIComponent(query.trim())}`, { timeout: 3000 });
      if (res.data?.found && res.data?.patient) {
        return { ...res.data.patient, source: "mock_central_server" };
      }
    } catch (_) {
      // Graceful fallback to local seed data if server is offline
    }
  }

  if (abha_id) {
    const norm = normaliseAbhaId(abha_id);
    const found = ABHA_PATIENTS.find(p => normaliseAbhaId(p.abha_id) === norm);
    if (found) return { ...found, abha_id: normaliseAbhaId(found.abha_id), source: "mock_local_fallback" };
  }
  if (phone) {
    const clean = phone.replace(/[^0-9]/g, "").slice(-10);
    const found = ABHA_PATIENTS.find(p => p.phone.slice(-10) === clean);
    if (found) return { ...found, abha_id: normaliseAbhaId(found.abha_id), source: "mock_local_fallback" };
  }
  return null;
}

module.exports = { lookupAbha, ABHA_PATIENTS, normaliseAbhaId };
