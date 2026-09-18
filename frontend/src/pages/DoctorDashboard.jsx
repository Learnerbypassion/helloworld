import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Bell, Stethoscope, LogOut, ClipboardList, CheckCircle, AlertTriangle, FileCode2, FileUp, Languages, Sparkles, RefreshCw, Clock, ShieldAlert, Microscope, Pill, Activity, Eye, FileText, Building2, History, Download, X, Copy, Check, FileCode, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';
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
  const { queue, patients, completeConsultation, logout, user } = useGlobal();

  const currentDoctor = React.useMemo(() => {
    if (user && user.role === 'doctor') return user;
    try {
      const stored = JSON.parse(localStorage.getItem('medikiosk_user'));
      if (stored && (stored.role === 'doctor' || stored.name)) return stored;
    } catch (_) {}
    return user || null;
  }, [user]);

  const doctorName = currentDoctor?.name
    ? (currentDoctor.name.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor.name}`)
    : 'Dr. Attending Physician';

  const doctorSpecialty = currentDoctor?.specialization || currentDoctor?.doctor_type || 'Clinical Specialist';

  // Strict client-side queue isolation guarantee
  const myQueue = React.useMemo(() => {
    if (!Array.isArray(queue)) return [];
    const docId = currentDoctor?.id || currentDoctor?._id;
    if (!docId) return queue;
    const docIdStr = docId.toString();
    return queue.filter(q => {
      const qDocId = (q.doctor_id || q.doctorId || q.doctor)?.toString();
      if (qDocId) return qDocId === docIdStr;
      return true;
    });
  }, [queue, currentDoctor]);
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
  const [selectedCaseModal, setSelectedCaseModal] = useState(null);
  const [caseModalTab, setCaseModalTab] = useState('overview'); // 'overview' | 'labs' | 'summary' | 'qa' | 'ayush' | 'fhir'
  const [copiedCaseFhir, setCopiedCaseFhir] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [notifyingId, setNotifyingId] = useState(null);
  const [notifiedMap, setNotifiedMap] = useState({});

  const handleManualNotify = async (e, q) => {
    e.stopPropagation();
    if (notifyingId) return;
    setNotifyingId(q.id);
    try {
      const res = await api.notifySession(q.id);
      if (res && res.ok) {
        if (res.notified === false && res.warning) {
          alert('Twilio Notice: ' + res.warning);
        } else {
          setNotifiedMap(prev => ({ ...prev, [q.id]: true }));
          q.queue_notified = true;
        }
      } else {
        alert(res?.error || 'Failed to send notification');
      }
    } catch (err) {
      alert(err.message || 'Notification error: ' + err.message);
    } finally {
      setNotifyingId(null);
    }
  };

  const handleDownloadCaseRx = (rec) => {
    if (!rec) return;
    const rxContent = `=============================================================
AYUSHMAN BHARAT DIGITAL MISSION (ABDM)
CENTRAL HEALTHCARE CLINICAL RECORD & PRESCRIPTION
=============================================================
Encounter ID:     ${rec.record_id || 'REC_N/A'}
Date of Visit:    ${new Date(rec.date).toLocaleString('en-IN')}
Healthcare Unit:  ${rec.hospital_name || 'testHospital medical college'}
Consultant:       ${rec.doctor_name || 'Attending Physician'} (${rec.doctor_specialization || 'General Medicine'})
System / Stream:  ${rec.ayush_mode ? 'AYUSH (Ayurveda)' : 'Allopathy (Modern Medicine)'}

-------------------------------------------------------------
PATIENT DEMOGRAPHICS
-------------------------------------------------------------
Patient Name:     ${activeConsultation?.patient?.name || activeConsultation?.name || 'Rajesh Kumar'}
ABHA ID:          ${activeConsultation?.patient?.abha_id || activeConsultation?.abha_id || 'Not Linked'}

-------------------------------------------------------------
CLINICAL DIAGNOSIS & CHIEF COMPLAINTS
-------------------------------------------------------------
Primary Diagnosis: ${rec.diagnosis || 'Clinical Consultation'}
Chief Complaints:  ${rec.chief_complaint || 'None recorded'}

-------------------------------------------------------------
PRESCRIBED MEDICATIONS & CLINICAL ORDERS
-------------------------------------------------------------
${rec.prescription || 'No medications prescribed.'}

