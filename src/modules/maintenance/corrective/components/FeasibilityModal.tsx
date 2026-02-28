
import React, { useState, useEffect } from 'react';
import { X, Ban, Calculator, AlertTriangle, CheckCircle2, Scale } from 'lucide-react';
import { Device } from '../../../../core/database/types';

interface FeasibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  currentRepairCost: number;
}

const FeasibilityModal: React.FC<FeasibilityModalProps> = ({ isOpen, onClose, device, currentRepairCost }) => {
  const [costNew, setCostNew] = useState<string>(device.purchaseCost ? device.purchaseCost.toString() : '');
  const [lifeExpectancy, setLifeExpectancy] = useState<string>('10');
  
  // Logic
  const purchaseCost = parseFloat(costNew) || 0;
  const deviceAge = new Date().getFullYear() - new Date(device.installDate).getFullYear();
  const lifeExp = parseFloat(lifeExpectancy) || 10;
  
  // Straight Line Depreciation
  const remainingLifeFactor = Math.max(0.1, (lifeExp - deviceAge) / lifeExp);
  const currentValue = purchaseCost * remainingLifeFactor;
  
  // BER Score
  const berScore = currentValue > 0 ? (currentRepairCost / currentValue) * 100 : 0;
  
  let recommendation = 'REPAIR';
  if (berScore > 80) recommendation = 'REPLACE';
  else if (berScore > 50) recommendation = 'EVALUATE';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                  <Ban className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">جدوى الإصلاح (BER)</h3>
                  <p className="text-xs text-slate-500">تحليل التكلفة مقابل القيمة الحالية</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Score Display */}
            <div className={`p-6 rounded-2xl border-2 text-center transition-colors ${
                recommendation === 'REPLACE' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900' :
                recommendation === 'EVALUATE' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900' :
                'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
            }`}>
                <h2 className="text-4xl font-bold mb-1">{berScore.toFixed(1)}%</h2>
                <p className="text-sm font-bold uppercase tracking-wider mb-2">مؤشر BER</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 rounded-lg text-sm font-bold">
                    {recommendation === 'REPLACE' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {recommendation === 'REPLACE' ? 'توصية بالاستبدال' : recommendation === 'EVALUATE' ? 'يحتاج مراجعة' : 'إصلاح مجدي'}
                </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">تكلفة الإصلاح الحالية (قطع + عمل)</label>
                    <div className="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-500 flex justify-between">
                        <span>{currentRepairCost.toFixed(2)}</span>
                        <span>$</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">سعر الشراء (جديد)</label>
                        <input 
                            type="number" 
                            value={costNew}
                            onChange={(e) => setCostNew(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">العمر الافتراضي (سنوات)</label>
                        <input 
                            type="number" 
                            value={lifeExpectancy}
                            onChange={(e) => setLifeExpectancy(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>
                
                <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <p>عمر الجهاز الحالي: <span className="font-bold text-slate-600 dark:text-slate-300">{deviceAge} سنوات</span></p>
                    <p>القيمة التقديرية الحالية: <span className="font-bold text-slate-600 dark:text-slate-300">${currentValue.toFixed(0)}</span></p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeasibilityModal;
