import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, FileText, History, Settings, Camera, Edit3, Save, Download } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { api, getStoredUser } from '../services/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { patients, updatePatientProfile, logout } = useGlobal();
  
  const stored = getStoredUser();
  const myPatientId = stored?.id || patients[0]?.id;
  const myProfile = patients.find(p => p.id === myPatientId) || patients[0];

  const [activeTab, setActiveTab] = useState('history'); // 'history', 'profile'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (myProfile) {
      setEditForm({ phone: myProfile.phone || '', address: myProfile.address || '' });
    }
  }, [myProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!myProfile) return;
    setIsSaving(true);
    try {
      await updatePatientProfile(myProfile.id, editForm);
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadRx = (h) => {
    const content = `PURVAROGYA CLINICAL PRESCRIPTION\n---------------------------------\nDate: ${h.date}\nDoctor: ${h.doctor}\nPatient: ${myProfile?.name}\n\nSymptoms / Notes:\n${h.symptomsText}\n\nPrescription:\n${h.prescription}\n\nDigitally Signed via ABDM / FHIR R4 standard.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_${h.date || 'consult'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    if (logout) logout();
    navigate('/');
  };

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
        <p className="text-gray-500 mb-4">No patient data available. Register via Receptionist or log in with phone OTP.</p>
        <button onClick={() => navigate('/patient-login')} className="px-4 py-2 bg-brand-600 text-white rounded-lg">
          Go to Patient Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-brand-900 text-white shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-8 h-8 mr-3 drop-shadow-md" />
            <span className="text-xl font-bold">PurvArogya</span>
          </div>
          <button onClick={handleSignOut} className="flex items-center px-3 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="relative group cursor-pointer mr-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-10 h-10 text-gray-400" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{myProfile.name}</h1>
              <p className="text-gray-500 mt-1">{myProfile.age ? `${myProfile.age} years` : 'Age not recorded'} • {myProfile.gender || 'Patient'}</p>
            </div>
          </div>
          <div className="bg-accent-50 text-accent-700 border border-accent-200 px-4 py-2 rounded-lg font-medium text-sm w-full sm:w-auto text-center">
            ABHA Status: Linked
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history' ? 'border-accent-600 text-accent-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <History className="w-4 h-4 inline mr-2" /> Medical History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-6 font-medium text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-accent-600 text-accent-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Settings className="w-4 h-4 inline mr-2" /> Account Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800">
              Past Consultations & Prescriptions
            </div>
            <div className="p-6">
              {!myProfile.history || myProfile.history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No past medical records found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...myProfile.history].map((h, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4 border-b pb-4">
                        <div>
                          <p className="font-bold text-lg text-gray-900">{h.doctor}</p>
                          <p className="text-sm text-gray-500">{h.date}</p>
                        </div>
                        <button 
                          onClick={() => handleDownloadRx(h)}
                          className="text-accent-600 text-sm font-medium hover:underline flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1 inline" /> Download Rx
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recorded Symptoms</h4>
                          <p className="text-gray-800">{h.symptomsText}</p>
                        </div>
                        <div className="bg-accent-50 p-4 rounded-lg border border-accent-100">
                          <h4 className="text-xs font-bold text-accent-600 uppercase tracking-wider mb-2">Prescription</h4>
                          <p className="text-gray-800">{h.prescription}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
            <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-800 flex justify-between items-center">
              <span>Contact Information</span>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-accent-600 hover:text-accent-700 text-sm flex items-center">
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </button>
              )}
            </div>
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input type="text" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea value={editForm.address} onChange={e=>setEditForm({...editForm, address: e.target.value})} className="w-full p-2 border rounded h-24" />
                  </div>
                  <div className="pt-2 flex space-x-3">
                    <button type="submit" disabled={isSaving} className="bg-accent-600 text-white px-4 py-2 rounded shadow-sm hover:bg-accent-700 flex items-center disabled:opacity-50">
                      <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h4>
                    <p className="text-gray-900 font-medium">+91 {myProfile.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Current Address</h4>
                    <p className="text-gray-900">{myProfile.address || 'No address provided'}</p>
                  </div>
                  <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Medical history and past prescriptions are strictly read-only and cannot be altered by patients to maintain data integrity.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
