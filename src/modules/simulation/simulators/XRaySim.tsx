
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Settings2, 
  Image as ImageIcon, 
  AlertTriangle, 
  Scan, 
  Aperture,
  Radiation
} from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

const XRaySim = () => {
  // --- Physics Parameters ---
  const [kvp, setKvp] = useState(70); // Kilovoltage Peak (Contrast)
  const [mas, setMas] = useState(20); // Milliampere-seconds (Density/Brightness)
  const [isExposing, setIsExposing] = useState(false);
  const [imageState, setImageState] = useState<'READY' | 'EXPOSED'>('READY');
  
  // --- Simulation Logic ---
  // 1. Contrast (kVp): Lower kVp = High Contrast (Black/White). Higher kVp = Low Contrast (Many Grays).
  //    In CSS, contrast(100%) is normal. 
  //    Sim: 40kVp -> contrast(150%), 120kVp -> contrast(70%)
  const contrastVal = 100 + (70 - kvp) * 1.5; 

  // 2. Brightness (mAs): Low mAs = Dark/Noisy. High mAs = Bright/Burned.
  //    Sim: 5 mAs -> brightness(40%), 100 mAs -> brightness(150%)
  //    Optimal is around 20-40 mAs for this "virtual phantom"
  const brightnessVal = 30 + (mas * 1.5);

  // 3. Noise (Quantum Mottle): Low mAs = High Noise.
  const noiseOpacity = Math.max(0, (40 - mas) / 50); // Visible only when mAs < 40

  const handleExposure = () => {
    setIsExposing(true);
    // Beep Sound Logic could go here
    setTimeout(() => {
      setIsExposing(false);
      setImageState('EXPOSED');
    }, 800); // 0.8s Exposure time sim
  };

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. X-Ray Detector View (The Image) */}
      <div className="flex-1 bg-black rounded-3xl relative overflow-hidden border-8 border-slate-800 shadow-2xl flex items-center justify-center min-h-[350px]">
         
         {/* Status Indicators */}
         <div className="absolute top-4 left-4 z-20 flex gap-2">
             <span className={`px-2 py-1 rounded text-xs font-bold font-mono transition-colors ${isExposing ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                 {isExposing ? 'X-RAY ON' : 'STANDBY'}
             </span>
             {imageState === 'EXPOSED' && (
                 <span className="px-2 py-1 rounded text-xs font-bold font-mono bg-blue-900/50 text-blue-400 border border-blue-800">
                     EI: {(mas * kvp / 10).toFixed(0)}
                 </span>
             )}
         </div>

         {/* Collimator Light Field (Visual Guide) */}
         {imageState === 'READY' && !isExposing && (
             <div className="absolute w-64 h-80 border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] flex items-center justify-center">
                 <div className="w-4 h-4 border-l border-t border-yellow-500/50 absolute top-0 left-0"></div>
                 <div className="w-4 h-4 border-r border-t border-yellow-500/50 absolute top-0 right-0"></div>
                 <div className="w-4 h-4 border-l border-b border-yellow-500/50 absolute bottom-0 left-0"></div>
                 <div className="w-4 h-4 border-r border-b border-yellow-500/50 absolute bottom-0 right-0"></div>
                 <span className="text-yellow-500/20 font-bold text-xs">FIELD OF VIEW</span>
             </div>
         )}

         {/* The "Patient" (Image) */}
         <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900">
             
             {/* X-Ray Source Image (Chest X-Ray) */}
             <img 
                src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800" 
                alt="X-Ray Phantom" 
                className={`max-h-full max-w-full object-contain transition-all duration-300 ${imageState === 'READY' && !isExposing ? 'opacity-0' : 'opacity-100'}`}
                style={{
                    filter: `
                        grayscale(100%) 
                        contrast(${contrastVal}%) 
                        brightness(${brightnessVal}%) 
                        invert(0)
                    `
                }}
             />

             {/* Noise Layer (Grain) */}
             <div 
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${noiseOpacity}'/%3E%3C/svg%3E")`,
                    opacity: noiseOpacity,
                    display: imageState === 'EXPOSED' ? 'block' : 'none'
                }}
             ></div>

             {/* Exposure Flash Effect */}
             <div className={`absolute inset-0 bg-white transition-opacity duration-75 pointer-events-none ${isExposing ? 'opacity-20' : 'opacity-0'}`}></div>
         </div>

         {/* Radiation Warning Overlay */}
         {isExposing && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-yellow-500 animate-pulse bg-black/50 px-4 py-2 rounded-full border border-yellow-500/50">
                 <Radiation className="w-5 h-5" />
                 <span className="font-bold text-xs tracking-widest">RADIATION EMISSION</span>
             </div>
         )}

      </div>

      {/* 2. Console Controls */}
      <div className="bg-slate-200 dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm relative overflow-hidden">
         {/* Texture */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '4px 4px' }}></div>

         <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
             
             {/* Parameters */}
             <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                 
                 {/* kVp Control */}
                 <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner">
                     <div className="flex justify-between items-end mb-2">
                         <span className="text-slate-500 text-xs font-bold uppercase">Tube Voltage</span>
                         <span className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{kvp} <span className="text-sm text-slate-400">kVp</span></span>
                     </div>
                     <input 
                        type="range" min="40" max="120" step="1" 
                        value={kvp} onChange={(e) => setKvp(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     />
                     <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-bold">
                         <span>High Contrast</span>
                         <span>Low Contrast</span>
                     </div>
                 </div>

                 {/* mAs Control */}
                 <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner">
                     <div className="flex justify-between items-end mb-2">
                         <span className="text-slate-500 text-xs font-bold uppercase">Tube Current</span>
                         <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{mas} <span className="text-sm text-slate-400">mAs</span></span>
                     </div>
                     <input 
                        type="range" min="1" max="100" step="1" 
                        value={mas} onChange={(e) => setMas(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                     />
                     <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-bold">
                         <span>Noisy/Dark</span>
                         <span>Burned/Bright</span>
                     </div>
                 </div>

             </div>

             {/* Exposure Button */}
             <div className="shrink-0">
                 <button 
                    onMouseDown={handleExposure}
                    disabled={isExposing}
                    className={`w-24 h-24 rounded-full border-4 border-slate-300 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95 active:shadow-inner ${
                        isExposing 
                        ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.5)]' 
                        : 'bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-700 dark:to-slate-800 hover:border-slate-400'
                    }`}
                 >
                    <Zap className={`w-8 h-8 mb-1 ${isExposing ? 'text-black fill-black' : 'text-slate-400'}`} />
                    <span className={`text-[10px] font-bold uppercase ${isExposing ? 'text-black' : 'text-slate-500'}`}>
                        Expose
                    </span>
                 </button>
             </div>

         </div>
      </div>

      <LearningObjective text="يوضح هذا النموذج العلاقة بين عوامل التصوير: (kVp) يتحكم في اختراقية الأشعة والتباين (Contrast)، بينما (mAs) يتحكم في كمية الأشعة وكثافة الصورة (Density). لاحظ ظهور التشويش (Noise) عند استخدام mAs منخفض." />
    </div>
  );
};

export default XRaySim;
