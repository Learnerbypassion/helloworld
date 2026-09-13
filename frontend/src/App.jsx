import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import PortalSelection from './pages/PortalSelection';
import HospitalLogin from './pages/HospitalLogin';
import KioskFlow from './pages/KioskFlow';
import PatientLogin from './pages/PatientLogin';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import MobileUpload from './pages/MobileUpload';

function App() {
  return (
    <GlobalProvider>
     <BrowserRouter basename="/dhanvantari">
        <Routes>
          <Route path="/" element={<PortalSelection />} />
          <Route path="/hospital-login" element={<HospitalLogin />} />
          <Route path="/kiosk" element={<KioskFlow />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          {/* QR-code phone handoff — /mobile-upload/:token (no base prefix; BrowserRouter basename handles /dhanvantari) */}
          <Route path="/mobile-upload/:token" element={<MobileUpload />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
