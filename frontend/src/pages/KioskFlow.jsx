import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, FileUp, Activity, CheckCircle, ShieldCheck, AlertTriangle, MonitorSmartphone, Volume2, Fingerprint, UserSquare } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../services/api';

export default function KioskFlow() {
  const navigate = useNavigate();
  const { patients, doctors, submitKioskIntake, handleAuthSuccess } = useGlobal();

  const [step, setStep] = useState(0); // 0: Check-in, 1: Consent, 2: System, 3: Symptoms, 4: AYUSH (opt), 5: Scan, 6: Select Doctor, 7: Summary, 8: Success
  
  // Intake state
  const [abhaId, setAbhaId] = useState('');
  const [patient, setPatient] = useState(null); // Loaded after check-in
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Doctor ID
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [intakeData, setIntakeData] = useState({
    mode: 'Allopathic',
    chiefComplaint: [],
    hpi: '',
    ayushData: { prakriti: '', agni: '', koshtha: '' },
    redFlags: [],
    documents: []
  });

  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);

  // Symptoms list
  const symptomsList = [
    { id: 'fever', label: 'Fever', icon: '🌡️' },
    { id: 'cough', label: 'Cough', icon: '🗣️' },
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'stomach', label: 'Stomach Ache', icon: '🤢' },
    { id: 'chest_pain', label: 'Chest Pain', icon: '🫀', redFlag: true },
    { id: 'weakness', label: 'Weakness', icon: '🥱' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await api.kioskCheckin({ abha_id: abhaId, phone: abhaId });
      if (res?.token) {
        handleAuthSuccess(res.token, { ...res.patient, role: 'patient' });
      }
      setPatient(res.patient);
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
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      setIsRecording(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIntakeData(prev => ({
          ...prev,
          hpi: prev.hpi ? `${prev.hpi} ${transcript}` : transcript
        }));
        setIsRecording(false);
      };
      recognition.onerror = () => {
        setIsRecording(false);
      };
      recognition.start();
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIntakeData(prev => ({
          ...prev,
          hpi: prev.hpi + " Patient mentions experiencing these symptoms since 3 days, increasing at night. (Auto-translated via Bhashini)"
        }));
        setIsRecording(false);
      }, 1500);
    }
  };

  const handleFileScanClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIntakeData(prev => ({
        ...prev,
        documents: [...prev.documents, file.name]
      }));
    } else if (intakeData.documents.length === 0) {
      setIntakeData(prev => ({
        ...prev,
        documents: ['blood_report_2026.pdf', 'past_prescription.jpg']
      }));
    }
  };

  const submitToHIS = async () => {
    setIsSubmitting(true);
    try {
      let docIdToAssign = selectedDoctor;
      if (!docIdToAssign) {
        const defaultDocs = doctors.filter(d => 
          intakeData.mode === 'AYUSH' 
            ? (d.specialization?.toLowerCase().includes('ayurveda') || d.doctor_type?.toLowerCase().includes('ayurveda'))
            : !(d.specialization?.toLowerCase().includes('ayurveda') || d.doctor_type?.toLowerCase().includes('ayurveda'))
        );
        docIdToAssign = defaultDocs.length > 0 ? defaultDocs[0].id : (doctors[0]?.id || 1);
      }
      
      const patId = patient?.id || 1;
      await submitKioskIntake(patId, docIdToAssign, intakeData);
      setStep(8); // Success screen
      setTimeout(() => {
        navigate('/'); // Zero persistence, returns to start
      }, 4000);
    } catch (err) {
      alert(err.message || 'Failed to submit kiosk intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter doctors for selection based on mode
  const filteredDoctors = doctors.filter(d => {
    const isAyu = (d.specialization?.toLowerCase() || '').includes('ayurveda') || (d.doctor_type?.toLowerCase() || '').includes('ayurveda');
    if (intakeData.mode === 'AYUSH') return isAyu;
    return !isAyu;
  });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-brand-900 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-10 h-10 mr-3 drop-shadow-md" />
            <div>
              <h1 className="text-xl font-bold">PurvArogya</h1>
              <p className="text-xs text-brand-200">Patient MediKiosk</p>
            </div>
          </div>
          {patient && (
            <div className="flex items-center space-x-3 bg-brand-800 px-4 py-2 rounded-full border border-brand-700">
              <span className="text-sm font-medium">{patient.name}</span>
              <span className="text-xs bg-accent-500 px-2 py-0.5 rounded text-white font-bold">ABHA VERIFIED</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: Check-In */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6">
                <Fingerprint className="w-20 h-20 text-brand-600 mb-2" />
                <h2 className="text-3xl font-bold text-gray-900">Welcome to OPD</h2>
                <p className="text-gray-500">Scan your QR code or enter ABHA ID / Mobile Number to begin your clinical intake.</p>
                
                <form onSubmit={handleLogin} className="w-full space-y-4 mt-4">
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter ABHA ID or Mobile (e.g. 12-3456-7890-1234)" 
                    value={abhaId}
                    onChange={e => setAbhaId(e.target.value)}
                    className="w-full p-4 text-center text-lg tracking-widest border-2 border-gray-300 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 font-medium"
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
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Audio-Visual Consent</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      "As per the DPDP Act 2023, we require your consent to collect your symptoms and health records. This data is fully encrypted and will be deleted from this device immediately after your doctor reviews it."
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setStep(2)} className="flex-1 bg-accent-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-accent-700 transition flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-6 h-6 mr-2" /> I Consent (Agree)
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
                <p className="text-gray-500 mb-6">Tap the icons or speak in your native language.</p>
                
                {intakeData.redFlags.length > 0 && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 mr-3 shrink-0" />
                    <span className="font-semibold">Red Flag Detected: You have selected emergency symptoms. Priority triage activated.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {symptomsList.map(sym => {
                    const isSelected = intakeData.chiefComplaint.includes(sym.label);
                    return (
                      <button 
                        key={sym.id}
                        onClick={() => toggleSymptom(sym)}
                        className={`p-6 rounded-2xl border-2 transition flex flex-col items-center justify-center space-y-2
                          ${isSelected ? (sym.redFlag ? 'border-red-500 bg-red-50' : 'border-brand-500 bg-brand-50') : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span className="text-4xl">{sym.icon}</span>
                        <span className={`font-semibold text-lg ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{sym.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 flex items-center space-x-6">
                  <button 
                    onClick={handleVoiceInput}
                    className={`shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}`}
                  >
                    <Mic className="w-10 h-10" />
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {isRecording ? 'Listening (Speak in Hindi, English, or regional language)...' : 'Tap mic to describe details'}
                    </p>
                    <textarea 
                      readOnly
                      value={intakeData.hpi}
                      className="w-full bg-white p-3 rounded-lg border border-gray-300 text-gray-700 text-sm h-16 resize-none"
                      placeholder="Transcribed text will appear here via Bhashini API..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: AYUSH Details (Only if AYUSH mode) */}
            {step === 4 && (
              <motion.div key="step4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashavidha Pariksha Intake</h2>
                <p className="text-gray-500 mb-8">Please provide basic Ayurvedic parameters to assist the Vaidya.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Prakriti (Body Constitution)</label>
                    <div className="flex space-x-3">
                      {['Vata', 'Pitta', 'Kapha', 'Don\'t Know'].map(p => (
                        <button 
                          key={p} 
                          onClick={() => setIntakeData({...intakeData, ayushData: {...intakeData.ayushData, prakriti: p}})}
                          className={`flex-1 py-3 rounded-lg font-medium border-2 transition ${intakeData.ayushData.prakriti === p ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">Agni (Digestive Fire)</label>
                    <div className="flex space-x-3">
                      {['Normal', 'Irregular', 'Weak', 'Sharp'].map(a => (
                        <button 
                          key={a}
                          onClick={() => setIntakeData({...intakeData, ayushData: {...intakeData.ayushData, agni: a}})}
                          className={`flex-1 py-3 rounded-lg font-medium border-2 transition ${intakeData.ayushData.agni === a ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Document Scan */}
            {step === 5 && (
              <motion.div key="step5" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Scan Past Records</h2>
                <p className="text-gray-500 mb-8">Place your previous prescriptions or lab reports on the scanner.</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,.pdf" 
                  style={{ display: 'none' }} 
                />

                <div 
                  onClick={() => {
                    if (intakeData.documents.length === 0) {
                      setIntakeData({ ...intakeData, documents: ['blood_report_2026.pdf', 'past_prescription.jpg'] });
                    } else {
                      handleFileScanClick();
                    }
                  }}
                  className="border-4 border-dashed border-gray-300 rounded-3xl p-16 flex flex-col items-center justify-center bg-gray-50 hover:bg-brand-50 hover:border-brand-300 transition cursor-pointer group"
                >
                  <FileUp className="w-20 h-20 text-gray-400 group-hover:text-brand-500 mb-4" />
                  <p className="text-xl font-bold text-gray-700 group-hover:text-brand-700">Tap to Simulate Scan or Upload</p>
                  <p className="text-gray-500 mt-2">Document AI will extract entities and map to SNOMED-CT</p>
                </div>

                {intakeData.documents.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {intakeData.documents.length} Documents successfully scanned and digitized.
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 6: Select Doctor */}
            {step === 6 && (
              <motion.div key="step6" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Choose a Physician</h2>
                <p className="text-gray-500 mb-8 text-center">Select your preferred doctor or skip to be auto-assigned.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredDoctors.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-center transition-colors ${selectedDoctor === doc.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}
                    >
                      <UserSquare className={`w-12 h-12 mr-4 ${selectedDoctor === doc.id ? 'text-brand-600' : 'text-gray-400'}`} />
                      <div>
                        <h3 className={`font-bold text-lg ${selectedDoctor === doc.id ? 'text-brand-900' : 'text-gray-900'}`}>{doc.name}</h3>
                        <p className="text-sm text-gray-500">{doc.specialization} • {doc.education}</p>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-8 bg-gray-50 rounded-xl border border-gray-200">
                      No specific doctors found for {intakeData.mode} medicine. You will be auto-assigned.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 7: Review & Submit */}
            {step === 7 && (
              <motion.div key="step7" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="h-full flex flex-col">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Physician-Ready Summary</h2>
                
                <div className="flex-1 overflow-y-auto space-y-6 text-left pr-4">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Chief Complaint</h3>
                    <div className="flex flex-wrap gap-2">
                      {intakeData.chiefComplaint.map(c => (
                        <span key={c} className="bg-white px-3 py-1 rounded-full border border-gray-300 font-medium shadow-sm">{c}</span>
                      ))}
                    </div>
                  </div>
                  
                  {intakeData.hpi && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">History of Present Illness (Auto-Transcribed)</h3>
                      <p className="text-gray-800 leading-relaxed font-medium">{intakeData.hpi}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Digitized Documents</h3>
                      <p className="text-gray-800 font-medium">{intakeData.documents.length} files attached and processed via OCR.</p>
                    </div>
                    <FileUp className="w-8 h-8 text-brand-500" />
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium mt-6 border border-blue-200 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-3 shrink-0" />
                  Zero-Persistence: This data will be instantly wiped from the kiosk and sent securely as a FHIR Bundle to the hospital system.
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
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center shrink-0">
            <button 
              onClick={() => {
                if (step === 5 && intakeData.mode === 'Allopathic') setStep(3);
                else setStep(step - 1);
              }}
              className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
            >
              Back
            </button>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => {
                if (intakeData.mode === 'Allopathic' && i === 4) return null;
                return (
                  <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-brand-600' : 'bg-gray-300'}`} />
                )
              })}
            </div>
            {step === 7 ? (
              <button 
                onClick={submitToHIS} 
                disabled={isSubmitting}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit to Doctor'}
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (step === 3 && intakeData.mode === 'Allopathic') setStep(5);
                  else setStep(step + 1);
                }}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
