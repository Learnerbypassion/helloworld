import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, UserPlus, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api } from '../services/api';

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { patients, doctors, queue, addPatient, forwardToDoctor, logout } = useGlobal();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'add'

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
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-8 h-8 mr-3 drop-shadow-md" />
          <span className="text-lg font-bold">PurvArogya</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('queue')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'queue' ? 'bg-brand-800' : 'hover:bg-brand-800/50'}`}>
            <Activity className="w-5 h-5 mr-3" /> Dashboard & Queue
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
                  <input type="tel" maxLength={10} required value={phone} onChange={e=>setPhone(e.target.value)} className="flex-1 block w-full p-2.5 border border-gray-300 rounded-r-md" placeholder="Enter number..." />
                </div>
                <button type="submit" disabled={isSubmitting || phone.length < 10} className="w-full bg-accent-600 text-white rounded p-3 font-medium hover:bg-accent-700 disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send OTP for Verification'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <label className="block text-sm font-medium">Enter OTP sent to +91 {phone}</label>
                <input type="text" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value)} className="block w-full p-2.5 text-center tracking-widest font-bold border border-gray-300 rounded-md" placeholder="123456" />
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
                    <input type="text" required value={patientDetails.name} onChange={e=>setPatientDetails({...patientDetails, name: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Age</label>
                    <input type="number" required value={patientDetails.age} onChange={e=>setPatientDetails({...patientDetails, age: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select value={patientDetails.gender} onChange={e=>setPatientDetails({...patientDetails, gender: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">Address</label>
                    <textarea required value={patientDetails.address} onChange={e=>setPatientDetails({...patientDetails, address: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded"></textarea>
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
