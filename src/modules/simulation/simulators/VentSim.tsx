
import React, { useState } from 'react';
import { Wind, Siren, RefreshCw, AlertTriangle } from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

const VentSim = () => {
  const [tv, setTv] = useState(500); 
  const [rr, setRr] = useState(12);  
  const [isKinked, setIsKinked] = useState(false);

  const cycleTime = 60 / rr; 
  const scale = 0.8 + (tv / 1000); 

  return (
    <div className="flex flex-col h-full">
        
        <div className="flex-1 bg-slate-900 rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-800 min-h-[300px]">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {isKinked && (
                <div className="absolute inset-0 z-20 bg-red-500/20 flex items-center justify-center animate-pulse">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-3">
                        <Siren className="w-6 h-6 animate-bounce" />
                        HIGH PRESSURE ALARM
                    </div>
                </div>
            )}

            <div 
               className="relative z-10 text-cyan-400 transition-transform ease-in-out"
               style={{ 
                   transitionDuration: isKinked ? '0s' : `${cycleTime/2}s`,
                   transform: isKinked ? 'scale(0.9)' : `scale(${scale})`,
                   animation: isKinked ? 'none' : `breath ${cycleTime}s infinite ease-in-out`
               }}
            >
               <Wind className="w-32 h-32 fill-cyan-400/20" />
            </div>

            <div className="absolute top-0 w-2 h-1/2 bg-slate-700 left-1/2 -translate-x-1/2 transition-all">
                {isKinked && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white font-bold text-xs">X</span>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Tidal Volume (TV)</span>
                        <span className="text-cyan-600">{tv} ml</span>
                    </label>
                    <input 
                        type="range" min="300" max="800" step="50"
                        value={tv} onChange={(e) => setTv(Number(e.target.value))}
                        disabled={isKinked}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
                <div>
                    <label className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Resp. Rate (RR)</span>
                        <span className="text-cyan-600">{rr} bpm</span>
                    </label>
                    <input 
                        type="range" min="10" max="30" step="1"
                        value={rr} onChange={(e) => setRr(Number(e.target.value))}
                        disabled={isKinked}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>

            <button 
               onClick={() => setIsKinked(!isKinked)}
               className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                   isKinked 
                   ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                   : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
               }`}
            >
                {isKinked ? (
                    <>
                        <RefreshCw className="w-5 h-5" />
                        <span>إصلاح الانسداد (Unkink Tube)</span>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="w-5 h-5" />
                        <span>محاكاة انسداد الأنبوب (Simulate Kink)</span>
                    </>
                )}
            </button>
        </div>

        <LearningObjective text="يوضح هذا النموذج العلاقة بين انسداد مجرى الهواء (Airway Obstruction) وارتفاع ضغط الجهاز (High Pressure Alarm) وتأثيره على توقف التوصيل الهوائي." />
        
        <style>{`
          @keyframes breath {
            0%, 100% { transform: scale(0.9); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
        `}</style>
    </div>
  );
};

export default VentSim;
