import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser, clearAuth } from '../services/api';

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());

  const [doctors, setDoctors] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize patient object so components using abhaId or abha_id work
  const normalizePatient = (p) => ({
    ...p,
    id: p.id,
    abhaId: p.abha_id || p.abhaId || '',
    abha_id: p.abha_id || p.abhaId || '',
    history: Array.isArray(p.history) ? p.history : [],
  });

  // Normalize doctor object so specialization, education, license, phone work
  const normalizeDoctor = (d) => ({
    ...d,
    id: d.id,
    specialization: d.specialization || d.doctor_type || 'General Medicine',
    education: d.education || 'MBBS',
    license: d.license || d.hpr_id || 'REG-' + d.id,
    phone: d.phone || '9999999999',
  });

  // Normalize queue item
  const normalizeQueueItem = (q) => {
    let intake = q.intake;
    if (!intake) {
      const redFlags = q.red_flag
        ? (q.red_flag_reason ? [q.red_flag_reason] : ['High risk symptoms detected'])
        : [];
      intake = {
        mode: q.ayush_mode ? 'AYUSH' : 'Allopathic',
        chiefComplaint: q.chief_complaint ? [q.chief_complaint] : [],
        hpi: q.transcript || q.hpi || '',
        ayushData: q.ayush_fields || { prakriti: '', agni: '', koshtha: '' },
        redFlags: redFlags,
        documents: q.documents ? q.documents.map(d => typeof d === 'string' ? d : d.filename) : [],
      };
    }
    return {
      ...q,
      id: q.session_id || q.id,
      sessionId: q.session_id || q.id,
      patientId: q.patient_id || q.patientId,
      doctorId: q.doctor_id || q.doctorId,
      status: q.status || 'waiting',
      intake,
    };
  };

  // Refresh all state from backend
  const refreshAll = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        // Try public doctors list or kiosk check if available
        return;
      }

      // 1. Fetch Doctors
      try {
        const docs = await api.getDoctors();
        if (Array.isArray(docs)) setDoctors(docs.map(normalizeDoctor));
      } catch (e) {
        // May not be allowed for patient role
      }

      // 2. Fetch Receptionists (hospital_admin role only)
      try {
        const recs = await api.getReceptionists();
        if (Array.isArray(recs)) setReceptionists(recs);
      } catch (e) {
        // Not admin
      }

      // 3. Fetch Patients
      try {
        const pts = await api.getPatients();
        if (Array.isArray(pts)) {
          // Also fetch session history for patients
          const detailed = await Promise.all(
            pts.map(async (p) => {
              try {
                const sessions = await api.getPatientSessions(p.id);
                const history = (sessions || []).map((s) => ({
                  date: (s.submitted_at || s.created_at || '').slice(0, 10),
                  doctor: 'Attending Physician',
                  intakeSummary: {
                    mode: s.ayush_mode ? 'AYUSH' : 'Allopathic',
                    chiefComplaint: s.chief_complaint ? [s.chief_complaint] : [],
                  },
                  symptomsText: s.summary || s.chief_complaint || 'N/A',
                  prescription: s.prescription || s.diagnosis || 'Under evaluation',
                }));
                return normalizePatient({ ...p, history });
              } catch {
                return normalizePatient(p);
              }
            })
          );
          setPatients(detailed);
        }
      } catch (e) {
        // If patient login, fetch own profile
        const stored = getStoredUser();
        if (stored?.role === 'patient' && stored?.id) {
          try {
            const myP = await api.getPatient(stored.id);
            const sessions = await api.getPatientSessions(stored.id);
            const history = (sessions || []).map((s) => ({
              date: (s.submitted_at || s.created_at || '').slice(0, 10),
              doctor: 'Attending Physician',
              symptomsText: s.summary || s.chief_complaint || 'N/A',
              prescription: s.prescription || s.diagnosis || 'Under evaluation',
            }));
            setPatients([normalizePatient({ ...myP, history })]);
          } catch (err) {
            console.error('Error fetching patient profile', err);
          }
        }
      }

      // 4. Fetch Queue (Doctor & Hospital Staff)
      try {
        const qList = await api.getDoctorQueue();
        if (Array.isArray(qList)) {
          // Enrich queue items with session detail
          const enriched = await Promise.all(
            qList.map(async (qItem) => {
              try {
                const fullSession = await api.getSession(qItem.session_id);
                return normalizeQueueItem({
                  ...qItem,
                  patient_id: fullSession.patient?.id || qItem.patient_id,
                  intake: {
                    mode: fullSession.ayush_mode ? 'AYUSH' : 'Allopathic',
                    chiefComplaint: fullSession.chief_complaint ? [fullSession.chief_complaint] : [],
                    hpi: fullSession.transcript || fullSession.pmh || '',
                    ayushData: fullSession.ayush_fields || {},
                    redFlags: fullSession.red_flag ? [fullSession.red_flag_reason || 'Triage Red Flag'] : [],
                    documents: (fullSession.documents || []).map((d) => d.filename || d),
                    fhirBundle: fullSession.fhir_bundle,
                  },
                });
              } catch {
                return normalizeQueueItem(qItem);
              }
            })
          );
          setQueue(enriched);
        }
      } catch (e) {
        // Not doctor
      }
    } catch (err) {
      console.error('Error loading data from API', err);
    }
  }, []);

  // On mount or token change, load backend data
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auth helper
  const handleAuthSuccess = (newToken, newUser) => {
    setAuthToken(newToken);
    setStoredUser(newUser);
    setToken(newToken);
    setUser(newUser);
    refreshAll();
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  // Admin Actions
  const addDoctor = async (docData) => {
    try {
      const res = await api.addDoctor(docData);
      const newDoc = normalizeDoctor(res.doctor || res);
      setDoctors((prev) => [...prev, newDoc]);
      return newDoc;
    } catch (err) {
      console.error('Failed to add doctor:', err);
      throw err;
    }
  };

  const deleteDoctor = async (id) => {
    try {
      await api.deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete doctor:', err);
      throw err;
    }
  };

  const addReceptionist = async (recData) => {
    try {
      const res = await api.addReceptionist(recData);
      const newRec = res.receptionist || res;
      setReceptionists((prev) => [...prev, newRec]);
      return newRec;
    } catch (err) {
      console.error('Failed to add receptionist:', err);
      throw err;
    }
  };

  const deleteReceptionist = async (id) => {
    try {
      await api.deleteReceptionist(id);
      setReceptionists((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete receptionist:', err);
      throw err;
    }
  };

  // Receptionist / Patient Actions
  const addPatient = async (patientData) => {
    try {
      const res = await api.addPatient(patientData);
      const newP = normalizePatient(res.patient || res);
      setPatients((prev) => [newP, ...prev]);
      return newP;
    } catch (err) {
      console.error('Failed to add patient:', err);
      throw err;
    }
  };

  const forwardToDoctor = async (patientId, doctorId) => {
    try {
      const res = await api.createSession({
        patient_id: patientId,
        doctor_id: doctorId,
        status: 'submitted',
        chief_complaint: 'Referred from Reception Desk',
      });
      // Refresh live queue from backend
      await refreshAll();
      return res;
    } catch (err) {
      console.error('Failed to forward patient to doctor:', err);
      throw err;
    }
  };

  // Kiosk Actions
  const submitKioskIntake = async (patientId, doctorId, intakeData) => {
    try {
      // 1. Create session
      const sessionRes = await api.createSession({
        patient_id: patientId,
        doctor_id: doctorId,
        ayush_mode: intakeData.mode === 'AYUSH',
      });
      const sId = sessionRes.session_id;

      // 2. Update symptom & red flags
      const chiefComplaintText = intakeData.chiefComplaint?.join(', ') || 'General Consultation';
      await api.updateSymptom(sId, {
        symptom_id: intakeData.redFlags?.length ? 'chest' : 'general',
        chief_complaint: chiefComplaintText,
        transcript: intakeData.hpi || null,
      });

      // 3. Update HPI
      if (intakeData.hpi) {
        await api.updateHpi(sId, [{ label: 'HPI', value: intakeData.hpi }]);
      }

      // 4. Update AYUSH if applicable
      if (intakeData.mode === 'AYUSH' && intakeData.ayushData) {
        await api.updateAyush(sId, intakeData.ayushData);
      }

      // 5. Submit session (generates FHIR bundle)
      const submitRes = await api.submitSession(sId);
      
      // Update queue locally & refresh
      await refreshAll();
      return submitRes;
    } catch (err) {
      console.error('Failed to submit kiosk intake:', err);
      throw err;
    }
  };

  // Doctor Actions
  const completeConsultation = async (queueId, patientId, notes, prescription) => {
    try {
      const reviewRes = await api.reviewSession(queueId, {
        summary: notes,
        diagnosis: notes,
        prescription: prescription,
      });

      // Remove from queue locally
      setQueue((prev) => prev.filter((q) => q.id !== queueId && q.sessionId !== queueId));

      // Update patient history
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === patientId) {
            return {
              ...p,
              history: [
                {
                  date: new Date().toISOString().split('T')[0],
                  doctor: 'Attending Doctor',
                  symptomsText: notes,
                  prescription: prescription,
                },
                ...p.history,
              ],
            };
          }
          return p;
        })
      );
      return reviewRes;
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      throw err;
    }
  };

  const updatePatientProfile = async (patientId, updates) => {
    try {
      const res = await api.updatePatient(patientId, updates);
      const updated = normalizePatient(res);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...updated } : p)));
      return updated;
    } catch (err) {
      console.error('Failed to update patient profile:', err);
      throw err;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        token,
        handleAuthSuccess,
        logout,
        refreshAll,
        doctors,
        receptionists,
        patients,
        queue,
        addDoctor,
        deleteDoctor,
        addReceptionist,
        deleteReceptionist,
        addPatient,
        forwardToDoctor,
        submitKioskIntake,
        completeConsultation,
        updatePatientProfile,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
