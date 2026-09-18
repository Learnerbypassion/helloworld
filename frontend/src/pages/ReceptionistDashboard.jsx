import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, UserPlus, Activity, ArrowRight, CheckCircle2, Thermometer, Heart, Wind, Weight, Lock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api, getStoredUser } from '../services/api';

// ─── Helper: format submitted_at to readable time ─────────────────────────────
function fmtTime(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ts; }
}

// ─── Vitals Station Tab ───────────────────────────────────────────────────────
function VitalsStation() {
  const currentUser = getStoredUser();
  const myId = currentUser?.id || currentUser?._id || '';

  const [vitalsQueue, setVitalsQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState(null);

  // activeSession: the session whose form is currently open (we hold the claim)
  const [activeSession, setActiveSession] = useState(null);
  // Form field values
  const [formValues, setFormValues] = useState({
    temperature: '', bp_systolic: '', bp_diastolic: '',
    pulse: '', spo2: '', weight: '',
  });
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(null); // sessionId being claimed

  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Fetch queue ────────────────────────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    try {
      const data = await api.getVitalsQueue();
      if (mountedRef.current) {
        setVitalsQueue(Array.isArray(data) ? data : []);
        setQueueError(null);
      }
    } catch (err) {
      if (mountedRef.current) setQueueError(err.message || 'Failed to load queue');
    } finally {
      if (mountedRef.current) setLoadingQueue(false);
    }
  }, []);

  // ── 3-second polling — mirrors the KioskFlow.jsx QR upload polling pattern ─
  useEffect(() => {
    mountedRef.current = true;
    fetchQueue();
    pollRef.current = setInterval(fetchQueue, 3000);
    return () => {
      mountedRef.current = false;
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [fetchQueue]);

  // ── Open vitals form: claim first, then open ───────────────────────────────
  const handleTakeVitals = async (session) => {
    setIsClaiming(session.id);
    setFormError(null);
    try {
      await api.claimVitals(session.id);
      setActiveSession(session);
      setFormValues({ temperature: '', bp_systolic: '', bp_diastolic: '', pulse: '', spo2: '', weight: '' });
      setFormError(null);
      // Immediate re-fetch so other stations see the lock right away
      fetchQueue();
    } catch (err) {
      if (err.status === 409) {
        setFormError('Someone just started this one — refreshing queue...');
        fetchQueue();
      } else {
        setFormError(err.message || 'Could not claim session');
      }
    } finally {
      setIsClaiming(null);
    }
  };

  // ── Resume: reopen form for a session we already claimed ───────────────────
  const handleResume = (session) => {
    setActiveSession(session);
    setFormValues({ temperature: '', bp_systolic: '', bp_diastolic: '', pulse: '', spo2: '', weight: '' });
    setFormError(null);
  };

  // ── Cancel form: release claim ─────────────────────────────────────────────
  const handleCancel = async () => {
    if (!activeSession) return;
    try {
      await api.releaseVitals(activeSession.id);
    } catch (_) { /* best-effort */ }
    setActiveSession(null);
    setFormError(null);
    fetchQueue();
  };

  // ── Save vitals ────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeSession) return;
    setIsSaving(true);
    setFormError(null);

    // Parse + validate
    const parse = (v) => (v === '' ? null : parseFloat(v));
    const temp = parse(formValues.temperature);
    const sysBP = parse(formValues.bp_systolic);
    const diaBP = parse(formValues.bp_diastolic);
    const pulse = parse(formValues.pulse);
    const spo2 = parse(formValues.spo2);
    const weight = parse(formValues.weight);

    if (temp !== null && (temp < 90 || temp > 110)) {
      setFormError('Temperature must be between 90–110 °F'); setIsSaving(false); return;
    }
    if (sysBP !== null && (sysBP < 50 || sysBP > 300)) {
      setFormError('BP systolic must be 50–300 mmHg'); setIsSaving(false); return;
    }
    if (diaBP !== null && (diaBP < 30 || diaBP > 200)) {
      setFormError('BP diastolic must be 30–200 mmHg'); setIsSaving(false); return;
    }
    if (pulse !== null && (pulse < 20 || pulse > 300)) {
      setFormError('Pulse must be 20–300 bpm'); setIsSaving(false); return;
    }
    if (spo2 !== null && (spo2 < 0 || spo2 > 100)) {
      setFormError('SpO₂ must be 0–100%'); setIsSaving(false); return;
    }
    if (weight !== null && (weight < 0.5 || weight > 500)) {
      setFormError('Weight must be 0.5–500 kg'); setIsSaving(false); return;
    }

    try {
      await api.saveVitals(activeSession.id, {
        temperature: temp, bp_systolic: sysBP, bp_diastolic: diaBP,
        pulse, spo2, weight,
      });
      setActiveSession(null);
      setFormError(null);
      fetchQueue();
    } catch (err) {
      if (err.status === 409) {
        setFormError('Your claim expired — please try again on this patient.');
        setActiveSession(null);
        fetchQueue();
      } else {
        setFormError(err.message || 'Failed to save vitals');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = 'block w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* ── Queue panel ─────────────────────────────────────────────────── */}
      <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <span className="font-bold text-gray-900 block">Vitals Queue</span>
            <span className="text-xs text-gray-500 font-normal">Shared · all stations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-100 text-brand-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {vitalsQueue.length} waiting
            </span>
            <button
              onClick={fetchQueue}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
              title="Refresh queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[60vh]">
          {loadingQueue && (
            <p className="text-gray-400 text-sm text-center py-6">Loading queue...</p>
          )}
          {!loadingQueue && queueError && (
            <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {queueError}
            </div>
          )}
          {!loadingQueue && !queueError && vitalsQueue.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No patients waiting for vitals.</p>
          )}

          {vitalsQueue.map((s) => {
            const isInProgressByMe = s.vitals_status === 'in_progress' && s.vitals_claimed_by === myId;
            const isInProgressByOther = s.vitals_status === 'in_progress' && s.vitals_claimed_by !== myId;
            const isActive = activeSession?.id === s.id;

            return (
              <div
                key={s.id}
                className={`rounded-xl border p-3.5 transition-all ${
                  isActive
                    ? 'border-brand-400 bg-brand-50/80 shadow-sm'
                    : isInProgressByOther
                    ? 'border-gray-200 bg-gray-50 opacity-70'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">
                        Token: {s.token || s.id.slice(-6)}
                      </span>
                      {s.red_flag && (
                        <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">
                          🚨 Red Flag
                        </span>
                      )}
                    </div>
                    {s.chief_complaint && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{s.chief_complaint}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{fmtTime(s.submitted_at)}</p>
                  </div>

                  {/* Action button area */}
                  <div className="shrink-0">
                    {isInProgressByMe && !isActive && (
                      <button
                        onClick={() => handleResume(s)}
                        className="text-xs font-semibold px-3 py-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
                      >
                        Resume
                      </button>
                    )}
                    {!isInProgressByMe && !isInProgressByOther && (
                      <button
                        onClick={() => handleTakeVitals(s)}
                        disabled={isClaiming === s.id}
                        className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {isClaiming === s.id ? 'Claiming...' : 'Take Vitals'}
                      </button>
                    )}
                    {isInProgressByOther && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span className="max-w-[100px] truncate" title={s.vitals_claimed_by_name}>
                          {s.vitals_claimed_by_name || 'Other receptionist'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lock banner when in-progress by someone else */}
                {isInProgressByOther && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                    <Lock className="w-3 h-3 shrink-0" />
                    Being handled by {s.vitals_claimed_by_name || 'another receptionist'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Claim/409 error banner below the list */}
          {formError && !activeSession && (
            <div className="flex items-start gap-2 text-amber-700 text-xs p-3 bg-amber-50 rounded-lg border border-amber-200 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {formError}
            </div>
          )}
        </div>
      </div>

      {/* ── Vitals form panel ────────────────────────────────────────────── */}
      <div className="xl:col-span-3">
        {!activeSession ? (
          <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
            <Activity className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-base font-medium">Select a patient from the queue</p>
            <p className="text-sm mt-1 opacity-70">Click "Take Vitals" to open the recording form</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-brand-300 shadow-md overflow-hidden">
            {/* Form header */}
            <div className="px-5 py-4 bg-brand-900 text-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">
                  Pre-Consultation Vitals
                  <span className="ml-2 text-xs bg-brand-700 px-2 py-0.5 rounded-full border border-brand-600">
                    Token: {activeSession.token || activeSession.id.slice(-6)}
                  </span>
                </h2>
                <p className="text-brand-200 text-xs mt-0.5">All fields optional — record what's available</p>
              </div>
              <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-semibold">
                🔒 Claimed by you
              </span>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5">
              {/* Row 1: Temperature + BP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>🌡️ Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="110"
                    placeholder="e.g. 98.6"
                    value={formValues.temperature}
                    onChange={(e) => setFormValues(v => ({ ...v, temperature: e.target.value }))}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Range: 90–110 °F</p>
                </div>
                <div>
                  <label className={labelCls}>🩺 BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    min="50"
                    max="300"
                    placeholder="e.g. 120"
                    value={formValues.bp_systolic}
                    onChange={(e) => setFormValues(v => ({ ...v, bp_systolic: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>🩺 BP Diastolic (mmHg)</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    placeholder="e.g. 80"
                    value={formValues.bp_diastolic}
                    onChange={(e) => setFormValues(v => ({ ...v, bp_diastolic: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Row 2: Pulse + SpO2 + Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>❤️ Pulse (bpm)</label>
                  <input
                    type="number"
                    min="20"
                    max="300"
                    placeholder="e.g. 72"
                    value={formValues.pulse}
                    onChange={(e) => setFormValues(v => ({ ...v, pulse: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>🫁 SpO₂ (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 98"
                    value={formValues.spo2}
                    onChange={(e) => setFormValues(v => ({ ...v, spo2: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>⚖️ Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="500"
                    placeholder="e.g. 65"
                    value={formValues.weight}
                    onChange={(e) => setFormValues(v => ({ ...v, weight: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-start gap-2 text-red-700 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-brand-600 text-white font-semibold rounded-lg py-2.5 hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Vitals'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-5 border border-gray-300 text-gray-700 font-medium rounded-lg py-2.5 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Receptionist Dashboard ──────────────────────────────────────────────
export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { patients, doctors, queue, addPatient, forwardToDoctor, logout } = useGlobal();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'vitals', 'add'

  // Add Patient States
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Details
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [patientDetails, setPatientDetails] = useState({ name: '', age: '', gender: 'Male', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forwarding State mapping patient id to selected doctor
  const [selectedDocs, setSelectedDocs] = useState({});

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setIsSubmitting(true);
      try {
        await api.sendPatientOtp(phone);
        setStep(2);
      } catch (err) {
        alert(err.message || 'Failed to send OTP');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep(3);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addPatient({ ...patientDetails, phone });
      setStep(1);
      setPhone('');
      setOtp('');
      setPatientDetails({ name: '', age: '', gender: 'Male', address: '' });
      setActiveTab('queue');
    } catch (err) {
      alert(err.message || 'Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForward = async (patientId) => {
    const docId = selectedDocs[patientId];
    if (!docId) return alert('Select doctor first!');
    try {
      await forwardToDoctor(patientId, docId);
      alert('Patient forwarded to doctor queue successfully!');
      setSelectedDocs(prev => ({ ...prev, [patientId]: '' }));
    } catch (err) {
      alert(err.message || 'Failed to forward patient to doctor');
    }
  };

  const handleSignOut = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="p-6 flex items-center border-b border-brand-800">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Dhanvantri" className="w-9 h-9 mr-3 drop-shadow-md rounded-xl object-contain bg-white p-1" />
          <span className="text-lg font-bold">Dhanvantri</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('queue')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'queue' ? 'bg-brand-800' : 'hover:bg-brand-800/50'}`}>
            <Activity className="w-5 h-5 mr-3" /> Dashboard & Queue
          </button>
          <button onClick={() => setActiveTab('vitals')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'vitals' ? 'bg-brand-800' : 'hover:bg-brand-800/50'}`}>
            <Heart className="w-5 h-5 mr-3" /> Vitals Station
          </button>
          <button onClick={() => setActiveTab('add')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'add' ? 'bg-brand-800' : 'hover:bg-brand-800/50'}`}>
            <UserPlus className="w-5 h-5 mr-3" /> Add / Walk-in
          </button>
        </nav>
        <div className="p-4 border-t border-brand-800">
          <button onClick={handleSignOut} className="flex items-center w-full px-4 py-3 hover:bg-brand-800/50 rounded-lg transition-colors text-red-300 hover:text-red-200">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Management</h1>

        {activeTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registered Patients List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50/50 font-semibold text-gray-800 flex justify-between items-center">
                <span>Registered Patients Directory</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{patients.length} records</span>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {patients.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No patients registered yet. Add walk-in patient from the tab above.</p>
                ) : patients.map(p => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{p.name} <span className="text-sm font-normal text-gray-500">({p.age ? `${p.age} yrs` : 'Age N/A'}, {p.gender || 'N/A'})</span></p>
                      <p className="text-sm text-gray-500">Phone: +91 {p.phone}</p>
                      {p.abhaId && <p className="text-xs text-brand-600 font-mono mt-0.5">ABHA: {p.abhaId}</p>}
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                      <select
                        value={selectedDocs[p.id] || ''}
                        onChange={(e) => setSelectedDocs({ ...selectedDocs, [p.id]: e.target.value })}
                        className="text-sm border-gray-300 rounded p-1.5 border"
                      >
                        <option value="">Select Doctor...</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                      </select>
                      <button
                        onClick={() => handleForward(p.id)}
                        className="bg-accent-600 text-white text-sm px-3 py-1.5 rounded hover:bg-accent-700 font-medium"
                      >
                        Forward
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Queue */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50/50 font-semibold text-gray-800 flex justify-between items-center">
                <span>Live Doctor Queues</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">{queue.length} in queue</span>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {queue.length === 0 ? <p className="text-gray-500 text-center py-6">No patients currently waiting in doctor queue.</p> : null}
                {queue.map(q => {
                  const pat = patients.find(pt => pt.id === q.patientId) || { name: q.patient_name || q.name || `Patient #${q.patientId}` };
                  const doc = doctors.find(dt => dt.id === q.doctorId) || { name: 'Attending Doctor' };
                  return (
                    <div key={q.id} className="bg-brand-50 border border-brand-100 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-brand-900">{pat?.name}</p>
                        <p className="text-sm text-brand-700">Waiting for: {doc?.name}</p>
                        {q.intake?.chiefComplaint?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">{q.intake.chiefComplaint.join(', ')}</p>
                        )}
                      </div>
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">Waiting</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && <VitalsStation />}

        {activeTab === 'add' && (
          <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">New Patient Registration</h2>

            {/* Steps indicator */}
            <div className="flex justify-between items-center mb-8 px-4 relative">
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-accent-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </div>
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <label className="block text-sm font-medium">Patient Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">+91</span>
                  <input type="tel" maxLength={10} required value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 block w-full p-2.5 border border-gray-300 rounded-r-md" placeholder="Enter number..." />
                </div>
                <button type="submit" disabled={isSubmitting || phone.length < 10} className="w-full bg-accent-600 text-white rounded p-3 font-medium hover:bg-accent-700 disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send OTP for Verification'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <label className="block text-sm font-medium">Enter OTP sent to +91 {phone}</label>
                <input type="text" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value)} className="block w-full p-2.5 text-center tracking-widest font-bold border border-gray-300 rounded-md" placeholder="123456" />
                <button type="submit" disabled={otp.length < 6} className="w-full bg-accent-600 text-white rounded p-3 font-medium hover:bg-accent-700 disabled:opacity-50">
                  Verify OTP
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">Full Name</label>
                    <input type="text" required value={patientDetails.name} onChange={e => setPatientDetails({...patientDetails, name: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Age</label>
                    <input type="number" required value={patientDetails.age} onChange={e => setPatientDetails({...patientDetails, age: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select value={patientDetails.gender} onChange={e => setPatientDetails({...patientDetails, gender: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">Address</label>
                    <textarea required value={patientDetails.address} onChange={e => setPatientDetails({...patientDetails, address: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded"></textarea>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-accent-600 text-white rounded p-3 font-medium hover:bg-accent-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Patient Profile'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

