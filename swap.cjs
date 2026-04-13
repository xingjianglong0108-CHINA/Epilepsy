const fs = require('fs');
const content = fs.readFileSync('components/PatientForm.tsx', 'utf8');

const medStart = content.indexOf('        <section>\n          <div className="flex items-center gap-2 mb-6 ml-1">\n             <div className="w-2 h-8 bg-fuchsia-500 rounded-full"></div>\n             <h3 className="text-2xl font-bold">{isNewVisit ? \'本次就诊用药方案\' : \'药物管理 (ASM)\'}</h3>');
const medEnd = content.indexOf('        </section>\n        </div>\n\n        <div className="space-y-12">\n        <section>\n          <div className="flex items-center gap-2 mb-6 ml-1">\n             <div className="w-2 h-8 bg-sky-400 rounded-full"></div>\n             <h3 className="text-2xl font-bold">{isNewVisit ? \'本次就诊临床评估资料\' : \'临床资料\'}</h3>');

const clinStart = content.indexOf('        <section>\n          <div className="flex items-center gap-2 mb-6 ml-1">\n             <div className="w-2 h-8 bg-sky-400 rounded-full"></div>\n             <h3 className="text-2xl font-bold">{isNewVisit ? \'本次就诊临床评估资料\' : \'临床资料\'}</h3>');
const clinEnd = content.indexOf('        </section>\n\n        <section className="bg-white/50 p-8 rounded-[2.5rem] border border-white shadow-sm">');

if (medStart !== -1 && medEnd !== -1 && clinStart !== -1 && clinEnd !== -1) {
  const medContent = content.substring(medStart, medEnd + 18); // include </section>
  const clinContent = content.substring(clinStart, clinEnd + 18); // include </section>
  
  const beforeMed = content.substring(0, medStart);
  const afterClin = content.substring(clinEnd + 18);
  
  const separator = '\n        </div>\n\n        <div className="space-y-12">\n';
  
  const newContent = beforeMed + clinContent + separator + medContent + afterClin;
  fs.writeFileSync('components/PatientForm.tsx', newContent);
  console.log('Swapped successfully');
} else {
  console.log('Could not find sections');
  console.log('medStart:', medStart);
  console.log('medEnd:', medEnd);
  console.log('clinStart:', clinStart);
  console.log('clinEnd:', clinEnd);
}
