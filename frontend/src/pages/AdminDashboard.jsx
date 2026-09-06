import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, LogOut, Users, Building, Trash2, PlusCircle, Monitor,
  Stethoscope, KeyRound, Eye, EyeOff, CheckCircle2, Lock, AlertCircle 
} from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { getStoredUser } from '../services/api';
import { api } from '../services/api';


const ALLOPATHY_SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Obstetrics & Gynecology",
  "Neurology",
  "General Surgery",
  "ENT (Otolaryngology)",
  "Ophthalmology",
  "Psychiatry",
  "Pulmonology / Chest Medicine",
  "Gastroenterology",
  "Endocrinology & Diabetes",
  "Nephrology",
  "Emergency Medicine",
  "Other (Specify)"
];

const AYUSH_SPECIALIZATIONS = [
  "Ayurveda - Kayachikitsa (Internal Medicine)",
  "Ayurveda - Panchakarma",
  "Ayurveda - Shalya Tantra (Surgery)",
  "Ayurveda - Shalakya Tantra (ENT & Eye)",
  "Ayurveda - Kaumarbhritya (Pediatrics)",
  "Ayurveda - Prasuti Tantra (Gynecology & Obstetrics)",
  "Homeopathy - General Practice",
  "Unani Medicine",
  "Siddha Medicine",
  "Naturopathy & Yoga",
  "Other (Specify)"
];

const EDUCATION_OPTIONS = [
  "MBBS",
  "MBBS, MD (General Medicine)",
  "MBBS, MS (General Surgery)",
  "MBBS, DNB",
  "MBBS, DCH (Pediatrics)",
  "MBBS, DGO (Gynecology)",
  "DM / MCh (Super Speciality)",
  "BAMS (Bachelor of Ayurvedic Medicine & Surgery)",
  "BAMS, MD (Ayurveda)",
  "BHMS (Bachelor of Homeopathic Medicine & Surgery)",
  "BUMS (Bachelor of Unani Medicine & Surgery)",
  "BSMS (Bachelor of Siddha Medicine & Surgery)",
  "BNYS (Naturopathy & Yogic Sciences)",
  "BDS / MDS (Dental)",
  "Other (Specify)"
];

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
    medical_stream: 'Allopathy', // 'Allopathy' | 'AYUSH'
    specializationSelect: 'General Medicine',
    specializationCustom: '',
    educationSelect: 'MBBS',
    educationCustom: '',
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
      const finalSpecialization = docForm.specializationSelect === 'Other (Specify)' 
        ? (docForm.specializationCustom.trim() || 'General Medicine')
        : docForm.specializationSelect;

      const finalEducation = docForm.educationSelect === 'Other (Specify)'
        ? (docForm.educationCustom.trim() || 'MBBS')
        : docForm.educationSelect;

      const payload = {
        name: docForm.name,
        phone: docForm.phone,
        email: docForm.email,
        license: docForm.license,
        medical_stream: docForm.medical_stream,
        specialization: finalSpecialization,
        education: finalEducation,
        doctor_type: docForm.medical_stream === 'AYUSH' ? 'AYUSH' : 'General Medicine',
        password: docForm.password || 'Doctor@123'
      };

      const res = await addDoctor(payload);
      setSuccessMsg(`Doctor ${docForm.name} registered successfully! Login Password: ${docForm.password || 'Doctor@123'}`);
      setDocForm({ 
        name: '', 
        phone: '', 
        email: '', 
        license: '', 
        medical_stream: 'Allopathy',
        specializationSelect: 'General Medicine',
        specializationCustom: '',
        educationSelect: 'MBBS',
        educationCustom: '',
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
                {/* System / Stream Selector: Allopathy vs AYUSH */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Medical System / Practice Stream *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <label className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      docForm.medical_stream === 'Allopathy' 
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-2xs' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="medical_stream" 
                        value="Allopathy" 
                        checked={docForm.medical_stream === 'Allopathy'} 
                        onChange={() => setDocForm(p => ({ 
                          ...p, 
                          medical_stream: 'Allopathy',
                          specializationSelect: 'General Medicine',
                          educationSelect: 'MBBS'
                        }))}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>🏥 Allopathy (Modern Medicine)</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      docForm.medical_stream === 'AYUSH' 
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-2xs' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}>
                      <input 
                        type="radio" 
                        name="medical_stream" 
                        value="AYUSH" 
                        checked={docForm.medical_stream === 'AYUSH'} 
                        onChange={() => setDocForm(p => ({ 
                          ...p, 
                          medical_stream: 'AYUSH',
                          specializationSelect: 'Ayurveda - Kayachikitsa (Internal Medicine)',
                          educationSelect: 'BAMS (Bachelor of Ayurvedic Medicine & Surgery)'
                        }))}
                        className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span>🌿 AYUSH (Ayurveda, Homeopathy, Unani, Siddha)</span>
                    </label>
                  </div>
                </div>

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

                  {/* Specialization Dropdown + Other write-in */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Specialization *</label>
                    <select 
                      required
                      value={docForm.specializationSelect}
                      onChange={e=>setDocForm({...docForm, specializationSelect: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    >
                      {(docForm.medical_stream === 'AYUSH' ? AYUSH_SPECIALIZATIONS : ALLOPATHY_SPECIALIZATIONS).map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>

                    {docForm.specializationSelect === 'Other (Specify)' && (
                      <input 
                        type="text" 
                        required 
                        placeholder="Specify Custom Specialization *" 
                        value={docForm.specializationCustom} 
                        onChange={e=>setDocForm({...docForm, specializationCustom: e.target.value})} 
                        className="w-full mt-2 p-2 border border-brand-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 bg-brand-50/20" 
                      />
                    )}
                  </div>

                  {/* Medical License */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Medical License / HPR ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MCI-123456 / HPR-IND-902" 
                      value={docForm.license} 
                      onChange={e=>setDocForm({...docForm, license: e.target.value})} 
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                    />
                  </div>

                  {/* Education Dropdown + Other write-in */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Education / Degree</label>
                    <select 
                      value={docForm.educationSelect}
                      onChange={e=>setDocForm({...docForm, educationSelect: e.target.value})}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    >
                      {EDUCATION_OPTIONS.map(edu => (
                        <option key={edu} value={edu}>{edu}</option>
                      ))}
                    </select>

                    {docForm.educationSelect === 'Other (Specify)' && (
                      <input 
                        type="text" 
                        required 
                        placeholder="Specify Custom Degree / Education *" 
                        value={docForm.educationCustom} 
                        onChange={e=>setDocForm({...docForm, educationCustom: e.target.value})} 
                        className="w-full mt-2 p-2 border border-brand-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 bg-brand-50/20" 
                      />
                    )}
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
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              doc.medical_stream === 'AYUSH' || /ayur|panch|unani|homeo/i.test(doc.specialization)
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            }`}>
                              {doc.medical_stream === 'AYUSH' || /ayur|panch|unani|homeo/i.test(doc.specialization) ? '🌿 AYUSH' : '🏥 Allopathy'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                              {doc.specialization}
                            </span>
                          </div>
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
