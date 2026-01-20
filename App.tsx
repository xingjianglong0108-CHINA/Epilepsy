
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import PatientHistory from './components/PatientHistory';
import { storage } from './services/storage';
import { Patient } from './types';

enum View {
  DASHBOARD = 'DASHBOARD',
  LIST = 'LIST',
  FORM = 'FORM',
  HISTORY = 'HISTORY'
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [historyPatient, setHistoryPatient] = useState<Patient | undefined>(undefined);
  const [isNewVisitMode, setIsNewVisitMode] = useState<boolean>(false);

  useEffect(() => {
    setPatients(storage.getPatients());
  }, []);

  const handleSavePatient = (patient: Patient, isNewVisit: boolean) => {
    if (editingPatient) {
      storage.updatePatient(patient);
    } else {
      storage.addPatient(patient);
    }
    setPatients(storage.getPatients());
    setActiveView(View.DASHBOARD);
    setEditingPatient(undefined);
    setIsNewVisitMode(false);
  };

  const handleDeletePatient = (id: string) => {
    if (window.confirm('确认删除该病人记录？此操作无法撤销。')) {
      storage.deletePatient(id);
      setPatients(storage.getPatients());
    }
  };

  const handleDeleteMultiplePatients = (ids: string[]) => {
    if (window.confirm(`确定要永久删除选中的 ${ids.length} 名患者记录吗？`)) {
      const allPatients = storage.getPatients();
      const filtered = allPatients.filter(p => !ids.includes(p.id));
      storage.savePatients(filtered);
      setPatients(filtered);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsNewVisitMode(false);
    setActiveView(View.FORM);
  };

  const handleNewVisit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsNewVisitMode(true);
    setActiveView(View.FORM);
  };

  const handleViewHistory = (patient: Patient) => {
    setHistoryPatient(patient);
    setActiveView(View.HISTORY);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <header className="sticky top-0 z-50 glass border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg">
                LZ
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">LZRYEK 癫痫随访</h1>
            </div>
            
            <nav className="flex space-x-1.5 bg-black/5 p-1.5 rounded-2xl">
              {[
                { id: View.DASHBOARD, label: '概览', icon: 'M4 6h16M4 12h16M4 18h16' },
                { id: View.LIST, label: '查询', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { id: View.FORM, label: '建档', icon: 'M12 4v16m8-8H4' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (item.id !== View.FORM) {
                      setEditingPatient(undefined);
                      setIsNewVisitMode(false);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    (activeView === item.id || (activeView === View.HISTORY && item.id === View.LIST)) 
                    ? 'bg-white shadow-sm text-violet-600' 
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon}></path>
                  </svg>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeView === View.DASHBOARD && (
          <Dashboard 
            patients={patients} 
            onSelectPatient={handleNewVisit} // Dashboard 点击提醒直接去录就诊
            onAddClick={() => {
              setEditingPatient(undefined);
              setIsNewVisitMode(false);
              setActiveView(View.FORM);
            }}
          />
        )}
        
        {activeView === View.LIST && (
          <PatientList 
            patients={patients} 
            onSelect={handleViewHistory} 
            onNewVisit={handleNewVisit}
            onEdit={handleEditPatient}
            onDelete={handleDeletePatient}
            onDeleteMultiple={handleDeleteMultiplePatients}
          />
        )}

        {activeView === View.FORM && (
          <PatientForm 
            initialData={editingPatient}
            isNewVisit={isNewVisitMode}
            onSubmit={handleSavePatient}
            onCancel={() => {
              setActiveView(View.DASHBOARD);
              setEditingPatient(undefined);
              setIsNewVisitMode(false);
            }}
          />
        )}

        {activeView === View.HISTORY && historyPatient && (
          <PatientHistory 
            patient={historyPatient}
            onBack={() => {
              setActiveView(View.LIST);
              setHistoryPatient(undefined);
            }}
          />
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-gray-600 text-xs px-4">
        <p className="opacity-75">© 2024 LZRYEK Epilepsy Management. <i>By Jefflong</i></p>
      </footer>
    </div>
  );
};

export default App;
