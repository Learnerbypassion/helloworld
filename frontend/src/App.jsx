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

function App() {
  return (
    <GlobalProvider>
     <BrowserRouter basename="/PurvArogya">
        <Routes>
          <Route path="/" element={<PortalSelection />} />
          <Route path="/hospital-login" element={<HospitalLogin />} />
          <Route path="/kiosk" element={<KioskFlow />} />
          <Route path="/patient-login" element={<PatientLogin />} />
          
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
