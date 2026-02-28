
import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw, Activity, Lock, Check } from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

const DefibSim = () => {
  const [energy, setEnergy] = useState(150);
  const [status, setStatus] = useState<'IDLE' | 'CHARGING' | 'READY' | 'SHOCKED'>('IDLE');
  const [chargeLevel, setChargeLevel] = useState(0);
  const [syncMode, setSyncMode] = useState(false);
  const [rhythmName, setRhythmName] = useState('Ventricular Fibrillation'); // Default shockable

  // Simulated Rhythm Strip Data
  const [stripOffset, setStripOffset] = useState(0);

  useEffect(() => {
      // Animate the strip
      const interval = setInterval(() => {
          setStripOffset(prev => (prev + 2) % 100);
      }, 50);
      return () => clearInterval(interval);
  }, []);

  const handleCharge = () => {
    if (status !== 'IDLE') return;
    setStatus('CHARGING');
    setChargeLevel(0);
    
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setChargeLevel(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatus('READY');
      }
    }, 50); // Fast charge for sim
  };

  const handleShock = () => {
    if (status !== 'READY') return;
    
    // Simulate Shock Delivery
    setStatus('SHOCKED');
    
    // After shock, revert to sinus rhythm if it was V-Fib (Simulation logic)
    setTimeout(() => {
        setRhythmName('NSR (Sinus Rhythm)');
        setStatus('IDLE');
        setChargeLevel(0);
        // Turn off Sync after shock (standard protocol)
        if(syncMode) setSyncMode(false);
    }, 2000); 
  };

  return (
    <div className="flex flex-col h-full space-y-6">
       
       {/* 1. Defib Monitor Screen */}
       <div className="bg-slate-900 border-[12px] border-slate-800 rounded-3xl relative overflow-hidden flex flex-col min-h-[280px] shadow-2xl">
          
          {/* Shock Overlay Effect */}
          {status === 'SHOCKED' && (
              <div className="absolute inset-0 bg-white z-50 animate-ping opacity-80 pointer-events-none"></div>
          )}

          {/* Top Info Bar */}
          <div className="bg-slate-800/80 p-2 flex justify-between items-center text-xs font-bold text-white px-4">
              <span>MANUAL MODE</span>
              <span className={syncMode ? "text-green-400 animate-pulse" : "text-slate-500"}>
                  {syncMode ? 'SYNC ON' : 'ASYNC'}
              </span>
              <span>{new Date().toLocaleTimeString()}</span>
          </div>

          {/* Main Display Area */}
          <div className="flex-1 p-4 flex flex-col justify-between relative">
              
              {/* Energy Large Display */}
              <div className="text-center">
                  <div className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-1">Selected Energy</div>
                  <div className={`text-7xl font-mono font-bold ${status === 'READY' ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                      {energy} <span className="text-2xl text-slate-500">J</span>
                  </div>
              </div>

              {/* Status Message */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                  {status === 'CHARGING' && (
                      <div className="bg-orange-500/90 text-white font-bold py-2 px-6 rounded-xl animate-pulse inline-block shadow-lg">
                          CHARGING {chargeLevel}%
                      </div>
                  )}
                  {status === 'READY' && (
                      <div className="bg-red-600 text-white font-bold py-4 px-8 rounded-xl animate-bounce inline-block shadow-xl border-4 border-red-800">
                          PRESS SHOCK BUTTON
                      </div>
                  )}
                  {status === 'SHOCKED' && (
                      <div className="text-yellow-400 font-bold text-2xl drop-shadow-md">
                          ENERGY DELIVERED
                      </div>
                  )}
              </div>

              {/* Rhythm Strip Simulation at Bottom */}
              <div className="h-16 border-t border-slate-700 mt-4 relative bg-black/40 rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 text-green-500 text-[10px] font-mono">LEAD II</div>
                  <div className="absolute top-2 right-2 text-white text-[10px] font-mono">{rhythmName}</div>
                  
                  {/* Fake Moving Wave */}
                  <svg className="w-full h-full" preserveAspectRatio="none">
                      <path 
                        d="M0,30 L10,30 L15,10 L20,50 L25,30 L40,30 L50,30 L60,30 L65,10 L70,50 L75,30 L90,30" 
                        fill="none" 
                        stroke="#00ff00" 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke"
                        transform={`translate(-${stripOffset}, 0) scale(4, 1)`} 
                      />
                      {syncMode && (
                          // Sync Markers
                          <path 
                            d="M15,5 L18,8 M65,5 L68,8" 
                            stroke="#fff" 
                            strokeWidth="3" 
                            transform={`translate(-${stripOffset}, 0) scale(4, 1)`}
                          />
                      )}
                  </svg>
              </div>
          </div>
       </div>

       {/* 2. Control Panel */}
       <div className="grid grid-cols-4 gap-3">
          
          {/* Energy Selection */}
          <div className="col-span-1 flex flex-col gap-2">
             <div className="text-center font-bold text-xs text-slate-500 bg-slate-200 dark:bg-slate-800 rounded py-1">1. Energy</div>
             <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 h-full">
                {[150, 200].map(val => (
                    <button 
                      key={val}
                      onClick={() => { if(status === 'IDLE') setEnergy(val); }}
                      className={`flex-1 rounded-lg text-sm font-bold transition-colors ${energy === val ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                      disabled={status !== 'IDLE'}
                    >
                        {val}J
                    </button>
                ))}
             </div>
          </div>

          {/* Sync Button (New) */}
          <div className="col-span-1 flex flex-col gap-2">
             <div className="text-center font-bold text-xs text-slate-500 bg-slate-200 dark:bg-slate-800 rounded py-1">Mode</div>
             <button 
                onClick={() => setSyncMode(!syncMode)}
                disabled={status !== 'IDLE'}
                className={`h-full rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                    syncMode 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200'
                }`}
             >
                <Activity className="w-5 h-5" />
                <span>{syncMode ? 'SYNC' : 'ASYNC'}</span>
             </button>
          </div>

          {/* Charge Button */}
          <div className="col-span-1 flex flex-col gap-2">
             <div className="text-center font-bold text-xs text-slate-500 bg-slate-200 dark:bg-slate-800 rounded py-1">2. Charge</div>
             <button 
                onClick={handleCharge}
                disabled={status !== 'IDLE'}
                className={`h-full rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                    status === 'IDLE' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-slate-300 cursor-not-allowed'
                }`}
             >
                <RefreshCw className={`w-6 h-6 ${status === 'CHARGING' ? 'animate-spin' : ''}`} />
                <span className="text-xs">CHARGE</span>
             </button>
          </div>

          {/* Shock Button */}
          <div className="col-span-1 flex flex-col gap-2">
             <div className="text-center font-bold text-xs text-slate-500 bg-slate-200 dark:bg-slate-800 rounded py-1">3. Shock</div>
             <button 
                onClick={handleShock}
                disabled={status !== 'READY'}
                className={`h-full rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                    status === 'READY' ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-300 animate-pulse' : 'bg-slate-300 cursor-not-allowed'
                }`}
             >
                <Zap className="w-6 h-6 fill-current" />
                <span className="text-xs">SHOCK</span>
             </button>
          </div>
       </div>

       <LearningObjective text="يوضح النموذج الفرق بين الصدمة غير المتزامنة (Defibrillation) المستخدمة في توقف القلب (Cardiac Arrest)، والصدمة المتزامنة (Cardioversion) التي تتزامن مع موجة R لتجنب إحداث رجفان بطيني." />
    </div>
  );
};

export default DefibSim;
