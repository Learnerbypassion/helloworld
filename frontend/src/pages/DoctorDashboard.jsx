import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, ClipboardList, CheckCircle, AlertTriangle, FileCode2, FileUp, Languages, Sparkles, RefreshCw } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../services/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { queue, patients, completeConsultation, logout } = useGlobal();

  const myQueue = queue;
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [prescription, setPrescription] = useState('');
  const [showFhir, setShowFhir] = useState(false);
  const [fhirData, setFhirData] = useState(null);
  const [sessionDocs, setSessionDocs] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const startConsultation = async (qItem) => {
    setActiveConsultation(qItem);
    setSymptoms(qItem.intake?.hpi || '');
    setPrescription('');
    setShowFhir(false);
    setAiSummary(qItem.summary || qItem.intake?.summary || null);

    try {
      const s = await api.getSession(qItem.id);
      if (s.fhir_bundle) {
        setFhirData(s.fhir_bundle);
      } else {
        setFhirData({
          resourceType: "Bundle", type: "transaction",
          entry: [
            { resource: { resourceType: "Patient", identifier: [{ value: s.patient?.abha_id || 'ABHA-SYNCED' }], name: [{ text: s.patient?.name }] } },
            { resource: { resourceType: "Condition", code: { text: s.chief_complaint || 'Clinical Intake' } } }
          ]
        });
      }
      if (Array.isArray(s.documents)) setSessionDocs(s.documents);
      else setSessionDocs([]);
      // Show AI summary if already generated
      if (s.summary) setAiSummary(s.summary);
    } catch (err) {
      console.error('Error fetching session details:', err);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!activeConsultation) return;
    setIsRegenerating(true);
    try {
      const result = await api.summarizeSession(activeConsultation.id);
      if (result.ok && result.summary) {
        setAiSummary(result.summary);
      } else {
        alert(result.message || 'AI summary unavailable — is Ollama running?');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate summary');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleComplete = async () => {
    if (!activeConsultation) return;
    setIsCompleting(true);
    try {
      await completeConsultation(activeConsultation.id, activeConsultation.patientId, symptoms, prescription);
      setActiveConsultation(null);
      setFhirData(null);
      setSessionDocs([]);
      setAiSummary(null);
    } catch (err) {
      alert(err.message || 'Failed to complete consultation');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSignOut = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-brand-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center border-b border-brand-800">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-8 h-8 mr-3 drop-shadow-md" />
          <span className="text-lg font-bold">PurvArogya</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-brand-800 rounded-lg">
            <ClipboardList className="w-5 h-5 mr-3" /> Today's Queue
          </button>
        </nav>
        <div className="p-4 border-t border-brand-800">
          <button onClick={handleSignOut} className="flex items-center w-full px-4 py-3 hover:bg-brand-800/50 rounded-lg text-red-300">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Module C: Structured Summary Engine</h1>
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium border border-blue-200">
            Clinician-in-the-Loop Mode
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
          {/* Queue Sidebar */}
          <div className="xl:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800 flex justify-between">
              <span>Waiting Patients</span>
              <span className="bg-brand-100 text-brand-800 px-2 rounded-full text-sm">{myQueue.length}</span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {myQueue.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No patients waiting.</p>}
              {myQueue.map(q => {
                const patient = patients.find(p => p.id === q.patientId) || { name: q.patient_name || q.name || `Patient #${q.patientId}` };
                const isActive = activeConsultation?.id === q.id;
                const hasRedFlags = q.intake?.redFlags?.length > 0;
                return (
                  <div key={q.id} onClick={() => startConsultation(q)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors relative ${isActive ? 'bg-brand-50 border-brand-300' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    {hasRedFlags && <AlertTriangle className="absolute top-3 right-3 w-5 h-5 text-red-500" />}
                    <p className={`font-bold ${isActive ? 'text-brand-900' : 'text-gray-900'}`}>{patient?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Token: {q.token || `A-${q.id}`}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Consultation Window */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-[80vh] overflow-hidden">
            {!activeConsultation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                <ClipboardList className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-xl font-medium">Select a patient from the queue</p>
                <p className="text-sm mt-2 max-w-md">The structured history generated by MediKiosk will appear here.</p>
              </div>
            ) : (() => {
              const patient = patients.find(p => p.id === activeConsultation.patientId) || { name: activeConsultation.patient_name || 'Patient', age: 'N/A', gender: 'N/A' };
              const intake = activeConsultation.intake || {};
              const docsToShow = sessionDocs.length > 0 ? sessionDocs : (intake.documents || []);

              return (
                <>
                  <div className="p-4 border-b border-gray-200 bg-brand-900 text-white flex justify-between items-center shrink-0">
                    <div>
                      <h2 className="font-bold text-lg flex items-center">
                        {patient?.name}
                        <span className="ml-3 text-xs bg-brand-800 px-2 py-1 rounded-full border border-brand-700">ABDM Synced</span>
                        {intake.redFlags?.length > 0 && <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded-full">🚨 RED FLAG</span>}
                      </h2>
                      <p className="text-brand-200 text-sm mt-1">{patient?.age ? `${patient.age} yrs` : ''} {patient?.gender ? `• ${patient.gender}` : ''} • {intake.mode || 'Allopathic'} Intake</p>
                    </div>
                    <button onClick={() => setShowFhir(!showFhir)} className="bg-brand-700 hover:bg-brand-600 text-white text-xs px-3 py-1.5 rounded flex items-center transition">
                      <FileCode2 className="w-4 h-4 mr-1" /> View FHIR Bundle
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">

                    {/* FHIR Bundle View */}
                    {showFhir && (
                      <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner max-h-64">
                        <pre>{JSON.stringify(fhirData, null, 2)}</pre>
                      </div>
                    )}

                    {/* Red Flag Alerts */}
                    {intake.redFlags?.length > 0 && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start shadow-sm">
                        <AlertTriangle className="w-6 h-6 text-red-600 mr-3 shrink-0" />
                        <div>
                          <h3 className="font-bold text-red-900">Safety Highlighting: Triage Alert</h3>
                          <p className="text-red-700 text-sm mt-1">System detected high-risk symptoms: {intake.redFlags.join(', ')}.</p>
                        </div>
                      </div>
                    )}

                    {/* AI Clinical Summary Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3 border-b pb-2">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center">
                          <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                          AI Clinical Summary
                          {aiSummary && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ollama Generated</span>}
                          {!aiSummary && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Not available</span>}
                        </h3>
                        <button
                          onClick={handleRegenerateSummary}
                          disabled={isRegenerating}
                          className="flex items-center text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                          {isRegenerating ? 'Generating...' : 'Re-generate'}
                        </button>
                      </div>
                      {aiSummary ? (
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{aiSummary}</pre>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No summary yet. Click "Re-generate" to run the local LLM (requires Ollama with {import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b'}).</p>
                      )}
                    </div>

                    {/* Structured Summary */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-gray-800 text-lg">Raw Intake Fields</h3>
                        <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded flex items-center">
                          <Languages className="w-3 h-3 mr-1" /> Editable by Clinician
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase">Chief Complaints (CC)</h4>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {intake.chiefComplaint?.map(c => <span key={c} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium border border-gray-200">{c}</span>)}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase">History of Present Illness (HPI)</h4>
                          <textarea
                            value={symptoms}
                            onChange={e => setSymptoms(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm text-gray-800 leading-relaxed bg-gray-50"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* AYUSH Data */}
                    {intake.mode === 'AYUSH' && (
                      <div className="bg-white p-5 rounded-xl border border-accent-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">Dashavidha Pariksha Summary</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(intake.ayushData || {}).map(([k, v]) => (
                            <div key={k} className="bg-accent-50 p-3 rounded text-sm border border-accent-100">
                              <span className="font-bold text-accent-800 capitalize">{k.replace(/_/g,' ')}: </span>
                              <span className="text-gray-800">{v || 'Not Provided'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {docsToShow?.length > 0 && (
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">Digitized Historical Records</h3>
                        <div className="space-y-2">
                          {docsToShow.map((doc, i) => {
                            const name = typeof doc === 'string' ? doc : (doc.filename || `Document #${doc.id}`);
                            const meds = doc.medications || [];
                            const labs = doc.labs || [];
                            const rawText = doc.raw_text || doc.raw_ocr_text;
                            return (
                              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-100 space-y-1">
                                <div className="flex items-center">
                                  <FileUp className="w-5 h-5 text-brand-500 mr-3" />
                                  <span className="text-sm font-medium text-gray-700">{name}</span>
                                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">PaddleOCR Extracted</span>
                                </div>
                                {(meds.length > 0 || labs.length > 0) && (
                                  <div className="text-xs text-gray-600 pl-8 space-y-0.5">
                                    {meds.length > 0 && <p><strong className="text-brand-800">Meds:</strong> {meds.map(m => m.drug || m.name || m).join(', ')}</p>}
                                    {labs.length > 0 && <p><strong className="text-emerald-800">Labs:</strong> {labs.map(l => `${l.name}: ${l.value}`).join(', ')}</p>}
                                  </div>
                                )}
                                {rawText && (
                                  <details className="pl-8 pt-1 text-xs text-gray-600">
                                    <summary className="cursor-pointer text-brand-600 hover:text-brand-800 font-medium select-none">
                                      View Raw OCR Text ({rawText.split('\n').length} lines)
                                    </summary>
                                    <pre className="mt-1.5 p-2.5 bg-white border border-gray-200 rounded font-mono text-[11px] text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                                      {rawText}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Prescription */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">Clinical Notes & Prescription</h3>
                      <textarea
                        value={prescription}
                        onChange={e => setPrescription(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm h-32"
                        placeholder="Add Rx, diagnosis, and plan..."
                      />
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
                    <p className="text-xs text-gray-400 font-medium hidden sm:block">Time saved: ~3 mins per consult</p>
                    <button
                      onClick={handleComplete}
                      disabled={isCompleting}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" /> {isCompleting ? 'Saving...' : 'Verify & Push to HIS'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
