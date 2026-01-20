
import React from 'react';
import { Patient, VisitRecord } from '../types';

interface PatientHistoryProps {
  patient: Patient;
  onBack: () => void;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ patient, onBack }) => {
  const sortedHistory = [...patient.visitHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white/80 rounded-[1.5rem] shadow-lg hover:bg-white transition-all">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">全程诊疗就诊史记录</h2>
            <p className="text-violet-600 text-lg font-bold uppercase tracking-widest mt-1">Timeline · {patient.name} · {patient.gender} · {patient.age}岁</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-[3rem] p-10 border-white/40 grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
        <div className="flex flex-col gap-2 p-6 bg-white/30 rounded-3xl">
           <span className="font-black text-gray-400 uppercase text-base tracking-[0.2em]">家族病史:</span>
           <span className="text-gray-800 font-bold">{patient.familyHistory || '未详细记录'}</span>
        </div>
        <div className="flex flex-col gap-2 p-6 bg-fuchsia-50/50 rounded-3xl border border-fuchsia-100">
           <span className="font-black text-fuchsia-400 uppercase text-base tracking-[0.2em]">药物/食物过敏史:</span>
           <span className="text-fuchsia-700 font-black">{patient.allergies || '暂未发现临床显著过敏情况'}</span>
        </div>
      </div>

      {sortedHistory.length > 0 ? (
        <div className="space-y-16 relative before:absolute before:left-10 before:top-6 before:bottom-6 before:w-1.5 before:bg-white/40 before:rounded-full">
          {sortedHistory.map((visit, index) => (
            <div key={visit.id} className="relative pl-32 group">
              <div className="absolute left-[1.85rem] top-10 w-6 h-6 bg-violet-600 rounded-full border-4 border-white shadow-2xl group-hover:scale-125 transition-all"></div>
              <div className="glass rounded-[3rem] p-10 space-y-10 hover:shadow-2xl transition-all border-white/40 shadow-xl">
                <div className="flex justify-between items-center pb-6 border-b border-black/5">
                  <div className="flex items-center gap-4">
                    <span className="px-6 py-2 bg-violet-600 text-white text-base font-black rounded-full shadow-lg">{visit.date} 就诊</span>
                    <span className="text-gray-400 text-base font-black uppercase tracking-widest">Archive Record No.{sortedHistory.length - index}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-6">
                    <h4 className="text-base font-black text-violet-500 uppercase tracking-widest bg-violet-50 px-4 py-2 rounded-xl inline-block">ASM 药物方案快照</h4>
                    <div className="space-y-4">
                      {visit.medications.map((m, i) => (
                        <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-2 ${m.endDate ? 'bg-gray-100/50 border-gray-200 grayscale opacity-60' : 'bg-white border-white/50 shadow-md'}`}>
                          <div className="flex justify-between items-center">
                             <span className="font-black text-gray-900 text-lg">{m.name}</span>
                             {m.endDate ? <span className="text-xs font-black text-gray-500 bg-gray-200 px-2 py-1 rounded">已停</span> : <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">维持治疗</span>}
                          </div>
                          <div className="text-base text-gray-600 font-bold">{m.usage} · {m.dosage}</div>
                          <div className="text-sm text-gray-400 font-bold mt-1">起始: {m.startDate} {m.endDate && `至 ${m.endDate}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                    <h4 className="text-base font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-4 py-2 rounded-xl inline-block">详细临床资料归档</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="text-lg">
                          <span className="font-black text-gray-400 block mb-2 uppercase text-base tracking-widest">脑电图 (EEG) 复查记录</span>
                          <p className="text-gray-800 leading-relaxed bg-white/50 p-4 rounded-2xl border border-white/50 shadow-sm">{visit.clinicalSummary.eeg || '本就诊周期未复查'}</p>
                        </div>
                        <div className="text-lg">
                          <span className="font-black text-gray-400 block mb-2 uppercase text-base tracking-widest">神经影像 (MRI/CT)</span>
                          <p className="text-gray-800 leading-relaxed bg-white/50 p-4 rounded-2xl border border-white/50 shadow-sm">{visit.clinicalSummary.mri || '暂无影像更新'}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="text-lg">
                          <span className="font-black text-fuchsia-400 block mb-2 uppercase text-base tracking-widest">遗传学/基因检测</span>
                          <p className="text-fuchsia-700 font-black bg-fuchsia-50/50 p-4 rounded-2xl border border-fuchsia-100 shadow-sm">{visit.clinicalSummary.genetic || '未见新的异常变异描述'}</p>
                        </div>
                        <div className="text-lg">
                          <span className="font-black text-emerald-600 block mb-2 uppercase text-base tracking-widest">实验室及生化指标</span>
                          <p className="text-emerald-700 font-bold bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm whitespace-pre-line">{visit.clinicalSummary.biochemical || '血常规及血药浓度等暂无更新'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-[3rem] p-32 text-center text-gray-300 font-black text-3xl italic">档案库中暂无历史就诊记录记录，请点击列表加号开始录入。</div>
      )}
    </div>
  );
};

export default PatientHistory;
