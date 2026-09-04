import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MonitorSmartphone, ArrowRight, UserCircle } from 'lucide-react';

export default function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-4">
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="PurvArogya Logo"
              className="w-20 h-20 drop-shadow-xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">
            PurvArogya
          </h1>
          <p className="text-xl text-brand-700 font-semibold mb-4">
            The Future of Clinical History & Case-Taking
          </p>
          <p className="text-sm text-gray-500">ABDM & DPDP Compliant • FHIR R4 Ready</p>
        </motion.div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Patient Kiosk Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, borderColor: '#0ea5e9' }}
            className="group relative bg-white border-2 border-transparent shadow-md rounded-2xl p-8 cursor-pointer transition-all flex flex-col"
            onClick={() => navigate('/kiosk')}
          >
            <div className="absolute top-8 right-8 text-gray-400 group-hover:text-accent-600 transition-colors">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="bg-accent-50 border border-accent-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <MonitorSmartphone className="w-8 h-8 text-accent-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient MediKiosk</h2>
            <p className="text-gray-600 leading-relaxed flex-1">
              Self-service clinical intake at the hospital. Log in via ABHA ID, report symptoms using Voice/Touch.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Auto-Triage</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">AYUSH Mode</span>
            </div>
          </motion.div>

          {/* Patient Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4, borderColor: '#10b981' }}
            className="group relative bg-white border-2 border-transparent shadow-md rounded-2xl p-8 cursor-pointer transition-all flex flex-col"
            onClick={() => navigate('/patient-login')}
          >
            <div className="absolute top-8 right-8 text-gray-400 group-hover:text-green-500 transition-colors">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="bg-green-50 border border-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <UserCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Patient Portal</h2>
            <p className="text-gray-600 leading-relaxed flex-1">
              Access your medical history securely from home. View past prescriptions, updates, and manage your profile.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Read-Only History</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">OTP Login</span>
            </div>
          </motion.div>

          {/* Hospital Staff Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4, borderColor: '#3b82f6' }}
            className="group relative bg-white border-2 border-transparent shadow-md rounded-2xl p-8 cursor-pointer transition-all flex flex-col"
            onClick={() => navigate('/hospital-login')}
          >
            <div className="absolute top-8 right-8 text-gray-400 group-hover:text-brand-600 transition-colors">
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="bg-brand-50 border border-brand-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-brand-700" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Physician & Staff</h2>
            <p className="text-gray-600 leading-relaxed flex-1">
              Review structured FHIR summaries in &lt;30s. Clinician-in-the-loop verification, staff management.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">HIS Interop</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Queue Mgmt</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
