
import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Play, 
  Square, 
  Lock, 
  Unlock, 
  Thermometer, 
  Activity, 
  Gauge, 
  Timer,
  RotateCw
} from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

const CentrifugeSim = () => {
  // Configuration State
  const [slots, setSlots] = useState<boolean[]>(new Array(6).fill(false));
  const [targetRpm, setTargetRpm] = useState(3000);
  const [targetTime, setTargetTime] = useState(15); // Seconds
  
  // Physics/Simulation State
  const [currentRpm, setCurrentRpm] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLidOpen, setIsLidOpen] = useState(true);
  const [status, setStatus] = useState<'IDLE' | 'ACCEL' | 'SPINNING' | 'DECEL' | 'FINISHED'>('IDLE');
  const [motorTemp, setMotorTemp] = useState(25); // Celsius
  const [vibration, setVibration] = useState(0); // 0-100%
  const [error, setError] = useState<string | null>(null);

  // Constants
  const ACCEL_RATE = 200; // RPM per tick
  const DECEL_RATE = 150; // RPM per tick
  const TEMP_RATE = 0.05; // Temp rise per tick
  const COOL_RATE = 0.1; // Temp drop per tick

  // Simulation Loop
  useEffect(() => {
    let interval: any;

    if (status !== 'IDLE' || currentRpm > 0 || motorTemp > 25) {
      interval = setInterval(() => {
        // 1. Handle RPM Physics
        setCurrentRpm(prev => {
          if (status === 'ACCEL' || status === 'SPINNING') {
            if (prev < targetRpm) return Math.min(prev + ACCEL_RATE, targetRpm);
            return prev;
          } else if (status === 'DECEL' || status === 'FINISHED' || status === 'IDLE') {
            if (prev > 0) return Math.max(prev - DECEL_RATE, 0);
            return 0;
          }
          return prev;
        });

        // 2. State Transitions based on RPM
        if (status === 'ACCEL' && currentRpm >= targetRpm) {
          setStatus('SPINNING');
        }
        if (status === 'DECEL' && currentRpm <= 0) {
          setStatus('FINISHED');
          // Auto unlock when stopped
          setTimeout(() => setStatus('IDLE'), 1000);
        }

        // 3. Handle Timer
        if (status === 'SPINNING') {
          setTimeLeft(prev => {
            if (prev <= 0) {
              setStatus('DECEL');
              return 0;
            }
            return prev - 0.1; // 100ms interval
          });
        }

        // 4. Handle Temperature (Engineering Aspect)
        setMotorTemp(prev => {
          if (currentRpm > 0) return Math.min(prev + TEMP_RATE, 60); // Heat up
          return Math.max(prev - COOL_RATE, 25); // Cool down
        });

        // 5. Handle Vibration (Based on Balance)
        const balanceFactor = calculateBalanceVector();
        // If speed increases, vibration from imbalance increases exponentially
        const currentVib = (balanceFactor * (currentRpm / 4000) * 100); 
        setVibration(currentVib);

        // Emergency Stop if Vibration too high
        if (currentVib > 80 && status !== 'DECEL') {
           setError("توقف طارئ: اهتزازات عالية جداً (Imbalance Detected)");
           setStatus('DECEL');
        }

      }, 100);
    }

    return () => clearInterval(interval);
  }, [status, currentRpm, targetRpm, slots]); // Dependencies

  // --- Logic Helpers ---

  const calculateBalanceVector = () => {
    let x = 0;
    let y = 0;
    slots.forEach((hasTube, i) => {
      if (hasTube) {
        const angle = (i * 60) * (Math.PI / 180);
        x += Math.cos(angle);
        y += Math.sin(angle);
      }
    });
    return Math.sqrt(x*x + y*y); // Magnitude of imbalance (0 to ~3)
  };

  const toggleSlot = (index: number) => {
    if (!isLidOpen || currentRpm > 0) return;
    const newSlots = [...slots];
    newSlots[index] = !newSlots[index];
    setSlots(newSlots);
    setError(null);
  };

  const toggleLid = () => {
    if (currentRpm > 0) {
      setError("لا يمكن فتح الغطاء أثناء الدوران (Safety Lock Active)");
      return;
    }
    setIsLidOpen(!isLidOpen);
    setError(null);
  };

  const handleStart = () => {
    if (isLidOpen) {
      setError("يجب إغلاق الغطاء أولاً (Lid Open Error)");
      return;
    }
    if (slots.filter(s => s).length === 0) {
      setError("لا يمكن التشغيل بدون عينات (Empty Rotor)");
      return;
    }
    
    // Check extreme imbalance before start (Safety Sensor Simulation)
    if (calculateBalanceVector() > 1.5) {
       setError("نظام الحماية: تم اكتشاف عدم توازن شديد قبل البدء.");
       return;
    }

    setError(null);
    setTimeLeft(targetTime);
    setStatus('ACCEL');
  };

  const handleStop = () => {
    setStatus('DECEL');
  };

  // Visual Calculations
  const rotationSpeedSec = currentRpm > 0 ? 60 / currentRpm : 0;
  // Shake visual: translate based on vibration %
  const shakeStyle = vibration > 5 ? {
     transform: `translate(${Math.random() * vibration * 0.1}px, ${Math.random() * vibration * 0.1}px)`
  } : {};

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. Main Visualizer Area */}
      <div className="flex-1 bg-slate-200 dark:bg-slate-900 rounded-3xl relative overflow-hidden border-4 border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[320px]">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {/* Rotor Assembly */}
        <div className="relative z-10 transition-transform" style={shakeStyle}>
            <div 
                className={`relative w-64 h-64 rounded-full border-8 border-slate-400 dark:border-slate-600 bg-slate-300 dark:bg-slate-800 shadow-2xl flex items-center justify-center transition-all ${currentRpm > 0 ? 'animate-spin' : ''}`} 
                style={{ 
                    animationDuration: `${Math.max(0.05, rotationSpeedSec)}s`,
                    animationTimingFunction: 'linear'
                }}
            >
                {/* Center Hub */}
                <div className="absolute w-16 h-16 bg-slate-500 dark:bg-slate-700 rounded-full z-20 border-4 border-slate-400 flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                </div>
                
                {/* Slots */}
                {slots.map((hasTube, i) => {
                    const rotation = i * 60;
                    return (
                    <div 
                        key={i}
                        onClick={() => toggleSlot(i)}
                        className={`absolute w-12 h-12 -ml-6 -mt-6 top-1/2 left-1/2 rounded-full cursor-pointer transition-all hover:scale-110 flex items-center justify-center shadow-inner group ${
                        hasTube 
                            ? 'bg-blue-500 border-2 border-white' 
                            : 'bg-slate-400/30 border-2 border-dashed border-slate-500'
                        }`}
                        style={{ transform: `rotate(${rotation}deg) translate(0, -95px) rotate(-${rotation}deg)` }}
                    >
                        {hasTube && <div className="w-8 h-8 bg-blue-300 rounded-full opacity-50 blur-[1px]"></div>}
                        <span className={`absolute -top-6 text-xs font-bold select-none ${isLidOpen ? 'text-slate-600 dark:text-slate-400' : 'opacity-0'}`}>{i+1}</span>
                    </div>
                    );
                })}
            </div>
        </div>

        {/* Lid Overlay (Visual Only) */}
        <div 
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center z-20 pointer-events-none ${isLidOpen ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}
        >
            <div className="w-24 h-24 border-4 border-white/20 rounded-full animate-pulse"></div>
        </div>

        {/* Safety Lock Indicator (Physical on Device) */}
        <div className="absolute top-4 right-4 z-30">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors ${
                !isLidOpen ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
                {isLidOpen ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>{isLidOpen ? 'LID OPEN' : 'LID LOCKED'}</span>
            </div>
        </div>

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-x-4 bottom-4 bg-red-500/90 text-white p-4 rounded-xl shadow-lg z-40 animate-in slide-in-from-bottom-5 flex items-start gap-3 backdrop-blur-sm">
             <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
             <div>
                <h4 className="font-bold text-sm">خطأ في التشغيل</h4>
                <p className="text-xs opacity-90">{error}</p>
             </div>
             <button onClick={() => setError(null)} className="mr-auto text-xs font-bold underline bg-white/20 px-2 py-1 rounded hover:bg-white/30">تجاهل</button>
          </div>
        )}
      </div>

      {/* 2. Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
         
         {/* Digital Display */}
         <div className="bg-black rounded-xl p-4 font-mono grid grid-cols-3 gap-4 text-center border-b-4 border-slate-700 relative overflow-hidden">
            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            
            {/* RPM */}
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Speed (RPM)</span>
                <span className={`text-2xl font-bold ${currentRpm > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                    {Math.round(currentRpm)}
                </span>
                <span className="text-[9px] text-slate-500">Target: {targetRpm}</span>
            </div>

            {/* TIME */}
            <div className="flex flex-col items-center border-x border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Time (Min:Sec)</span>
                <span className={`text-2xl font-bold ${timeLeft > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                    {Math.floor(timeLeft / 60)}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </span>
            </div>

            {/* TEMP */}
            <div className="flex flex-col items-center relative">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Motor Temp</span>
                <div className="flex items-center gap-1">
                    <span className={`text-2xl font-bold ${motorTemp > 45 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                        {Math.round(motorTemp)}
                    </span>
                    <span className="text-xs text-slate-500">°C</span>
                </div>
                {/* Vibration Bar */}
                <div className="absolute bottom-0 left-2 right-2 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className={`h-full transition-all duration-300 ${vibration > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(vibration, 100)}%` }}></div>
                </div>
            </div>
         </div>

         {/* Controls Grid */}
         <div className="grid grid-cols-2 gap-4">
             {/* Sliders */}
             <div className="space-y-4">
                <div>
                    <label className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Target RPM</span>
                        <span className="text-blue-600">{targetRpm}</span>
                    </label>
                    <input 
                        type="range" min="1000" max="6000" step="100" 
                        value={targetRpm} onChange={(e) => setTargetRpm(Number(e.target.value))}
                        disabled={status !== 'IDLE'}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
                <div>
                    <label className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Timer (Sec)</span>
                        <span className="text-amber-600">{targetTime}s</span>
                    </label>
                    <input 
                        type="range" min="5" max="60" step="5" 
                        value={targetTime} onChange={(e) => { setTargetTime(Number(e.target.value)); setTimeLeft(Number(e.target.value)); }}
                        disabled={status !== 'IDLE'}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                </div>
             </div>

             {/* Buttons */}
             <div className="grid grid-cols-2 gap-2">
                 <button 
                    onClick={toggleLid}
                    disabled={currentRpm > 0}
                    className={`rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                        isLidOpen 
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300' 
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800'
                    } ${currentRpm > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    {isLidOpen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    <span>{isLidOpen ? 'إغلاق الغطاء' : 'فتح الغطاء'}</span>
                 </button>

                 <button 
                    onClick={status === 'SPINNING' || status === 'ACCEL' ? handleStop : handleStart}
                    className={`rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${
                        status === 'SPINNING' || status === 'ACCEL'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                 >
                    {status === 'SPINNING' || status === 'ACCEL' ? (
                        <>
                           <Square className="w-5 h-5 fill-current" />
                           <span>إيقاف</span>
                        </>
                    ) : (
                        <>
                           <Play className="w-5 h-5 fill-current" />
                           <span>تشغيل</span>
                        </>
                    )}
                 </button>
             </div>
         </div>
      </div>

      <LearningObjective text="يوضح النموذج أهمية (Dynamic Balancing) ونظام (Safety Interlock) الذي يمنع دوران المحرك إذا كان الغطاء مفتوحاً، ومراقبة حرارة المحرك لتفادي (Overheating)." />
    </div>
  );
};

export default CentrifugeSim;
