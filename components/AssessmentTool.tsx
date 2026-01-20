
import React, { useState } from 'react';
import { Patient, AssessmentRecord } from '../types';
import { storage } from '../services/storage';

interface AssessmentToolProps {
  patients: Patient[];
  onSaved: () => void;
}

const AssessmentTool: React.FC<AssessmentToolProps> = ({ patients, onSaved }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [scores, setScores] = useState({ emotional: 5, social: 5, seizure: 5, sideEffect: 5, overall: 5 });
  const [notes, setNotes] = useState('');

  const calculateTotal = () => {
    const sum = scores.emotional + scores.social + scores.seizure + (10 - scores.sideEffect) + scores.overall;
    return (sum / 50) * 100;
  };

  const handleSave = () => {
    if (!selectedPatientId) return alert('请先选择待评估患儿');
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;
    const newRecord: AssessmentRecord = { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], scores: { ...scores }, totalScore: Math.round(calculateTotal()), notes };
    storage.updatePatient({ ...patient, assessmentHistory: [...(patient.assessmentHistory || []), newRecord] });
    onSaved();
  };

  const currentScore = calculateTotal();

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-24">
      <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/40">
        <h2 className="text-4xl font-black text-gray-900 mb-12 flex items-center gap-5 tracking-tight">
           <div className="w-20 h-20 bg-violet-600 rounded-3xl flex items-center justify-center text-white shadow-2xl"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div>
           QOLIE 生活质量临床专项测评
        </h2>

        <div className="space-y-16">
          <div className="space-y-4">
             <label className="text-base font-black text-gray-400 uppercase tracking-widest ml-2">测评对象 (从档案库选取)</label>
             <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full px-10 py-6 bg-white/80 border-0 ring-1 ring-black/5 rounded-[2rem] font-black text-2xl text-gray-900 outline-none focus:ring-4 focus:ring-violet-500/20 shadow-inner">
               <option value="">点击此处从档案库选择患儿进行测评...</option>
               {patients.map(p => ( <option key={p.id} value={p.id}>{p.name} · {p.age}岁 · {p.diagnosis}</option> ))}
             </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
               {[
                 { key: 'emotional', label: '情绪平衡', desc: '患儿在就诊周期内的焦虑、波动或易怒程度' },
                 { key: 'social', label: '社会适应', desc: '患儿在学校、社交环境及家庭中的融入度' },
                 { key: 'seizure', label: '发作恐惧', desc: '患儿及其家属对下一次发作的心理心理负担' },
                 { key: 'sideEffect', label: 'ASM副作用', desc: '药物对认知、精力和行为的主观负面感受' },
                 { key: 'overall', label: '整体质量', desc: '家长或患儿对当前综合生活水平的整体评价' },
               ].map((item) => (
                 <div key={item.key} className="space-y-5">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <h4 className="font-black text-gray-800 text-2xl">{item.label}</h4>
                        <p className="text-base text-gray-400 font-bold">{item.desc}</p>
                      </div>
                      <span className="text-4xl font-black text-violet-600">{scores[item.key as keyof typeof scores]}</span>
                   </div>
                   <input type="range" min="0" max="10" value={scores[item.key as keyof typeof scores]} onChange={(e) => setScores(p => ({ ...p, [item.key]: parseInt(e.target.value) }))} className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-violet-600" />
                 </div>
               ))}
            </div>

            <div className="flex flex-col items-center justify-center space-y-12 bg-violet-50/50 rounded-[3rem] p-12 border border-white shadow-inner">
               <div className="relative flex items-center justify-center">
                  <svg className="w-64 h-64 transform -rotate-90"><circle cx="128" cy="128" r="110" stroke="#F3F4F6" strokeWidth="16" fill="transparent" /><circle cx="128" cy="128" r="110" stroke="#8B5CF6" strokeWidth="16" fill="transparent" strokeDasharray={690} strokeDashoffset={690 * (1 - currentScore / 100)} className="transition-all duration-1000 ease-out" /></svg>
                  <div className="absolute flex flex-col items-center">
                     <span className="text-7xl font-black tracking-tighter text-gray-900">{Math.round(currentScore)}</span>
                     <span className="text-base font-black text-gray-400 uppercase tracking-widest mt-2">QOL 综合指数</span>
                  </div>
               </div>
               <div className="w-full space-y-4">
                  <label className="text-base font-black text-gray-400 uppercase tracking-widest ml-2">测评期间的临床观察与主诉备注</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="记录家长主诉、测评时的表现、关键行为观察等细节..." className="w-full px-6 py-5 bg-white rounded-3xl border-0 ring-1 ring-black/5 outline-none font-bold text-lg min-h-[180px] shadow-sm" />
               </div>
            </div>
          </div>

          <div className="flex gap-8 pt-8">
             <button onClick={handleSave} className="flex-1 bg-violet-600 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-violet-700 transition-all active:scale-95 text-2xl">保存本次测评记录到档案库</button>
             <button onClick={() => window.history.back()} className="px-16 py-6 bg-white text-gray-600 font-bold border-2 border-gray-100 rounded-[2rem] text-2xl hover:bg-gray-50 transition-all shadow-lg">取消测评操作</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTool;
