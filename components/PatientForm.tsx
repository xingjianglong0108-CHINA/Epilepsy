
import React, { useState, useEffect } from 'react';
import { Patient, Gender, Medication, VisitRecord } from '../types';
import { COMMON_MEDICATIONS, FOLLOW_UP_ITEMS } from '../constants';

interface PatientFormProps {
  initialData?: Patient;
  isNewVisit?: boolean;
  onSubmit: (data: Patient, isNewVisit: boolean) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, isNewVisit = false, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '', gender: Gender.MALE, birthday: '', age: 0, allergies: '', familyHistory: '', idCard: '', phone: '',
    clinicalSummary: { syndrome: '', seizureType: '', eeg: '', mri: '', genetic: '', biochemical: '', other: '' },
    diagnosis: '', diagnosisDate: new Date().toISOString().split('T')[0],
    medications: [{ name: '', usage: '', dosage: '', startDate: new Date().toISOString().split('T')[0], endDate: '' }],
    followUpConfig: { items: [], intervalMonths: 3, lastFollowUpDate: new Date().toISOString().split('T')[0], nextFollowUpDate: '' },
    visitHistory: []
  });

  const [otherFollowUpText, setOtherFollowUpText] = useState('');

  useEffect(() => { 
    if (initialData) {
      setFormData(initialData);
      const customItem = initialData.followUpConfig.items.find(item => !FOLLOW_UP_ITEMS.includes(item));
      if (customItem) setOtherFollowUpText(customItem);
    } 
  }, [initialData]);

  useEffect(() => {
    if (formData.birthday) {
      const birth = new Date(formData.birthday);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setFormData(prev => ({ ...prev, age: Math.max(0, age) }));
    }
  }, [formData.birthday]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...(prev[parent as keyof Patient] as any), [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMeds = [...(formData.medications || [])];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setFormData(prev => ({ ...prev, medications: newMeds }));
  };

  const calculateNextDate = () => {
    if (!formData.followUpConfig?.lastFollowUpDate || !formData.followUpConfig?.intervalMonths) return;
    const lastDate = new Date(formData.followUpConfig.lastFollowUpDate);
    lastDate.setMonth(lastDate.getMonth() + Number(formData.followUpConfig.intervalMonths));
    setFormData(prev => ({ ...prev, followUpConfig: { ...prev.followUpConfig!, nextFollowUpDate: lastDate.toISOString().split('T')[0] } }));
  };

  useEffect(() => { calculateNextDate(); }, [formData.followUpConfig?.lastFollowUpDate, formData.followUpConfig?.intervalMonths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalItems = [...(formData.followUpConfig?.items || [])].filter(i => i !== '其他');
    if (formData.followUpConfig?.items.includes('其他') && otherFollowUpText.trim()) finalItems.push(otherFollowUpText.trim());
    
    const currentFollowUpConfig = { ...formData.followUpConfig!, items: finalItems };
    let updatedHistory = [...(formData.visitHistory || [])];
    
    if (!initialData || isNewVisit) {
      const newVisit: VisitRecord = {
        id: crypto.randomUUID(),
        date: formData.followUpConfig?.lastFollowUpDate || new Date().toISOString().split('T')[0],
        clinicalSummary: { ...formData.clinicalSummary! },
        medications: [...(formData.medications || [])],
        followUpConfig: { ...currentFollowUpConfig }
      };
      updatedHistory.push(newVisit);
    }

    onSubmit({ 
      ...(formData as Patient), 
      followUpConfig: currentFollowUpConfig, 
      visitHistory: updatedHistory,
      id: initialData?.id || crypto.randomUUID(), 
      createdAt: initialData?.createdAt || Date.now() 
    }, isNewVisit);
  };

  const toggleItem = (item: string) => {
    const items = formData.followUpConfig?.items || [];
    setFormData(prev => ({ ...prev, followUpConfig: { ...prev.followUpConfig!, items: items.includes(item) ? items.filter(i => i !== item) : [...items, item] } }));
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-[2.5rem] p-8 space-y-10 animate-fade-in overflow-y-auto max-h-[85vh] shadow-2xl border-white/40">
      <div className="flex justify-between items-center pb-6 border-b border-white/30">
        <div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tight">
             {isNewVisit ? '录入新诊记录' : (initialData ? '修改患儿档案资料' : '新建患儿诊疗档案')}
           </h2>
           <p className="text-violet-500 text-base font-black uppercase tracking-[0.2em] mt-1">
             {isNewVisit ? 'New Clinical Visit Record' : 'Patient Information Management'}
           </p>
        </div>
        <button type="button" onClick={onCancel} className="p-3 bg-black/5 hover:bg-black/10 rounded-full transition-colors">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
             <div className="w-2 h-8 bg-violet-500 rounded-full"></div>
             <h3 className="text-2xl font-bold">患儿基本信息 {isNewVisit && '(只读参考)'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-white/40 p-8 rounded-[2rem] border border-white/50 shadow-inner">
            <div className="space-y-2">
              <label className="text-base font-black text-gray-400 uppercase tracking-widest px-1">患儿姓名</label>
              <input name="name" value={formData.name} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 focus:ring-4 focus:ring-violet-500/20 outline-none transition-all font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`} required />
            </div>
            <div className="space-y-2">
              <label className="text-base font-black text-gray-400 uppercase tracking-widest px-1">性别</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`}>
                <option value={Gender.MALE}>男</option>
                <option value={Gender.FEMALE}>女</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-black text-sky-600 uppercase tracking-widest px-1">出生日期</label>
              <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`} required />
            </div>
            <div className="space-y-2">
              <label className="text-base font-black text-gray-400 uppercase tracking-widest px-1">计算年龄</label>
              <div className="w-full px-5 py-4 bg-gray-100/50 text-gray-400 rounded-2xl border-0 ring-1 ring-black/5 font-bold text-lg">{formData.age} 岁</div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-base font-black text-fuchsia-600 uppercase tracking-widest px-1">过敏史</label>
              <input name="allergies" value={formData.allergies} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`} placeholder="药物或食物过敏史" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-base font-black text-violet-600 uppercase tracking-widest px-1">家族史</label>
              <input name="familyHistory" value={formData.familyHistory} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`} placeholder="家族遗传或癫痫史" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
             <div className="w-2 h-8 bg-fuchsia-500 rounded-full"></div>
             <h3 className="text-2xl font-bold">{isNewVisit ? '本次就诊用药方案' : '药物管理 (ASM)'}</h3>
          </div>
          <div className="space-y-6">
            {(formData.medications || []).map((med, idx) => (
              <div key={idx} className="bg-white/50 p-6 rounded-3xl border border-white/50 space-y-4 shadow-sm relative group transition-all hover:bg-white/70">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                  <div className="lg:col-span-3 space-y-2">
                    <label className="text-base font-black text-gray-400 uppercase tracking-widest ml-1">药物名称</label>
                    <select value={COMMON_MEDICATIONS.includes(med.name) ? med.name : (med.name === '' ? '' : 'OTHER')} onChange={(e) => handleMedicationChange(idx, 'name', e.target.value === 'OTHER' ? ' ' : e.target.value)} className="w-full px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-bold border-0 ring-1 ring-black/5">
                      <option value="">选择药物...</option>
                      {COMMON_MEDICATIONS.map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="OTHER">其他...</option>
                    </select>
                    {(!COMMON_MEDICATIONS.includes(med.name) && med.name !== '') && (
                      <input value={med.name === ' ' ? '' : med.name} onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)} className="w-full px-4 py-3.5 mt-2 bg-violet-50 border-2 border-violet-200 rounded-xl outline-none text-lg font-black" placeholder="输入药名" />
                    )}
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-base font-black text-gray-400 uppercase tracking-widest ml-1">用法</label>
                    <input value={med.usage} onChange={(e) => handleMedicationChange(idx, 'usage', e.target.value)} className="w-full px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-semibold border-0 ring-1 ring-black/5" placeholder="如: bid" />
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-base font-black text-gray-400 uppercase tracking-widest ml-1">用量</label>
                    <input value={med.dosage} onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)} className="w-full px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-semibold border-0 ring-1 ring-black/5" placeholder="如: 0.25g" />
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-base font-black text-violet-600 uppercase tracking-widest ml-1">起始日期</label>
                    <input type="date" value={med.startDate} onChange={(e) => handleMedicationChange(idx, 'startDate', e.target.value)} className="w-full px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-semibold border-0 ring-1 ring-black/5" />
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-base font-black text-fuchsia-600 uppercase tracking-widest ml-1">停药时间</label>
                    <input type="date" value={med.endDate || ''} onChange={(e) => handleMedicationChange(idx, 'endDate', e.target.value)} className="w-full px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-semibold border-0 ring-1 ring-black/5" />
                  </div>
                  <div className="lg:col-span-1 pb-1 flex justify-center">
                    <button type="button" onClick={() => setFormData(p => ({ ...p, medications: p.medications?.filter((_, i) => i !== idx) }))} className="p-3 bg-fuchsia-50 text-fuchsia-500 rounded-xl hover:bg-fuchsia-500 hover:text-white transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setFormData(p => ({ ...p, medications: [...(p.medications || []), { name: '', usage: '', dosage: '', startDate: new Date().toISOString().split('T')[0], endDate: '' }] }))} className="w-full py-5 bg-violet-50 text-violet-600 font-black rounded-2xl hover:bg-violet-100 transition-all text-lg border-2 border-dashed border-violet-200">
              + 添加新的药物方案记录
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
             <div className="w-2 h-8 bg-sky-400 rounded-full"></div>
             <h3 className="text-2xl font-bold">{isNewVisit ? '本次就诊临床评估资料' : '临床资料'}</h3>
          </div>
          <div className="glass-dark p-8 rounded-[2.5rem] border-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-base font-black text-gray-500 uppercase tracking-widest">临床诊断结论</label>
                <input name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} className="w-full px-6 py-4 bg-white border-2 border-sky-400/30 rounded-2xl outline-none font-black text-lg text-sky-800" placeholder="如: 局灶性癫痫" required />
              </div>
              <div className="space-y-2">
                <label className="text-base font-black text-gray-500 uppercase tracking-widest">癫痫综合征分类</label>
                <input name="clinicalSummary.syndrome" value={formData.clinicalSummary?.syndrome} onChange={handleInputChange} className="w-full px-6 py-4 bg-white border-2 border-violet-500/30 rounded-2xl outline-none font-black text-lg text-violet-800" placeholder="如: West 综合征" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-base font-black text-violet-500 uppercase tracking-widest">脑电图 (EEG) 描述</label>
                <textarea name="clinicalSummary.eeg" value={formData.clinicalSummary?.eeg} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none text-lg min-h-[100px]" placeholder="记录背景波、棘波、尖波等异常情况..." />
              </div>
              <div className="space-y-2">
                <label className="text-base font-black text-sky-600 uppercase tracking-widest">头颅影像 (MRI/CT) 结果</label>
                <textarea name="clinicalSummary.mri" value={formData.clinicalSummary?.mri} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none text-lg min-h-[100px]" placeholder="记录结构性改变、软化灶等..." />
              </div>
              <div className="space-y-2">
                <label className="text-base font-black text-fuchsia-600 uppercase tracking-widest">基因检测报告</label>
                <textarea name="clinicalSummary.genetic" value={formData.clinicalSummary?.genetic} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none text-lg min-h-[100px]" placeholder="致病性变异、VUS 等详细记录..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-base font-black text-emerald-600 uppercase tracking-widest">生化检查与实验室指标</label>
              <textarea name="clinicalSummary.biochemical" value={formData.clinicalSummary?.biochemical} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none text-lg min-h-[100px]" placeholder="血常规、肝肾功能、血药浓度测定结果..." />
            </div>
          </div>
        </section>

        <section className="bg-white/50 p-8 rounded-[2.5rem] border border-white shadow-sm">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <h3 className="text-2xl font-bold mb-4">复诊计划与检查预约</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                   {FOLLOW_UP_ITEMS.map(item => (
                     <div key={item} onClick={() => toggleItem(item)} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center text-center text-base font-black uppercase tracking-widest ${formData.followUpConfig?.items.includes(item) ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-white border-black/5 text-gray-500 hover:border-violet-300'}`}>
                       {item}
                     </div>
                   ))}
                </div>
              </div>
              <div className="space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-base font-black text-gray-500 uppercase tracking-widest">随访时间间隔 (月)</label>
                       <input type="number" name="followUpConfig.intervalMonths" value={formData.followUpConfig?.intervalMonths} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-base font-black text-sky-700 uppercase tracking-widest">本次就诊日期</label>
                       <input type="date" name="followUpConfig.lastFollowUpDate" value={formData.followUpConfig?.lastFollowUpDate} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-bold text-lg" />
                    </div>
                 </div>
                 <div className="p-10 bg-gradient-to-br from-violet-600 to-sky-600 rounded-[2.5rem] text-white shadow-2xl border-4 border-white/20">
                    <span className="text-base font-black text-violet-100 uppercase tracking-[0.3em] block mb-3">系统建议预约提醒</span>
                    <span className="text-5xl font-black tracking-tighter">{formData.followUpConfig?.nextFollowUpDate || '...'}</span>
                 </div>
              </div>
           </div>
        </section>
      </div>

      <div className="flex gap-6 pt-10 sticky bottom-0 bg-white/40 backdrop-blur-xl -mx-8 px-8 pb-6 z-20 border-t border-white/20">
        <button type="submit" className="flex-1 bg-violet-600 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-violet-700 transition-all text-xl active:scale-95">
          {isNewVisit ? '完成并确认生成本次就诊记录' : (initialData ? '确认保存档案基础修改' : '确认建立长期诊疗档案')}
        </button>
        <button type="button" onClick={onCancel} className="px-14 py-6 bg-white/80 text-gray-700 font-bold rounded-3xl hover:bg-white transition-all text-xl shadow-lg">
          取消操作
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
