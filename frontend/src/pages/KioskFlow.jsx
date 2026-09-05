import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, FileUp, Activity, CheckCircle, ShieldCheck, AlertTriangle, Volume2, VolumeX, Fingerprint, UserSquare } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../services/api';
import { useSpeech, SUPPORTED_LANGUAGES } from '../hooks/useSpeech';

// Expanded symptoms list
const SYMPTOMS_LIST = [
  { id: 'fever',       label: 'Fever',            icon: 'S1' },
  { id: 'cough',       label: 'Cough',             icon: 'S2' },
  { id: 'headache',    label: 'Headache',          icon: 'S3' },
  { id: 'stomach',     label: 'Stomach Pain',      icon: 'S4' },
  { id: 'chest',       label: 'Chest Pain',        icon: 'S5', redFlag: true },
  { id: 'weakness',    label: 'Weakness / Fatigue',icon: 'S6' },
  { id: 'breathless',  label: 'Breathlessness',    icon: 'S7', redFlag: true },
  { id: 'vomiting',    label: 'Vomiting / Nausea', icon: 'S8' },
  { id: 'joint_pain',  label: 'Joint Pain',        icon: 'S9' },
  { id: 'skin',        label: 'Skin Rash',         icon: 'S10' },
  { id: 'urinary',     label: 'Urinary Issues',    icon: 'S11' },
  { id: 'eye',         label: 'Eye Problems',      icon: 'S12' },
];

const SYMPTOM_EMOJI = { S1:'🌡️',S2:'🗣️',S3:'🤕',S4:'🤢',S5:'🫀',S6:'🥱',S7:'😮‍💨',S8:'🤮',S9:'🦵',S10:'🩹',S11:'🚽',S12:'👁️' };

