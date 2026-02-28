
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, ZapOff, Settings, Volume2, VolumeX } from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

type RhythmType = 'NSR' | 'BRADY' | 'TACHY' | 'VFIB' | 'ASYSTOLE';

const ECGSim = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Simulation State
  const [rhythm, setRhythm] = useState<RhythmType>('NSR');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [gain, setGain] = useState(1);
  const [speed, setSpeed] = useState(1);

  // Vitals State (Computed based on Rhythm)
  const [displayHR, setDisplayHR] = useState(80);
  const [spo2, setSpo2] = useState(98);
  const [bp, setBp] = useState('120/80');

  // Animation Refs
  const xRef = useRef(0);
  const pointsRef = useRef<number[]>([]);
  const requestRef = useRef<number>(0);
  const lastBeatTime = useRef(0);

  // Rhythm Configurations
  const RHYTHMS: Record<RhythmType, { label: string; baseHR: number; noise: number }> = {
    'NSR': { label: 'Normal Sinus Rhythm', baseHR: 75, noise: 0.5 },
    'BRADY': { label: 'Sinus Bradycardia', baseHR: 45, noise: 0.5 },
    'TACHY': { label: 'Sinus Tachycardia', baseHR: 130, noise: 1 },
    'VFIB': { label: 'Ventricular Fibrillation', baseHR: 0, noise: 15 }, // Chaos
    'ASYSTOLE': { label: 'Asystole (Flatline)', baseHR: 0, noise: 0.2 }
  };

  // Update Vitals based on Rhythm
  useEffect(() => {
    const config = RHYTHMS[rhythm];
    // Randomize HR slightly around base
    if (rhythm === 'VFIB' || rhythm === 'ASYSTOLE') {
        setDisplayHR(0);
        setSpo2(0);
        setBp('---/---');
    } else {
        const randomOffset = Math.floor(Math.random() * 5) - 2;
        setDisplayHR(config.baseHR + randomOffset);
        setSpo2(rhythm === 'NSR' ? 98 : 95);
        setBp(rhythm === 'TACHY' ? '140/90' : rhythm === 'BRADY' ? '110/70' : '120/80');
    }
  }, [rhythm]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const baseline = height / 2;

    // Drawing Loop
    const draw = () => {
      // 1. Draw Background (Medical Grid)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Small grid (5mm)
      for (let i = 0; i < width; i += 10) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      for (let i = 0; i < height; i += 10) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
      ctx.stroke();
      
      // Major grid (25mm)
      ctx.strokeStyle = '#333333';
      ctx.beginPath();
      for (let i = 0; i < width; i += 50) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      for (let i = 0; i < height; i += 50) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
      ctx.stroke();

      // 2. Calculate Next Point
      const currentConfig = RHYTHMS[rhythm];
      const time = Date.now() / 1000;
      const moveSpeed = 2 * speed; // Pixels per frame
      xRef.current = (xRef.current + moveSpeed) % width;
      
      // Clear the "scan bar" ahead of the drawing point
      ctx.fillStyle = '#000000';
      ctx.fillRect(xRef.current, 0, 20, height); // Eraser bar

      // Generate Waveform Y value
      let y = 0;

      if (rhythm === 'VFIB') {
          // Chaos wave
          y = (Math.sin(time * 10) * 10 + Math.sin(time * 23) * 10 + Math.random() * 10) * gain;
      } else if (rhythm === 'ASYSTOLE') {
          // Flatline with tiny noise
          y = (Math.random() - 0.5) * 2;
      } else {
          // P-QRS-T Logic
          const bps = currentConfig.baseHR / 60;
          const beatDuration = 1 / bps;
          const cycleTime = time % beatDuration; // Time within current beat
          const progress = cycleTime / beatDuration; // 0.0 to 1.0

          // Scale amplitudes by Gain
          const P_AMP = 5 * gain;
          const Q_AMP = 5 * gain;
          const R_AMP = 40 * gain;
          const S_AMP = 10 * gain;
          const T_AMP = 8 * gain;

          // Simple ECG Complex Math approximation
          if (progress > 0.1 && progress < 0.2) y = -Math.sin((progress - 0.1) * 10 * Math.PI) * P_AMP; // P
          else if (progress > 0.3 && progress < 0.32) y = (progress - 0.3) * 100 * Q_AMP; // Q
          else if (progress > 0.32 && progress < 0.36) y = -R_AMP + Math.abs(progress - 0.34) * 500; // R spike
          else if (progress > 0.36 && progress < 0.38) y = S_AMP - (progress - 0.38) * 100; // S
          else if (progress > 0.5 && progress < 0.7) y = -Math.sin((progress - 0.5) * 5 * Math.PI) * T_AMP; // T
          
          // Add baseline wander/noise
          y += (Math.random() - 0.5) * 2;
      }

      // Store Point
      pointsRef.current[Math.floor(xRef.current)] = y;

      // Draw the Green Trace
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#00ff00';
      
      ctx.beginPath();
      // Draw previous 100 points or so to avoid redrawing whole canvas every frame
      // Actually, standard way is to clear rect ahead and draw lines connecting history
      // Simplified: We redraw a segment behind x
      
      // Let's draw the trail
      // This is a simplified "Scan" effect where we keep the buffer
      // But for React Canvas, simpler to just redraw valid points in the buffer?
      // No, for "Scanner" effect, we just draw the new line segment from previous X
      
      const prevX = xRef.current - moveSpeed;
      if (prevX > 0) {
          ctx.moveTo(prevX, baseline + pointsRef.current[Math.floor(prevX)]);
          ctx.lineTo(xRef.current, baseline + y);
          ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [rhythm, gain, speed]);

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. Patient Monitor Screen */}
      <div className="flex-1 bg-black rounded-3xl border-[10px] border-slate-800 relative overflow-hidden shadow-2xl flex">
         
         {/* Sidebar Vitals */}
         <div className="w-1/4 h-full border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between p-4">
            {/* HR */}
            <div>
                <div className="text-green-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                    <Heart className={`w-4 h-4 ${rhythm !== 'ASYSTOLE' ? 'animate-pulse' : ''}`} /> HR (bpm)
                </div>
                <div className={`text-5xl font-mono font-bold ${rhythm === 'VFIB' || rhythm === 'ASYSTOLE' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                    {displayHR}
                </div>
            </div>

            {/* SpO2 */}
            <div>
                <div className="text-cyan-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                    <Activity className="w-4 h-4" /> SpO2 (%)
                </div>
                <div className="text-4xl font-mono font-bold text-cyan-400">
                    {spo2}
                </div>
            </div>

            {/* BP */}
            <div>
                <div className="text-orange-400 text-xs font-bold uppercase mb-1">NIBP (mmHg)</div>
                <div className="text-2xl font-mono font-bold text-orange-400">
                    {bp}
                </div>
            </div>
         </div>

         {/* ECG Canvas Area */}
         <div className="flex-1 relative bg-black">
             <div className="absolute top-2 left-2 text-green-500 text-xs font-mono font-bold">II 1mV</div>
             <canvas 
                ref={canvasRef} 
                width={600} 
                height={300} 
                className="w-full h-full"
             />
         </div>
         
         {/* Alarm Overlay */}
         {(rhythm === 'VFIB' || rhythm === 'ASYSTOLE') && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-lg font-bold animate-bounce shadow-lg shadow-red-900/50 flex items-center gap-2 z-20">
                 <ZapOff className="w-5 h-5" />
                 <span>CARDIAC ARREST - CODE BLUE</span>
             </div>
         )}
      </div>

      {/* 2. Controls */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
         
         <div className="grid grid-cols-2 gap-4">
             {/* Rhythm Selector */}
             <div>
                 <label className="block text-xs font-bold text-slate-500 mb-2">النظم القلبي (Rhythm)</label>
                 <select 
                    value={rhythm}
                    onChange={(e) => setRhythm(e.target.value as RhythmType)}
                    className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                 >
                     {Object.entries(RHYTHMS).map(([key, val]) => (
                         <option key={key} value={key}>{val.label}</option>
                     ))}
                 </select>
             </div>

             {/* Gain & Speed */}
             <div className="flex gap-2">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Gain (x{gain})</label>
                    <input 
                        type="range" min="0.5" max="3" step="0.5"
                        value={gain} onChange={(e) => setGain(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-2">Speed (x{speed})</label>
                    <input 
                        type="range" min="0.5" max="2" step="0.5"
                        value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                 </div>
             </div>
         </div>

         <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4">
             <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    soundEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}
             >
                 {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                 {soundEnabled ? 'الصوت مفعل' : 'الصوت مكتوم'}
             </button>
             <p className="text-[10px] text-slate-400">
                 محاكاة المراقبة السريرية (Bedside Monitor Simulation)
             </p>
         </div>
      </div>

      <LearningObjective text="يتعلم المهندس كيفية التعرف على الإشارات الحيوية غير الطبيعية، وضبط إعدادات الكسب (Gain) والسرعة (Sweep Speed) للحصول على أفضل إشارة للتشخيص، والتمييز بين الإشارة الحقيقية والضوضاء." />
    </div>
  );
};

export default ECGSim;
