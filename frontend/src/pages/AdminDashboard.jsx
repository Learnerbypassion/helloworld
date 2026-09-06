import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, LogOut, Users, Building, Trash2, PlusCircle, Monitor,
  Stethoscope, KeyRound, Eye, EyeOff, CheckCircle2, Lock, AlertCircle 
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { getStoredUser } from '../services/api';
import { api } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { doctors, receptionists, addDoctor, deleteDoctor, addReceptionist, deleteReceptionist, logout } = useGlobal();
  const storedUser = getStoredUser();

  const openKiosk = () => {
    navigate('/kiosk', {
      state: {
        hospital_id:   storedUser?.hospital_id || storedUser?.id,
        hospital_name: storedUser?.name || 'Hospital',
      }
    });
  };

  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'receptionists'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password reset modal state
  const [resetModal, setResetModal] = useState({
    isOpen: false,
    staffType: 'doctor', // 'doctor' | 'receptionist'
    id: null,
    name: '',
    newPassword: '',
    loading: false,
    msg: ''
  });

  // Form states with initial password field
  const [docForm, setDocForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    license: '', 
    education: '', 
    specialization: '', 
    password: 'Doctor@123' 
  });
  
  const [recForm, setRecForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    password: 'Reception@123' 
  });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await addDoctor(docForm);
      setSuccessMsg(`Doctor ${docForm.name} registered successfully! Login Password: ${docForm.password || 'Doctor@123'}`);
      setDocForm({ 
        name: '', 
        phone: '', 
        email: '', 
        license: '', 
        education: '', 
        specialization: '', 
        password: 'Doctor@123' 
      });
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReceptionist = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await addReceptionist(recForm);
      setSuccessMsg(`Receptionist ${recForm.name} registered successfully! Login Password: ${recForm.password || 'Reception@123'}`);
      setRecForm({ 
        name: '', 
        phone: '', 
        email: '', 
        password: 'Reception@123' 
      });
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      alert(err.message || 'Failed to add receptionist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResetPasswordModal = (staffType, item) => {
    setResetModal({
      isOpen: true,
      staffType,
      id: item.id || item._id,
      name: item.name,
      newPassword: staffType === 'doctor' ? 'Doctor@123' : 'Reception@123',
      loading: false,
      msg: ''
    });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!resetModal.newPassword || resetModal.newPassword.length < 4) {
      alert('Password must be at least 4 characters long');
      return;
    }
    setResetModal(prev => ({ ...prev, loading: true, msg: '' }));
    try {
      if (resetModal.staffType === 'doctor') {
        await api.updateDoctorPassword(resetModal.id, resetModal.newPassword);
      } else {
        await api.updateReceptionistPassword(resetModal.id, resetModal.newPassword);
      }
      setSuccessMsg(`Password updated for ${resetModal.name} to "${resetModal.newPassword}"!`);
      setResetModal(prev => ({ ...prev, isOpen: false }));
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      alert(err.message || 'Failed to update password');
      setResetModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSignOut = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-brand-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center border-b border-brand-800">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-8 h-8 mr-3 drop-shadow-md" />
          <div>
            <span className="text-lg font-bold block leading-tight">PurvArogya</span>
            <span className="text-xs text-brand-300">Hospital Administration</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('doctors'); setSuccessMsg(''); }} 
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'doctors' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-100 hover:bg-brand-800/50'}`}
          >
            <Stethoscope className="w-5 h-5 mr-3" /> Manage Doctors
          </button>
          <button 
            onClick={() => { setActiveTab('receptionists'); setSuccessMsg(''); }} 
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'receptionists' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-100 hover:bg-brand-800/50'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Manage Reception
          </button>
          <button
            onClick={openKiosk}
            className="w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all text-brand-100 hover:bg-brand-800/50 mt-4 border border-brand-700"
          >
            <Monitor className="w-5 h-5 mr-3 text-green-400" /> Open Patient Kiosk
          </button>
        </nav>
        <div className="p-4 border-t border-brand-800">
          <button onClick={handleSignOut} className="flex items-center w-full px-4 py-3 hover:bg-red-500/20 rounded-xl transition-colors text-red-300 hover:text-red-200 font-medium">
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Staff & Credential Management</h1>
            <p className="text-sm text-gray-500 mt-1">Configure doctor & receptionist accounts with custom initial login passwords</p>
          </div>
        </div>

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Active Doctors</h3>
              <p className="text-4xl font-extrabold text-brand-900 mt-2">{doctors.length}</p>
            </div>
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
              <Stethoscope className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Active Receptionists</h3>
              <p className="text-4xl font-extrabold text-brand-900 mt-2">{receptionists.length}</p>
            </div>
            <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600">
              <Users className="w-7 h-7" />
            </div>
          </div>
        </div>

        {activeTab === 'doctors' && (
          <div className="space-y-8">
            {/* Add Doctor Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2 text-brand-600" /> Add Doctor with Initial Password
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Doctors can log in using either their registered <b>Email</b> or <b>Phone Number</b> and the <b>Initial Password</b> set below.
                </p>
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Doctor Full Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Dr. Rajesh Sharma" 
                      value={docForm.name} 
                      onChange={e=>setDocForm({...docForm, name: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Mobile Phone Number *</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={docForm.phone} 
                      onChange={e=>setDocForm({...docForm, phone: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Doctor Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="e.g. dr.sharma@hospital.com" 
                      value={docForm.email} 
                      onChange={e=>setDocForm({...docForm, email: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Specialization *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Cardiology / General Medicine" 
                      value={docForm.specialization} 
                      onChange={e=>setDocForm({...docForm, specialization: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Medical License / HPR ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MCI-123456" 
                      value={docForm.license} 
                      onChange={e=>setDocForm({...docForm, license: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Education</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MBBS, MD (Medicine)" 
                      value={docForm.education} 
                      onChange={e=>setDocForm({...docForm, education: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>
                </div>

                {/* Password input section */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-amber-900 uppercase mb-1 flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1 text-amber-700" /> Set Initial Login Password for Doctor
                      </label>
                      <div className="relative max-w-md">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          value={docForm.password} 
                          onChange={e=>setDocForm({...docForm, password: e.target.value})} 
                          className="w-full p-2.5 pr-10 border border-amber-300 rounded-lg text-sm bg-white font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
                          placeholder="e.g. Doctor@123"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">
                        Default: <code>Doctor@123</code>. You can customize this now or change it anytime from the Doctors list.
                      </p>
                    </div>

                    <div className="flex items-end">
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full md:w-auto px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 shadow-sm disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Registering Doctor...' : 'Save & Register Doctor'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Doctors List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Hospital Doctors Directory ({doctors.length})</h3>
                <span className="text-xs text-gray-500">Doctors can log in with Phone / Email & Initial Password</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor Details</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization & License</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Login Credentials</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {doctors.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                          No doctors registered in this hospital yet. Add your first doctor using the form above.
                        </td>
                      </tr>
                    ) : doctors.map(doc => (
                      <tr key={doc.id || doc._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 text-base">{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.education || 'MBBS'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 mb-1">
                            {doc.specialization}
                          </span>
                          <div className="text-xs text-gray-500 font-mono">{doc.license || 'License on file'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-900 font-medium">📞 {doc.phone || 'Phone not set'}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">✉️ {doc.email}</div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => openResetPasswordModal('doctor', doc)} 
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                            title="Set or reset login password"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Set Password
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${doc.name}?`)) {
                                deleteDoctor(doc.id || doc._id);
                              }
                            }} 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="Delete doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'receptionists' && (
          <div className="space-y-8">
            {/* Add Receptionist Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2 text-brand-600" /> Add Reception Staff with Initial Password
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Reception staff can log in using either their registered <b>Email</b> or <b>Phone Number</b> and the <b>Initial Password</b> set below.
                </p>
              </div>

              <form onSubmit={handleAddReceptionist} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Staff Full Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Ramesh Verma" 
                      value={recForm.name} 
                      onChange={e=>setRecForm({...recForm, name: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Mobile Phone Number *</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="e.g. 9811223344" 
                      value={recForm.phone} 
                      onChange={e=>setRecForm({...recForm, phone: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Staff Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="e.g. staff.ramesh@hospital.com" 
                      value={recForm.email} 
                      onChange={e=>setRecForm({...recForm, email: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>
                </div>

                {/* Password input section */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-amber-900 uppercase mb-1 flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1 text-amber-700" /> Set Initial Login Password for Reception Staff
                      </label>
                      <div className="relative max-w-md">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          value={recForm.password} 
                          onChange={e=>setRecForm({...recForm, password: e.target.value})} 
                          className="w-full p-2.5 pr-10 border border-amber-300 rounded-lg text-sm bg-white font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
                          placeholder="e.g. Reception@123"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">
                        Default: <code>Reception@123</code>. You can customize this now or change it anytime.
                      </p>
                    </div>

                    <div className="flex items-end">
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full md:w-auto px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 shadow-sm disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Registering Staff...' : 'Save & Register Receptionist'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Receptionists List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900">Hospital Reception Desk Directory ({receptionists.length})</h3>
                <span className="text-xs text-gray-500">Reception staff can log in with Phone / Email & Initial Password</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact & Login Credentials</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receptionists.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-sm text-gray-500">
                          No reception staff registered yet. Add one using the form above.
                        </td>
                      </tr>
                    ) : receptionists.map(rec => (
                      <tr key={rec.id || rec._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900 text-base">{rec.name}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-900 font-medium">📞 {rec.phone || 'Phone not set'}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">✉️ {rec.email}</div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => openResetPasswordModal('receptionist', rec)} 
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                            title="Set or reset login password"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Set Password
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${rec.name}?`)) {
                                deleteReceptionist(rec.id || rec._id);
                              }
                            }} 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="Delete receptionist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-scale-up">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <KeyRound className="w-5 h-5 text-amber-600 mr-2" /> 
                  Set Password for {resetModal.name}
                </h3>
                <button 
                  onClick={() => setResetModal(prev => ({ ...prev, isOpen: false }))} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    New Initial / Login Password
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={resetModal.newPassword} 
                    onChange={e => setResetModal(prev => ({ ...prev, newPassword: e.target.value }))} 
                    className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The staff member will immediately be able to log in with this password.
                  </p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModal(prev => ({ 
                      ...prev, 
                      newPassword: resetModal.staffType === 'doctor' ? 'Doctor@123' : 'Reception@123' 
                    }))}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Quick Reset to Default ({resetModal.staffType === 'doctor' ? 'Doctor@123' : 'Reception@123'})
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setResetModal(prev => ({ ...prev, isOpen: false }))} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={resetModal.loading} 
                    className="px-5 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
                  >
                    {resetModal.loading ? 'Updating...' : 'Save Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
