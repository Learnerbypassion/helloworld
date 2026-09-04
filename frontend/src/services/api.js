/**
 * PurvArogya / MediKiosk API client
 * Interacts with the Express/MongoDB backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getAuthToken = () => localStorage.getItem('medikiosk_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('medikiosk_token', token);
  else localStorage.removeItem('medikiosk_token');
};

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('medikiosk_user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('medikiosk_user', JSON.stringify(user));
  else localStorage.removeItem('medikiosk_user');
};

export const clearAuth = () => {
  localStorage.removeItem('medikiosk_token');
  localStorage.removeItem('medikiosk_user');
};

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });
  
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  registerHospital: (data) => apiFetch('/auth/hospital/register', { method: 'POST', body: JSON.stringify(data) }),
  loginHospital: (data) => apiFetch('/auth/hospital/login', { method: 'POST', body: JSON.stringify(data) }),
  loginDoctor: (data) => apiFetch('/auth/doctor/login', { method: 'POST', body: JSON.stringify(data) }),
  loginReceptionist: (data) => apiFetch('/auth/receptionist/login', { method: 'POST', body: JSON.stringify(data) }),
  sendPatientOtp: (phone) => apiFetch('/auth/patient/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyPatientOtp: (phone, otp) => apiFetch('/auth/patient/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  loginPatient: (phone, password) => apiFetch('/auth/patient/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),
  kioskCheckin: (params) => apiFetch('/auth/patient/kiosk-checkin', { method: 'POST', body: JSON.stringify(params) }),

  // Doctors
  getDoctors: () => apiFetch('/auth/doctors'),
  addDoctor: (data) => apiFetch('/auth/doctors', { method: 'POST', body: JSON.stringify(data) }),
  deleteDoctor: (id) => apiFetch(`/auth/doctors/${id}`, { method: 'DELETE' }),
  updateDoctorPassword: (id, password) => apiFetch(`/auth/doctors/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),

  // Receptionists
  getReceptionists: () => apiFetch('/auth/receptionists'),
  addReceptionist: (data) => apiFetch('/auth/receptionists', { method: 'POST', body: JSON.stringify(data) }),
  deleteReceptionist: (id) => apiFetch(`/auth/receptionists/${id}`, { method: 'DELETE' }),
  updateReceptionistPassword: (id, password) => apiFetch(`/auth/receptionists/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),

  // Patients
  getPatients: () => apiFetch('/patients'),
  findPatient: (phone) => apiFetch(`/patients/find?phone=${encodeURIComponent(phone)}`),
  lookupPatient: (params) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/patients/lookup?${qs}`);
  },
  getPatient: (id) => apiFetch(`/patients/${id}`),
  addPatient: (data) => apiFetch('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => apiFetch(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getPatientSessions: (id) => apiFetch(`/patients/${id}/sessions`),

  // Kiosk & Intake Sessions
  createSession: (data) => apiFetch('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  updateSymptom: (id, data) => apiFetch(`/sessions/${id}/symptom`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateHpi: (id, details) => apiFetch(`/sessions/${id}/hpi`, { method: 'PATCH', body: JSON.stringify({ details }) }),
  updateAyush: (id, fields) => apiFetch(`/sessions/${id}/ayush`, { method: 'PATCH', body: JSON.stringify(fields) }),
  updateParameters: (id, parameters) => apiFetch(`/sessions/${id}/parameters`, { method: 'PATCH', body: JSON.stringify({ parameters }) }),
  uploadDocument: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiFetch(`/sessions/${id}/document`, { method: 'POST', body: fd });
  },
  submitSession: (id) => apiFetch(`/sessions/${id}/submit`, { method: 'POST' }),
  getSession: (id) => apiFetch(`/sessions/${id}`),

  // Doctor Module
  getDoctorQueue: () => apiFetch('/doctor/queue'),
  getDoctorStats: () => apiFetch('/doctor/stats'),
  getPatientMedications: (patientId) => apiFetch(`/doctor/patients/${patientId}/medications`),
  reviewSession: (sessionId, data) => apiFetch(`/doctor/sessions/${sessionId}/review`, { method: 'POST', body: JSON.stringify(data) }),
};
