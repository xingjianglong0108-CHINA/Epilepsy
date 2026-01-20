
import { Patient } from '../types';

const STORAGE_KEY = 'LZRYEK_EPILEPSY_PATIENTS';

export const storage = {
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePatients: (patients: Patient[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  },

  addPatient: (patient: Patient): void => {
    const patients = storage.getPatients();
    patients.push(patient);
    storage.savePatients(patients);
  },

  updatePatient: (updatedPatient: Patient): void => {
    const patients = storage.getPatients();
    const index = patients.findIndex(p => p.id === updatedPatient.id);
    if (index !== -1) {
      patients[index] = updatedPatient;
      storage.savePatients(patients);
    }
  },

  deletePatient: (id: string): void => {
    const patients = storage.getPatients();
    const filtered = patients.filter(p => p.id !== id);
    storage.savePatients(filtered);
  },

  // 批量合并导入
  importPatients: (newPatients: Patient[]): number => {
    const existing = storage.getPatients();
    const existingIds = new Set(existing.map(p => p.idCard || p.id));
    
    let addedCount = 0;
    const merged = [...existing];
    
    newPatients.forEach(np => {
      const identifier = np.idCard || np.id;
      if (!existingIds.has(identifier)) {
        merged.push(np);
        addedCount++;
      }
    });
    
    storage.savePatients(merged);
    return addedCount;
  }
};
