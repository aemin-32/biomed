
import React from 'react';
import { Info } from 'lucide-react';

const LearningObjective = ({ text }: { text: string }) => (
  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-medical-500 flex gap-3">
    <Info className="w-5 h-5 text-medical-600 shrink-0 mt-0.5" />
    <div>
      <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">الهدف التعليمي (Learning Objective)</h4>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default LearningObjective;