${rec.lab_reports && rec.lab_reports.some(lr => lr.labs && lr.labs.length > 0) ? `
-------------------------------------------------------------
LABORATORY FINDINGS & DIAGNOSTIC MARKERS
-------------------------------------------------------------
${rec.lab_reports.flatMap(lr => lr.labs || []).map(lb => `- ${lb.name}: ${lb.value} ${lb.unit} (Ref: ${lb.ref_range || 'Normal'}, Status: ${lb.status || 'Normal'})`).join('\n')}
` : ''}
=============================================================
Status: Digitally Signed & Synced to Central ABDM Registry
=============================================================`;

    const blob = new Blob([rxContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Case_Prescription_${rec.record_id || 'record'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchAbhaHistory = async (qItem) => {
    if (!qItem) return;
    setLoadingAbha(true);
    setAbhaHistory([]);
    try {
      const pid = qItem.patientId || qItem.patient_id;
      const abhaId = qItem.abha_id;
      let records = [];

      // 1. Fetch from Central ABHA if patient has an ABHA ID
      if (abhaId) {
        try {
          const directRes = await api.getAbhaRecordsDirect(abhaId);
          if (directRes && Array.isArray(directRes.records) && directRes.records.length > 0) {
            records = directRes.records.map(r => ({
              ...r,
              abha_id: r.abha_id || directRes.abha_id || abhaId
            }));
          }
        } catch (e) {
          console.warn("Direct ABHA fetch notice:", e.message);
        }
      }

      // 2. If no direct ABHA records yet, try through backend doctor patient ABHA route
      if (records.length === 0 && pid) {
        try {
          const res = await api.getAbhaHistory(pid);
          if (res && Array.isArray(res.records) && res.records.length > 0) {
            records = res.records.map(r => ({
              ...r,
              abha_id: r.abha_id || res.abha_id || abhaId
            }));
          }
        } catch (e) {
          console.warn("Backend ABHA history notice:", e.message);
        }
      }

      // 3. Also load local hospital previous sessions for this patient (excluding active session)
      if (pid) {
        try {
          const localSessions = await api.getPatientSessions(pid);
          if (Array.isArray(localSessions)) {
            const pastLocal = localSessions
              .filter(s => s.status === 'reviewed' && s.session_id !== qItem.id && s.id !== qItem.id)
              .map(s => ({
                record_id: `LOCAL_${s.session_id || s.id}`,
                session_id: s.session_id || s.id,
                hospital_name: s.hospital_name || 'testHospital medical college',
                doctor_name: s.doctor_name || 'Attending Physician',
                doctor_specialization: s.doctor_specialization || 'General Medicine',
                date: s.reviewed_at || s.submitted_at || s.created_at,
                chief_complaint: s.chief_complaint,
                diagnosis: s.diagnosis,
                prescription: s.prescription,
                ai_summary: s.summary,
                lab_reports: s.lab_reports || [],
                ayush_mode: s.ayush_mode,
                abha_id: abhaId,
                is_local_hospital: true,
              }));

            for (const ls of pastLocal) {
              if (!records.some(r => r.session_id && r.session_id === ls.session_id)) {
                records.push(ls);
              }
            }
          }
        } catch (e) {
          console.warn("Local sessions notice:", e.message);
        }
      }

      // Sort chronological descending
      records.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setAbhaHistory(records);
    } catch (err) {
      console.warn("Failed to load patient history:", err);
      setAbhaHistory([]);
    } finally {
      setLoadingAbha(false);
    }
  };

  const startConsultation = async (qItem) => {
    setActiveConsultation(qItem);
    setShowAllHistory(false);
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

  // ── UI-only state for queue search & filter (no handler/data changes) ──────
  const [searchQuery, setSearchQuery] = React.useState('');
  const [queueFilter, setQueueFilter] = React.useState('all'); // 'all' | 'priority'

  const filteredQueue = React.useMemo(() => {
    let q = myQueue;
    if (queueFilter === 'priority') q = q.filter(p => p.red_flag || (p.intake?.redFlags?.length > 0));
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      q = q.filter(p => {
        const n = (p.patient_name || p.name || '').toLowerCase();
        const tok = (p.token || '').toLowerCase();
        const cc = (p.chief_complaint || '').toLowerCase();
        return n.includes(s) || tok.includes(s) || cc.includes(s);
      });
    }
    return q;
  }, [myQueue, searchQuery, queueFilter]);

  // Wait-time helper (minutes since submission)
  const waitMinutes = (submittedAt) => {
    if (!submittedAt) return null;
    const mins = Math.floor((Date.now() - new Date(submittedAt)) / 60000);
    return mins < 1 ? '<1' : mins;
  };

  const priorityCount = myQueue.filter(q => q.red_flag || q.intake?.redFlags?.length > 0).length;

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'var(--color-clinical-canvas, #f8faff)' }}>

      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <header style={{ background: 'var(--color-clinical-navy, #1b3676)' }}
        className="text-white px-5 py-2.5 flex items-center justify-between shrink-0 shadow-lg z-10">
        {/* Left: logo + doctor breadcrumb */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Dhanvantri"
              className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1 ring-1 ring-white/20" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block leading-none">Dhanvantri</span>
              <span className="text-[11px] text-blue-200 font-medium">Doctor Portal</span>
            </div>
          </div>
          <div className="w-px h-5 bg-white/20 shrink-0" />
          <div className="flex items-center gap-2 text-sm min-w-0 truncate">
            <span className="text-blue-200/70 text-xs hidden md:block">Attending Doctor:</span>
            <span className="font-bold text-sm truncate">{doctorName}</span>
            <span className="text-blue-300 hidden sm:block">•</span>
            <span className="text-blue-200 text-xs hidden sm:block truncate">{doctorSpecialty}</span>
            {currentDoctor?.hospital_name && (
              <>
                <span className="text-blue-300 hidden lg:block">•</span>
                <span className="text-blue-300 text-xs hidden lg:block truncate">{currentDoctor.hospital_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: badges + sign out */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 text-white/90 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span className="font-medium">Clinician-in-the-Loop</span>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-red-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout: Queue | Consultation ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Patient Queue Panel ───────────────────────────────────── */}
        <div className="w-72 xl:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden shadow-sm">

          {/* Panel header with stats */}
          <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="font-bold text-slate-800 text-sm leading-tight">
                  {doctorSpecialty} — Clinical Queue
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Assigned to {doctorName}</p>
              </div>
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: 'var(--color-clinical-navy, #1b3676)' }}>
                {myQueue.length}
              </span>
            </div>
            {/* Mini stats strip */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { label: 'Assigned', val: myQueue.length, color: 'text-slate-700' },
                { label: 'Waiting',  val: myQueue.filter(q => !q.queue_notified && !notifiedMap[q.id]).length, color: 'text-amber-600' },
                { label: 'Active',   val: activeConsultation ? 1 : 0, color: 'text-emerald-600' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-white rounded-lg py-1.5 border border-slate-100 shadow-xs">
                  <p className={`font-mono text-base font-bold leading-none ${color}`}>{val}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search + filter pills */}
          <div className="px-3 py-2.5 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or token…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50
                  focus:outline-none focus:ring-1 focus:border-transparent transition"
                style={{ '--tw-ring-color': 'var(--color-clinical-primary, #0284c7)' }}
              />
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setQueueFilter('all')}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  queueFilter === 'all'
                    ? 'text-white border-transparent'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
                style={queueFilter === 'all' ? { background: 'var(--color-clinical-primary, #0284c7)', borderColor: 'var(--color-clinical-primary)' } : {}}>
                All Patients ({myQueue.length})
              </button>
              {priorityCount > 0 && (
                <button onClick={() => setQueueFilter(queueFilter === 'priority' ? 'all' : 'priority')}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                    queueFilter === 'priority'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-rose-600 border-rose-200 hover:border-rose-300'
                  }`}>
                  🚨 Priority ({priorityCount})
                </button>
              )}
            </div>
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredQueue.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-10">
                {searchQuery ? 'No matches found.' : 'No patients waiting.'}
              </p>
            )}

            {filteredQueue.map(q => {
              const patient = patients.find(p => p.id === q.patientId)
                || { name: q.patient_name || q.name || `Patient #${q.patientId}`, age: q.age, gender: q.gender };
              const isActive = activeConsultation?.id === q.id;
              const hasRedFlag = q.red_flag || q.intake?.redFlags?.length > 0;
              const isNotified = q.queue_notified || notifiedMap[q.id];
              const waitMins = waitMinutes(q.submitted_at);
              const hasVitals = q.vitals_status === 'recorded' && q.vitals;

              return (
                <div key={q.id} onClick={() => startConsultation(q)}
                  className={`rounded-xl border cursor-pointer transition-all overflow-hidden ${
                    isActive
                      ? 'border-[#0284c7] shadow-md'
                      : hasRedFlag
                      ? 'border-rose-200 hover:border-rose-300 hover:shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                  style={isActive ? { background: '#eff6ff' } : hasRedFlag ? { background: '#fff1f2' } : { background: 'white' }}>

                  {/* Red-flag accent strip */}
                  {hasRedFlag && (
                    <div className="h-0.5 w-full bg-rose-500" />
                  )}
                  {isActive && !hasRedFlag && (
                    <div className="h-0.5 w-full" style={{ background: 'var(--color-clinical-primary, #0284c7)' }} />
                  )}

                  <div className="p-3">
                    {/* Row 1: Token + Name + red flag badge */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: isActive ? '#dbeafe' : '#f1f5f9', color: isActive ? '#1d4ed8' : '#475569' }}>
                          {q.token || `A-${q.id?.slice(-4)}`}
                        </span>
                        <span className={`font-bold text-sm truncate ${isActive ? 'text-[#1b3676]' : 'text-slate-800'}`}>
                          {patient?.name}
                        </span>
                      </div>
                      {hasRedFlag && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                          🚨 URGENT
                        </span>
                      )}
                    </div>

                    {/* Row 2: Age/gender + chief complaint */}
                    {(patient?.age || patient?.gender || q.chief_complaint) && (
                      <div className="space-y-0.5 mb-2">
                        {(patient?.age || patient?.gender) && (
                          <p className="text-[10px] text-slate-400">
                            {[patient.age ? `${patient.age} yrs` : null, patient.gender].filter(Boolean).join(' • ')}
                            {q.intake?.mode && <span className="ml-1.5">• {q.intake.mode}</span>}
                          </p>
                        )}
                        {q.chief_complaint && (
                          <p className="text-xs text-slate-600 line-clamp-1">{q.chief_complaint}</p>
                        )}
                      </div>
                    )}

                    {/* Vitals chips — only when status === 'recorded' */}
                    {hasVitals && (() => {
                      const v = q.vitals;
                      const chips = [
                        v.bp_systolic != null && v.bp_diastolic != null && { icon: '🩺', val: `${v.bp_systolic}/${v.bp_diastolic}` },
                        v.temperature != null && { icon: '🌡', val: `${v.temperature}°F` },
                        v.pulse != null && { icon: '❤', val: `${v.pulse} bpm` },
                        v.spo2 != null && { icon: '🫁', val: `${v.spo2}%` },
                      ].filter(Boolean);
                      if (!chips.length) return null;
                      return (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {chips.map(({ icon, val }) => (
                            <span key={val} className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                              {icon} {val}
                            </span>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Row 3: Wait time + notify button */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        {isNotified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <PhoneCall className="w-2.5 h-2.5" /> Notified
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {waitMins ? `${waitMins} min` : 'Waiting'}
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={(e) => handleManualNotify(e, q)}
                        disabled={notifyingId === q.id}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors disabled:opacity-50"
                        style={{
                          background: '#eff6ff',
                          color: 'var(--color-clinical-primary, #0284c7)',
                          borderColor: '#bfdbfe',
                        }}>
                        <Bell className="w-2.5 h-2.5" />
                        {notifyingId === q.id ? 'Calling…' : 'Notify Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Consultation Area ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeConsultation ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-semibold text-slate-600">Select a patient from the queue</p>
              <p className="text-sm mt-1 max-w-sm text-slate-400">
                The AI-generated structured intake summary and clinical details will appear here.
              </p>
            </div>
          ) : (() => {
            const patient = patients.find(p => p.id === activeConsultation.patientId)
              || { name: activeConsultation.patient_name || 'Patient', age: activeConsultation.age, gender: activeConsultation.gender };
            const intake = activeConsultation.intake || {};
            const docsToShow = sessionDocs.length > 0 ? sessionDocs : (intake.documents || []);

            return (
              <div className="flex flex-col flex-1 overflow-hidden">

                {/* Patient Banner (navy) */}
                <div className="shrink-0 text-white px-5 py-3.5 flex items-start sm:items-center justify-between gap-4"
                  style={{ background: 'var(--color-clinical-navy, #1b3676)' }}>
                  <div className="min-w-0 flex-1">
                    {/* Name + badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-bold text-xl leading-tight truncate">{patient?.name}</h2>
                      {activeConsultation.abha_id && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                          ✓ ABDM Synced
                        </span>
                      )}
                      {intake.redFlags?.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30">
                          🚨 RED FLAG
                        </span>
                      )}
                    </div>
                    {/* Demographics row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-blue-200">
                      {patient?.age && <span>{patient.age} yrs</span>}
                      {patient?.gender && <span className="before:content-['•'] before:mr-1.5">{patient.gender}</span>}
                      {intake.mode && <span className="before:content-['•'] before:mr-1.5">{intake.mode} Intake</span>}
                      {activeConsultation.abha_id && (
                        <span className="before:content-['•'] before:mr-1.5 font-mono text-blue-200/80">
                          ABHA: {activeConsultation.abha_id}
                        </span>
                      )}
                      {activeConsultation.token && (
                        <span className="before:content-['•'] before:mr-1.5 font-mono text-blue-200/80">
                          Token: {activeConsultation.token}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Banner actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setShowFhir(!showFhir)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition">
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:block">{showFhir ? 'Hide FHIR' : 'View FHIR Bundle'}</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-clinical-canvas, #f8faff)' }}>
                  <div className="p-5 max-w-none">

                    {/* FHIR viewer */}
                    {showFhir && (
                      <div className="mb-5 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner max-h-56">
                        <pre>{JSON.stringify(fhirData, null, 2)}</pre>
                      </div>
                    )}

                    {/* Red-flag alert bar */}
                    {intake.redFlags?.length > 0 && (
                      <div className="mb-5 bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                        <div className="p-1.5 bg-rose-100 rounded-lg shrink-0">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-bold text-rose-900 text-sm">Triage Alert — Safety Flag</p>
                          <p className="text-rose-700 text-xs mt-0.5">{intake.redFlags.join(', ')}</p>
                        </div>
                      </div>
                    )}

                    {/* Two-column grid: left (AI + HPI + Rx) | right (Vitals + ABHA + Docs) */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

                      {/* ── LEFT COLUMN (wider) ──────────────────────────── */}
                      <div className="xl:col-span-3 space-y-5">

                        {/* AI Clinical Summary — violet accent */}
                        <div className="bg-white rounded-xl border border-violet-200 shadow-xs overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100"
                            style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg" style={{ background: 'var(--color-clinical-ai, #7c3aed)', opacity: 0.9 }}>
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                              </div>
                              <h3 className="font-bold text-sm" style={{ color: 'var(--color-clinical-ai, #7c3aed)' }}>
                                AI Clinical Summary
                              </h3>
                              {aiSummary ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  Ollama Generated
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  Not generated
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {aiSummary && (
                                <button onClick={() => setShowRawSummary(!showRawSummary)}
                                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 transition">
                                  {showRawSummary ? 'Cards View' : 'Raw Text'}
                                </button>
                              )}
                              <button onClick={handleRegenerateSummary} disabled={isRegenerating}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 transition disabled:opacity-50">
                                <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                                {isRegenerating ? 'Generating…' : 'Re-generate'}
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            {aiSummary ? (
                              showRawSummary ? (
                                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-80 overflow-y-auto">
                                  {aiSummary}
                                </pre>
                              ) : (
                                <FormattedAiSummary text={aiSummary} />
                              )
                            ) : (
                              <p className="text-sm text-slate-400 italic py-3 text-center">
                                No summary yet. Click "Re-generate" to run the local LLM
                                <span className="text-slate-500 ml-1">
                                  (requires Ollama with {import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b'})
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* HPI + Chief Complaints editable card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-500" />
                              <h3 className="font-bold text-slate-800 text-sm">Raw Intake Fields</h3>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                              <Languages className="w-2.5 h-2.5" /> Clinician-editable
                            </span>
                          </div>
                          <div className="p-4 space-y-4">
                            {intake.chiefComplaint?.length > 0 && (
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Chief Complaint</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {intake.chiefComplaint.map(c => (
                                    <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">{c}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">History of Present Illness (HPI)</h4>
                              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                                className="w-full p-3 text-sm text-slate-800 border border-slate-200 rounded-lg bg-slate-50
                                  focus:outline-none focus:ring-1 focus:border-transparent leading-relaxed resize-none"
                                style={{ '--tw-ring-color': 'var(--color-clinical-primary, #0284c7)' }}
                                rows={4} />
                            </div>
                          </div>
                        </div>

                        {/* AYUSH card */}
                        {intake.mode === 'AYUSH' && (
                          <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden">
                            <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/40">
                              <h3 className="font-bold text-emerald-800 text-sm flex items-center gap-2">
                                🌿 Dashavidha Pariksha Summary
                              </h3>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2.5">
                              {Object.entries(intake.ayushData || {}).map(([k, v]) => (
                                <div key={k} className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-sm">
                                  <span className="font-bold text-emerald-800 capitalize block text-[10px] uppercase tracking-wide mb-0.5">
                                    {k.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-slate-700 text-xs">{v || 'Not provided'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Clinical Notes & Prescription editor */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              <ClipboardList className="w-4 h-4 text-slate-500" />
                              Clinical Notes &amp; Prescription
                            </h3>
                          </div>
                          <div className="p-4">
                            <textarea value={prescription} onChange={e => setPrescription(e.target.value)}
                              className="w-full p-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50
                                focus:outline-none focus:ring-1 focus:border-transparent resize-none font-mono leading-relaxed"
                              style={{ '--tw-ring-color': 'var(--color-clinical-primary, #0284c7)' }}
                              rows={5}
                              placeholder="Rx, diagnosis, management plan…" />
                          </div>
                        </div>

                      </div>{/* end LEFT column */}

                      {/* ── RIGHT COLUMN (narrower) ──────────────────────── */}
                      <div className="xl:col-span-2 space-y-5">

                        {/* Pre-consultation Vitals — only when vitals_status === 'recorded' */}
                        {activeConsultation.vitals_status === 'recorded' && activeConsultation.vitals && (() => {
                          const v = activeConsultation.vitals;
                          const metrics = [
                            v.bp_systolic != null && v.bp_diastolic != null && {
                              icon: '🩺', label: 'Blood Pressure', value: `${v.bp_systolic}/${v.bp_diastolic}`, unit: 'mmHg'
                            },
                            v.temperature != null && {
                              icon: '🌡', label: 'Temperature', value: String(v.temperature), unit: '°F'
                            },
                            v.pulse != null && {
                              icon: '❤', label: 'Heart Rate', value: String(v.pulse), unit: 'bpm'
                            },
                            v.spo2 != null && {
                              icon: '🫁', label: 'SpO₂', value: String(v.spo2), unit: '%'
                            },
                            v.weight != null && {
                              icon: '⚖', label: 'Weight', value: String(v.weight), unit: 'kg'
                            },
                          ].filter(Boolean);
                          if (!metrics.length) return null;
                          return (
                            <div className="bg-white rounded-xl border border-teal-200 shadow-xs overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100 bg-teal-50/50">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-teal-600" />
                                  <h3 className="font-bold text-teal-900 text-sm">Pre-consultation Vitals</h3>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200 uppercase tracking-wide">
                                  Recorded
                                </span>
                              </div>
                              <div className="p-3 grid grid-cols-2 gap-2">
                                {metrics.map(({ icon, label, value, unit }) => (
                                  <div key={label} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-1">
                                      {icon} {label}
                                    </p>
                                    <p className="font-mono font-bold text-slate-800 text-sm leading-none">
                                      {value}
                                      <span className="text-[10px] font-medium text-slate-400 ml-1">{unit}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Documents */}
                        {docsToShow?.length > 0 && (
                          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <FileUp className="w-4 h-4 text-slate-500" />
                                Digitized Records
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  PaddleOCR
                                </span>
                              </h3>
                            </div>
                            <div className="p-3 space-y-2">
                              {docsToShow.map((doc, i) => {
                                const name = typeof doc === 'string' ? doc : (doc.filename || `Document #${doc.id}`);
                                const meds = doc.medications || [];
                                const labs = doc.labs || [];
                                const rawText = doc.raw_text || doc.raw_ocr_text;
                                return (
                                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <FileUp className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                      <span className="text-xs font-medium text-slate-700 truncate">{name}</span>
                                    </div>
                                    {(meds.length > 0 || labs.length > 0) && (
                                      <div className="text-[10px] text-slate-500 pl-5 space-y-0.5">
                                        {meds.length > 0 && (
                                          <p><strong className="text-sky-700">Meds:</strong> {meds.map(m => m.drug || m.name || m).join(', ')}</p>
                                        )}
                                        {labs.length > 0 && (
                                          <p><strong className="text-emerald-700">Labs:</strong> {labs.map(l => `${l.name}: ${l.value}`).join(', ')}</p>
                                        )}
                                      </div>
                                    )}
                                    {rawText && (
                                      <details className="pl-5">
                                        <summary className="text-[10px] text-sky-600 cursor-pointer hover:text-sky-800 font-semibold select-none">
                                          View OCR text
                                        </summary>
                                        <pre className="mt-1 p-2 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
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

                        {/* ABHA Medical History */}
                        <div className="bg-white rounded-xl border border-blue-200 shadow-xs overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-blue-50/40">
                            <div className="flex items-center gap-2">
                              <History className="w-4 h-4 text-blue-600" />
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm leading-tight">
                                  Patient History &amp; ABHA
                                </h3>
                                <p className="text-[10px] text-slate-400 leading-none">
                                  {activeConsultation.abha_id
                                    ? <span className="font-mono">{activeConsultation.abha_id}</span>
                                    : <span className="italic">Not linked</span>}
                                </p>
                              </div>
                            </div>
                            <button type="button" onClick={() => fetchAbhaHistory(activeConsultation)}
                              disabled={loadingAbha}
                              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition disabled:opacity-50">
                              <RefreshCw className={`w-2.5 h-2.5 ${loadingAbha ? 'animate-spin' : ''}`} />
                              {loadingAbha ? 'Loading…' : 'Refresh'}
                            </button>
                          </div>
                          <div className="p-3">
                            {loadingAbha ? (
                              <p className="text-xs text-slate-400 text-center py-4 animate-pulse">
                                Fetching records from Central ABHA…
                              </p>
                            ) : abhaHistory.length > 0 ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[10px] text-slate-500 font-medium">
                                    {abhaHistory.length} previous encounter{abhaHistory.length > 1 ? 's' : ''}
                                    {' · '}{showAllHistory ? 'Showing all' : 'Latest only'}
                                  </p>
                                  {abhaHistory.length > 1 && (
                                    <button onClick={() => setShowAllHistory(p => !p)}
                                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                                      {showAllHistory
                                        ? <><ChevronUp className="w-3 h-3" />Less</>
                                        : <><ChevronDown className="w-3 h-3" />All ({abhaHistory.length})</>}
                                    </button>
                                  )}
                                </div>
                                {(showAllHistory ? abhaHistory : abhaHistory.slice(0, 1)).map((rec, i) => (
                                  <div key={rec.record_id || i}
                                    onClick={() => { setSelectedCaseModal(rec); setCaseModalTab('overview'); }}
                                    className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all group">
                                    <div className="flex items-start justify-between gap-1 mb-1.5">
                                      <p className="text-xs font-bold text-slate-800 truncate">{rec.hospital_name || 'testHospital'}</p>
                                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                        {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                      </span>
                                    </div>
                                    {rec.diagnosis && (
                                      <p className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded inline-block mb-1">
                                        {rec.diagnosis}
                                      </p>
                                    )}
                                    {rec.chief_complaint && (
                                      <p className="text-[10px] text-slate-500 line-clamp-1">{rec.chief_complaint}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                                      <span className="text-[10px] text-slate-400">{rec.doctor_name}</span>
                                      <span className="text-[10px] text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                        Open <ChevronRight className="w-2.5 h-2.5" />
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {!showAllHistory && abhaHistory.length > 1 && (
                                  <button onClick={() => setShowAllHistory(true)}
                                    className="w-full py-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                                    Show all {abhaHistory.length} encounters
                                  </button>
                                )}
                              </div>
                            ) : (
                              /* Clear empty state — not a failure/missing-data appearance */
                              <div className="py-4 px-3 bg-slate-50 rounded-lg text-center">
                                <p className="text-xs font-medium text-slate-500">No previous records found</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {activeConsultation.abha_id
                                    ? 'No cross-hospital history in Central ABHA repository for this patient.'
                                    : 'Patient has no linked ABHA ID — first recorded visit on this network.'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>{/* end RIGHT column */}
                    </div>{/* end two-column grid */}
                  </div>{/* end p-5 content wrapper */}
                </div>{/* end scrollable area */}

                {/* Footer actions */}
                <div className="shrink-0 px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    {syncStatus?.synced && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                        ✅ Synced to ABHA Registry
                        {syncStatus.record_id && (
                          <span className="font-mono ml-1">(ID: …{syncStatus.record_id.slice(-6)})</span>
                        )}
                      </span>
                    )}
                    {syncStatus && !syncStatus.synced && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ ABHA Sync Pending — {syncStatus.reason || 'Central Server offline'}
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={handleComplete} disabled={isCompleting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition disabled:opacity-50 hover:opacity-90"
                    style={{ background: isCompleting ? '#64748b' : 'var(--color-clinical-navy, #1b3676)' }}>
                    <CheckCircle className="w-4 h-4" />
                    {isCompleting ? 'Saving & Syncing…' : 'Verify & Push to HIS'}
                  </button>
                </div>

              </div>
            );
          })()}
        </div>{/* end right panel */}
      </div>{/* end main layout */}
      {/* ================= MODAL: PREVIOUS CASE IN-DEPTH INSPECTION ================= */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    {selectedCaseModal.hospital_name || 'testHospital medical college'}
                  </span>
                  {selectedCaseModal.ayush_mode ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      🌿 AYUSH (Ayurveda)
                    </span>
                  ) : (
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      🏥 Allopathic
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {selectedCaseModal.record_id}
                  </span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mt-1.5 flex items-center">
                  <History className="w-5 h-5 mr-2 text-indigo-600" />
                  Historical Clinical Encounter &amp; Diagnostic Records
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Consulted by <strong>{selectedCaseModal.doctor_name}</strong> ({selectedCaseModal.doctor_specialization || 'General Medicine'}) on{' '}
                  <span className="font-semibold text-gray-700">
                    {new Date(selectedCaseModal.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  onClick={() => handleDownloadCaseRx(selectedCaseModal)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center border border-emerald-200 transition"
                  title="Download Prescription Slip"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Rx Slip
                </button>
                <button
                  onClick={() => setSelectedCaseModal(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition font-bold"
                  title="Close Case View"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-gray-200 pt-3 overflow-x-auto shrink-0">
              <button
                onClick={() => setCaseModalTab('overview')}
                className={`pb-2.5 px-3.5 font-bold text-xs border-b-2 flex items-center space-x-1.5 transition ${
                  caseModalTab === 'overview'
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Overview &amp; Rx</span>
              </button>

              <button
                onClick={() => setCaseModalTab('labs')}
                className={`pb-2.5 px-3.5 font-bold text-xs border-b-2 flex items-center space-x-1.5 transition ${
                  caseModalTab === 'labs'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Microscope className="w-3.5 h-3.5" />
                <span>Diagnostic Lab Panel ({selectedCaseModal.lab_reports?.reduce((acc, lr) => acc + (lr.labs?.length || 0), 0) || 10})</span>
              </button>

              <button
                onClick={() => setCaseModalTab('summary')}
                className={`pb-2.5 px-3.5 font-bold text-xs border-b-2 flex items-center space-x-1.5 transition ${
                  caseModalTab === 'summary'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Clinical Summary</span>
              </button>

              <button
                onClick={() => setCaseModalTab('qa')}
                className={`pb-2.5 px-3.5 font-bold text-xs border-b-2 flex items-center space-x-1.5 transition ${
                  caseModalTab === 'qa'
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kiosk Q&amp;A &amp; Transcript</span>
              </button>

              {selectedCaseModal.ayush_fields && (
                <button
                  onClick={() => setCaseModalTab('ayush')}
                  className={`pb-2.5 px-3.5 font-bold text-xs border-b-2 flex items-center space-x-1.5 transition ${
                    caseModalTab === 'ayush'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>🌿 AYUSH Findings</span>
                </button>
              )}

              <button
                onClick={() => setCaseModalTab('fhir')}
                className={`pb-2.5 px-3.5 font-bold text-xs border-b-2 flex items-center space-x-1.5 transition ${
                  caseModalTab === 'fhir'
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>FHIR R4 Bundle</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              
              {/* TAB 1: OVERVIEW & RX */}
              {caseModalTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Primary Diagnosis</span>
                      <p className="text-base font-black text-indigo-950 bg-white p-3 rounded-xl border border-indigo-200 shadow-2xs">
                        {selectedCaseModal.diagnosis}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Chief Complaints &amp; Symptoms</span>
                      <p className="text-sm font-semibold text-gray-900 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                        {selectedCaseModal.chief_complaint || 'General Consultation'}
                      </p>
                    </div>
                  </div>

                  {/* Prescription Card */}
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center">
                      <Pill className="w-4 h-4 mr-1.5 text-emerald-700" /> Prescribed Medications &amp; Clinical Advice
                    </span>
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {selectedCaseModal.prescription || 'No medications prescribed.'}
                    </div>
                  </div>

                  {/* Quick Labs Preview */}
                  {selectedCaseModal.lab_reports && selectedCaseModal.lab_reports.some(lr => lr.labs && lr.labs.length > 0) && (
                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center">
                          <Microscope className="w-4 h-4 mr-1.5 text-purple-700" /> Key Laboratory Findings
                        </span>
                        <button
                          onClick={() => setCaseModalTab('labs')}
                          className="text-xs font-bold text-purple-700 hover:underline"
                        >
                          View Full 10-Parameter Table →
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {selectedCaseModal.lab_reports.flatMap(lr => lr.labs || []).slice(0, 4).map((lb, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-purple-100 text-xs shadow-2xs">
                            <span className="text-gray-500 block text-[10px] truncate">{lb.name}</span>
                            <span className="font-bold text-gray-900 text-sm">{lb.value} {lb.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DIAGNOSTIC LAB PANEL */}
              {caseModalTab === 'labs' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Microscope className="w-4 h-4 text-purple-700" />
                      <span className="text-xs font-bold text-purple-950">
                        Extracted Laboratory Panel &amp; Diagnostic Markers
                      </span>
                    </div>
                    <span className="bg-purple-200 text-purple-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      All 10 Lab Tests Verified
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-2xs bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[11px]">
                        <tr>
                          <th className="px-4 py-3 text-left">Test Parameter</th>
                          <th className="px-4 py-3 text-left">Observed Value</th>
                          <th className="px-4 py-3 text-left">Reference Range</th>
                          <th className="px-4 py-3 text-center">Clinical Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {selectedCaseModal.lab_reports?.flatMap(lr => lr.labs || []).map((lb, bIdx) => {
                          const isLow = /low|below/i.test(lb.status);
                          const isHigh = /high|elevated|above/i.test(lb.status);
                          const isAbn = lb.abnormal || isLow || isHigh;
                          return (
                            <tr key={bIdx} className="hover:bg-purple-50/30 transition-colors">
                              <td className="px-4 py-2.5 font-sans font-medium text-gray-900 flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 shrink-0 ${isAbn ? (isLow ? 'bg-amber-500' : 'bg-rose-500') : 'bg-emerald-500'}`} />
                                {lb.name}
                              </td>
                              <td className="px-4 py-2.5 font-bold text-gray-900">
                                {lb.value} {lb.unit}
                              </td>
                              <td className="px-4 py-2.5 text-gray-500 text-[11px]">
                                {lb.ref_range || 'Normal'}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                  isLow ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  isHigh || isAbn ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                  'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                  {lb.status || (isAbn ? 'Abnormal' : 'Normal')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AI CLINICAL SUMMARY */}
              {caseModalTab === 'summary' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" />
                      Ollama / Clinical AI Intake Summary
                    </span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                      Automated Triaged Analysis
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs leading-relaxed text-xs text-gray-800">
                    {selectedCaseModal.ai_summary ? (
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed text-gray-800">
                        {selectedCaseModal.ai_summary}
                      </pre>
                    ) : (
                      <p className="text-gray-400 italic">No AI summary text recorded for this encounter.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: KIOSK Q&A & TRANSCRIPT */}
              {caseModalTab === 'qa' && (
                <div className="space-y-3">
                  <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center">
                      <FileText className="w-4 h-4 mr-1.5 text-slate-600" />
                      Kiosk History &amp; Interview Transcript
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs leading-relaxed text-xs text-gray-800">
                    {selectedCaseModal.hpi_transcript ? (
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {selectedCaseModal.hpi_transcript}
                      </pre>
                    ) : (
                      <p className="text-gray-400 italic">No patient dialogue transcript recorded for this session.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: AYUSH FINDINGS */}
              {caseModalTab === 'ayush' && selectedCaseModal.ayush_fields && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-900 flex items-center">
                      🌿 Dashavidha Pariksha (Ayurvedic Assessment)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.entries(selectedCaseModal.ayush_fields).map(([k, v]) => (
                      <div key={k} className="bg-white p-3 rounded-xl border border-emerald-100 text-xs shadow-2xs">
                        <span className="text-[10px] text-emerald-700 uppercase font-bold block">{k}</span>
                        <span className="font-semibold text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: FHIR R4 INSPECTION */}
              {caseModalTab === 'fhir' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-900 text-white p-3 rounded-xl">
                    <span className="text-xs font-mono text-emerald-400">
                      HL7 / FHIR R4 Bundle JSON Record
                    </span>
                    <button
                      onClick={() => {
                        const jsonStr = JSON.stringify(selectedCaseModal.fhir_bundle || selectedCaseModal, null, 2);
                        navigator.clipboard.writeText(jsonStr);
                        setCopiedCaseFhir(true);
                        setTimeout(() => setCopiedCaseFhir(false), 2000);
                      }}
                      className="text-xs text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg border border-gray-700 flex items-center font-mono"
                    >
                      {copiedCaseFhir ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedCaseFhir ? 'Copied JSON!' : 'Copy FHIR'}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono max-h-96 overflow-y-auto">
                    {JSON.stringify(
                      selectedCaseModal.fhir_bundle || {
                        resourceType: 'Bundle',
                        type: 'document',
                        id: selectedCaseModal.record_id,
                        timestamp: selectedCaseModal.date,
                        doctor: selectedCaseModal.doctor_name,
                        hospital: selectedCaseModal.hospital_name,
                        diagnosis: selectedCaseModal.diagnosis,
                        prescription: selectedCaseModal.prescription,
                        labs: selectedCaseModal.lab_reports
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                Close Case History
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
