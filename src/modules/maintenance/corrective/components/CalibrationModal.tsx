
import React, { useState, useEffect } from 'react';
import { X, Scale, Target, Activity } from 'lucide-react';
import { Device } from '../../../../core/database/types';
import { CALIBRATION_PRESETS } from '../../../tools/data/specStandards';
import PresetSelector from '../../../tools/components/PresetSelector';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

const CalibrationModal: React.FC<CalibrationModalProps> = ({ isOpen, onClose, device }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [standard, setStandard] = useState<string>('');
  const [measured, setMeasured] = useState<string>('');
  const [tolerance, setTolerance] = useState<string>('5');
  
  // Auto-select based on device name
  useEffect(() => {
      if (isOpen) {
          const type = device.type.toLowerCase();
          const name = device.name.toLowerCase();
          const found = CALIBRATION_PRESETS.find(p => type.includes(p.name.toLowerCase()) || name.includes(p.name.toLowerCase()));
          
          if (found) {
              setSelectedPresetId(found.id);
              setStandard(found.standardVal.toString());
              setTolerance(found.tolerance.toString());
          }
          
          if (device.calibrationSpecs?.tolerancePercent) {
              setTolerance(device.calibrationSpecs.tolerancePercent.toString());
          }
      }
  }, [isOpen, device]);

  // Calc Logic
  const stdVal = parseFloat(standard);
  const measVal = parseFloat(measured);
  const tolVal = parseFloat(tolerance);
  let errorPercent = 0;
  let isPass = false;
  let isCalculable = !isNaN(stdVal) && !isNaN(measVal) && stdVal !== 0;

  if (isCalculable) {
      const absError = Math.abs(measVal - stdVal);
      errorPercent = (absError / stdVal) * 100;
      isPass = errorPercent <= tolVal;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Scale className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">فحص المعايرة السريع</h3>
                  <p className="text-xs text-slate-500">التحقق من دقة القراءات</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            <PresetSelector 
                presets={CALIBRATION_PRESETS}
                selectedId={selectedPresetId}
                onSelect={(id) => {
                    setSelectedPresetId(id);
                    const p = CALIBRATION_PRESETS.find(x => x.id === id);
                    if(p) { setStandard(p.standardVal.toString()); setTolerance(p.tolerance.toString()); }
                }}
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Target className="w-3 h-3" /> المرجع (Standard)
                    </label>
                    <input 
                        type="number" 
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> المقاس (Measured)
                    </label>
                    <input 
                        type="number" 
                        value={measured}
                        onChange={(e) => setMeasured(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Result Box */}
            <div className={`p-4 rounded-xl text-center border-2 transition-all ${
                !isCalculable ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700' :
                isPass ? 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
                <p className="text-xs font-bold uppercase mb-1">نسبة الخطأ</p>
                <h2 className="text-3xl font-bold mb-1">{isCalculable ? errorPercent.toFixed(2) + '%' : '--'}</h2>
                <p className="text-xs font-bold">{isCalculable ? (isPass ? 'ناجح (PASS)' : 'فاشل (FAIL)') : 'أدخل القيم'}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationModal;
