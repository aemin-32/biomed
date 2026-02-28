
import React, { useState } from 'react';
import { X, Battery, ArrowLeftRight, Calculator, Thermometer, Gauge, Zap } from 'lucide-react';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickToolsModal: React.FC<QuickToolsModalProps> = ({ isOpen, onClose }) => {
  const [activeTool, setActiveTool] = useState<'converter' | 'battery'>('converter');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
           <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
             <Calculator className="w-5 h-5 text-indigo-500" />
             الأدوات المساعدة السريعة
           </h3>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* Tool Switcher */}
        <div className="flex p-2 bg-slate-100 dark:bg-slate-950 mx-4 mt-4 rounded-xl">
            <button 
                onClick={() => setActiveTool('converter')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTool === 'converter' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
            >
                <ArrowLeftRight className="w-4 h-4" />
                محول الوحدات
            </button>
            <button 
                onClick={() => setActiveTool('battery')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTool === 'battery' 
                    ? 'bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
            >
                <Battery className="w-4 h-4" />
                حاسبة البطارية
            </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {activeTool === 'converter' ? <MiniConverter /> : <MiniBatteryCalc />}
        </div>

      </div>
    </div>
  );
};

// --- Mini Sub-Components ---

const MiniConverter = () => {
    const [category, setCategory] = useState<'pressure' | 'temp'>('pressure');
    const [val, setVal] = useState('');
    
    // Simple logic
    const calculate = (input: string, type: 'pressure' | 'temp') => {
        const v = parseFloat(input);
        if (isNaN(v)) return '---';
        
        if (type === 'pressure') {
            // Bar to PSI
            return (v * 14.5038).toFixed(2) + ' PSI';
        } else {
            // C to F
            return ((v * 9/5) + 32).toFixed(1) + ' °F';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-3 justify-center">
                <button 
                    onClick={() => { setCategory('pressure'); setVal(''); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 ${category === 'pressure' ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                >
                    <Gauge className="w-4 h-4" /> ضغط (Bar → PSI)
                </button>
                <button 
                    onClick={() => { setCategory('temp'); setVal(''); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 ${category === 'temp' ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                >
                    <Thermometer className="w-4 h-4" /> حرارة (C → F)
                </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 mb-1 block">القيمة ({category === 'pressure' ? 'Bar' : '°C'})</label>
                    <input 
                        type="number" 
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 text-slate-800 dark:text-white"
                        placeholder="0"
                        autoFocus
                    />
                </div>
                <ArrowLeftRight className="w-6 h-6 text-slate-300" />
                <div className="flex-1 text-right">
                    <label className="text-xs font-bold text-slate-400 mb-1 block">النتيجة</label>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 py-1">
                        {calculate(val, category)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MiniBatteryCalc = () => {
    const [cap, setCap] = useState('');
    const [load, setLoad] = useState('');

    const hours = (parseFloat(cap) && parseFloat(load)) 
        ? ((parseFloat(cap) / parseFloat(load)) * 0.7).toFixed(1) 
        : '--';

    return (
        <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl flex items-center gap-3 border border-green-100 dark:border-green-900/30">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">وقت التشغيل المقدر</p>
                    <p className="text-2xl font-mono font-bold text-green-700 dark:text-green-400">{hours} <span className="text-sm">ساعة</span></p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">سعة البطارية (mAh)</label>
                    <input 
                        type="number" 
                        value={cap}
                        onChange={(e) => setCap(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="3000"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">استهلاك الحمل (mA)</label>
                    <input 
                        type="number" 
                        value={load}
                        onChange={(e) => setLoad(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="500"
                    />
                </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center">يتم احتساب معامل أمان 0.7 تلقائياً</p>
        </div>
    );
};

export default QuickToolsModal;
