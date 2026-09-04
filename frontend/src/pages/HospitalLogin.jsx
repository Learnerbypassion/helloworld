import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Stethoscope, Users, ArrowLeft, ShieldCheck, Lock, FileText, UserCircle, Mail } from 'lucide-react';
import { api } from '../services/api';
import { useGlobal } from '../context/GlobalContext';

export default function HospitalLogin() {
  const navigate = useNavigate();
  const { handleAuthSuccess } = useGlobal();
  const [activeTab, setActiveTab] = useState('receptionist');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [regForm, setRegForm] = useState({ name: '', registration_no: '', email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ name: '', registration_no: '', password: '' });
  const [staffForm, setStaffForm] = useState({ email: '', password: '' });

  const tabs = [
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'receptionist', label: 'Receptionist', icon: Users },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.registerHospital(regForm);
      handleAuthSuccess(res.token, { ...res.hospital, role: 'hospital_admin' });
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (activeTab === 'admin') {
        const res = await api.loginHospital({
          name: adminForm.name,
          email: adminForm.name,
          password: adminForm.password,
        });
        handleAuthSuccess(res.token, { ...res.hospital, role: 'hospital_admin' });
        navigate('/admin-dashboard');
      } else if (activeTab === 'receptionist') {
        const res = await api.loginReceptionist({
          email: staffForm.email,
          password: staffForm.password,
        });
        handleAuthSuccess(res.token, { ...res.receptionist, role: 'receptionist' });
        navigate('/receptionist-dashboard');
      } else if (activeTab === 'doctor') {
        const res = await api.loginDoctor({
          email: staffForm.email,
          password: staffForm.password,
        });
        handleAuthSuccess(res.token, { ...res.doctor, role: 'doctor' });
        navigate('/doctor-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Portal
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-brand-900 px-8 py-8 text-white text-center">
          <div className="inline-flex justify-center mb-4">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="PurvArogya" className="w-16 h-16 drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-semibold">PurvArogya Portal</h2>
          <p className="text-brand-100 mt-2 text-sm">Secure access for authorized personnel only</p>
        </div>

        {/* Tabs - Only show if not registering */}
        {!isRegistering && (
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setError(''); }}
                  className={`flex-1 flex flex-col items-center py-4 text-sm font-medium transition-colors relative
                    ${isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* Registration Form for Admin */}
            {isRegistering ? (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
                onSubmit={handleRegisterSubmit}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Official Hospital Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                      placeholder="e.g. City General Hospital" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Govt. ID Proof / License No.</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      required 
                      value={regForm.registration_no}
                      onChange={(e) => setRegForm({ ...regForm, registration_no: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                      placeholder="Registration ID" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                      placeholder="admin@hospital.com" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors mt-2 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register Hospital & Open Dashboard'}
                </button>
                
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsRegistering(false); setError(''); }} 
                    className="text-sm text-brand-600 hover:text-brand-500 font-medium"
                  >
                    Already have an account? Log In
                  </button>
                </div>
              </motion.form>
            ) : (
              /* Regular Login Form */
              <motion.form
                key={activeTab + "-login"}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
                onSubmit={handleLoginSubmit}
              >
                
                {activeTab === 'admin' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Official Hospital Name or Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          required 
                          value={adminForm.name}
                          onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                          placeholder="e.g. City General Hospital or admin email" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Govt. ID Proof / License No.</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="text" 
                          value={adminForm.registration_no}
                          onChange={(e) => setAdminForm({ ...adminForm, registration_no: e.target.value })}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                          placeholder="Registration ID (optional)" 
                        />
                      </div>
                    </div>
                  </>
                )}

                {(activeTab === 'receptionist' || activeTab === 'doctor') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID / Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {activeTab === 'doctor' ? <Stethoscope className="h-5 w-5 text-gray-400" /> : <UserCircle className="h-5 w-5 text-gray-400" />}
                      </div>
                      <input 
                        type="email" 
                        required 
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                        placeholder={activeTab === 'doctor' ? "dr.smith@hospital.com" : "staff@hospital.com"} 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      required 
                      value={activeTab === 'admin' ? adminForm.password : staffForm.password}
                      onChange={(e) => {
                        if (activeTab === 'admin') setAdminForm({ ...adminForm, password: e.target.value });
                        else setStaffForm({ ...staffForm, password: e.target.value });
                      }}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Forgot password?</a>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors mt-2 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in to Dashboard'}
                </button>
                
                {activeTab === 'admin' && (
                  <div className="text-center mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      New Hospital?{' '}
                      <button 
                        type="button" 
                        onClick={() => { setIsRegistering(true); setError(''); }} 
                        className="font-medium text-brand-600 hover:text-brand-500"
                      >
                        Register Here
                      </button>
                    </p>
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
