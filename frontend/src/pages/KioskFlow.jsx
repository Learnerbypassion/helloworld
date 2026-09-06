import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, FileUp, Activity, CheckCircle, ShieldCheck, AlertTriangle,
  Volume2, VolumeX, Fingerprint, UserSquare, Sparkles, Search,
  User, Calendar, MapPin, Heart, ChevronRight, Loader, BrainCircuit
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../services/api';
import { useSpeech, SUPPORTED_LANGUAGES } from '../hooks/useSpeech';
import { getTranslation, SYMPTOM_TRANSLATIONS, STEP_PROMPTS_BY_LANG, getQuestionOptions } from '../utils/kioskTranslations';


const getQEng = (q) => (typeof q === "object" && q ? q.english || q.translated : q) || "";
const getQTrans = (q) => (typeof q === "object" && q ? q.translated || q.english : q) || "";

const SYMPTOMS_LIST = [
  { id: 'fever',      label: 'Fever',              icon: '🌡️', redFlag: false },
  { id: 'cough',      label: 'Cough',               icon: '🗣️', redFlag: false },
  { id: 'headache',   label: 'Headache',            icon: '🤕', redFlag: false },
  { id: 'stomach',    label: 'Stomach Pain',        icon: '🤢', redFlag: false },
  { id: 'chest',      label: 'Chest Pain',          icon: '🫀', redFlag: true  },
  { id: 'weakness',   label: 'Weakness / Fatigue',  icon: '🥱', redFlag: false },
  { id: 'breathless', label: 'Breathlessness',      icon: '😮‍💨', redFlag: true  },
  { id: 'vomiting',   label: 'Vomiting / Nausea',  icon: '🤮', redFlag: false },
  { id: 'joint_pain', label: 'Joint Pain',          icon: '🦵', redFlag: false },
  { id: 'skin',       label: 'Skin Rash',           icon: '🩹', redFlag: false },
  { id: 'urinary',    label: 'Urinary Issues',      icon: '🚽', redFlag: false },
  { id: 'eye',        label: 'Eye Problems',        icon: '👁️', redFlag: false },
];

