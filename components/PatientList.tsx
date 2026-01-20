
import React, { useState, useMemo } from 'react';
import { Patient, Gender } from '../types';

interface PatientListProps {
  patients: Patient[];
  onSelect: (patient: Patient) => void;
  onNewVisit: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelect, onNewVisit, onEdit, onDelete, onDeleteMultiple }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showInsights, setShowInsights] = useState(false);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchLower) || p.idCard.includes(searchTerm) || p.phone.includes(searchTerm) || p.diagnosis.toLowerCase().includes(searchLower) || (p.clinicalSummary?.syndrome || '').toLowerCase().includes(searchLower) || p.medications.some(m => m.name.toLowerCase().includes(searchLower));
      const patientDate = new Date(p.createdAt).toISOString().split('T')[0];
      const matchesStart = !startDate || patientDate >= startDate;
      const matchesEnd = !endDate || patientDate <= endDate;
      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [patients, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const total = filteredPatients.length;
    if (total === 0) return null;
    const genderCount = { male: 0, female: 0 };
    const ageGroups = { infant: 0, toddler: 0, preschool: 0, school: 0, adolescent: 0 };
    const medUsage: Record<string, number> = {};
    filteredPatients.forEach(p => {
      if (p.gender === Gender.MALE) genderCount.male++; else genderCount.female++;
      if (p.age <= 1) ageGroups.infant++; else if (p.age <= 3) ageGroups.toddler++; else if (p.age <= 6) ageGroups.preschool++; else if (p.age <= 12) ageGroups.school++; else ageGroups.adolescent++;
      p.medications.forEach(m => { const name = m.name.split(' ')[0].trim(); if (name) medUsage[name] = (medUsage[name] || 0) + 1; });
    });
    const topMeds = Object.entries(medUsage).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, genderCount, ageGroups, topMeds };
  }, [filteredPatients]);

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/40 space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-violet-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">智能病历档案查询</h2>
              <p className="text-gray-500 text-base font-bold uppercase tracking-widest mt-1">Pediatric Database Search System</p>
            </div>
          </div>

          <div className="flex items-center bg-black/5 p-2 rounded-2xl border border-white/50">
             <button onClick={() => setShowInsights(false)} className={`px-8 py-3 rounded-xl text-lg font-bold transition-all ${!showInsights ? 'bg-white text-violet-600 shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}>病历列表</button>
             <button onClick={() => setShowInsights(true)} className={`px-8 py-3 rounded-xl text-lg font-bold transition-all ${showInsights ? 'bg-white text-violet-600 shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}>统计报表</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          <div className="relative group lg:col-span-6">
            <input type="text" placeholder="搜索患儿姓名、诊断药物、临床表现..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl border-0 ring-1 ring-black/5 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all font-black text-xl" />
            <svg className="w-8 h-8 text-gray-400 absolute left-4 top-[1.2rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <div className="lg:col-span-4 flex gap-4">
             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 px-5 py-5 bg-white rounded-3xl border-0 ring-1 ring-black/5 font-bold text-lg outline-none" />
             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 px-5 py-5 bg-white rounded-3xl border-0 ring-1 ring-black/5 font-bold text-lg outline-none" />
          </div>
          <button onClick={() => {setSearchTerm(''); setStartDate(''); setEndDate('');}} className="lg:col-span-2 py-5 bg-gray-100 text-gray-700 rounded-3xl font-black text-lg hover:bg-gray-200 transition shadow-sm">重置筛选</button>
        </div>
      </div>

      {showInsights && stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in">
          <div className="glass rounded-[3rem] p-10 flex flex-col items-center justify-center space-y-8 shadow-xl border-white/40">
            <h3 className="text-base font-black text-gray-400 uppercase tracking-widest">患儿性别占比</h3>
            <div className="relative w-52 h-52">
               <svg className="w-full h-full transform -rotate-90"><circle cx="104" cy="104" r="90" fill="transparent" stroke="#F3F4F6" strokeWidth="20" /><circle cx="104" cy="104" r="90" fill="transparent" stroke="#8B5CF6" strokeWidth="20" strokeDasharray={565} strokeDashoffset={565 * (1 - stats.genderCount.male / stats.total)} /></svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-gray-900">{Math.round((stats.genderCount.male / stats.total) * 100)}%</span>
                  <span className="text-base text-gray-500 font-bold">男童</span>
               </div>
            </div>
          </div>
          <div className="glass rounded-[3rem] p-10 space-y-8 shadow-xl border-white/40">
            <h3 className="text-base font-black text-gray-400 uppercase tracking-widest">年龄分段统计</h3>
            <div className="space-y-5">
              {[
                { label: '婴儿(0-1)', count: stats.ageGroups.infant },
                { label: '幼儿(1-3)', count: stats.ageGroups.toddler },
                { label: '学龄前(3-6)', count: stats.ageGroups.preschool },
                { label: '学龄(6-12)', count: stats.ageGroups.school },
                { label: '青春期(12+)', count: stats.ageGroups.adolescent },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between text-base font-bold"><span className="text-gray-600">{item.label}</span><span className="text-gray-900">{item.count}人</span></div>
                   <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-sky-500" style={{ width: `${(item.count / stats.total) * 100}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-[3rem] p-10 space-y-8 shadow-xl border-white/40">
            <h3 className="text-base font-black text-gray-400 uppercase tracking-widest">ASM 药物应用分布</h3>
            <div className="space-y-5">
               {stats.topMeds.map(([name, count], i) => (
                 <div key={i} className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-lg">{i+1}</div>
                    <div className="flex-1"><div className="flex justify-between items-center mb-1"><span className="text-base font-black text-gray-800">{name}</span><span className="text-sm font-bold text-gray-500">{count}例</span></div><div className="w-full h-2.5 bg-gray-100 rounded-full"><div className="h-full bg-fuchsia-400 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }}></div></div></div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border-white/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/60 border-b border-white/30 text-base font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-8">患儿基础信息</th>
                  <th className="px-8 py-8">诊断</th>
                  <th className="px-8 py-8">治疗方案</th>
                  <th className="px-8 py-8 text-center">档案操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-white/60 transition-colors group">
                    <td className="px-8 py-8 cursor-pointer" onClick={() => onSelect(p)}>
                      <div className="font-black text-gray-900 text-xl">{p.name}</div>
                      <div className="text-base text-gray-500 font-bold">{p.gender} · {p.age}岁</div>
                      <div className="mt-2 text-base text-violet-600 font-black flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        查看就诊史 ({p.visitHistory.length} 次记录)
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-2">
                        <span className="px-4 py-2 bg-sky-100 text-sky-800 text-base font-black rounded-xl inline-block border border-sky-200 shadow-sm">{p.diagnosis}</span>
                        {p.clinicalSummary?.syndrome && <span className="text-sm font-bold text-violet-400">[{p.clinicalSummary.syndrome}]</span>}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-wrap gap-2 max-w-xs">
                        {p.medications.filter(m => !m.endDate).map((m, i) => (
                          <div key={i} className="px-3 py-2 bg-violet-100 text-violet-700 text-sm font-black rounded-xl border border-violet-200 shadow-sm">{m.name.split(' ')[0]}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button title="新诊记录录入" onClick={() => onNewVisit(p)} className="p-4 bg-sky-100 text-sky-700 rounded-2xl hover:bg-sky-600 hover:text-white transition-all shadow-md">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                        <button title="修改基础档案" onClick={() => onEdit(p)} className="p-4 bg-violet-100 text-violet-700 rounded-2xl hover:bg-violet-600 hover:text-white transition-all shadow-md">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button title="档案销毁" onClick={() => onDelete(p.id)} className="p-4 bg-fuchsia-100 text-fuchsia-600 rounded-2xl hover:bg-fuchsia-500 hover:text-white transition-all shadow-md">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
