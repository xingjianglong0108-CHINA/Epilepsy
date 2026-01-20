
import React, { useRef } from 'react';
import { Patient, FollowUpReminder } from '../types';
import { storage } from '../services/storage';

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onAddClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getReminders = (): FollowUpReminder[] => {
    const today = new Date();
    return patients
      .map(p => {
        const nextDate = new Date(p.followUpConfig.nextFollowUpDate);
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          patientId: p.id,
          patientName: p.name,
          daysRemaining: diffDays,
          isOverdue: diffDays < 0,
          dueDate: p.followUpConfig.nextFollowUpDate
        };
      })
      .filter(r => r.daysRemaining <= 14) 
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const reminders = getReminders();

  const exportToCSV = () => {
    if (patients.length === 0) return alert('暂无数据可导出');
    const headers = ['姓名', '性别', '出生日期', '年龄', '过敏史', '家族史', '联系电话', '身份证号', '当前诊断', '当前用药'];
    const rows = patients.map(p => [
      p.name, p.gender, p.birthday, p.age, p.allergies, p.familyHistory, p.phone, `'${p.idCard}`, p.diagnosis,
      p.medications.map(m => `${m.name}(${m.usage} ${m.dosage})`).join('; ')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LZRYEK_Patients_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LZRYEK_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const imported = JSON.parse(content);
          const count = storage.importPatients(imported);
          alert(`导入成功！共新增 ${count} 条记录。`);
          window.location.reload();
        }
      } catch (err) {
        alert('文件格式错误或解析失败');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
      <div className="lg:col-span-2 space-y-8">
        <div className="glass rounded-[3rem] p-10 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">随访任务待办清单</h2>
              <p className="text-gray-500 text-lg font-bold mt-1">未来 14 天内需要进行的临床复诊随访</p>
            </div>
            <span className="bg-white/50 backdrop-blur-sm text-gray-700 text-base font-black px-6 py-2 rounded-full border border-white/50 shadow-sm">{reminders.length} 个任务</span>
          </div>
          
          {reminders.length > 0 ? (
            <div className="space-y-6">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.patientId}
                  onClick={() => {
                    const patient = patients.find(p => p.id === reminder.patientId);
                    if (patient) onSelectPatient(patient);
                  }}
                  className="flex items-center justify-between p-6 rounded-3xl transition-all active:scale-[0.98] cursor-pointer group glass-dark border-0 hover:bg-white/80 shadow-md"
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${reminder.isOverdue ? 'bg-fuchsia-500 text-white' : 'bg-sky-500 text-white'}`}>
                      {reminder.patientName[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xl">{reminder.patientName}</h4>
                      <p className="text-base text-gray-500 font-bold">预约随访日期: {reminder.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {reminder.isOverdue ? (
                      <span className="text-fuchsia-600 font-black bg-fuchsia-100 px-4 py-2 rounded-full text-base">
                        已逾期 {Math.abs(reminder.daysRemaining)} 天
                      </span>
                    ) : (
                      <span className="text-sky-700 font-black bg-sky-100 px-4 py-2 rounded-full text-base">
                        {reminder.daysRemaining === 0 ? '就在今天' : `${reminder.daysRemaining} 天内`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-dark rounded-[2.5rem] border-0">
              <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                 <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-gray-600 font-black text-2xl">暂无近期待办随访</p>
              <p className="text-gray-400 text-lg mt-2 font-bold">所有患儿的随访计划均已同步并跟进</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-10">
        <div className="bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-500 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
             临床管理中心
          </h3>
          <div className="space-y-6">
            <button 
              onClick={onAddClick}
              className="w-full bg-white text-violet-600 font-black py-5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-95 text-xl"
            >
              新病人建档录入
            </button>
            
            <div className="pt-6 border-t border-white/20 space-y-4">
              <p className="text-base font-black uppercase tracking-widest opacity-80">数据库资产管理</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={exportToCSV}
                  className="bg-white/20 hover:bg-white/30 py-4 px-3 rounded-2xl text-base font-black uppercase tracking-tight transition-all flex flex-col items-center gap-2 border border-white/10 shadow-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  导出 EXCEL
                </button>
                <button 
                  onClick={exportToJSON}
                  className="bg-white/20 hover:bg-white/30 py-4 px-3 rounded-2xl text-base font-black uppercase tracking-tight transition-all flex flex-col items-center gap-2 border border-white/10 shadow-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  数据全量备份
                </button>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-black/20 hover:bg-black/30 py-5 rounded-2xl text-base font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                从 JSON 恢复数据
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-white/80 text-lg font-bold mb-1">系统已管理患儿总数</p>
            <p className="text-6xl font-black tracking-tighter">{patients.length} <span className="text-2xl opacity-70">位</span></p>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/40">
          <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            管理指南建议
          </h3>
          <div className="space-y-6">
            {[
              "遵循 ILAE 指南：新诊患者建议 1-3 个月随访一次。",
              "定期导出备份：建议每周进行一次全量 JSON 备份以防数据丢失。",
              "用药安全建议：长期服药患者建议定期监测血常规及肝肾功能指标。"
            ].map((tip, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-2 h-8 bg-violet-400 rounded-full shrink-0"></div>
                <p className="text-gray-700 text-lg font-bold leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
