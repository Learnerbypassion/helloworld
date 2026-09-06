import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, ClipboardList, CheckCircle, AlertTriangle, FileCode2, FileUp, Languages, Sparkles, RefreshCw, Clock, ShieldAlert, Microscope, Pill, Activity, Eye, FileText, Building2, History } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../services/api';


function FormattedAiSummary({ text }) {
  if (!text) return null;

  const renderInline = (str) => {
    if (!str) return '';
    const parts = str.split(/(\?\?[^*]+\?\?|\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getSection = (pattern) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  };

  const chiefComplaint = getSection(/\*\*Chief Complaint:?\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/i);
  const keyHistory = getSection(/\*\*Key History:?\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/i);
  const redFlags = getSection(/\*\*(?:Red Flags?\s*(?:\/|\&)?\s*Triage|Triage):?\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/i);
  const labFindings = getSection(/\*\*(?:Uploaded Document Analysis|Lab Findings|Uploaded Report Findings)[^:]*:?\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/i);
  const medications = getSection(/\*\*(?:Extracted Medications?|Medications? Detected):?\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/i);
  const assessment = getSection(/\*\*(?:Clinical Assessment|Suggested Priority)[^:]*:?\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/i);

  const isStructured = chiefComplaint || keyHistory || labFindings || assessment;

  if (!isStructured) {
    return (
      <div className="space-y-2 text-sm text-gray-700 leading-relaxed font-sans">
        {text.split('\n').map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start ml-2 space-x-2">
                <span className="text-brand-500 font-bold">•</span>
                <span>{renderInline(trimmed.slice(2))}</span>
              </div>
            );
          }
          return <p key={idx}>{renderInline(trimmed)}</p>;
        })}
      </div>
    );
  }

  let priority = 'Routine';
  let priorityColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (/urgent/i.test(assessment || '')) {
    priority = 'Urgent';
    priorityColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (/emergency|critical|high priority/i.test(assessment || '')) {
    priority = 'Emergency';
    priorityColor = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
  }

  const isSafeTriage = !redFlags || /none|no immediate|normal/i.test(redFlags);

  return (
    <div className="space-y-3.5 text-sm font-sans pt-1">
      {/* Chief Complaint */}
      {chiefComplaint && (
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex items-start space-x-3 shadow-2xs">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-blue-800">Chief Complaint</h4>
            <p className="text-gray-900 font-medium text-sm mt-0.5 leading-snug">{renderInline(chiefComplaint)}</p>
          </div>
        </div>
      )}

      {/* Key History Bullets */}
      {keyHistory && (
        <div className="bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-2xs">
          <h4 className="text-[11px] font-bold tracking-wider uppercase text-gray-500 mb-2 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-purple-600" /> Key Clinical History
          </h4>
          <ul className="space-y-1.5 pl-1">
            {keyHistory.split('\n').filter(l => l.trim()).map((line, idx) => {
              const clean = line.replace(/^[\*\-\•]\s*/, '').trim();
              return (
                <li key={idx} className="flex items-start text-gray-800 text-xs sm:text-sm leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-2.5 shrink-0" />
                  <span>{renderInline(clean)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Triage / Red Flags */}
      {redFlags && (
        <div className={`rounded-xl p-3 border flex items-center space-x-3 ${isSafeTriage ? 'bg-green-50/80 border-green-200 text-green-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
          <div className={`p-1.5 rounded-lg shrink-0 ${isSafeTriage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-75 block">Triage & Red Flag Assessment</span>
            <span className="font-semibold text-xs sm:text-sm">{renderInline(redFlags)}</span>
          </div>
        </div>
      )}

      {/* Uploaded Document / Lab Findings (Key-Value Table Format) */}
      {labFindings && (() => {
        // Parse markdown table if present
        const tableLines = labFindings.split('\n').filter(l => l.trim().startsWith('|'));
        let parsedTable = [];
        let nonTableText = [];

        if (tableLines.length >= 2) {
          // Has markdown table
          const rawRows = tableLines.filter(l => !/^[\|\-\s:]+$/.test(l.trim()));
          if (rawRows.length > 0) {
            parsedTable = rawRows.slice(1).map(row => {
              const cells = row.split('|').map(c => c.trim()).filter(Boolean);
              return {
                param: cells[0] || '',
                value: cells[1] || '',
                ref: cells[2] || '-',
                status: cells[3] || 'Normal'
              };
            }).filter(r => r.param);
          }
          nonTableText = labFindings.split('\n').filter(l => !l.trim().startsWith('|') && l.trim().length > 0);
        } else {
          // Regex extract key-value pairs from prose/paragraph
          const extractedRows = [];
          const knownPatterns = [
            { name: 'Serum Urea', regex: /urea[^\d]*(\d+(?:\.\d+)?)\s*(mg\/dl)?(?:[^\d]*reference[^\d]*(\d+(?:\s*-\s*\d+)?))?/i, defaultRef: '19 - 45 mg/dL' },
            { name: 'Serum Creatinine', regex: /creatinine[^\d]*(\d+(?:\.\d+)?)\s*(mg\/dl)?(?:[^\d]*reference[^\d]*(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)))?/i, defaultRef: '0.72 - 1.18 mg/dL' },
            { name: 'eGFR', regex: /egfr[^\d]*(\d+(?:\.\d+)?)\s*(ml\/min[^,\n\.]*)?/i, defaultRef: '> 90 mL/min' },
            { name: 'BUN / Creatinine Ratio', regex: /bun\s*\/\s*creatinine\s*ratio[^\d]*(\d+(?:\.\d+)?)/i, defaultRef: '10 - 20' },
            { name: 'BUN', regex: /\bbun\b[^\d]*(\d+(?:\.\d+)?)\s*(mg\/dl)?/i, defaultRef: '7.9 - 20 mg/dL' },
            { name: 'Serum Calcium', regex: /calcium[^\d]*(\d+(?:\.\d+)?)\s*(mg\/dl)?/i, defaultRef: '8.8 - 10.6 mg/dL' },
            { name: 'Serum Potassium', regex: /potassium[^\d]*(\d+(?:\.\d+)?)\s*(mmol\/l)?/i, defaultRef: '3.5 - 5.1 mmol/L' },
            { name: 'Serum Sodium', regex: /sodium[^\d]*(\d+(?:\.\d+)?)\s*(mmol\/l)?/i, defaultRef: '136 - 146 mmol/L' },
            { name: 'Serum Uric Acid', regex: /uric\s*acid[^\d]*(\d+(?:\.\d+)?)\s*(mg\/dl)?/i, defaultRef: '3.5 - 7.2 mg/dL' },
            { name: 'Platelet Count', regex: /platelet[^\d]*([\d,]+(?:\.\d+)?)/i, defaultRef: '1,50,000 - 4,50,000' },
            { name: 'Hemoglobin', regex: /hemoglobin|\bhb\b[^\d]*(\d+(?:\.\d+)?)/i, defaultRef: '12 - 16 g/dL' },
          ];

          for (const kp of knownPatterns) {
            const m = labFindings.match(kp.regex);
            if (m) {
              const valNum = m[1];
              const unit = m[2] || '';
              const ref = m[3] || kp.defaultRef;
              let status = 'Normal';
              if (/low|slightly elevated|decreased|elevated|abnormal|reduced/i.test(labFindings)) {
                if (kp.name === 'Serum Urea' && parseFloat(valNum) < 19) status = 'Low';
                else if (kp.name === 'Serum Creatinine' && parseFloat(valNum) < 0.72) status = 'Low';
                else if (kp.name === 'Serum Urea' && parseFloat(valNum) > 45) status = 'High';
              }
              extractedRows.push({
                param: kp.name,
                value: `${valNum} ${unit}`.trim(),
                ref: ref,
                status: status
              });
            }
          }

          if (extractedRows.length > 0) {
            parsedTable = extractedRows;
            nonTableText = [labFindings];
          } else {
            nonTableText = [labFindings];
          }
        }

        return (
          <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/40 border border-emerald-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-200/80">
              <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-900 flex items-center">
                <Microscope className="w-4 h-4 mr-1.5 text-emerald-700" /> Uploaded Document & Lab Findings
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Key-Value Lab Analysis
              </span>
            </div>

            {/* Render Key-Value Table if parameters found */}
            {parsedTable.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-emerald-200/70 bg-white mb-3 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50/80 text-emerald-900 border-b border-emerald-200 text-[11px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedTable.map((row, idx) => {
                      const isLow = /low/i.test(row.status);
                      const isHigh = /high|elevated/i.test(row.status);
                      const isAbnormal = isLow || isHigh;
                      return (
                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="py-2 px-3 font-semibold text-gray-900 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shrink-0" />
                            {row.param}
                          </td>
                          <td className="py-2 px-3 font-bold text-gray-800">
                            {row.value}
                          </td>
                          <td className="py-2 px-3 text-gray-500 font-mono text-[11px]">
                            {row.ref}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isAbnormal ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {isLow ? 'Low' : 'High'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Supporting Clinical Notes from AI */}
            {nonTableText.length > 0 && (
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-100 text-xs text-gray-700 leading-relaxed">
                <span className="font-bold text-emerald-900 block mb-1">Clinical Interpretation:</span>
                {nonTableText.map((p, idx) => (
                  <p key={idx} className="my-1">{renderInline(p)}</p>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Extracted Medications */}
      {medications && (
        <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-3 flex items-start space-x-3">
          <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0 mt-0.5">
            <Pill className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-purple-900">Extracted Medications</h4>
            <div className="mt-1">
              {/none/i.test(medications) ? (
                <span className="text-xs text-gray-500 italic">No historical medications detected</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {medications.split(/[,;\n]+/).filter(m => m.trim()).map((m, idx) => (
                    <span key={idx} className="bg-white border border-purple-200 text-purple-900 text-xs px-2.5 py-1 rounded-full font-medium shadow-2xs">
                      {m.replace(/^[\*\-\•]\s*/, '').trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Assessment & Priority */}
      {assessment && (
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-2xs flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold tracking-wider uppercase text-gray-500 flex items-center">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Clinical Assessment & Priority
            </h4>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${priorityColor}`}>
              {priority} Priority
            </span>
          </div>
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
            {renderInline(assessment.replace(/^(?:Routine|Urgent|Emergency)[\.\s\:\-]*/i, ''))}
          </p>
        </div>
      )}
    </div>
  );
}

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
  const [showRawSummary, setShowRawSummary] = useState(false);
  const [abhaHistory, setAbhaHistory] = useState([]);
  const [loadingAbha, setLoadingAbha] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const fetchAbhaHistory = async (qItem) => {
    if (!qItem) return;
    setLoadingAbha(true);
    try {
      const pid = qItem.patientId || qItem.patient_id;
      let res = null;
      if (pid) {
        res = await api.getAbhaHistory(pid);
      }
      if ((!res || !res.records || res.records.length === 0) && qItem.abha_id) {
        res = await api.getAbhaRecordsDirect(qItem.abha_id);
      }
      setAbhaHistory(res?.records || []);
    } catch (err) {
      console.warn("Failed to load ABHA history:", err);
      setAbhaHistory([]);
    } finally {
      setLoadingAbha(false);
    }
  };

  const startConsultation = async (qItem) => {
    setActiveConsultation(qItem);
    setSymptoms(qItem.intake?.hpi || '');
    setPrescription('');
    setShowFhir(false);
    setAiSummary(qItem.summary || qItem.intake?.summary || null);
    setSyncStatus(null);
    fetchAbhaHistory(qItem);

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
    setSyncStatus(null);
    try {
      const res = await completeConsultation(activeConsultation.id, activeConsultation.patientId, symptoms, prescription);
      if (res && res.abha_synced) {
        setSyncStatus({ synced: true, record_id: res.record_id });
      } else if (res) {
        setSyncStatus({ synced: false, reason: res.abha_error });
      }
      setTimeout(() => {
        setActiveConsultation(null);
        setFhirData(null);
        setSessionDocs([]);
        setAiSummary(null);
        setAbhaHistory([]);
        setSyncStatus(null);
      }, 2400);
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
                          {aiSummary && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold border border-green-200">Ollama Generated</span>}
                          {!aiSummary && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Not available</span>}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {aiSummary && (
                            <button
                              onClick={() => setShowRawSummary(!showRawSummary)}
                              className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-2.5 py-1.5 rounded-lg transition font-medium"
                            >
                              {showRawSummary ? 'Cards View' : 'Raw Text'}
                            </button>
                          )}
                          <button
                            onClick={handleRegenerateSummary}
                            disabled={isRegenerating}
                            className="flex items-center text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50 font-medium"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                            {isRegenerating ? 'Generating...' : 'Re-generate'}
                          </button>
                        </div>
                      </div>
                      {aiSummary ? (
                        showRawSummary ? (
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">{aiSummary}</pre>
                        ) : (
                          <FormattedAiSummary text={aiSummary} />
                        )
                      ) : (
                        <p className="text-sm text-gray-400 italic py-2">No summary yet. Click "Re-generate" to run the local LLM (requires Ollama with {import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b'}).</p>
                      )}
                    </div>

                    {/* Universal ABHA Health Records (Cross-Hospital History) */}
                    <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex justify-between items-center mb-3 border-b pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                            <History className="w-4 h-4" />
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-900 text-base flex items-center">
                              Universal ABHA Health Records
                              <span className="ml-2 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                                ABDM Central Network
                              </span>
                            </h3>
                            <p className="text-xs text-gray-500">
                              Patient ABHA ID: <span className="font-mono font-semibold text-gray-700">{activeConsultation.abha_id || patient.abha_id || '12-3456-7890-1234'}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchAbhaHistory(activeConsultation)}
                          disabled={loadingAbha}
                          className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition font-medium flex items-center"
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${loadingAbha ? 'animate-spin' : ''}`} />
                          {loadingAbha ? 'Refreshing...' : 'Refresh Central'}
                        </button>
                      </div>

                      {loadingAbha ? (
                        <div className="py-4 text-center text-xs text-gray-500 animate-pulse">
                          Fetching longitudinal health records from Central ABHA Server (Port 8005)...
                        </div>
                      ) : abhaHistory.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-600 font-medium">
                            Found <strong>{abhaHistory.length}</strong> previous hospital encounter(s) in Central Health Database:
                          </p>
                          {abhaHistory.map((rec, i) => (
                            <div key={rec.record_id || i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-blue-800 flex items-center">
                                  🏥 {rec.hospital_name || 'Hospital Visit'}
                                </span>
                                <span className="text-gray-500 font-mono">
                                  📅 {new Date(rec.date).toLocaleDateString()} ({new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                              </div>
                              <div className="text-xs text-gray-700">
                                <p><strong className="text-gray-900">Treating Doctor:</strong> {rec.doctor_name} ({rec.doctor_specialization || 'Physician'})</p>
                                <p className="mt-0.5"><strong className="text-gray-900">Diagnosis:</strong> <span className="text-emerald-800 font-semibold">{rec.diagnosis}</span></p>
                                {rec.chief_complaint && (
                                  <p className="mt-0.5 text-gray-600"><strong>Symptoms:</strong> {rec.chief_complaint}</p>
                                )}
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs">
                                <span className="font-bold text-emerald-900 block mb-0.5">Prescription & Rx:</span>
                                <p className="text-gray-800 font-mono text-[11px] whitespace-pre-wrap">{rec.prescription}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-3 px-4 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-center justify-between">
                          <span>No previous cross-hospital records found in Central ABHA Repository for this patient.</span>
                          <span className="text-gray-400">First recorded visit on network</span>
                        </div>
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
                    <div>
                      {syncStatus && syncStatus.synced && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                          ✅ Synced to Central ABHA Registry (Record ID: {syncStatus.record_id ? syncStatus.record_id.slice(-8) : 'CONFIRMED'})
                        </span>
                      )}
                      {syncStatus && !syncStatus.synced && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠️ ABHA Sync Pending: {syncStatus.reason || 'Central Server offline'}
                        </span>
                      )}
                      {!syncStatus && (
                        <p className="text-xs text-gray-400 font-medium hidden sm:block">Time saved: ~3 mins per consult</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={isCompleting}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" /> {isCompleting ? 'Saving & Syncing...' : 'Verify & Push to HIS'}
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
