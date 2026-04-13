
import React, { useState, useEffect } from 'react';
import { Patient, Gender, Medication, VisitRecord } from '../types';
import { COMMON_MEDICATIONS, FOLLOW_UP_ITEMS, USAGE_OPTIONS, DOSAGE_UNITS, SYNDROME_OPTIONS, SEIZURE_TYPES } from '../constants';

const getDosageParts = (dosage: string) => {
  if (!dosage) return { value: '', unit: 'mg' };
  const match = dosage.match(/^([\d.]+)(.*)$/);
  if (match) {
    return { value: match[1], unit: match[2].trim() || 'mg' };
  }
  return { value: dosage, unit: '' };
};

interface PatientFormProps {
  initialData?: Patient;
  isNewVisit?: boolean;
  onSubmit: (data: Patient, isNewVisit: boolean) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialData, isNewVisit = false, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '', gender: Gender.MALE, birthday: '', age: 0, allergies: '', familyHistory: '', medicalHistory: '', idCard: '', phone: '',
    clinicalSummary: { syndrome: '', seizureType: '', eeg: '', mri: '', genetic: '', biochemical: '', other: '' },
    diagnosis: '', diagnosisDate: new Date().toISOString().split('T')[0],
    medications: [{ name: '', usage: '', dosage: '', startDate: new Date().toISOString().split('T')[0], endDate: '' }],
    followUpConfig: { items: [], intervalMonths: 3, lastFollowUpDate: new Date().toISOString().split('T')[0], nextFollowUpDate: '' },
    visitHistory: []
  });

  const [otherFollowUpText, setOtherFollowUpText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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
      let m = today.getMonth() - birth.getMonth();
      if (today.getDate() < birth.getDate()) {
        m--;
      }
      if (m < 0) {
        age--;
        m += 12;
      }
      setFormData(prev => ({ ...prev, age: Math.max(0, age), ageMonth: Math.max(0, m) }));
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
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    let finalItems = [...(formData.followUpConfig?.items || [])].filter(i => i !== '其他');
    if (formData.followUpConfig?.items.includes('其他') && otherFollowUpText.trim()) finalItems.push(otherFollowUpText.trim());
    
    const generatedDiagnosis = [
      formData.clinicalSummary?.seizureType ? `${formData.clinicalSummary.seizureType}癫痫` : '癫痫',
      formData.clinicalSummary?.syndrome,
      formData.clinicalSummary?.etiology,
      formData.clinicalSummary?.comorbidity
    ].filter(Boolean).join(' ');

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
      diagnosis: generatedDiagnosis,
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
    <form onSubmit={handleSubmit} className="glass rounded-[2.5rem] flex flex-col animate-fade-in max-h-[85vh] shadow-2xl border-white/40 overflow-hidden">
      <div className="p-8 pb-6 border-b border-white/30 shrink-0">
        <div className="flex justify-between items-center">
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
      </div>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12">
          <div className="space-y-12">
            <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
             <div className="w-2 h-8 bg-violet-500 rounded-full"></div>
             <h3 className="text-2xl font-bold">患儿基本信息 {isNewVisit && '(只读参考)'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 bg-white/40 p-8 rounded-[2rem] border border-white/50 shadow-inner">
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
              <div className="w-full px-5 py-4 bg-gray-100/50 text-gray-400 rounded-2xl border-0 ring-1 ring-black/5 font-bold text-lg">
                {formData.age} 岁 {formData.ageMonth !== undefined ? `${formData.ageMonth} 个月` : ''}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-base font-black text-fuchsia-600 uppercase tracking-widest px-1">过敏史</label>
              <input name="allergies" value={formData.allergies} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`} placeholder="药物或食物过敏史" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-base font-black text-violet-600 uppercase tracking-widest px-1">家族史</label>
              <input name="familyHistory" value={formData.familyHistory} onChange={handleInputChange} disabled={isNewVisit} className={`w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg ${isNewVisit ? 'opacity-50' : ''}`} placeholder="家族遗传或癫痫史" />
            </div>
            <div className="md:col-span-2 lg:col-span-4 xl:col-span-4 space-y-2">
              <label className="text-base font-black text-emerald-600 uppercase tracking-widest px-1">病史录入</label>
              <textarea name="medicalHistory" value={formData.medicalHistory || ''} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none font-semibold text-lg min-h-[100px]" placeholder="在此简单录入病史资料（建档或复诊时均可编辑）" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
             <div className="w-2 h-8 bg-sky-400 rounded-full"></div>
             <h3 className="text-2xl font-bold">{isNewVisit ? '本次就诊临床评估资料' : '临床资料'}</h3>
          </div>
          <div className="glass-dark p-8 rounded-[2.5rem] border-0 space-y-8">
            <div className="space-y-4 bg-white/40 p-6 rounded-3xl border border-white/50">
              <label className="text-base font-black text-gray-500 uppercase tracking-widest">临床诊断</label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <select 
                    value={SEIZURE_TYPES.includes(formData.clinicalSummary?.seizureType || '') ? formData.clinicalSummary?.seizureType : (formData.clinicalSummary?.seizureType === '' ? '' : 'OTHER')}
                    onChange={(e) => {
                      const val = e.target.value === 'OTHER' ? ' ' : e.target.value;
                      handleInputChange({ target: { name: 'clinicalSummary.seizureType', value: val } } as any);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-sky-400/30 rounded-xl outline-none font-black text-lg text-sky-800 appearance-none"
                  >
                    <option value="">选择发作形式...</option>
                    {SEIZURE_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="OTHER">其他...</option>
                  </select>
                </div>
                {(!SEIZURE_TYPES.includes(formData.clinicalSummary?.seizureType || '') && formData.clinicalSummary?.seizureType !== '') && (
                  <input 
                    name="clinicalSummary.seizureType" 
                    value={formData.clinicalSummary?.seizureType === ' ' ? '' : formData.clinicalSummary?.seizureType} 
                    onChange={handleInputChange} 
                    className="flex-1 min-w-[150px] px-4 py-3 bg-sky-50 border-2 border-sky-300 rounded-xl outline-none font-black text-lg text-sky-800" 
                    placeholder="手动输入发作形式" 
                  />
                )}
                <span className="text-xl font-black text-gray-800">癫痫</span>
                
                <div className="flex-1 min-w-[200px] relative">
                  <select 
                    value={SYNDROME_OPTIONS.includes(formData.clinicalSummary?.syndrome || '') ? formData.clinicalSummary?.syndrome : (formData.clinicalSummary?.syndrome === '' ? '' : 'OTHER')}
                    onChange={(e) => {
                      const val = e.target.value === 'OTHER' ? ' ' : e.target.value;
                      handleInputChange({ target: { name: 'clinicalSummary.syndrome', value: val } } as any);
                    }}
                    className="w-full px-4 py-3 bg-white border-2 border-violet-500/30 rounded-xl outline-none font-black text-lg text-violet-800 appearance-none"
                  >
                    <option value="">选择癫痫综合征分类...</option>
                    {SYNDROME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="OTHER">其他...</option>
                  </select>
                </div>
                {(!SYNDROME_OPTIONS.includes(formData.clinicalSummary?.syndrome || '') && formData.clinicalSummary?.syndrome !== '') && (
                  <input 
                    name="clinicalSummary.syndrome" 
                    value={formData.clinicalSummary?.syndrome === ' ' ? '' : formData.clinicalSummary?.syndrome} 
                    onChange={handleInputChange} 
                    className="flex-1 min-w-[200px] px-4 py-3 bg-violet-50 border-2 border-violet-300 rounded-xl outline-none font-black text-lg text-violet-800" 
                    placeholder="手动输入综合征分类" 
                  />
                )}
                
                <input name="clinicalSummary.etiology" value={formData.clinicalSummary?.etiology || ''} onChange={handleInputChange} className="flex-1 min-w-[150px] px-4 py-3 bg-white border-2 border-fuchsia-400/30 rounded-xl outline-none font-black text-lg text-fuchsia-800" placeholder="病因诊断" />
                <input name="clinicalSummary.comorbidity" value={formData.clinicalSummary?.comorbidity || ''} onChange={handleInputChange} className="flex-1 min-w-[150px] px-4 py-3 bg-white border-2 border-emerald-400/30 rounded-xl outline-none font-black text-lg text-emerald-800" placeholder="共患病诊断" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <div className="space-y-2">
                <label className="text-base font-black text-emerald-600 uppercase tracking-widest">生化检查与实验室指标</label>
                <textarea name="clinicalSummary.biochemical" value={formData.clinicalSummary?.biochemical} onChange={handleInputChange} className="w-full px-5 py-4 bg-white rounded-2xl border-0 ring-1 ring-black/5 outline-none text-lg min-h-[100px]" placeholder="血常规、肝肾功能、血药浓度测定结果..." />
              </div>
            </div>
          </div>
        </section>
        </div>

        <div className="space-y-12">
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
                    <select 
                      value={USAGE_OPTIONS.includes(med.usage) ? med.usage : (med.usage === '' ? '' : 'OTHER')} 
                      onChange={(e) => handleMedicationChange(idx, 'usage', e.target.value === 'OTHER' ? ' ' : e.target.value)} 
                      className="w-full px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-bold border-0 ring-1 ring-black/5"
                    >
                      <option value="">选择用法...</option>
                      {USAGE_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      <option value="OTHER">其他...</option>
                    </select>
                    {(!USAGE_OPTIONS.includes(med.usage) && med.usage !== '') && (
                      <input 
                        value={med.usage === ' ' ? '' : med.usage} 
                        onChange={(e) => handleMedicationChange(idx, 'usage', e.target.value)} 
                        className="w-full px-4 py-3.5 mt-2 bg-violet-50 border-2 border-violet-200 rounded-xl outline-none text-lg font-black" 
                        placeholder="输入用法" 
                      />
                    )}
                  </div>
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-base font-black text-gray-400 uppercase tracking-widest ml-1">用量</label>
                    <div className="flex gap-2">
                      <input 
                        value={getDosageParts(med.dosage).value} 
                        onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value + getDosageParts(med.dosage).unit)} 
                        className="w-1/2 px-4 py-3.5 bg-white rounded-xl outline-none text-lg font-semibold border-0 ring-1 ring-black/5" 
                        placeholder="如: 0.25" 
                      />
                      <select 
                        value={DOSAGE_UNITS.includes(getDosageParts(med.dosage).unit) ? getDosageParts(med.dosage).unit : 'OTHER'} 
                        onChange={(e) => {
                          const newUnit = e.target.value === 'OTHER' ? ' ' : e.target.value;
                          handleMedicationChange(idx, 'dosage', getDosageParts(med.dosage).value + newUnit);
                        }} 
                        className="w-1/2 px-2 py-3.5 bg-white rounded-xl outline-none text-lg font-semibold border-0 ring-1 ring-black/5"
                      >
                        {DOSAGE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        <option value="OTHER">其他</option>
                      </select>
                    </div>
                    {(!DOSAGE_UNITS.includes(getDosageParts(med.dosage).unit) && getDosageParts(med.dosage).unit !== '') && (
                      <input 
                        value={getDosageParts(med.dosage).unit === ' ' ? '' : getDosageParts(med.dosage).unit} 
                        onChange={(e) => handleMedicationChange(idx, 'dosage', getDosageParts(med.dosage).value + e.target.value)} 
                        className="w-full px-4 py-3.5 mt-2 bg-violet-50 border-2 border-violet-200 rounded-xl outline-none text-lg font-black" 
                        placeholder="输入单位" 
                      />
                    )}
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

        <section className="bg-white/50 p-8 rounded-[2.5rem] border border-white shadow-sm">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <h3 className="text-2xl font-bold mb-4">复诊计划与检查预约</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </div>
      </div>
      <div className="p-8 pt-4 border-t border-white/30 shrink-0 bg-white/30 backdrop-blur-md">
        <button type="submit" className={`w-full py-5 rounded-3xl font-black text-white shadow-2xl transition-all text-xl active:scale-95 ${showConfirm ? 'bg-emerald-500 hover:bg-emerald-600 animate-pulse' : 'bg-violet-600 hover:bg-violet-700'}`}>
          {showConfirm ? '确定保存' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
