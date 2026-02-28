
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Battery, Zap, Info } from 'lucide-react';

const BatteryCalcView: React.FC = () => {
  const navigate = useNavigate();
  const [capacity, setCapacity] = useState<string>('');
  const [load, setLoad] = useState<string>('');
  
  // Calculation Logic
  const capacityNum = parseFloat(capacity);
  const loadNum = parseFloat(load);
  
  let resultHours = 0;
  let isValid = false;

  // Formula: (Capacity mAh / Load mA) * 0.7 (Safety Factor)
  if (!isNaN(capacityNum) && !isNaN(loadNum) && loadNum > 0) {
    resultHours = (capacityNum / loadNum) * 0.7;
    isValid = true;
  }

  // Formatting hours and minutes
  const hours = Math.floor(resultHours);
  const minutes = Math.round((resultHours - hours) * 60);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/tools')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">حاسبة البطارية</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Battery Runtime Estimator</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Result Card (Visual Feedback) */}
        <div className={`p-8 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${
          isValid 
            ? resultHours > 2 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/20' 
              : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-orange-500/20'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm'
        }`}>
          {/* Background decoration */}
          {isValid && <Zap className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-10 rotate-12" />}

          <Battery className={`w-16 h-16 mb-4 transition-colors ${isValid ? 'text-white' : 'text-slate-300 dark:text-slate-600'}`} />
          
          <div className="text-center relative z-10">
            <p className={`text-sm font-medium mb-1 ${isValid ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
              وقت التشغيل المتوقع
            </p>
            <h2 className={`text-4xl font-bold font-mono tracking-tight ${isValid ? 'text-white' : 'text-slate-200 dark:text-slate-700'}`}>
              {isValid ? `${hours}h ${minutes}m` : '--:--'}
            </h2>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">سعة البطارية (Capacity)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="مثال: 3000"
                  className="w-full p-4 pl-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-medical-500 dark:text-white transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">mAh</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">استهلاك الجهاز (Load)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={load}
                  onChange={(e) => setLoad(e.target.value)}
                  placeholder="مثال: 500"
                  className="w-full p-4 pl-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-medical-500 dark:text-white transition-all"
                />
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">mA</span>
              </div>
            </div>
        </div>

        {/* Technical Note */}
        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs leading-relaxed border border-blue-100 dark:border-blue-800">
          <Info className="w-5 h-5 flex-shrink-0" />
          <p>
            تستخدم المعادلة <strong>معامل أمان (0.7)</strong> لمحاكاة الظروف الواقعية، حيث لا يتم تفريغ البطارية بالكامل لحماية الخلايا وللتعويض عن فقد الطاقة في الدوائر الإلكترونية.
          </p>
        </div>

      </div>
    </div>
  );
};

export default BatteryCalcView;
