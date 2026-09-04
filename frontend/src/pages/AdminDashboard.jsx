import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Users, Building, Trash2, PlusCircle, Stethoscope } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { doctors, receptionists, addDoctor, deleteDoctor, addReceptionist, deleteReceptionist, logout } = useGlobal();
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'receptionists'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [docForm, setDocForm] = useState({ name: '', phone: '', license: '', education: '', specialization: '' });
  const [recForm, setRecForm] = useState({ name: '', phone: '', email: '' });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoctor(docForm);
      setDocForm({ name: '', phone: '', license: '', education: '', specialization: '' });
    } catch (err) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReceptionist = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addReceptionist(recForm);
      setRecForm({ name: '', phone: '', email: '' });
    } catch (err) {
      alert(err.message || 'Failed to add receptionist');
    } finally {
      setIsSubmitting(false);
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
          <button onClick={() => setActiveTab('doctors')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'doctors' ? 'bg-brand-800' : 'hover:bg-brand-800/50'}`}>
            <Stethoscope className="w-5 h-5 mr-3" /> Manage Doctors
          </button>
          <button onClick={() => setActiveTab('receptionists')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'receptionists' ? 'bg-brand-800' : 'hover:bg-brand-800/50'}`}>
            <Users className="w-5 h-5 mr-3" /> Manage Reception
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Staff Management</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">Total Doctors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{doctors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">Total Receptionists</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{receptionists.length}</p>
          </div>
        </div>

        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Add Doctor Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-brand-600" /> Add New Doctor</h2>
              <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Dr. Name" value={docForm.name} onChange={e=>setDocForm({...docForm, name: e.target.value})} className="p-2 border rounded" />
                <input required type="tel" placeholder="Phone" value={docForm.phone} onChange={e=>setDocForm({...docForm, phone: e.target.value})} className="p-2 border rounded" />
                <input required type="text" placeholder="License Number" value={docForm.license} onChange={e=>setDocForm({...docForm, license: e.target.value})} className="p-2 border rounded" />
                <input required type="text" placeholder="Education (e.g. MBBS)" value={docForm.education} onChange={e=>setDocForm({...docForm, education: e.target.value})} className="p-2 border rounded" />
                <input required type="text" placeholder="Specialization" value={docForm.specialization} onChange={e=>setDocForm({...docForm, specialization: e.target.value})} className="p-2 border rounded" />
                <button type="submit" disabled={isSubmitting} className="bg-brand-600 text-white font-medium rounded py-2 hover:bg-brand-700 disabled:opacity-50">
                  {isSubmitting ? 'Adding...' : 'Add Doctor'}
                </button>
              </form>
            </div>
            
            {/* Doctors List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name & Spec</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No doctors registered yet. Add one above.</td>
                    </tr>
                  ) : doctors.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.specialization} • {doc.education}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{doc.license}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteDoctor(doc.id)} className="text-red-500 hover:text-red-700" title="Delete doctor">
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'receptionists' && (
          <div className="space-y-6">
            {/* Add Receptionist Form */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-brand-600" /> Add Receptionist</h2>
              <form onSubmit={handleAddReceptionist} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Name" value={recForm.name} onChange={e=>setRecForm({...recForm, name: e.target.value})} className="p-2 border rounded" />
                <input required type="tel" placeholder="Phone" value={recForm.phone} onChange={e=>setRecForm({...recForm, phone: e.target.value})} className="p-2 border rounded" />
                <input required type="email" placeholder="Email" value={recForm.email} onChange={e=>setRecForm({...recForm, email: e.target.value})} className="p-2 border rounded" />
                <button type="submit" disabled={isSubmitting} className="bg-brand-600 text-white font-medium rounded py-2 hover:bg-brand-700 disabled:opacity-50">
                  {isSubmitting ? 'Adding...' : 'Add Receptionist'}
                </button>
              </form>
            </div>
            
            {/* Receptionists List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {receptionists.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No receptionists registered yet. Add one above.</td>
                    </tr>
                  ) : receptionists.map(rec => (
                    <tr key={rec.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">{rec.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{rec.phone}<br/>{rec.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteReceptionist(rec.id)} className="text-red-500 hover:text-red-700" title="Delete receptionist">
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
