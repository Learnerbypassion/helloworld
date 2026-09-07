import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, LogOut, Users, Building, Trash2, PlusCircle, Monitor,
  Stethoscope, KeyRound, Eye, EyeOff, CheckCircle2, Lock, AlertCircle,
  Sliders, ArrowUp, ArrowDown, Layers, HelpCircle, Sparkles
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

  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' | 'receptionists' | 'decision_trees'

  // Decision Tree States
  const [decisionTrees, setDecisionTrees] = useState([]);
  const [dtLoading, setDtLoading] = useState(false);
  const [dtSaving, setDtSaving] = useState(false);
  const [dtSymptomKey, setDtSymptomKey] = useState('fever');
  const [dtCustomSymptom, setDtCustomSymptom] = useState('');
  const [dtParams, setDtParams] = useState([
    { id: '1', label: 'Have you noticed any mouth sores or throat redness?', type: 'yes_no', options: '' },
    { id: '2', label: 'Are you experiencing severe chills or shivering?', type: 'yes_no', options: '' },
    { id: '3', label: 'On a scale of 1-10, how intense is your fever / body heat?', type: 'scale', options: '' }
  ]);
  const [dtError, setDtError] = useState('');
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  const hospitalId = storedUser?.hospital_id || storedUser?.id || '';

  const loadDecisionTrees = React.useCallback(async () => {
    if (!hospitalId) return;
    setDtLoading(true);
    try {
      const res = await api.getDecisionTrees(hospitalId);
      setDecisionTrees(res?.trees || []);
    } catch (err) {
      console.error("Failed to load decision trees:", err);
    } finally {
      setDtLoading(false);
    }
  }, [hospitalId]);

  React.useEffect(() => {
    if (activeTab === 'decision_trees') {
      loadDecisionTrees();
    }
  }, [activeTab, hospitalId]);

  const handleOpenNewProtocol = () => {
    setDtSymptomKey('fever');
    setDtCustomSymptom('');
    setDtParams([
      { id: '1', label: 'Have you noticed any mouth sores or throat redness?', type: 'yes_no', options: '' },
      { id: '2', label: 'Are you experiencing severe chills or shivering?', type: 'yes_no', options: '' },
      { id: '3', label: 'On a scale of 1-10, how intense is your fever / body heat?', type: 'scale', options: '' }
    ]);
    setDtError('');
    setIsProtocolModalOpen(true);
  };

  const handleAddParam = () => {
    setDtParams(prev => [
      ...prev,
      { id: Date.now().toString(), label: '', type: 'yes_no', options: '' }
    ]);
  };

  const handleRemoveParam = (index) => {
    setDtParams(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveParam = (index, direction) => {
    setDtParams(prev => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleSaveDecisionTree = async (e) => {
    e.preventDefault();
    if (!hospitalId) return;

    const symKey = (dtSymptomKey === 'Custom' ? dtCustomSymptom : dtSymptomKey).trim().toLowerCase();
    if (!symKey) {
      setDtError('Please select or specify a valid symptom.');
      return;
    }

    const validParams = dtParams.filter(p => p.label.trim().length > 0);
    if (validParams.length === 0) {
      setDtError('Please provide at least one parameter question with a label.');
      return;
    }

    setDtSaving(true);
    setDtError('');
    setSuccessMsg('');
    try {
      await api.saveDecisionTree(hospitalId, {
        symptom_key: symKey,
        parameters: validParams.map(p => ({
          label: p.label.trim(),
          type: p.type,
          options: p.type === 'chips' ? p.options : undefined
        }))
      });
      setSuccessMsg(`Decision tree protocol for "${symKey}" saved! Stale question caches invalidated.`);
      setIsProtocolModalOpen(false);
      await loadDecisionTrees();
    } catch (err) {
      setDtError(err.message || 'Failed to save decision tree');
    } finally {
      setDtSaving(false);
    }
  };

  const handleEditTree = (tree) => {
    const knownKeys = ['fever', 'cough', 'chest', 'headache', 'stomach', 'vomiting', 'joint_pain', 'skin', 'urinary', 'eye', 'breathless', 'weakness'];
    if (knownKeys.includes(tree.symptom_key)) {
      setDtSymptomKey(tree.symptom_key);
      setDtCustomSymptom('');
    } else {
      setDtSymptomKey('Custom');
      setDtCustomSymptom(tree.symptom_key);
    }

    setDtParams((tree.parameters || []).map((p, idx) => ({
      id: idx.toString(),
      label: p.label,
      type: p.type || 'yes_no',
      options: Array.isArray(p.options) ? p.options.join(', ') : (p.options || '')
    })));
    setDtError('');
    setIsProtocolModalOpen(true);
  };

  const handleDeleteTree = async (treeId, symKey) => {
    if (!window.confirm(`Are you sure you want to delete the decision tree protocol for "${symKey}"? The cached questions for this symptom will also be removed.`)) return;
    try {
      await api.deleteDecisionTree(hospitalId, treeId);
      setSuccessMsg(`Protocol for "${symKey}" removed.`);
      await loadDecisionTrees();
    } catch (err) {
      alert(err.message || 'Failed to delete decision tree');
    }
  };
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
            onClick={() => { setActiveTab('decision_trees'); setSuccessMsg(''); }} 
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'decision_trees' ? 'bg-brand-800 text-white shadow-sm' : 'text-brand-100 hover:bg-brand-800/50'}`}
          >
            <Sliders className="w-5 h-5 mr-3" /> Question Parameters
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
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === 'decision_trees' ? 'Symptom Decision Trees & Question Parameters' : 'Hospital Staff & Credential Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'decision_trees'
                ? 'Define hospital-specific clinical inquiry parameters for kiosk triage AI with zero-latency cached reuse'
                : 'Configure doctor & receptionist accounts with custom initial login passwords'}
            </p>
          </div>
          {activeTab === 'decision_trees' && (
            <button
              onClick={handleOpenNewProtocol}
              className="mt-4 md:mt-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center shrink-0"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Configure Protocol
            </button>
          )}
        </div>

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
        )}
        
        {/* Stats */}
        {activeTab !== 'decision_trees' ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Configured Protocols</h3>
                <p className="text-3xl font-extrabold text-brand-900 mt-1">{decisionTrees.length}</p>
              </div>
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <Sliders className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Triage Question Scope</h3>
                <p className="text-base font-bold text-gray-800 mt-1">Hospital-Scoped</p>
                <p className="text-xs text-gray-400">Isolated per hospital ID</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Building className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Zero-Latency Cache</h3>
                <p className="text-base font-bold text-emerald-700 mt-1">Active</p>
                <p className="text-xs text-gray-400">Auto-invalidates on update</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

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

        {activeTab === 'decision_trees' && (
          <div className="space-y-6">
            {/* Top Banner Card */}
            <div className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white p-6 rounded-2xl shadow-sm border border-brand-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Sliders className="w-6 h-6 mr-3 text-brand-300" />
                  Hospital-Authored Symptom Decision Trees
                </h2>
                <p className="text-sm text-brand-200 mt-2 max-w-2xl leading-relaxed">
                  Define your hospital's custom clinical inquiry parameters per symptom. When patients select or voice this symptom at the kiosk, the triage AI will formulate natural questions specifically targeting these parameters, then cache them in the database for zero-latency reuse.
                </p>
              </div>
              <button
                onClick={handleOpenNewProtocol}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center shrink-0"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Configure Protocol
              </button>
            </div>

            {/* Active Protocols List Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-gray-100 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-brand-600" /> Active Hospital Protocols ({decisionTrees.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click "Edit" on any protocol to modify its inquiry parameters or click "Configure Protocol" to author a new one.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewProtocol}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" /> Configure Protocol
                </button>
              </div>

              {dtLoading && decisionTrees.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">Loading protocols...</div>
              ) : decisionTrees.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6 max-w-md mx-auto">
                  <HelpCircle className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="font-bold text-gray-800 text-base">No Custom Protocols Configured Yet</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                    Kiosk currently falls back to standard clinical inquiries. Click below to configure your hospital's custom parameters for any symptom.
                  </p>
                  <button
                    onClick={handleOpenNewProtocol}
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 shadow"
                  >
                    + Configure First Protocol
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {decisionTrees.map(tree => (
                    <div
                      key={tree.id || tree._id}
                      className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-brand-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider bg-brand-50 text-brand-700 px-3 py-1 rounded-lg border border-brand-200 inline-block">
                              {tree.symptom_key}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 font-medium">
                              {(tree.parameters || []).length} parameter{(tree.parameters || []).length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteTree(tree.id || tree._id, tree.symptom_key)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                            title="Delete protocol"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-2 max-h-48 overflow-y-auto">
                          {(tree.parameters || []).map((p, i) => (
                            <div key={i} className="flex items-start justify-between">
                              <span className="pr-2 font-medium leading-tight">#{i+1}. {p.label}</span>
                              <span className="shrink-0 text-[10px] bg-white px-2 py-0.5 rounded-md border border-gray-200 text-gray-600 font-mono">
                                {p.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => handleEditTree(tree)}
                          className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 transition text-center"
                        >
                          Edit Protocol Parameters
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Dialog: Configure Symptom Protocol Builder */}
        {isProtocolModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-gray-100 max-h-[90vh] flex flex-col animate-scale-up">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-brand-600" />
                    Configure Symptom Protocol
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define the exact inquiry parameters the kiosk AI must ask about for this symptom.
                  </p>
                </div>
                <button
                  onClick={() => setIsProtocolModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  ✕
                </button>
              </div>

              {dtError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center shrink-0">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  {dtError}
                </div>
              )}

              <form onSubmit={handleSaveDecisionTree} className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
                {/* Target Symptom Selector */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Target Symptom
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={dtSymptomKey}
                      onChange={e => setDtSymptomKey(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="fever">Fever / Temperature (জ্বর / बुखार)</option>
                      <option value="cough">Cough / Respiratory (কাশি / खांसी)</option>
                      <option value="chest">Chest Pain / Discomfort (বুক / छाতি)</option>
                      <option value="headache">Headache (মাথা ব্যথা / सिरदर्द)</option>
                      <option value="stomach">Stomach / Abdominal Pain (পেট / पेट)</option>
                      <option value="vomiting">Vomiting / Nausea</option>
                      <option value="joint_pain">Joint Pain / Arthritis</option>
                      <option value="skin">Skin Rash / Allergy</option>
                      <option value="urinary">Urinary Issues</option>
                      <option value="eye">Eye Problems</option>
                      <option value="breathless">Breathlessness</option>
                      <option value="weakness">Weakness / Fatigue</option>
                      <option value="Custom">Custom Symptom Key</option>
                    </select>

                    {dtSymptomKey === 'Custom' && (
                      <input
                        type="text"
                        value={dtCustomSymptom}
                        onChange={e => setDtCustomSymptom(e.target.value)}
                        placeholder="e.g. ear pain, backache, sore throat"
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    )}
                  </div>
                </div>

                {/* Parameters List */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Inquiry Parameters ({dtParams.length} / max 5 questions)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddParam}
                      disabled={dtParams.length >= 5}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg border border-brand-200 disabled:opacity-40"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Parameter
                    </button>
                  </div>

                  {dtParams.map((param, index) => (
                    <div key={param.id || index} className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 relative hover:border-brand-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold bg-white text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                          #{index + 1} Parameter
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveParam(index, -1)}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-20 rounded"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveParam(index, 1)}
                            disabled={index === dtParams.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-20 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveParam(index)}
                            className="p-1 text-red-500 hover:text-red-700 rounded ml-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Clinical Topic / Prompt Label</label>
                          <input
                            type="text"
                            value={param.label}
                            onChange={e => {
                              const val = e.target.value;
                              setDtParams(prev => prev.map((p, i) => i === index ? { ...p, label: val } : p));
                            }}
                            placeholder="e.g. Mouth sores?, Feeling chills or shivering?"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-brand-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Question Type</label>
                          <select
                            value={param.type}
                            onChange={e => {
                              const val = e.target.value;
                              setDtParams(prev => prev.map((p, i) => i === index ? { ...p, type: val } : p));
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="yes_no">Yes / No</option>
                            <option value="scale">Scale (1 to 10)</option>
                            <option value="chips">Multiple Choice Chips</option>
                            <option value="text">Open-ended Text</option>
                          </select>
                        </div>
                      </div>

                      {param.type === 'chips' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Options (comma-separated)</label>
                          <input
                            type="text"
                            value={param.options || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setDtParams(prev => prev.map((p, i) => i === index ? { ...p, options: val } : p));
                            }}
                            placeholder="e.g. Mild, Moderate, High, Severe"
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsProtocolModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dtSaving}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center"
                  >
                    {dtSaving ? 'Saving & Invalidating Caches...' : 'Save Decision Tree Protocol'}
                  </button>
                </div>
              </form>
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
