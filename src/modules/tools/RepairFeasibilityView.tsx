
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Calculator, AlertTriangle, CheckCircle2, XCircle, Info, DollarSign, Calendar, Wrench, Activity, Scale, History, ShieldCheck } from 'lucide-react';

const RepairFeasibilityView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for passed state
  const preFilledData = (location.state as any) || {};

  // Inputs
  const [costNew, setCostNew] = useState<string>(''); // Replacement Cost
  const [costRepair, setCostRepair] = useState<string>(''); // Estimated Repair Cost
  const [costHistory, setCostHistory] = useState<number>(0); // Historical Cost
  const [includeHistory, setIncludeHistory] = useState<boolean>(false);
  const [isWarranty, setIsWarranty] = useState<boolean>(false);
  
  const [age, setAge] = useState<string>(''); // Device Age in Years
  const [lifeExpectancy, setLifeExpectancy] = useState<string>('10'); // Industry Standard Life (e.g., 7-10 years)

  // Results
  const [berScore, setBerScore] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<'REPAIR' | 'EVALUATE' | 'REPLACE' | 'WARRANTY'>('REPAIR');

  // Load Pre-filled data if available
  useEffect(() => {
      if (preFilledData.costNew) setCostNew(preFilledData.costNew.toString());
      if (preFilledData.costRepair) setCostRepair(preFilledData.costRepair.toString());
      if (preFilledData.age) setAge(preFilledData.age.toString());
      if (preFilledData.costHistory) {
          const hist = parseFloat(preFilledData.costHistory);
          setCostHistory(hist);
          // Automatically enable history inclusion if history exists, assuming user wants full context
          if (hist > 0) setIncludeHistory(true);
      }
      if (preFilledData.isWarranty !== undefined) {
          setIsWarranty(preFilledData.isWarranty);
      }
  }, [preFilledData]);

  useEffect(() => {
    // Override if warranty is active
    if (isWarranty) {
        setRecommendation('WARRANTY');
        // We still calculate score for visual info if data exists
    } 

    const cNew = parseFloat(costNew);
    const cRepair = parseFloat(costRepair);
    const dAge = parseFloat(age);
    const dLife = parseFloat(lifeExpectancy);

    if (cNew > 0 && cRepair > 0 && dLife > 0) {
        // Calculate Total Repair Load (Current + History if enabled)
        const totalRepairLoad = cRepair + (includeHistory ? costHistory : 0);

        // 1. Calculate Depreciated Value (Straight Line)
        let remainingLifeFactor = Math.max(0.1, (dLife - dAge) / dLife);
        let currentValue = cNew * remainingLifeFactor;

        // 2. Calculate BER Ratio
        // (Total Repair Cost / Current Value) * 100
        const score = (totalRepairLoad / currentValue) * 100;
        
        setBerScore(score);

        if (!isWarranty) {
            if (score < 50) setRecommendation('REPAIR');
            else if (score < 80) setRecommendation('EVALUATE');
            else setRecommendation('REPLACE');
        }

    } else {
        setBerScore(0);
        if (isWarranty) setRecommendation('WARRANTY');
    }
  }, [costNew, costRepair, costHistory, includeHistory, age, lifeExpectancy, isWarranty]);

  const handleBack = () => {
      if (preFilledData.backPath && preFilledData.returnState) {
          // Explicitly pass the state back
          navigate(preFilledData.backPath, { 
              state: { 
                  returnState: preFilledData.returnState 
              } 
          });
      } else {
          // Fallback
          navigate(-1);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleBack}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">حاسبة جدوى الإصلاح</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">BER Calculator (Beyond Economic Repair)</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Result Card */}
        <div className={`p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden shadow-xl ${
            berScore === 0 && !isWarranty ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' :
            recommendation === 'WARRANTY' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200' :
            recommendation === 'REPAIR' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-200' :
            recommendation === 'EVALUATE' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-800 dark:text-amber-200' :
            'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isWarranty ? 'WARRANTY' : (berScore === 0 ? '--' : berScore.toFixed(1) + '%')}
                    </h2>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                        {isWarranty ? 'حالة التغطية' : `مؤشر التكلفة (${includeHistory ? 'TCO' : 'BER'})`}
                    </p>
                </div>
                <div className={`p-3 rounded-full ${
                    berScore === 0 && !isWarranty ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' :
                    recommendation === 'WARRANTY' ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200' :
                    recommendation === 'REPAIR' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200' :
                    recommendation === 'EVALUATE' ? 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200' :
                    'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200'
                }`}>
                    {recommendation === 'WARRANTY' ? <ShieldCheck className="w-8 h-8" /> : 
                     recommendation === 'REPAIR' ? <CheckCircle2 className="w-8 h-8" /> : 
                     recommendation === 'EVALUATE' ? <AlertTriangle className="w-8 h-8" /> : 
                     recommendation === 'REPLACE' ? <XCircle className="w-8 h-8" /> : <Scale className="w-8 h-8" />}
                </div>
            </div>

            <div className="text-sm font-bold bg-white/50 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                {berScore === 0 && !isWarranty ? 'أدخل البيانات للحساب' :
                 recommendation === 'WARRANTY' ? '🛡️ التوصية: مطالبة بالضمان (Contact Supplier)' :
                 recommendation === 'REPAIR' ? '✅ التوصية: باشر بالإصلاح (تكلفة مقبولة)' :
                 recommendation === 'EVALUATE' ? '⚠️ التوصية: مراجعة الإدارة (تكلفة متوسطة)' :
                 '🛑 التوصية: استبدال الجهاز (غير مجدي اقتصادياً)'}
            </div>
        </div>

        {/* Inputs Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            
            {/* Warranty Toggle (Main Check) */}
            <div className="col-span-2 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                        <ShieldCheck className="w-5 h-5" />
                        <span>الجهاز تحت الضمان (Under Warranty)</span>
                    </div>
                    <input 
                        type="checkbox"
                        checked={isWarranty}
                        onChange={(e) => setIsWarranty(e.target.checked)}
                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> سعر جهاز جديد (Replacement Cost)
                    </label>
                    <input 
                        type="number" 
                        value={costNew}
                        onChange={(e) => setCostNew(e.target.value)}
                        placeholder="مثال: 5000"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> تكلفة الإصلاح الحالية (Parts + Labor)
                    </label>
                    <input 
                        type="number" 
                        value={costRepair}
                        onChange={(e) => setCostRepair(e.target.value)}
                        placeholder="تم جلبه تلقائياً..."
                        className={`w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${preFilledData.costRepair ? 'ring-2 ring-indigo-500/20 bg-indigo-50/50' : ''}`}
                    />
                </div>

                {/* Historical Cost Toggle */}
                <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <History className="w-3.5 h-3.5" />
                            <span>تضمين تكاليف سابقة (${costHistory.toLocaleString()})</span>
                        </div>
                        <input 
                            type="checkbox"
                            checked={includeHistory}
                            onChange={(e) => setIncludeHistory(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                    </label>
                    {includeHistory && (
                        <p className="text-[10px] text-slate-400 mt-1 mr-6">
                            يتم حساب المجموع التراكمي للإصلاحات لتقييم الجدوى الاقتصادية الكلية (Total Cost of Ownership).
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> عمر الجهاز (سنوات)
                    </label>
                    <input 
                        type="number" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> العمر الافتراضي
                    </label>
                    <input 
                        type="number" 
                        value={lifeExpectancy}
                        onChange={(e) => setLifeExpectancy(e.target.value)}
                        placeholder="Life Exp."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>

        {/* Explanation Note */}
        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs leading-relaxed border border-blue-100 dark:border-blue-800">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            تعتمد هذه الأداة على حساب <strong>القيمة المستهلكة (Depreciation)</strong> للجهاز. إذا تجاوزت تكلفة الإصلاح (سواء الحالية فقط أو المجموع التراكمي) 50-60% من القيمة الحالية، فإن الاستبدال هو الخيار الاقتصادي الأمثل.
          </p>
        </div>

      </div>
    </div>
  );
};

export default RepairFeasibilityView;
