
export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export interface Medication {
  name: string;
  usage: string;   // 用法 (如: bid)
  dosage: string;  // 用量 (如: 0.25g)
  startDate: string; 
  endDate?: string; // 停药时间 (可选)
}

export interface AssessmentRecord {
  id: string;
  date: string;
  scores: {
    emotional: number;
    social: number;
    seizure: number;
    sideEffect: number;
    overall: number;
  };
  totalScore: number;
  notes: string;
}

export interface VisitRecord {
  id: string;
  date: string;
  clinicalSummary: {
    syndrome: string;
    seizureType: string;
    eeg: string;
    mri: string;
    genetic: string;
    biochemical: string; // 新增：生化检查
    other: string;
  };
  medications: Medication[];
  followUpConfig: {
    items: string[];
    intervalMonths: number;
    lastFollowUpDate: string;
    nextFollowUpDate: string;
  };
}

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  birthday: string; 
  age: number;      
  allergies: string;
  familyHistory: string; // 家族史
  idCard: string;
  phone: string;
  clinicalSummary: VisitRecord['clinicalSummary'];
  diagnosis: string;
  diagnosisDate: string;
  medications: Medication[];
  followUpConfig: VisitRecord['followUpConfig'];
  visitHistory: VisitRecord[];
  assessmentHistory?: AssessmentRecord[];
  createdAt: number;
}

export interface FollowUpReminder {
  patientId: string;
  patientName: string;
  daysRemaining: number;
  isOverdue: boolean;
  dueDate: string;
}
