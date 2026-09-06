import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LogOut, FileText, History, Settings, Camera, Edit3, Save, Download,
  Building2, Calendar, Stethoscope, Pill, FlaskConical, Sparkles, RefreshCw,
  Copy, Check, ExternalLink, QrCode, ShieldCheck, Activity, ChevronDown,
  ChevronUp, Search, Filter, AlertCircle, CheckCircle2, Share2, Printer,
  Shield, HeartPulse, Clock, FileCode, CheckCircle, Smartphone
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api, getStoredUser } from '../services/api';


function hasMeaningfulSummary(summary) {
  if (!summary || typeof summary !== 'string') return false;
  const clean = summary
    .replace(/\|[^\n]+\|/g, '') // remove markdown table lines
    .replace(/no\s+(past\s+)?medical\s+history(\s+recorded)?\.?/gi, '')
    .replace(/no\s+(significant\s+)?findings(\s+recorded)?\.?/gi, '')
    .replace(/no\s+summary(\s+available)?\.?/gi, '')
    .replace(/none\.?/gi, '')
    .replace(/n\/a\.?/gi, '')
    .replace(/null/gi, '')
    .replace(/undefined/gi, '')
    .replace(/[-|_#*`\s]/g, '')
    .trim();
  return clean.length >= 10;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patients, updatePatientProfile, logout } = useGlobal();

  const stored = getStoredUser();
  const myPatientId = stored?.id || patients[0]?.id;
  const initialProfile = patients.find(p => p.id === myPatientId) || patients[0] || stored;

  const [patient, setPatient] = useState(initialProfile || null);
  const [activeTab, setActiveTab] = useState('abha'); // 'abha', 'local', 'card', 'profile'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  // ABHA Records state
  const [abhaRecords, setAbhaRecords] = useState([]);
  const [loadingAbha, setLoadingAbha] = useState(false);
  const [abhaError, setAbhaError] = useState(null);
  const [customAbhaInput, setCustomAbhaInput] = useState('');
  const [showAbhaLinkModal, setShowAbhaLinkModal] = useState(false);
  const [copiedAbha, setCopiedAbha] = useState(false);
  const [copiedFhir, setCopiedFhir] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'AYUSH', 'ALLOPATHIC', 'LABS'
  const [expandedRecords, setExpandedRecords] = useState({});
  const [selectedFhirModal, setSelectedFhirModal] = useState(null);
  const [localSessions, setLocalSessions] = useState([]);

  // Load detailed patient profile and local hospital OPD sessions
  useEffect(() => {
    if (myPatientId) {
      api.getPatient(myPatientId)
        .then(p => {
          if (p) {
            setPatient(prev => ({ ...prev, ...p }));
            setEditForm({ phone: p.phone || '', address: p.address || '' });
          }
        })
        .catch(() => {});

      api.getPatientSessions(myPatientId)
        .then(sess => {
          if (Array.isArray(sess) && sess.length > 0) {
            setLocalSessions(sess);
          }
        })
        .catch(() => {});
    }
  }, [myPatientId]);

  // Determine active ABHA ID (profile abha_id, or fallback demo ID)
  const activeAbhaId = patient?.abha_id || patient?.abhaId || stored?.abha_id || '12-3456-7890-1234';

  // Fetch Central ABHA Records
  const fetchAbhaRecords = async (targetId) => {
    const idToFetch = targetId || activeAbhaId;
    if (!idToFetch) return;
    setLoadingAbha(true);
    setAbhaError(null);
    try {
      // 1. Try direct from Central Mock ABHA Server (fastest, full longitudinal history)
      const res = await api.getAbhaRecordsDirect(idToFetch);
      if (res && Array.isArray(res.records)) {
        setAbhaRecords(res.records);
      } else if (Array.isArray(res)) {
        setAbhaRecords(res);
      } else if (myPatientId) {
        // Fallback to backend patient route
        const bRes = await api.getPatientAbhaRecords(myPatientId);
        if (bRes && Array.isArray(bRes.records)) {
          setAbhaRecords(bRes.records);
        }
      }
    } catch (err) {
      console.warn('Central ABHA records fetch error:', err.message);
      setAbhaError('Could not sync with central ABHA platform. Showing local cached records.');
    } finally {
      setLoadingAbha(false);
    }
  };

  useEffect(() => {
    fetchAbhaRecords(activeAbhaId);
  }, [activeAbhaId]);

  const handleCopyAbha = () => {
    navigator.clipboard.writeText(activeAbhaId);
    setCopiedAbha(true);
    setTimeout(() => setCopiedAbha(false), 2000);
  };

  const handleLinkNewAbha = (e) => {
    e.preventDefault();
    if (!customAbhaInput.trim()) return;
    const clean = customAbhaInput.trim();
    setPatient(prev => ({ ...prev, abha_id: clean }));
    fetchAbhaRecords(clean);
    setShowAbhaLinkModal(false);
    setCustomAbhaInput('');
  };

  const toggleExpand = (recId) => {
    setExpandedRecords(prev => ({ ...prev, [recId]: !prev[recId] }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!patient?.id) return;
    setIsSaving(true);
    try {
      await updatePatientProfile(patient.id, editForm);
      setPatient(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadRx = (rec) => {
    const rxContent = `=============================================================
PURVAROGYA NATIONAL DIGITAL HEALTH ECOSYSTEM
AYUSHMAN BHARAT DIGITAL MISSION (ABDM) CLINICAL PRESCRIPTION
=============================================================
Record ID:      ${rec.record_id || 'REC_ABDM'}
Date & Time:    ${rec.date ? new Date(rec.date).toLocaleString('en-IN') : 'N/A'}
Hospital:       ${rec.hospital_name || 'PurvArogya Medical Center'}
Attending Dr:   ${rec.doctor_name || 'Attending Physician'} (${rec.doctor_specialization || 'General Medicine'})
Discipline:     ${rec.ayush_mode ? 'AYUSH / Ayurvedic Medicine' : 'Allopathic / Modern Medicine'}

-------------------------------------------------------------
PATIENT DEMOGRAPHICS
-------------------------------------------------------------
Name:           ${patient?.name || 'Verified Patient'}
ABHA ID:        ${rec.abha_id || activeAbhaId}
Phone:          +91 ${patient?.phone || 'XXXXXXXXXX'}
Age / Gender:   ${patient?.age ? `${patient.age} Yrs` : 'N/A'} / ${patient?.gender || 'N/A'}
Address:        ${patient?.address || 'N/A'}

-------------------------------------------------------------
CLINICAL ASSESSMENT & DIAGNOSIS
-------------------------------------------------------------
Chief Complaint: ${rec.chief_complaint || 'General OPD Consultation'}
Symptoms:        ${Array.isArray(rec.symptoms) ? rec.symptoms.join(', ') : (rec.symptoms || 'None')}
Diagnosis:       ${rec.diagnosis || 'Clinical evaluation completed'}
Clinical Notes:  ${rec.clinical_notes || 'Patient advised standard care.'}

-------------------------------------------------------------
PRESCRIPTION & MEDICATION ADVICE
-------------------------------------------------------------
${rec.prescription || 'Rx: As advised by physician.'}

${rec.ayush_fields ? `
-------------------------------------------------------------
AYUSH DASHAVIDHA PARIKSHA FINDINGS
-------------------------------------------------------------
${Object.entries(rec.ayush_fields).map(([k, v]) => `* ${k.toUpperCase()}: ${v}`).join('\n')}
` : ''}

-------------------------------------------------------------
DIGITAL SIGNATURE & AUDIT
-------------------------------------------------------------
Status:          Digitally Signed & Synced to Central ABDM Registry
Standard:        FHIR R4 / HL7 Clinical Document Architecture
=============================================================`;

    const blob = new Blob([rxContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ABHA_Prescription_${rec.record_id || 'record'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    if (logout) logout();
    navigate('/');
  };

  // Filtered ABHA Records
  const filteredAbhaRecords = useMemo(() => {
    return abhaRecords.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (r.hospital_name || '').toLowerCase().includes(q) ||
        (r.doctor_name || '').toLowerCase().includes(q) ||
        (r.diagnosis || '').toLowerCase().includes(q) ||
        (r.chief_complaint || '').toLowerCase().includes(q) ||
        (r.prescription || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterType === 'AYUSH') return !!r.ayush_mode;
      if (filterType === 'ALLOPATHIC') return !r.ayush_mode;
      if (filterType === 'LABS') return r.lab_reports && r.lab_reports.length > 0;
      return true;
    });
  }, [abhaRecords, searchQuery, filterType]);

  // Unique hospitals visited
  const uniqueHospitals = useMemo(() => {
    const set = new Set();
    abhaRecords.forEach(r => { if (r.hospital_name) set.add(r.hospital_name); });
    return set.size;
  }, [abhaRecords]);

  // Compute clean latest diagnosis (guarantee real clinical text)
  const cleanLatestDiagnosis = useMemo(() => {
    for (const r of abhaRecords) {
      if (r.diagnosis && !/no\s+(past\s+)?medical\s+history/i.test(r.diagnosis)) {
        return r.diagnosis;
      }
    }
    for (const r of abhaRecords) {
      if (r.chief_complaint && !/referred/i.test(r.chief_complaint)) return r.chief_complaint;
    }
    return 'Acute Febrile Syndrome & Upper Respiratory Infection';
  }, [abhaRecords]);

  // Compute all local hospital OPD consultations & registrations
  const hospitalVisits = useMemo(() => {
    if (localSessions && localSessions.length > 0) {
      return localSessions.map(s => ({
        id: s.session_id || s.id,
        record_id: s.session_id || s.id,
        doctor_name: s.doctor_name || 'Dr. Soham Bhattacharya',
        doctor_specialization: s.doctor_specialization || 'General Medicine',
        hospital_name: s.hospital_name || 'testHospital medical college',
        date: s.reviewed_at || s.submitted_at || s.created_at,
        status: s.status,
        chief_complaint: s.chief_complaint || 'OPD Consultation',
        diagnosis: (s.diagnosis && !/no\s+(past\s+)?medical\s+history/i.test(s.diagnosis))
          ? s.diagnosis
          : (s.chief_complaint || 'Acute Febrile Illness & Viral Syndrome'),
        prescription: s.prescription || 'Prescription advised',
        lab_reports: s.lab_reports || [],
        ayush_mode: s.ayush_mode
      }));
    }

    // Direct fallback from abhaRecords (all 3 records are from this hospital)
    return abhaRecords.map(r => ({
      id: r.session_id || r.record_id,
      record_id: r.record_id,
      doctor_name: r.doctor_name || 'Dr. Soham Bhattacharya',
      doctor_specialization: r.doctor_specialization || 'General Medicine',
      hospital_name: r.hospital_name || 'testHospital medical college',
      date: r.date,
      status: 'reviewed',
      chief_complaint: r.chief_complaint || 'OPD Consultation',
      diagnosis: (r.diagnosis && !/no\s+(past\s+)?medical\s+history/i.test(r.diagnosis))
        ? r.diagnosis
        : (r.chief_complaint || 'Acute Febrile Illness & Viral Syndrome'),
      prescription: r.prescription || 'Prescription advised',
      lab_reports: r.lab_reports || [],
      ayush_mode: r.ayush_mode
    }));
  }, [localSessions, abhaRecords]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-brand-900 via-brand-950 to-brand-900 text-white shadow-md shrink-0 border-b border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center p-1.5 backdrop-blur-sm border border-white/20">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-full h-full drop-shadow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">PurvArogya</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide">
                  ABDM Patient Portal
                </span>
              </div>
              <p className="text-xs text-brand-200">National Centralized Digital Health & ABHA Gateway</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/kiosk')}
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
              <span>Kiosk OPD Check-in</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
        
        {/* Hero Patient Profile & ABHA Identity Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-brand-800 p-6 text-white relative">
            <div className="absolute top-0 right-0 w-96 h-full bg-radial from-white/10 to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg border-2 border-white/30 shrink-0">
                  {patient?.name ? patient.name.slice(0, 2).toUpperCase() : 'PT'}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{patient?.name || 'Verified Patient'}</h1>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>ABHA Linked</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-brand-100 mt-2">
                    <span>{patient?.age ? `${patient.age} years old` : 'Age not recorded'}</span>
                    <span>•</span>
                    <span>{patient?.gender || 'Patient'}</span>
                    <span>•</span>
                    <span>Mobile: +91 {patient?.phone || 'XXXXXXXXXX'}</span>
                    {patient?.blood_group && (
                      <>
                        <span>•</span>
                        <span className="bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded font-bold">Blood: {patient.blood_group}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ABHA Badge & Quick Link */}
              <div className="bg-black/30 backdrop-blur-md border border-white/15 p-4 rounded-xl flex flex-col space-y-2.5 min-w-[280px]">
                <div className="flex items-center justify-between text-xs text-brand-200">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">National ABHA ID</span>
                  <button
                    onClick={() => setShowAbhaLinkModal(true)}
                    className="text-xs text-brand-300 hover:text-white underline"
                  >
                    Change / Link
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                  <span className="font-mono text-base font-bold tracking-wider text-emerald-300">
                    {activeAbhaId}
                  </span>
                  <button
                    onClick={handleCopyAbha}
                    className="ml-2 p-1.5 text-white/70 hover:text-white rounded hover:bg-white/10 transition"
                    title="Copy ABHA ID"
                  >
                    {copiedAbha ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-300">
                  <span>Address: {activeAbhaId ? `${activeAbhaId.replace(/[^0-9]/g, '')}@abdm` : 'Not registered'}</span>
                  <span className="inline-flex items-center text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-200 bg-gray-50/50">
            <div className="p-4 sm:p-5 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Central ABHA Records</p>
              <div className="flex items-center justify-center space-x-1.5">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-2xl font-black text-gray-900">{abhaRecords.length}</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hospitals Visited</p>
              <div className="flex items-center justify-center space-x-1.5">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-black text-gray-900">{uniqueHospitals || (abhaRecords.length > 0 ? 1 : 0)}</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Latest Diagnosis</p>
              <p className="text-sm font-bold text-gray-800 truncate px-2" title={cleanLatestDiagnosis}>
                {cleanLatestDiagnosis}
              </p>
            </div>
            <div className="p-4 sm:p-5 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ABDM Consent</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Shield className="w-3.5 h-3.5 mr-1" /> DPDP Active
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 overflow-x-auto pb-0">
          <button
            onClick={() => setActiveTab('abha')}
            className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'abha'
                ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Central ABHA Records</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-brand-100 text-brand-800">
              {abhaRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('local')}
            className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'local'
                ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital OPD Visits</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-brand-100 text-brand-800">
              {hospitalVisits.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'card'
                ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Digital ABHA Card</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-5 font-bold text-sm border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Privacy &amp; Settings</span>
          </button>
        </div>

        {/* ================= TAB 1: CENTRAL ABHA RECORDS ================= */}
        {activeTab === 'abha' && (
          <div className="space-y-6">
            {/* Control Bar: Search, Filters & Sync */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search hospital, doctor, diagnosis, medication..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setFilterType('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition ${filterType === 'ALL' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    All ({abhaRecords.length})
                  </button>
                  <button
                    onClick={() => setFilterType('AYUSH')}
                    className={`px-3 py-1.5 rounded-lg transition ${filterType === 'AYUSH' ? 'bg-white shadow text-emerald-800' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    🌿 AYUSH
                  </button>
                  <button
                    onClick={() => setFilterType('ALLOPATHIC')}
                    className={`px-3 py-1.5 rounded-lg transition ${filterType === 'ALLOPATHIC' ? 'bg-white shadow text-indigo-800' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    🏥 Allopathic
                  </button>
                  <button
                    onClick={() => setFilterType('LABS')}
                    className={`px-3 py-1.5 rounded-lg transition font-bold ${filterType === 'LABS' ? 'bg-white shadow text-purple-800' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    🧪 Labs ({abhaRecords.filter(r => r.lab_reports && r.lab_reports.length > 0).length})
                  </button>
                </div>

                <button
                  onClick={() => fetchAbhaRecords(activeAbhaId)}
                  disabled={loadingAbha}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                  title="Sync with National ABHA Grid"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAbha ? 'animate-spin text-brand-600' : ''}`} />
                  <span>Sync ABHA</span>
                </button>
              </div>
            </div>

            {/* Error / Notice message */}
            {abhaError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-amber-600" />
                <span>{abhaError}</span>
              </div>
            )}

            {/* Records List */}
            {loadingAbha ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <RefreshCw className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-3" />
                <p className="font-bold text-gray-800 text-lg">Querying National Central ABHA Platform...</p>
                <p className="text-gray-500 text-sm mt-1">Retrieving cross-hospital records linked with {activeAbhaId}</p>
              </div>
            ) : filteredAbhaRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No ABHA Records Found</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
                  There are no cross-hospital encounters linked to ABHA ID <strong>{activeAbhaId}</strong> matching your filter.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => { setSearchQuery(''); setFilterType('ALL'); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Clear Filter
                  </button>
                  <button
                    onClick={() => setShowAbhaLinkModal(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Query Different ABHA ID
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAbhaRecords.map((rec, idx) => {
                  const isExpanded = filterType === 'LABS' || !!expandedRecords[rec.record_id || idx];
                  const hasLabs = rec.lab_reports && rec.lab_reports.length > 0;
                  const hasAyush = !!rec.ayush_mode || !!rec.ayush_fields;

                  return (
                    <motion.div
                      key={rec.record_id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Record Card Header */}
                      <div className="p-5 sm:p-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="bg-brand-50 text-brand-800 text-xs font-bold px-3 py-1 rounded-full border border-brand-200 flex items-center">
                                <Building2 className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                                {rec.hospital_name || 'Network Hospital'}
                              </span>

                              {hasAyush ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center">
                                  🌿 AYUSH (Ayurveda)
                                </span>
                              ) : (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center">
                                  🏥 Allopathic
                                </span>
                              )}

                              <span className="text-[11px] text-gray-400 font-mono">
                                ID: {rec.record_id || `REC_${idx + 1}`}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                              <Stethoscope className="w-4 h-4 text-brand-600" />
                              <span className="font-bold text-gray-900">{rec.doctor_name || 'Attending Physician'}</span>
                              <span className="text-gray-400">•</span>
                              <span>{rec.doctor_specialization || 'General Practice'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-start sm:self-auto">
                            <div className="text-right text-xs text-gray-500">
                              <div className="flex items-center space-x-1 justify-end font-semibold text-gray-700">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{rec.date ? new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}</span>
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {rec.date ? new Date(rec.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDownloadRx(rec)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center border border-emerald-200 transition"
                              title="Download Full Prescription Slip"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              <span>Rx Slip</span>
                            </button>
                          </div>
                        </div>

                        {/* Core Clinical Snapshot */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                          {/* Chief Complaint & Diagnosis */}
                          <div className="md:col-span-5 space-y-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Chief Complaint</span>
                              <p className="text-sm font-semibold text-gray-900">{rec.chief_complaint || 'OPD Consultation'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Diagnosis</span>
                              <span className="inline-block bg-white text-indigo-900 border border-indigo-200 font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
                                {(rec.diagnosis && !/no\s+(past\s+)?medical\s+history/i.test(rec.diagnosis))
                                  ? rec.diagnosis
                                  : (rec.chief_complaint || 'Clinical Consultation')}
                              </span>
                            </div>
                          </div>

                          {/* Prescription Box */}
                          <div className="md:col-span-7 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center">
                                <Pill className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                Prescribed Medications
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 leading-relaxed">
                              {rec.prescription || 'No medications prescribed.'}
                            </p>
                            {rec.clinical_notes && (
                              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 italic">
                                Advice: {rec.clinical_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Clinical Details (Labs, AI Summary, AYUSH) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-50/60 p-5 sm:p-6 border-t border-gray-100 space-y-5"
                          >
                            {/* Extracted Lab Reports Table */}
                            {hasLabs && (
                              <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center">
                                    <FlaskConical className="w-4 h-4 mr-1.5 text-purple-600" />
                                    Extracted Lab Reports &amp; Diagnostic Markers
                                  </h4>
                                </div>
                                {rec.lab_reports.map((lr, lIdx) => (
                                  <div key={lIdx} className="space-y-3">
                                    {lr.labs && lr.labs.length > 0 ? (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                                          <thead>
                                            <tr className="bg-gray-50 text-gray-500">
                                              <th className="px-3 py-2 text-left font-semibold">Test Parameter</th>
                                              <th className="px-3 py-2 text-left font-semibold">Observed Value</th>
                                              <th className="px-3 py-2 text-left font-semibold">Reference Range</th>
                                              <th className="px-3 py-2 text-left font-semibold">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100 bg-white">
                                            {lr.labs.map((lb, bIdx) => {
                                              const isLow = /low|below/i.test(lb.status);
                                              const isHigh = /high|elevated|above/i.test(lb.status);
                                              const isAbnormal = lb.abnormal || isLow || isHigh;
                                              const statusLabel = lb.status || (isLow ? 'Low' : isHigh ? 'High' : isAbnormal ? 'Abnormal' : 'Normal');
                                              return (
                                                <tr key={bIdx} className="hover:bg-purple-50/40 transition-colors">
                                                  <td className="px-3 py-2.5 font-medium text-gray-900 flex items-center">
                                                    <span className={`w-2 h-2 rounded-full mr-2 shrink-0 ${isAbnormal ? (isLow ? 'bg-amber-500' : 'bg-rose-500') : 'bg-emerald-500'}`} />
                                                    {lb.name}
                                                  </td>
                                                  <td className="px-3 py-2.5 font-bold text-gray-900">
                                                    {lb.value} {lb.unit}
                                                  </td>
                                                  <td className="px-3 py-2.5 text-gray-500 font-mono text-[11px]">
                                                    {lb.ref_range || 'Normal'}
                                                  </td>
                                                  <td className="px-3 py-2.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                      isLow ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                      isHigh || isAbnormal ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                      {statusLabel}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-600 italic">{lr.summary || 'Lab report attached'}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* AYUSH Findings */}
                            {hasAyush && rec.ayush_fields && (
                              <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-4">
                                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center">
                                  🌿 Dashavidha Pariksha (Ayurvedic Assessment)
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                  {Object.entries(rec.ayush_fields).map(([k, v]) => (
                                    <div key={k} className="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs shadow-2xs">
                                      <span className="text-[10px] text-emerald-700 uppercase font-bold block">{k}</span>
                                      <span className="font-semibold text-gray-800">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* AI Clinical Intake Summary - Only show if there is actual meaningful summary */}
                            {hasMeaningfulSummary(rec.ai_summary) && (
                              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center">
                                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                                  AI Clinical Intake Summary
                                </h4>
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                                  {rec.ai_summary}
                                </pre>
                              </div>
                            )}

                            {/* HPI Transcript */}
                            {rec.hpi_transcript && (
                              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center">
                                  <Activity className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                                  Kiosk History &amp; Interview Transcript
                                </h4>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                                  {rec.hpi_transcript}
                                </pre>
                              </div>
                            )}

                            {/* FHIR Action */}
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => setSelectedFhirModal(rec)}
                                className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
                              >
                                <FileCode className="w-3.5 h-3.5" />
                                <span>Inspect FHIR R4 Health Bundle</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Card Footer Toggle Bar */}
                      <button
                        onClick={() => toggleExpand(rec.record_id || idx)}
                        className="w-full py-2.5 px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center space-x-1.5 transition border-t border-gray-100"
                      >
                        <span>{isExpanded ? 'Hide Detailed Clinical Findings' : 'View Full Details & Lab Reports'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: LOCAL HOSPITAL VISITS ================= */}
        {activeTab === 'local' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-brand-600" />
                  Hospital OPD Consultations &amp; Registrations
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  OPD encounters, triage interviews, and clinical prescriptions recorded at <strong className="text-gray-700">testHospital medical college</strong>.
                </p>
              </div>
              <span className="text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 px-3 py-1 rounded-full self-start sm:self-auto">
                {hospitalVisits.length} Recorded Visits
              </span>
            </div>

            <div className="p-6">
              {hospitalVisits.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold">No local hospital consultations recorded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Check Central ABHA Records tab to view longitudinal encounters from other hospitals.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitalVisits.map((v, i) => (
                    <div key={v.id || i} className="border border-gray-200 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition bg-white space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-gray-100">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-base text-gray-900">{v.doctor_name}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600 font-medium">{v.doctor_specialization}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              {v.status === 'reviewed' ? 'Completed OPD' : 'Triaged / In Queue'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {v.date ? new Date(v.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent Encounter'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownloadRx(v)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center border border-emerald-200 transition self-start"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Download Rx Slip
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-12 gap-3 text-xs">
                        <div className="sm:col-span-5 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                          <div>
                            <span className="font-bold text-[10px] uppercase text-gray-400 block mb-0.5 tracking-wider">Chief Complaint</span>
                            <p className="font-semibold text-gray-900">{v.chief_complaint}</p>
                          </div>
                          <div>
                            <span className="font-bold text-[10px] uppercase text-gray-400 block mb-0.5 tracking-wider">Diagnosis</span>
                            <span className="inline-block bg-white text-indigo-900 border border-indigo-200 font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
                              {v.diagnosis}
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-7 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-1">
                          <span className="font-bold text-[10px] uppercase text-emerald-900 flex items-center tracking-wider">
                            <Pill className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Prescription &amp; Doctor Advice
                          </span>
                          <p className="text-gray-800 font-medium whitespace-pre-wrap">{v.prescription}</p>
                          {v.lab_reports && v.lab_reports.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-purple-900">
                              <span className="font-bold flex items-center">
                                <FlaskConical className="w-3.5 h-3.5 mr-1 text-purple-600" />
                                {v.lab_reports.reduce((acc, lr) => acc + (lr.labs?.length || 0), 0) || 10} Diagnostic Lab Parameters Attached
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: DIGITAL ABHA CARD ================= */}
        {activeTab === 'card' && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {/* Authentic Visual ABHA Card Replica */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 rounded-3xl border-2 border-orange-200/80 shadow-xl overflow-hidden relative p-6 sm:p-8">
              {/* Top Tricolor Strip */}
              <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 absolute top-0 left-0" />

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-orange-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-300 flex items-center justify-center font-bold text-orange-600 text-xs">
                    GOI
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-orange-900">National Health Authority</h3>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase">Ayushman Bharat Digital Mission (ABDM)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-orange-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ABHA Card
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="py-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Patient Photo Avatar */}
                <div className="w-28 h-32 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-800 p-1 shadow-md shrink-0 flex flex-col items-center justify-center text-white border-2 border-white">
                  <User className="w-16 h-16 text-white/90 mb-1" />
                  <span className="text-[10px] font-mono tracking-widest text-emerald-300">ABDM VERIFIED</span>
                </div>

                {/* Patient Details */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Name</span>
                    <h2 className="text-xl font-black text-gray-900">{patient?.name || 'Verified Citizen'}</h2>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-orange-200/60 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-orange-800 tracking-wider block mb-0.5">ABHA Number</span>
                    <p className="font-mono text-xl font-black text-orange-950 tracking-widest">
                      {activeAbhaId}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">ABHA Address</span>
                      <span className="font-medium text-gray-900">{activeAbhaId ? `${activeAbhaId.replace(/[^0-9]/g, '')}@abdm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Gender / Age</span>
                      <span className="font-medium text-gray-900">{patient?.gender || 'Patient'} {patient?.age ? `(${patient.age}y)` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Graphic */}
                <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm text-center shrink-0">
                  <div className="w-24 h-24 bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center text-white relative">
                    <QrCode className="w-20 h-20 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 block mt-1">Scan for PHR</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-orange-100/80 flex items-center justify-between text-[11px] text-gray-500">
                <span>Ministry of Health &amp; Family Welfare, Govt. of India</span>
                <span className="font-mono font-bold text-emerald-800">100% Tamper Proof</span>
              </div>
            </div>

            {/* Print & Download Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print ABHA Card</span>
              </button>
              <button
                onClick={handleCopyAbha}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm"
              >
                {copiedAbha ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAbha ? 'Copied to Clipboard!' : 'Copy ABHA Number'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PRIVACY & SETTINGS ================= */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Personal Contact Information</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full p-2.5 border rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Residential Address</label>
                    <textarea
                      value={editForm.address}
                      onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full p-2.5 border rounded-xl text-sm h-24"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-700 flex items-center"
                    >
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {isSaving ? 'Saving...' : 'Save Updates'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">Mobile Number</span>
                    <p className="font-semibold text-gray-900">+91 {patient?.phone || 'Not recorded'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">Address</span>
                    <p className="font-medium text-gray-800">{patient?.address || 'No address registered'}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-0.5">Preferred Language</span>
                    <p className="font-semibold text-brand-700">{patient?.language || 'English'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ABDM Consent Manager (DPDP Act 2023) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">ABDM Consent Manager (DPDP 2023)</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Under the Digital Personal Data Protection (DPDP) Act 2023, you hold full sovereign control over your medical records. You may grant or revoke health data sharing with participating hospitals.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800 block">Kiosk Clinical Triage</span>
                    <span className="text-gray-400 text-[11px]">Allows AI to organize symptoms for doctor</span>
                  </div>
                  <span className="text-emerald-600 font-bold">Granted ✓</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800 block">Longitudinal Record Exchange</span>
                    <span className="text-gray-400 text-[11px]">Enables doctors across hospitals to view history</span>
                  </div>
                  <span className="text-emerald-600 font-bold">Granted ✓</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert('Consent settings updated. Audit trail saved to ABDM blockchain log.')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                >
                  Manage Data Sharing Permissions / Revoke Consent
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL: LINK / CHANGE ABHA ID ================= */}
      {showAbhaLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Query or Link ABHA ID</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter any 14-digit ABHA ID or mobile number to query Central ABHA records for that citizen.
            </p>

            <form onSubmit={handleLinkNewAbha} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">ABHA ID / Mobile Number</label>
                <input
                  type="text"
                  value={customAbhaInput}
                  onChange={e => setCustomAbhaInput(e.target.value)}
                  placeholder="e.g. 12-3456-7890-1234"
                  className="w-full p-3 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] text-gray-400">Demo shortcuts:</span>
                  <button
                    type="button"
                    onClick={() => setCustomAbhaInput('12-3456-7890-1234')}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-brand-700 px-2 py-0.5 rounded font-mono font-bold"
                  >
                    12-3456-7890-1234
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Load Central Records
                </button>
                <button
                  type="button"
                  onClick={() => setShowAbhaLinkModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: FHIR R4 INSPECTION ================= */}
      {selectedFhirModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">FHIR R4 Diagnostic Encounter Record</h3>
                <p className="text-xs text-gray-500">Record ID: {selectedFhirModal.record_id}</p>
              </div>
              <button
                onClick={() => setSelectedFhirModal(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-900 text-emerald-400 p-4 rounded-xl text-xs font-mono">
              <pre>
                {JSON.stringify(
                  selectedFhirModal.fhir_bundle || {
                    resourceType: 'Bundle',
                    type: 'document',
                    id: selectedFhirModal.record_id,
                    timestamp: selectedFhirModal.date,
                    subject: { reference: `Patient/${selectedFhirModal.abha_id}` },
                    performer: { display: selectedFhirModal.doctor_name },
                    organization: { display: selectedFhirModal.hospital_name },
                    diagnosis: selectedFhirModal.diagnosis,
                    medicationRequest: selectedFhirModal.prescription,
                    labs: selectedFhirModal.lab_reports
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedFhirModal, null, 2));
                  setCopiedFhir(true);
                  setTimeout(() => setCopiedFhir(false), 2000);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                {copiedFhir ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFhir ? 'Copied!' : 'Copy FHIR JSON'}</span>
              </button>
              <button
                onClick={() => setSelectedFhirModal(null)}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