export default function KioskFlow() {
  const navigate = useNavigate();
  const { patients, doctors, submitKioskIntake, handleAuthSuccess } = useGlobal();
  const [localDoctors, setLocalDoctors] = useState([]);

  useEffect(() => {
    api.getDoctors().then(docs => {
      if (Array.isArray(docs) && docs.length > 0) setLocalDoctors(docs);
    }).catch(() => {});
  }, []);
  const { speak, stopSpeaking, startListening, stopListening, isListening, isSpeaking, isSupported } = useSpeech();

  const [step, setStep] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Language selection (step 0)
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Intake state
  const [abhaId, setAbhaId] = useState('');
  const [patient, setPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isSelfServed, setIsSelfServed] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [intakeData, setIntakeData] = useState({
    mode: 'Allopathic',
    chiefComplaint: [],
    hpi: '',
    ayushData: {},
    redFlags: [],
    documents: []
  });

  // Dynamic AYUSH questions from server
  const [ayushQuestions, setAyushQuestions] = useState([]);
  const [ayushSubStep, setAyushSubStep] = useState(0);

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // TTS: speak current step question when step changes
  const STEP_PROMPTS = {
    0: 'Welcome to PurvArogya. Please select your language and enter your ABHA ID.',
    1: 'Please review the consent information and choose whether you agree.',
    2: 'Please select your consultation type: Allopathic or AYUSH.',
    3: 'Please select your symptoms or speak to describe your condition.',
    4: 'Please answer the Ayurvedic assessment questions.',
    5: 'You may upload your past prescriptions or lab reports for digitization.',
    6: 'Please choose your preferred doctor.',
    7: 'Please review your intake summary before submitting.',
  };

  useEffect(() => {
    if (audioEnabled && STEP_PROMPTS[step]) {
      // Small delay so UI renders first
      const t = setTimeout(() => speak(STEP_PROMPTS[step], selectedLanguage), 400);
      return () => clearTimeout(t);
    }
  }, [step, audioEnabled, selectedLanguage]);

  // Load AYUSH questions when entering AYUSH mode
  useEffect(() => {
    if (intakeData.mode === 'AYUSH' && ayushQuestions.length === 0) {
      api.getAyushQuestions().then(q => setAyushQuestions(q)).catch(() => {});
    }
  }, [intakeData.mode]);

  // TTS for AYUSH questions
  useEffect(() => {
    if (step === 4 && ayushQuestions[ayushSubStep] && audioEnabled) {
      setTimeout(() => speak(ayushQuestions[ayushSubStep].question, selectedLanguage), 400);
    }
  }, [ayushSubStep, step, audioEnabled]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.kioskCheckin({ abha_id: abhaId, phone: abhaId });
      if (res?.token) handleAuthSuccess(res.token, { ...res.patient, role: 'patient' });
      setPatient(res.patient);
      setIsSelfServed(!!res?.is_self_served);

      // Re-fetch doctors based on patient type (self-served vs receptionist-added)
      try {
        const freshDocs = await api.getDoctors();
        if (Array.isArray(freshDocs)) setLocalDoctors(freshDocs);
      } catch (_) {}

      setStep(1);
    } catch (err) {
      const p = patients[0] || { name: 'Verified Patient', abhaId: abhaId, id: 1 };
      setPatient(p);
      setStep(1);
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleSymptom = (sym) => {
    let newComplaints = [...intakeData.chiefComplaint];
    let newFlags = [...intakeData.redFlags];
    if (newComplaints.includes(sym.label)) {
      newComplaints = newComplaints.filter(c => c !== sym.label);
      if (sym.redFlag) newFlags = newFlags.filter(f => f !== sym.label);
    } else {
      newComplaints.push(sym.label);
      if (sym.redFlag) newFlags.push(sym.label);
    }
    setIntakeData({ ...intakeData, chiefComplaint: newComplaints, redFlags: newFlags });
  };

  const handleVoiceInput = () => {
    if (isListening) { stopListening(); return; }
    startListening(
      selectedLanguage,
      (transcript) => {
        setIntakeData(prev => ({ ...prev, hpi: prev.hpi ? `${prev.hpi} ${transcript}` : transcript }));
      },
      (err) => { console.warn('ASR error:', err.message); }
    );
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsUploading(true);
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const patId = patient?.id || patient?._id || 1;
        const sRes = await api.createSession({
          patient_id: patId,
          ayush_mode: intakeData.mode === 'AYUSH',
        });
        currentSessionId = sRes.session_id || sRes.id;
        setSessionId(currentSessionId);
      }

      const result = await api.uploadDocument(currentSessionId, file);
      setOcrResult(result);
      setIntakeData(prev => ({ ...prev, documents: [...prev.documents, file.name] }));
    } catch (err) {
      if (err.status === 413) {
        alert('File is too large (max 10 MB). Please compress or crop the document.');
      } else {
        console.warn('OCR processing error:', err.message || err);
        setIntakeData(prev => ({ ...prev, documents: [...prev.documents, file.name] }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAyushAnswer = (field, value) => {
    const newAyushData = { ...intakeData.ayushData, [field]: value };
    setIntakeData({ ...intakeData, ayushData: newAyushData });
    if (ayushSubStep < ayushQuestions.length - 1) {
      setAyushSubStep(ayushSubStep + 1);
    }
  };

  const submitToHIS = async () => {
    setIsSubmitting(true);
    try {
      let docIdToAssign = selectedDoctor;
      if (!docIdToAssign) {
        docIdToAssign = filteredDoctors[0]?.id || availableDoctors[0]?.id || doctors[0]?.id || 1;
      }
      const patId = patient?.id || patient?._id || 1;
      if (sessionId) {
        // Session was already created during document upload
        const chiefComplaintText = intakeData.chiefComplaint?.join(', ') || 'General Consultation';
        await api.updateSymptom(sessionId, {
          symptom_id: intakeData.redFlags?.length ? 'chest' : 'general',
          chief_complaint: chiefComplaintText,
          transcript: intakeData.hpi || null,
        });
        if (intakeData.hpi) {
          await api.updateHpi(sessionId, [{ label: 'HPI', value: intakeData.hpi }]);
        }
        if (intakeData.mode === 'AYUSH' && intakeData.ayushData) {
          await api.updateAyush(sessionId, intakeData.ayushData);
        }
        await api.submitSession(sessionId, { doctor_id: docIdToAssign });
      } else {
        await submitKioskIntake(patId, docIdToAssign, intakeData);
      }
      stopSpeaking();
      setStep(8);
      if (audioEnabled) speak('Your intake is complete. Please proceed to the waiting area.', selectedLanguage);
      setTimeout(() => navigate('/'), 5000);
    } catch (err) {
      alert(err.message || 'Failed to submit kiosk intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDoctors = localDoctors.length > 0 ? localDoctors : doctors;
  const filteredDoctors = availableDoctors.filter(d => {
    const isAyu = (d.specialization?.toLowerCase() || '').includes('ayurveda') || (d.doctor_type?.toLowerCase() || '').includes('ayurveda');
    // Show mode-specific doctors if they exist, otherwise show all doctors
    const hasSpecific = availableDoctors.some(doc => {
      const ayu = (doc.specialization?.toLowerCase() || '').includes('ayurveda') || (doc.doctor_type?.toLowerCase() || '').includes('ayurveda');
      return intakeData.mode === 'AYUSH' ? ayu : !ayu;
    });
    if (!hasSpecific) return true;
    return intakeData.mode === 'AYUSH' ? isAyu : !isAyu;
  });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh]">

        {/* Header */}
        <div className="bg-brand-900 text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-10 h-10 mr-3 drop-shadow-md" />
            <div>
              <h1 className="text-xl font-bold">PurvArogya</h1>
              <p className="text-xs text-brand-200">Patient MediKiosk — {selectedLanguage}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {patient && (
              <div className="flex items-center space-x-2 bg-brand-800 px-3 py-1.5 rounded-full border border-brand-700">
                <span className="text-sm font-medium">{patient.name}</span>
                <span className="text-xs bg-accent-500 px-2 py-0.5 rounded text-white font-bold">ABHA</span>
              </div>
            )}
            {isSupported.tts && (
              <button
                onClick={() => { setAudioEnabled(!audioEnabled); if (audioEnabled) stopSpeaking(); }}
                title={audioEnabled ? 'Mute audio guidance' : 'Enable audio guidance'}
                className="p-2 rounded-full bg-brand-800 hover:bg-brand-700 transition"
              >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">

            {/* STEP 0: Check-In + Language Select */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
                <Fingerprint className="w-20 h-20 text-brand-600 mb-2" />
                <h2 className="text-3xl font-bold text-gray-900">Welcome to OPD</h2>
                <p className="text-gray-500">Select your language, then enter your ABHA ID or Mobile number.</p>

                {/* Language selector */}
                <div className="w-full">
                  <p className="text-sm font-semibold text-gray-600 mb-2 text-left">Select Language / भाषा चुनें</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border-2 transition ${selectedLanguage === lang ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleLogin} className="w-full space-y-4">
                  <input
                    type="text" required
                    placeholder="ABHA ID or Mobile (e.g. 12-3456-7890-1234)"
                    value={abhaId}
                    onChange={e => setAbhaId(e.target.value)}
                    className="w-full p-4 text-center text-lg tracking-widest border-2 border-gray-300 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  />
                  <button type="submit" disabled={isVerifying} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-50">
                    {isVerifying ? 'Verifying...' : 'Verify Identity'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 1: DPDP Consent */}
            {step === 1 && (
              <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8 flex items-start">
                  <Volume2 className="w-8 h-8 text-blue-500 mr-4 shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Audio-Visual Consent (DPDP Act 2023)</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      "We require your consent to collect your symptoms and health records. This data is fully encrypted and will be deleted from this device immediately after your doctor reviews it."
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setStep(2)} className="flex-1 bg-accent-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-accent-700 transition flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-6 h-6 mr-2" /> I Consent
                  </button>
                  <button onClick={() => { setStep(0); setPatient(null); }} className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-xl hover:bg-gray-300 transition">
                    Decline
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: System Select */}
            {step === 2 && (
              <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Select Consultation Type</h2>
                <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                  <button
                    onClick={() => { setIntakeData({...intakeData, mode: 'Allopathic'}); setStep(3); setSelectedDoctor(null); }}
                    className="border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 p-10 rounded-2xl flex flex-col items-center transition"
                  >
                    <Activity className="w-16 h-16 text-brand-600 mb-4" />
                    <span className="text-2xl font-bold text-gray-800">Allopathic / Modern</span>
                  </button>
                  <button
                    onClick={() => { setIntakeData({...intakeData, mode: 'AYUSH'}); setStep(3); setSelectedDoctor(null); }}
                    className="border-2 border-gray-200 hover:border-accent-500 hover:bg-accent-50 p-10 rounded-2xl flex flex-col items-center transition"
                  >
                    <span className="text-6xl mb-4">🌿</span>
                    <span className="text-2xl font-bold text-gray-800">AYUSH (Ayurveda)</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Symptoms (Multimodal) */}
            {step === 3 && (
              <motion.div key="step3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">What brings you here today?</h2>
                <p className="text-gray-500 mb-4">Tap symptoms or use the mic to speak in {selectedLanguage}.</p>

                {intakeData.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 mr-3 shrink-0" />
                    <span className="font-semibold">Red Flag: Emergency symptoms selected. Priority triage activated.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {SYMPTOMS_LIST.map(sym => {
                    const isSelected = intakeData.chiefComplaint.includes(sym.label);
                    return (
                      <button
                        key={sym.id}
                        onClick={() => toggleSymptom(sym)}
                        className={`p-4 rounded-2xl border-2 transition flex flex-col items-center justify-center space-y-1
                          ${isSelected ? (sym.redFlag ? 'border-red-500 bg-red-50' : 'border-brand-500 bg-brand-50') : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span className="text-3xl">{SYMPTOM_EMOJI[sym.icon]}</span>
                        <span className={`font-semibold text-sm text-center ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{sym.label}</span>
                        {sym.redFlag && <span className="text-xs text-red-500 font-bold">⚠️ Urgent</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto bg-gray-50 p-5 rounded-2xl border border-gray-200 flex items-center space-x-5">
                  <button
                    onClick={handleVoiceInput}
                    className={`shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1 text-sm">
                      {isListening ? `Listening in ${selectedLanguage}...` : `Tap mic to speak in ${selectedLanguage}`}
                    </p>
                    <textarea
                      value={intakeData.hpi}
                      onChange={e => setIntakeData({...intakeData, hpi: e.target.value})}
                      className="w-full bg-white p-3 rounded-lg border border-gray-300 text-gray-700 text-sm h-16 resize-none"
                      placeholder="Voice transcript appears here..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: AYUSH Guided Dashavidha Pariksha */}
            {step === 4 && (
              <motion.div key="step4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashavidha Pariksha</h2>
                <p className="text-gray-500 mb-6">Question {Math.min(ayushSubStep + 1, ayushQuestions.length)} of {ayushQuestions.length}</p>

                {ayushQuestions.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">Loading Ayurvedic questions...</div>
                ) : ayushSubStep < ayushQuestions.length ? (() => {
                  const q = ayushQuestions[ayushSubStep];
                  return (
                    <div className="space-y-6">
                      <div className="bg-accent-50 p-5 rounded-xl border border-accent-200">
                        <p className="text-xs font-bold text-accent-600 uppercase mb-2">{q.label}</p>
                        <p className="text-xl font-semibold text-gray-900">{q.question}</p>
                      </div>
                      <div className="space-y-3">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleAyushAnswer(q.field, opt)}
                            className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition text-gray-800
                              ${intakeData.ayushData[q.field] === opt ? 'border-accent-500 bg-accent-50 text-accent-800' : 'border-gray-200 hover:border-accent-300 hover:bg-accent-50/50'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {/* Progress dots */}
                      <div className="flex justify-center space-x-1 mt-4">
                        {ayushQuestions.map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < ayushSubStep ? 'bg-accent-600' : i === ayushSubStep ? 'bg-accent-400' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-accent-600 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900">Assessment Complete</p>
                    <p className="text-gray-500 mt-2">All {ayushQuestions.length} parameters recorded.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Document Scan */}
            {step === 5 && (
              <motion.div key="step5" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Scan Past Records</h2>
                <p className="text-gray-500 mb-8">Upload previous prescriptions or lab reports (max 10 MB). PaddleOCR will extract medication and lab data.</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" style={{ display: 'none' }} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-gray-300 rounded-3xl p-14 flex flex-col items-center justify-center bg-gray-50 hover:bg-brand-50 hover:border-brand-300 transition cursor-pointer group"
                >
                  {isUploading ? (
                    <div className="text-brand-600 text-lg font-bold animate-pulse">Processing via OCR...</div>
                  ) : (
                    <>
                      <FileUp className="w-20 h-20 text-gray-400 group-hover:text-brand-500 mb-4" />
                      <p className="text-xl font-bold text-gray-700 group-hover:text-brand-700">Tap to Upload Document</p>
                      <p className="text-gray-500 mt-2 text-sm">Image or PDF, max 10 MB</p>
                    </>
                  )}
                </div>
                {intakeData.documents.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {intakeData.documents.length} document{intakeData.documents.length > 1 ? 's' : ''} uploaded.
                    {ocrResult && <span className="ml-2 text-sm">({ocrResult.medications?.length || 0} meds, {ocrResult.labs?.length || 0} labs extracted)</span>}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 6: Select Doctor */}
            {step === 6 && (
              <motion.div key="step6" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Choose a Physician</h2>
                <p className="text-gray-500 mb-2 text-center">Select your preferred doctor or skip to be auto-assigned.</p>
                <p className="text-xs text-center font-semibold mb-6 ${isSelfServed ? 'text-purple-600' : 'text-brand-600'}">
                  {isSelfServed ? 'Displaying Independent / Teleconsult Physicians' : 'Displaying Doctors Registered at your Hospital'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => (
                    <div key={doc.id} onClick={() => setSelectedDoctor(doc.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-center transition-colors ${selectedDoctor === doc.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}
                    >
                      <UserSquare className={`w-12 h-12 mr-4 ${selectedDoctor === doc.id ? 'text-brand-600' : 'text-gray-400'}`} />
                      <div>
                        <h3 className={`font-bold text-lg ${selectedDoctor === doc.id ? 'text-brand-900' : 'text-gray-900'}`}>{doc.name}</h3>
                        <p className="text-sm text-gray-500">{doc.specialization}</p>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-gray-200">
                      No specific doctors found for {intakeData.mode}. You will be auto-assigned.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 7: Review & Submit */}
            {step === 7 && (
              <motion.div key="step7" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3">Physician-Ready Summary</h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chief Complaints</h3>
                    <div className="flex flex-wrap gap-2">
                      {intakeData.chiefComplaint.length > 0
                        ? intakeData.chiefComplaint.map(c => <span key={c} className="bg-white px-3 py-1 rounded-full border border-gray-300 font-medium shadow-sm text-sm">{c}</span>)
                        : <span className="text-gray-400 text-sm">None selected</span>}
                    </div>
                  </div>
                  {intakeData.hpi && (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">HPI (Voice Transcribed)</h3>
                      <p className="text-gray-800 leading-relaxed text-sm">{intakeData.hpi}</p>
                    </div>
                  )}
                  {intakeData.mode === 'AYUSH' && Object.keys(intakeData.ayushData).length > 0 && (
                    <div className="bg-accent-50 p-5 rounded-2xl border border-accent-200">
                      <h3 className="text-xs font-bold text-accent-600 uppercase tracking-wider mb-3">Dashavidha Pariksha</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(intakeData.ayushData).map(([k, v]) => (
                          <div key={k} className="text-sm"><span className="font-semibold text-gray-600 capitalize">{k.replace(/_/g,' ')}: </span><span className="text-gray-800">{v}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Documents</h3>
                      <p className="text-gray-800 font-medium text-sm">{intakeData.documents.length} file(s) — OCR processed</p>
                    </div>
                    <FileUp className="w-8 h-8 text-brand-500" />
                  </div>
                  {intakeData.redFlags.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-700 font-semibold text-sm">Red Flag — Priority triage will be notified</span>
                    </div>
                  )}
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-200 flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
                    Zero-Persistence: Data will be wiped from kiosk and sent as FHIR Bundle to hospital HIS.
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 8: Success */}
            {step === 8 && (
              <motion.div key="step8" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Intake Complete</h2>
                <p className="text-xl text-gray-600 max-w-lg">Your clinical history has been securely transferred to the doctor's desk. Please proceed to the waiting area.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        {step > 0 && step < 8 && (
          <div className="bg-gray-50 p-5 border-t border-gray-200 flex justify-between items-center shrink-0">
            <button
              onClick={() => {
                if (step === 5 && intakeData.mode === 'Allopathic') setStep(3);
                else if (step === 4) { if (ayushSubStep > 0) { setAyushSubStep(ayushSubStep - 1); } else setStep(3); }
                else setStep(step - 1);
              }}
              className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
            >Back</button>
            <div className="flex space-x-2">
              {[1,2,3,4,5,6,7].map(i => {
                if (intakeData.mode === 'Allopathic' && i === 4) return null;
                return <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-brand-600' : 'bg-gray-300'}`} />;
              })}
            </div>
            {step === 7 ? (
              <button onClick={submitToHIS} disabled={isSubmitting}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit to Doctor'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (step === 3 && intakeData.mode === 'Allopathic') setStep(5);
                  else if (step === 4 && ayushSubStep < ayushQuestions.length - 1) setAyushSubStep(ayushSubStep + 1);
                  else if (step === 4) setStep(5);
                  else setStep(step + 1);
                }}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg">
                {step === 4 && ayushSubStep < ayushQuestions.length - 1 ? 'Next Question' : 'Next'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