function AIThinkingLoader({ chiefComplaint }) {
  const messages = [
    'Thinking & analysing your symptoms...',
    'Consulting clinical triage guidelines...',
    'Creating best targeted questions...',
    'Personalising intake for your doctor...',
    'Almost ready...'
  ];

  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length);
    }, 2200);

    const progTimer = setInterval(() => {
      setProgress(p => (p < 88 ? p + Math.floor(Math.random() * 12) + 6 : Math.min(p + 1, 95)));
    }, 600);

    return () => {
      clearInterval(timer);
      clearInterval(progTimer);
    };
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-lg mx-auto text-center select-none">
      {/* Live AI Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-sm"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600"></span>
        </span>
        <span>AI Clinical Engine Active</span>
      </motion.div>

      {/* Animated Glowing Orb & Brain */}
      <div className="relative mb-8 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.08, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-36 h-36 rounded-full bg-brand-400 blur-lg"
        />
        <motion.div
          animate={{ scale: [1.1, 1.55, 1.1], opacity: [0.25, 0.04, 0.25] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute w-44 h-44 rounded-full bg-accent-400 blur-xl"
        />

        {/* Orbiting particles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute w-32 h-32 rounded-full border border-dashed border-brand-300"
        >
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-brand-600 shadow-md shadow-brand-400" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 rounded-full border border-brand-200"
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent-500 shadow-sm" />
        </motion.div>

        {/* Central glowing icon container */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-500 shadow-xl shadow-brand-500/30 flex items-center justify-center text-white"
        >
          <BrainCircuit className="w-10 h-10 animate-pulse" />
        </motion.div>
      </div>

      {/* Dynamic Animated Text Headline */}
      <div className="h-12 flex items-center justify-center mb-2">
        <AnimatePresence mode="wait">
          <motion.h3
            key={msgIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="text-xl font-bold text-gray-800 tracking-tight"
          >
            {messages[msgIdx]}
          </motion.h3>
        </AnimatePresence>
      </div>

      {/* Selected symptoms context tags */}
      {chiefComplaint && chiefComplaint.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 max-w-md">
          <span className="text-xs text-gray-400 font-medium mr-1">Evaluating:</span>
          {chiefComplaint.map((sym, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
            >
              {sym}
            </span>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full max-w-xs mb-3">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-600 via-accent-500 to-brand-500 rounded-full"
            initial={{ width: '15%' }}
            animate={{ width: progress + '%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Pulsing indicator dots */}
      <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-medium">
        <span>Formulating clinical intake questions</span>
        <span className="flex space-x-1 ml-1">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="inline-block w-1.5 h-1.5 bg-brand-600 rounded-full"
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="inline-block w-1.5 h-1.5 bg-brand-600 rounded-full"
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="inline-block w-1.5 h-1.5 bg-brand-600 rounded-full"
          />
        </span>
      </div>
    </div>
  );
}

export default function KioskFlow() {
  // Localization helper
  const t = (key, ...args) => getTranslation(key, selectedLanguage, ...args);
  const navigate = useNavigate();
  const location = useLocation();
  const { doctors, submitKioskIntake, handleAuthSuccess } = useGlobal();

  const [searchParams] = useSearchParams();
  const urlHospId = searchParams.get('hospital_id');
  const urlKioskId = searchParams.get('kiosk_id');

  // Priority: URL Param -> Location State -> LocalStorage -> Registered Hospital Default
  const [kioskHospitalId, setKioskHospitalId] = useState(
    urlHospId || location.state?.hospital_id || localStorage.getItem('mediKiosk_hospital_id') || '6a9c3b6bf41dd3e1afb895f1'
  );
  const [kioskId, setKioskId] = useState(
    urlKioskId || location.state?.kiosk_id || localStorage.getItem('mediKiosk_kiosk_id') || 'KIOSK-01'
  );
  const [kioskHospitalName, setKioskHospitalName] = useState(
    location.state?.hospital_name || localStorage.getItem('mediKiosk_hospital_name') || 'testHospital medical college'
  );

  useEffect(() => {
    if (kioskHospitalId) localStorage.setItem('mediKiosk_hospital_id', kioskHospitalId);
    if (kioskId) localStorage.setItem('mediKiosk_kiosk_id', kioskId);
    if (kioskHospitalName) localStorage.setItem('mediKiosk_hospital_name', kioskHospitalName);
  }, [kioskHospitalId, kioskId, kioskHospitalName]);

  const [localDoctors, setLocalDoctors] = useState([]);
  const { speak, stopSpeaking, startListening, stopListening, isListening, isSpeaking, isSupported, bhasiniAvailable, voiceProvider, isVoiceLoading, voiceLoadingText } = useSpeech();

  const [step,            setStep]           = useState(0);
  const [audioEnabled,    setAudioEnabled]   = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleLanguageChange = (lang) => {
    stopSpeaking();
    setSelectedLanguage(lang);
    if (audioEnabled) {
      const prompt = STEP_PROMPTS_BY_LANG[lang]?.[step] || STEP_PROMPTS_BY_LANG.English[lang] || STEP_PROMPTS_BY_LANG.English[step];
      if (prompt) {
        speak(prompt, lang);
      }
    }
  };

  const [abhaInput,        setAbhaInput]       = useState('');
  const [abhaLookupResult, setAbhaLookupResult] = useState(null);
  const [isLookingUp,      setIsLookingUp]     = useState(false);
  const [lookupError,      setLookupError]     = useState('');

  const [patient,      setPatient]     = useState(null);
  const [isSelfServed, setIsSelfServed] = useState(true);
  const [sessionId,    setSessionId]   = useState(null);
  const [isVerifying,  setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [intakeData, setIntakeData] = useState({
    mode: 'Allopathic', chiefComplaint: [], hpi: '', ayushData: {}, redFlags: [], documents: [],
  });
  const [customDiseaseInput, setCustomDiseaseInput] = useState('');

  const [hpiQuestions, setHpiQuestions] = useState([]);
  const [hpiAnswers,   setHpiAnswers]   = useState({});
  const [hpiSubStep,   setHpiSubStep]   = useState(0);
  const [loadingHpi,   setLoadingHpi]   = useState(false);

  const [ayushQuestions, setAyushQuestions] = useState([]);
  const [ayushSubStep,   setAyushSubStep]   = useState(0);

  const [selectedDoctor,      setSelectedDoctor]      = useState(null);
  const [recommendedDoctorId, setRecommendedDoctorId] = useState(null);
  const [recRationale,        setRecRationale]        = useState('');
  const [loadingRec,          setLoadingRec]          = useState(false);

  const fileInputRef  = useRef(null);
  const [ocrResult,   setOcrResult]  = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const STEP_PROMPTS = STEP_PROMPTS_BY_LANG[selectedLanguage] || STEP_PROMPTS_BY_LANG.English;

  useEffect(() => {
    if (audioEnabled && STEP_PROMPTS[step]) {
      const t = setTimeout(() => speak(STEP_PROMPTS[step], selectedLanguage), 400);
      return () => clearTimeout(t);
    }
  }, [step, audioEnabled, selectedLanguage]);

  useEffect(() => {
    if (intakeData.mode === 'AYUSH' && ayushQuestions.length === 0)
      api.getAyushQuestions().then(q => setAyushQuestions(q)).catch(() => {});
  }, [intakeData.mode]);

  useEffect(() => {
    api.getDoctors({ hospital_id: kioskHospitalId }).then(d => {
      if (Array.isArray(d) && d.length > 0) setLocalDoctors(d);
    }).catch(() => {});
  }, [kioskHospitalId]);

  const handleAbhaLookup = async () => {
    if (!abhaInput.trim()) { setLookupError('Please enter an ABHA ID or mobile number.'); return; }
    setIsLookingUp(true); setLookupError(''); setAbhaLookupResult(null);
    try {
      const isPhone = /^\d{10}$/.test(abhaInput.replace(/\D/g, ''));
      const params  = isPhone ? { phone: abhaInput } : { abha_id: abhaInput };
      const result  = await api.abhaLookup(params);
      setAbhaLookupResult(result);
    } catch {
      setLookupError('Registry lookup failed. You can still continue as a new patient.');
      setAbhaLookupResult({ found: false, patient: null });
    } finally { setIsLookingUp(false); }
  };

  const handleCheckin = async () => {
    setIsVerifying(true);
    try {
      const demographics = abhaLookupResult?.patient || null;
      const isPhone = /^\d{10}$/.test(abhaInput.replace(/\D/g, ''));
      const params = {
        abha_id: !isPhone ? abhaInput : undefined,
        phone:   isPhone  ? abhaInput : demographics?.phone,
        hospital_id: kioskHospitalId,
        kiosk_id: kioskId,
        abha_demographics: demographics,
      };
      const res = await api.kioskCheckin(params);
      if (res?.token) handleAuthSuccess(res.token, { ...res.patient, role: 'patient' });
      // Always show ABHA registry demographics for display (name, dob, age, gender)
      // but keep the DB patient id for session linking
      const dbPatient = res.patient || {};
      const mergedPatient = {
        ...dbPatient,
        // ABHA demographics override stale DB fields for display
        ...(demographics ? {
          name:    demographics.name    || dbPatient.name,
          dob:     demographics.dob     || dbPatient.dob,
          age:     demographics.age     || dbPatient.age,
          gender:  demographics.gender  || dbPatient.gender,
          address: demographics.address || dbPatient.address,
          abha_id: demographics.abha_id || dbPatient.abha_id,
        } : {}),
      };
      setPatient(mergedPatient);
      setIsSelfServed(!!res?.is_self_served);
      try { const fd = await api.getDoctors(); if (Array.isArray(fd)) setLocalDoctors(fd); } catch (_) {}
      setStep(1);
    } catch {
      const p = abhaLookupResult?.patient
        ? { ...abhaLookupResult.patient, id: 'temp_' + Date.now() }
        : { name: 'Verified Patient', id: 'temp_' + Date.now() };
      setPatient(p); setStep(1);
    } finally { setIsVerifying(false); }
  };

  const toggleSymptom = (sym) => {
    const symLabel = SYMPTOM_TRANSLATIONS[sym.id]?.[selectedLanguage] || sym.label;
    let cc = [...intakeData.chiefComplaint];
    let fl = [...intakeData.redFlags];
    const isSelected = cc.includes(sym.label) || cc.includes(symLabel);
    if (isSelected) {
      cc = cc.filter(c => c !== sym.label && c !== symLabel);
      if (sym.redFlag) fl = fl.filter(f => f !== sym.label && f !== symLabel);
    } else {
      cc.push(symLabel);
      if (sym.redFlag) fl.push(symLabel);
    }
    setIntakeData({ ...intakeData, chiefComplaint: cc, redFlags: fl });
  };

  const handleVoiceInput = () => {
    if (step === 4) {
      handleHpiVoiceInput();
      return;
    }
    if (isListening) { stopListening(); return; }
    stopSpeaking();
    startListening(
      selectedLanguage,
      transcript => {
        if (!transcript) return;
        setIntakeData(prev => ({
          ...prev,
          hpi: prev.hpi ? `${prev.hpi} ${transcript.trim()}` : transcript.trim(),
        }));
      },
      e => console.warn('ASR error:', e.message)
    );
  };

  const handleHpiVoiceInput = () => {
    if (isListening) { stopListening(); return; }
    stopSpeaking();
    const currentItem = hpiQuestions[hpiSubStep];
    if (!currentItem) return;
    const qKey = getQEng(currentItem);
    startListening(
      selectedLanguage,
      transcript => {
        if (!transcript) return;
        setHpiAnswers(prev => {
          const existing = prev[qKey] ? `${prev[qKey]} ` : '';
          const updatedVal = existing + transcript.trim();
          const newAnswers = { ...prev, [qKey]: updatedVal };
          const hpiText = Object.entries(newAnswers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n');
          setIntakeData(p => ({ ...p, hpi: hpiText }));
          return newAnswers;
        });
      },
      e => console.warn('ASR error in HPI step:', e.message)
    );
  };

  const ensureSession = async () => {
    if (sessionId) return sessionId;
    try {
      const patId = patient?.id || patient?._id || 1;
      const sRes  = await api.createSession({ patient_id: patId, ayush_mode: intakeData.mode === 'AYUSH', hospital_id: kioskHospitalId, kiosk_id: kioskId });
      const sid   = sRes.session_id || sRes.id;
      setSessionId(sid);
      return sid;
    } catch { return null; }
  };

  const goToHpiStep = async () => {
    setStep(4);
    setLoadingHpi(true);
    setHpiSubStep(0);
    try {
      const sid = await ensureSession();
      if (sid) {
        try {
          const chiefComplaintStr = intakeData.chiefComplaint.length > 0
            ? intakeData.chiefComplaint.join(', ')
            : ((intakeData.hpi && intakeData.hpi.trim()) || 'General Consultation');

          await api.updateSymptom(sid, {
            symptom_id: intakeData.redFlags.length ? 'chest' : (intakeData.chiefComplaint[0] || 'general'),
            chief_complaint: chiefComplaintStr,
            transcript: intakeData.hpi || null,
          });
        } catch (_) {}
        const res = await api.getHpiQuestions(sid);
        if (res && res.questions && res.questions.length > 0) {
          const items = [];
          for (const q of res.questions) {
            if (typeof q === "object" && q.english) {
              let trans = (q.translations && q.translations[selectedLanguage]) || q.english;
              // If AI generated and non-English, translate on the fly
              if (selectedLanguage !== "English" && trans === q.english) {
                try {
                  const tr = await api.translate(q.english, selectedLanguage);
                  if (tr && tr.translated_text) trans = tr.translated_text;
                } catch (_) {}
              }
              const opts = q.type === "scale"
                ? null
                : ((q.options && (q.options[selectedLanguage] || q.options.English)) || null);
              items.push({
                english: q.english,
                translated: trans,
                type: q.type,
                options: opts,
              });
            } else {
              items.push({ english: q, translated: q });
            }
          }
          setHpiQuestions(items);
          if (audioEnabled && items[0]) {
            setTimeout(() => speak(items[0].translated, selectedLanguage), 400);
          }
          return;
        }
      }
      const defaultEng = [
        'How long have you been experiencing these symptoms?',
        'On a scale of 1-10, how severe is your discomfort?',
        'Does anything make your symptoms better or worse?',
        'Do you have any fever, nausea, or other associated symptoms?',
        'Have you taken any medication for this? If yes, which one?',
      ];
      let items = defaultEng.map(q => ({ english: q, translated: q }));
      if (selectedLanguage !== 'English') {
        try {
          const transQs = await Promise.all(
            defaultEng.map(q => api.translate(q, selectedLanguage).then(r => r.translated_text || q).catch(() => q))
          );
          items = defaultEng.map((q, i) => ({ english: q, translated: transQs[i] || q }));
        } catch (_) {}
      }
      setHpiQuestions(items);
      if (audioEnabled && items[0]) {
        setTimeout(() => speak(items[0].translated, selectedLanguage), 400);
      }
    } catch {
      const defaultEng = [
        'How long have you been experiencing these symptoms?',
        'On a scale of 1-10, how severe is your discomfort?',
        'Does anything make your symptoms better or worse?',
        'Do you have any fever, nausea, or other associated symptoms?',
        'Have you taken any medication for this? If yes, which one?',
      ];
      let items = defaultEng.map(q => ({ english: q, translated: q }));
      setHpiQuestions(items);
      if (audioEnabled && items[0]) {
        setTimeout(() => speak(items[0].translated, selectedLanguage), 400);
      }
    } finally {
      setLoadingHpi(false);
    }
  };

  const handleHpiAnswer = (qItem, answer) => {
    const qKey = getQEng(qItem);
    const newA = { ...hpiAnswers, [qKey]: answer };
    setHpiAnswers(newA);
    const hpiText = Object.entries(newA).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n\n');
    setIntakeData(p => ({ ...p, hpi: hpiText }));
    if (hpiSubStep < hpiQuestions.length - 1) {
      setHpiSubStep(s => s + 1);
      const nextItem = hpiQuestions[hpiSubStep + 1];
      if (audioEnabled && nextItem) setTimeout(() => speak(getQTrans(nextItem), selectedLanguage), 300);
    } else {
      // Completed all questions -> move to next step!
      setStep(intakeData.mode === "AYUSH" ? 4.5 : 5);
    }
  };

  const handleAyushAnswer = (field, value) => {
    setIntakeData({ ...intakeData, ayushData: { ...intakeData.ayushData, [field]: value } });
    if (ayushSubStep < ayushQuestions.length - 1) setAyushSubStep(s => s + 1);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const sid = await ensureSession();
      if (sid) {
        const result = await api.uploadDocument(sid, file);
        setOcrResult(result);
        setIntakeData(p => ({ ...p, documents: [...p.documents, file.name] }));
      } else {
        setIntakeData(p => ({ ...p, documents: [...p.documents, file.name] }));
      }
    } catch (err) {
      if (err.status === 413) alert('File too large (max 10 MB).');
      else setIntakeData(p => ({ ...p, documents: [...p.documents, file.name] }));
    } finally { setIsUploading(false); }
  };

  const goToDoctorStep = async () => {
    setStep(6);
    setLoadingRec(true);
    try {
      const sid = await ensureSession();
      if (sid) {
        try {
          await api.updateSymptom(sid, {
            symptom_id: intakeData.redFlags.length ? 'chest' : 'general',
            chief_complaint: intakeData.chiefComplaint.join(', ') || 'General Consultation',
            transcript: intakeData.hpi || null,
          });
          if (intakeData.hpi) await api.updateHpi(sid, [{ label: 'HPI', value: intakeData.hpi }]);
          const res = await api.recommendDoctor(sid);
          if (res && res.recommended_doctor_id) {
            setRecommendedDoctorId(res.recommended_doctor_id);
            setSelectedDoctor(res.recommended_doctor_id);
            setRecRationale(res.rationale || '');
          }
        } catch (_) {}
      }
    } finally {
      setLoadingRec(false);
    }
  };

  const submitToHIS = async () => {
    setIsSubmitting(true);
    try {
      const docId = selectedDoctor || recommendedDoctorId || availableDoctors[0]?.id || null;
      const patId = patient?.id || patient?._id || 1;
      const sid   = sessionId || await ensureSession();
      if (sid) {
        const cc = intakeData.chiefComplaint.join(', ') || 'General Consultation';
        await api.updateSymptom(sid, { symptom_id: intakeData.redFlags.length ? 'chest' : 'general', chief_complaint: cc, transcript: intakeData.hpi || null });
        if (intakeData.hpi) await api.updateHpi(sid, [{ label: 'HPI', value: intakeData.hpi }]);
        if (intakeData.mode === 'AYUSH' && intakeData.ayushData) await api.updateAyush(sid, intakeData.ayushData);
        await api.submitSession(sid, { doctor_id: docId });
      } else {
        await submitKioskIntake(patId, docId, intakeData);
      }
      stopSpeaking(); setStep(8);
      if (audioEnabled) speak('Your intake is complete. Please proceed to the waiting area.', selectedLanguage);
      setTimeout(() => navigate('/'), 5000);
    } catch (err) {
      alert(err.message || 'Failed to submit kiosk intake');
    } finally { setIsSubmitting(false); }
  };

  const handleNext = () => {
    if (step === 3) { goToHpiStep(); return; }
    if (step === 4 && hpiSubStep < hpiQuestions.length - 1) { setHpiSubStep(s => s + 1); return; }
    if (step === 4 && intakeData.mode === 'AYUSH') { setStep(4.5); return; }
    if (step === 4.5 && ayushSubStep < ayushQuestions.length - 1) { setAyushSubStep(s => s + 1); return; }
    if (step === 5) { goToDoctorStep(); return; }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 4 && hpiSubStep > 0)     { setHpiSubStep(s => s - 1); return; }
    if (step === 4)                        { setStep(3); return; }
    if (step === 4.5 && ayushSubStep > 0)  { setAyushSubStep(s => s - 1); return; }
    if (step === 4.5)                      { setStep(4); return; }
    if (step === 5 && intakeData.mode === 'Allopathic') { setStep(4); return; }
    setStep(s => Math.max(0, s - 1));
  };

  const availableDoctors = localDoctors.length > 0 ? localDoctors : doctors;
  const filteredDoctors  = availableDoctors.filter(d => {
    const isAyu = /ayurveda/i.test(d.specialization || '') || /ayurveda/i.test(d.doctor_type || '');
    const hasSpec = availableDoctors.some(doc => intakeData.mode === 'AYUSH'
      ? /ayurveda/i.test(doc.specialization || '') || /ayurveda/i.test(doc.doctor_type || '')
      : !(/ayurveda/i.test(doc.specialization || '') || /ayurveda/i.test(doc.doctor_type || '')));
    if (!hasSpec) return true;
    return intakeData.mode === 'AYUSH' ? isAyu : !isAyu;
  });
  // Fallback: If no doctor found for current mode or independent, show all available hospital doctors
  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : (availableDoctors.length > 0 ? availableDoctors : doctors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-brand-950 to-gray-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh]">

        <div className="bg-brand-900 text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-10 h-10 mr-3 drop-shadow-md" />
            <div>
              <h1 className="text-xl font-bold flex items-center space-x-2">
                <span>PurvArogya</span>
                <span className="text-xs bg-brand-700 font-mono text-brand-100 px-2.5 py-0.5 rounded-full border border-brand-600">
                  {kioskId || 'KIOSK-01'}
                </span>
              </h1>
              <p className="text-xs text-brand-200 flex items-center space-x-1.5 mt-0.5">
                <span>🏥 {kioskHospitalName || 'Hospital Network'}</span>
                <span>•</span>
                <span>{selectedLanguage}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {patient && (
              <div className="flex items-center space-x-2 bg-brand-800 px-3 py-1.5 rounded-full border border-brand-700">
                <User className="w-4 h-4 text-brand-200" />
                <span className="text-sm font-medium">{patient.name}</span>
                <span className="text-xs bg-accent-500 px-2 py-0.5 rounded text-white font-bold">ABHA</span>
              </div>
            )}
            {bhasiniAvailable && (
              <span className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-full font-semibold flex items-center shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse mr-1.5"></span>
                {voiceProvider === 'sarvam' ? 'Sarvam Indic Voice 🇮🇳' : 'Bhasini ✓'}
              </span>
            )}
            {isVoiceLoading && (
              <span className="text-xs bg-amber-500/30 text-amber-200 border border-amber-400/50 px-3 py-1 rounded-full font-semibold flex items-center shadow-sm animate-pulse">
                <Loader className="w-3.5 h-3.5 animate-spin mr-1.5 text-amber-300" />
                <span>{voiceLoadingText || 'Generating voice...'}</span>
              </span>
            )}
            {isSpeaking && !isVoiceLoading && (
              <span className="text-xs bg-brand-800 text-brand-200 border border-brand-700 px-3 py-1 rounded-full font-semibold flex items-center space-x-1.5 shadow-sm">
                <span className="flex space-x-0.5 items-end h-3">
                  <span className="w-1 bg-brand-400 h-2 animate-bounce"></span>
                  <span className="w-1 bg-brand-300 h-3 animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-1 bg-brand-400 h-1.5 animate-bounce [animation-delay:0.3s]"></span>
                </span>
                <span>{selectedLanguage}</span>
              </span>
            )}
            {isSupported.tts && (
              <button onClick={() => { setAudioEnabled(!audioEnabled); if (audioEnabled) stopSpeaking(); }}
                className="p-2 rounded-full bg-brand-800 hover:bg-brand-700 transition">
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">

            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-5">
                <Fingerprint className="w-20 h-20 text-brand-600 mb-2" />
                <h2 className="text-3xl font-bold text-gray-900">{t('welcomeTitle')}</h2>
                <p className="text-gray-500">{t('welcomeSubtitle')}</p>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-600 text-left">{t('selectLanguage')}</p>
                    {isVoiceLoading && (
                      <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-semibold flex items-center animate-pulse shadow-sm">
                        <Loader className="w-3.5 h-3.5 animate-spin mr-1.5 text-amber-700" />
                        <span>{voiceLoadingText || 'Translating & generating voice...'}</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button key={lang} onClick={() => handleLanguageChange(lang)}
                        className={`py-2 px-1 rounded-lg text-sm font-medium border-2 transition ${selectedLanguage === lang ? 'border-brand-500 bg-brand-50 text-brand-800 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex space-x-2">
                    <input type="text"
                      placeholder={t('abhaPlaceholder')}
                      value={abhaInput}
                      onChange={e => { setAbhaInput(e.target.value); setAbhaLookupResult(null); setLookupError(''); }}
                      onKeyDown={e => e.key === 'Enter' && !isLookingUp && handleAbhaLookup()}
                      className="flex-1 p-4 text-center text-base tracking-widest border-2 border-gray-300 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                    <button onClick={handleAbhaLookup} disabled={isLookingUp || !abhaInput.trim()}
                      className="px-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition disabled:opacity-50 flex items-center justify-center">
                      {isLookingUp ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  {lookupError && <p className="text-red-600 text-sm">{lookupError}</p>}
                  {abhaLookupResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border-2 text-left ${abhaLookupResult.found ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
                      {abhaLookupResult.found ? (
                        <>
                          <div className="flex items-center mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-bold text-green-800">Patient Found
                              {abhaLookupResult.source === 'mock_registry' && <span className="ml-2 text-xs bg-green-200 px-2 py-0.5 rounded">ABHA Registry</span>}
                              {abhaLookupResult.source === 'db' && <span className="ml-2 text-xs bg-blue-200 px-2 py-0.5 rounded">Hospital Records</span>}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-2 text-gray-700"><User className="w-4 h-4 text-brand-500" /><span className="font-semibold">{abhaLookupResult.patient.name}</span></div>
                            {abhaLookupResult.patient.dob && <div className="flex items-center space-x-2 text-gray-600"><Calendar className="w-4 h-4 text-brand-400" /><span>{abhaLookupResult.patient.dob} ({abhaLookupResult.patient.age}y)</span></div>}
                            {abhaLookupResult.patient.gender && <div className="flex items-center space-x-2 text-gray-600"><Heart className="w-4 h-4 text-rose-400" /><span>{abhaLookupResult.patient.gender}</span></div>}
                            {abhaLookupResult.patient.address && <div className="flex items-center space-x-2 text-gray-600 col-span-2"><MapPin className="w-4 h-4 text-brand-400 shrink-0" /><span className="truncate">{abhaLookupResult.patient.address}</span></div>}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center text-amber-800">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          <span>No existing records found. You will be registered as a new patient.</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                  {abhaLookupResult ? (
                    <button onClick={handleCheckin} disabled={isVerifying}
                      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center">
                      {isVerifying ? <><Loader className="w-5 h-5 mr-2 animate-spin" />Verifying...</> : <><ShieldCheck className="w-5 h-5 mr-2" />Confirm &amp; Continue</>}
                    </button>
                  ) : (
                    <button onClick={handleAbhaLookup} disabled={isLookingUp || !abhaInput.trim()}
                      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg disabled:opacity-50">
                      {isLookingUp ? 'Searching Registry...' : 'Verify Identity'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8 flex items-start">
                  <Volume2 className="w-8 h-8 text-blue-500 mr-4 shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">{t('dpdpConsentTitle')}</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      "{t('dpdpConsentDesc')}"
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setStep(2)} className="flex-1 bg-accent-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-accent-700 transition flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-6 h-6 mr-2" /> {t('iConsent')}
                  </button>
                  <button onClick={() => { setStep(0); setPatient(null); setAbhaLookupResult(null); }} className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-xl hover:bg-gray-300 transition">
                    {t('decline')}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col justify-center items-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('consultationTitle')}</h2>
                <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                  <button onClick={() => { setIntakeData({ ...intakeData, mode: 'Allopathic' }); setStep(3); }}
                    className="border-2 border-gray-200 hover:border-brand-500 hover:bg-brand-50 p-10 rounded-2xl flex flex-col items-center transition">
                    <Activity className="w-16 h-16 text-brand-600 mb-4" />
                    <span className="text-2xl font-bold text-gray-800 text-center">{t('allopathicTitle')}</span>
                  </button>
                  <button onClick={() => { setIntakeData({ ...intakeData, mode: 'AYUSH' }); setStep(3); }}
                    className="border-2 border-gray-200 hover:border-accent-500 hover:bg-accent-50 p-10 rounded-2xl flex flex-col items-center transition">
                    <span className="text-6xl mb-4">🌿</span>
                    <span className="text-2xl font-bold text-gray-800 text-center">{t('ayushTitle')}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('symptomsTitle')}</h2>
                <p className="text-gray-500 mb-4">{t('symptomsSubtitle', selectedLanguage)}</p>
                {intakeData.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 mr-3 shrink-0" />
                    <span className="font-semibold">{t('redFlagAlert')}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {SYMPTOMS_LIST.map(sym => {
                    const symLabel = SYMPTOM_TRANSLATIONS[sym.id]?.[selectedLanguage] || sym.label;
                    const sel = intakeData.chiefComplaint.includes(sym.label) || intakeData.chiefComplaint.includes(symLabel);
                    return (
                      <button key={sym.id} onClick={() => toggleSymptom(sym)}
                        className={`p-4 rounded-2xl border-2 transition flex flex-col items-center justify-center space-y-1 ${sel ? (sym.redFlag ? 'border-red-500 bg-red-50' : 'border-brand-500 bg-brand-50') : 'border-gray-200 hover:bg-gray-50'}`}>
                        <span className="text-3xl">{sym.icon}</span>
                        <span className={`font-semibold text-sm text-center ${sel ? 'text-gray-900' : 'text-gray-600'}`}>{symLabel}</span>
                        {sym.redFlag && <span className="text-xs text-red-500 font-bold">⚠️ {t('urgent')}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Disease / Symptoms Input & Selected Custom Chips */}
                <div className="mb-4 bg-brand-50/50 p-3 rounded-2xl border border-brand-200/70">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customDiseaseInput}
                      onChange={e => setCustomDiseaseInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = customDiseaseInput.trim();
                          if (val && !intakeData.chiefComplaint.includes(val)) {
                            setIntakeData(prev => ({ ...prev, chiefComplaint: [...prev.chiefComplaint, val] }));
                            setCustomDiseaseInput('');
                          }
                        }
                      }}
                      placeholder={t('customDiseasePlaceholder', selectedLanguage) || 'Or type any custom disease / symptom (e.g. Ear pain, Dengue)...'}
                      className="flex-1 bg-white px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-500 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = customDiseaseInput.trim();
                        if (val && !intakeData.chiefComplaint.includes(val)) {
                          setIntakeData(prev => ({ ...prev, chiefComplaint: [...prev.chiefComplaint, val] }));
                          setCustomDiseaseInput('');
                        }
                      }}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition whitespace-nowrap"
                    >
                      + {t('add', selectedLanguage) || 'Add'}
                    </button>
                  </div>

                  {/* Display user's custom added symptoms if any */}
                  {intakeData.chiefComplaint.filter(c => !SYMPTOMS_LIST.some(s => s.label === c || (SYMPTOM_TRANSLATIONS[s.id] && Object.values(SYMPTOM_TRANSLATIONS[s.id]).includes(c)))).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-brand-200/50">
                      {intakeData.chiefComplaint
                        .filter(c => !SYMPTOMS_LIST.some(s => s.label === c || (SYMPTOM_TRANSLATIONS[s.id] && Object.values(SYMPTOM_TRANSLATIONS[s.id]).includes(c))))
                        .map((customSym, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-brand-800 border border-brand-300 shadow-sm">
                            🏷️ {customSym}
                            <button
                              type="button"
                              onClick={() => setIntakeData(prev => ({ ...prev, chiefComplaint: prev.chiefComplaint.filter(x => x !== customSym) }))}
                              className="ml-1.5 text-brand-600 hover:text-red-600 font-bold"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <div className="mt-auto bg-gray-50 p-5 rounded-2xl border border-gray-200 flex items-center space-x-5">
                  <button onClick={handleVoiceInput}
                    className={`shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}`}>
                    <Mic className="w-8 h-8" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1 text-sm">{isListening ? t('listening', selectedLanguage) : t('tapToSpeak', selectedLanguage)}</p>
                    <textarea value={intakeData.hpi} onChange={e => setIntakeData({ ...intakeData, hpi: e.target.value })}
                      className="w-full bg-white p-3 rounded-lg border border-gray-300 text-gray-700 text-sm h-16 resize-none"
                      placeholder={t('voicePlaceholder')} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <div className="flex items-center mb-2"><BrainCircuit className="w-6 h-6 text-brand-600 mr-2" /><h2 className="text-2xl font-bold text-gray-900">{t('aiHistoryTitle')}</h2></div>
                <p className="text-gray-500 mb-6 text-sm">{t('aiHistorySubtitle')}</p>
                {loadingHpi ? (
                  <AIThinkingLoader chiefComplaint={intakeData.chiefComplaint} />
                ) : hpiSubStep < hpiQuestions.length ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600 uppercase">{t('questionCount', hpiSubStep + 1, hpiQuestions.length)}</span>
                      <div className="flex space-x-1">{hpiQuestions.map((_, i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < hpiSubStep ? 'bg-brand-600' : i === hpiSubStep ? 'bg-brand-400' : 'bg-gray-200'}`} />)}</div>
                    </div>
                    {/* Bilingual Question Box: Shows English first when non-English is selected */}
                    <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 shadow-sm">
                      {selectedLanguage !== "English" && getQEng(hpiQuestions[hpiSubStep]) && (
                        <p className="text-sm font-bold text-brand-700 mb-2 pb-1.5 border-b border-brand-200/80 tracking-wide uppercase">
                          {getQEng(hpiQuestions[hpiSubStep])}
                        </p>
                      )}
                      <p className="text-xl font-bold text-gray-900 leading-relaxed">
                        {getQTrans(hpiQuestions[hpiSubStep])}
                      </p>
                    </div>

                    {/* Interactive Question Options / Rating Scale */}
                    {(() => {
                      const currentItem = hpiQuestions[hpiSubStep];
                      const engQ = getQEng(currentItem);
                      const displayQ = getQTrans(currentItem);
                      const qConfig = (currentItem?.type === "scale")
                        ? {
                            type: "scale",
                            options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => ({
                              label: String(n),
                              value: String(n),
                              tone: n <= 3 ? "green" : n <= 6 ? "amber" : n <= 8 ? "orange" : "red"
                            }))
                          }
                        : (currentItem?.options && currentItem.options.length > 0)
                          ? { type: "chips", options: currentItem.options }
                          : getQuestionOptions(displayQ, selectedLanguage, engQ);
                      const qKey = engQ || displayQ;
                      const currentVal = (hpiAnswers[qKey] || "").trim();

                      const onSelectOption = (optVal) => {
                        const newAnswers = { ...hpiAnswers, [qKey]: optVal };
                        setHpiAnswers(newAnswers);
                        const hpiText = Object.entries(newAnswers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n");
                        setIntakeData(p => ({ ...p, hpi: hpiText }));
                      };

                      if (qConfig.type === "scale") {
                        return (
                          <div className="space-y-2">
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                              {qConfig.options.map(opt => {
                                const isSelected = currentVal === opt.value;
                                const toneStyles = {
                                  green: isSelected
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105 font-bold"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-500 hover:text-white",
                                  amber: isSelected
                                    ? "bg-amber-500 text-white border-amber-500 shadow-lg scale-105 font-bold"
                                    : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-500 hover:text-white",
                                  orange: isSelected
                                    ? "bg-orange-600 text-white border-orange-600 shadow-lg scale-105 font-bold"
                                    : "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-500 hover:text-white",
                                  red: isSelected
                                    ? "bg-rose-600 text-white border-rose-600 shadow-lg scale-105 font-bold"
                                    : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-600 hover:text-white",
                                };
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => onSelectOption(opt.value)}
                                    className={`py-3 px-2 rounded-xl border-2 text-center text-xl font-bold transition-all transform active:scale-95 ${toneStyles[opt.tone] || toneStyles.green}`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 px-1 font-medium">
                              <span className="text-emerald-700 font-semibold">{t("mild")} (1)</span>
                              <span className="text-amber-700 font-semibold">{t("moderate")} (5)</span>
                              <span className="text-rose-700 font-semibold">{t("extreme")} (10)</span>
                            </div>
                          </div>
                        );
                      }

                      if (qConfig.options && qConfig.options.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2.5">
                            {qConfig.options.map(opt => {
                              const isSelected = currentVal === opt.label || currentVal.includes(opt.label);
                              const toneStyles = {
                                green: isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md font-bold scale-[1.02]"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-600 hover:text-white",
                                red: isSelected
                                  ? "bg-rose-600 text-white border-rose-600 shadow-md font-bold scale-[1.02]"
                                  : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-600 hover:text-white",
                                amber: isSelected
                                  ? "bg-amber-500 text-white border-amber-500 shadow-md font-bold scale-[1.02]"
                                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-500 hover:text-white",
                                orange: isSelected
                                  ? "bg-orange-500 text-white border-orange-500 shadow-md font-bold scale-[1.02]"
                                  : "bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-500 hover:text-white",
                                blue: isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md font-bold scale-[1.02]"
                                  : "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-600 hover:text-white",
                                slate: isSelected
                                  ? "bg-gray-700 text-white border-gray-700 shadow-md font-bold scale-[1.02]"
                                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-200",
                              };
                              return (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => onSelectOption(opt.label)}
                                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all transform active:scale-95 flex items-center space-x-1.5 ${toneStyles[opt.tone] || toneStyles.slate}`}
                                >
                                  {opt.icon && <span className="mr-1">{opt.icon}</span>}
                                  <span>{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <button onClick={handleHpiVoiceInput}
                        className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isListening ? "bg-red-500 animate-pulse ring-4 ring-red-200" : "bg-brand-600 hover:bg-brand-700"}`}>
                        <Mic className="w-7 h-7" />
                      </button>
                      <textarea
                        value={hpiAnswers[getQEng(hpiQuestions[hpiSubStep]) || getQTrans(hpiQuestions[hpiSubStep])] || ""}
                        onChange={e => {
                          const val = e.target.value;
                          const qKey = getQEng(hpiQuestions[hpiSubStep]) || getQTrans(hpiQuestions[hpiSubStep]);
                          const newAnswers = { ...hpiAnswers, [qKey]: val };
                          setHpiAnswers(newAnswers);
                          const hpiText = Object.entries(newAnswers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n");
                          setIntakeData(p => ({ ...p, hpi: hpiText }));
                        }}
                        className="flex-1 bg-white p-3 rounded-lg border border-gray-300 text-gray-700 text-sm h-16 resize-none"
                        placeholder={isListening ? t("listening", selectedLanguage) : t("answerPlaceholder")} />
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => {
                        const qKey = getQEng(hpiQuestions[hpiSubStep]) || getQTrans(hpiQuestions[hpiSubStep]);
                        handleHpiAnswer(hpiQuestions[hpiSubStep], hpiAnswers[qKey] || "Not sure");
                      }}
                        className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition flex items-center justify-center">
                        {hpiSubStep < hpiQuestions.length - 1 ? <><ChevronRight className="w-5 h-5 mr-1" />{t("nextQuestion")}</> : <><CheckCircle className="w-5 h-5 mr-1" />{t("done")}</>}
                      </button>
                      <button onClick={() => { if (hpiSubStep < hpiQuestions.length - 1) setHpiSubStep(s => s + 1); else setStep(intakeData.mode === "AYUSH" ? 4.5 : 5); }}
                        className="px-4 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition text-sm">{t('skip')}</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-brand-600 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-900">{t('historyCaptured')}</p>
                    <p className="text-gray-500 mt-2">{t('allAnswered', hpiQuestions.length)}</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4.5 && (
              <motion.div key="s45" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col justify-center max-w-2xl mx-auto">
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
                          <button key={opt} onClick={() => handleAyushAnswer(q.field, opt)}
                            className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium transition text-gray-800 ${intakeData.ayushData[q.field] === opt ? 'border-accent-500 bg-accent-50 text-accent-800' : 'border-gray-200 hover:border-accent-300 hover:bg-accent-50/50'}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-8"><CheckCircle className="w-16 h-16 text-accent-600 mx-auto mb-4" /><p className="text-xl font-bold text-gray-900">Assessment Complete</p></div>
                )}
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col justify-center max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Scan Past Records</h2>
                <p className="text-gray-500 mb-8">Upload previous prescriptions or lab reports (max 10 MB).</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" style={{ display: 'none' }} />
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-gray-300 rounded-3xl p-14 flex flex-col items-center justify-center bg-gray-50 hover:bg-brand-50 hover:border-brand-300 transition cursor-pointer group">
                  {isUploading ? <div className="text-brand-600 text-lg font-bold animate-pulse">Processing via OCR...</div> : (
                    <><FileUp className="w-20 h-20 text-gray-400 group-hover:text-brand-500 mb-4" />
                    <p className="text-xl font-bold text-gray-700 group-hover:text-brand-700">Tap to Upload Document</p>
                    <p className="text-gray-500 mt-2 text-sm">Image or PDF, max 10 MB</p></>
                  )}
                </div>
                {intakeData.documents.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {intakeData.documents.length} document(s) uploaded.
                    {ocrResult && <span className="ml-2 text-sm">({ocrResult.medications?.length || 0} meds, {ocrResult.labs?.length || 0} labs extracted)</span>}
                  </div>
                )}
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <div className="flex items-center mb-2"><Sparkles className="w-6 h-6 text-brand-600 mr-2" /><h2 className="text-3xl font-bold text-gray-900">{t('chooseDoctorTitle')}</h2></div>
                <p className="text-gray-500 mb-2 text-center">{t('chooseDoctorSubtitle')}</p>
                {kioskHospitalName && <p className="text-xs text-center font-semibold mb-2 text-brand-600">Showing Doctors at {kioskHospitalName}</p>}
                {!kioskHospitalName && isSelfServed && <p className="text-xs text-center font-semibold mb-2 text-purple-600">Displaying Independent / Teleconsult Physicians</p>}
                {loadingRec && (
                  <div className="flex items-center justify-center py-3 space-x-2 text-brand-600 text-sm mb-2">
                    <BrainCircuit className="w-4 h-4 animate-pulse" /><span>AI is analysing your symptoms...</span>
                  </div>
                )}
                {recRationale && (
                  <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-4 flex items-start">
                    <BrainCircuit className="w-4 h-4 text-brand-600 mr-2 mt-0.5 shrink-0" />
                    <p className="text-xs text-brand-800"><strong>AI Recommendation:</strong> {recRationale}</p>
                  </div>
                )}
                {filteredDoctors.length === 0 && displayDoctors.length > 0 && (
                  <div className="col-span-2 text-center text-xs font-semibold py-2 px-4 mb-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                    ℹ️ {t('showingHospitalDoctors')}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayDoctors.map(doc => {
                    const isRec = doc.id === recommendedDoctorId;
                    const isSel = selectedDoctor === doc.id;
                    return (
                      <div key={doc.id} onClick={() => setSelectedDoctor(doc.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer flex items-center transition-colors relative ${isSel ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}>
                        {isRec && <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center"><Sparkles className="w-3 h-3 mr-1" />{t('aiPick')}</span>}
                        <UserSquare className={`w-12 h-12 mr-4 ${isSel ? 'text-brand-600' : 'text-gray-400'}`} />
                        <div><h3 className={`font-bold text-lg ${isSel ? 'text-brand-900' : 'text-gray-900'}`}>{doc.name}</h3><p className="text-sm text-gray-500">{doc.specialization}</p></div>
                      </div>
                    );
                  })}
                  {displayDoctors.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-gray-200">{t('noDoctorsFound')}</div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div key="s7" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }}
                className="h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-3">{t('summaryTitle')}</h2>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {patient && (
                    <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200 flex items-center space-x-4">
                      <User className="w-10 h-10 text-brand-600" />
                      <div>
                        <p className="font-bold text-brand-900">{patient.name}</p>
                        <p className="text-sm text-brand-700">{patient.gender || ''}{patient.age ? ` · ${patient.age}y` : ''}{patient.dob ? ` · DOB: ${patient.dob}` : ''}</p>
                        {patient.abha_id && <p className="text-xs text-brand-500 font-mono mt-0.5">ABHA: {patient.abha_id}</p>}
                      </div>
                    </div>
                  )}
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
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">HPI &amp; Interview Answers</h3>
                      <pre className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap font-sans">{intakeData.hpi}</pre>
                    </div>
                  )}
                  {selectedDoctor && (() => {
                    const doc = filteredDoctors.find(d => d.id === selectedDoctor) || availableDoctors.find(d => d.id === selectedDoctor);
                    return doc ? (
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Doctor</h3>
                          <p className="font-bold text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.specialization}</p>
                        </div>
                        {selectedDoctor === recommendedDoctorId && <span className="bg-brand-100 text-brand-700 text-xs px-2 py-1 rounded-full font-bold flex items-center"><Sparkles className="w-3 h-3 mr-1" />AI Recommended</span>}
                      </div>
                    ) : null;
                  })()}
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Documents</h3><p className="text-gray-800 font-medium text-sm">{intakeData.documents.length} file(s) — OCR processed</p></div>
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

            {step === 8 && (
              <motion.div key="s8" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('intakeCompleteTitle')}</h2>
                <p className="text-xl text-gray-600 max-w-lg">{t('intakeCompleteDesc')}</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {step > 0 && step < 8 && (
          <div className="bg-gray-50 p-5 border-t border-gray-200 flex justify-between items-center shrink-0">
            <button onClick={handleBack} disabled={loadingHpi || isSubmitting} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">{t('back')}</button>
            <div className="flex space-x-2">
              {[1,2,3,4,5,6,7].map(i => {
                if (intakeData.mode === 'Allopathic' && i === 4) return null;
                return <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-brand-600' : 'bg-gray-300'}`} />;
              })}
            </div>
            {step === 7 ? (
              <button onClick={submitToHIS} disabled={isSubmitting}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg disabled:opacity-50">
                {isSubmitting ? t('submitting') : t('submitToDoctor')}
              </button>
            ) : (
              <button onClick={handleNext} disabled={loadingHpi || isSubmitting}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                {loadingHpi ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>{t('thinking')}</span>
                  </>
                ) : (
                  <span>{t('next')}</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
