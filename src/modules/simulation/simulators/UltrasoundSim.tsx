
import React, { useState, useEffect, useRef } from 'react';
import { 
  Waves, 
  Settings2, 
  Search, 
  Activity, 
  ArrowDown, 
  Maximize,
  SlidersHorizontal
} from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

const UltrasoundSim = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Physics Parameters
  const [gain, setGain] = useState(50); // Master Gain (0-100)
  const [depth, setDepth] = useState(15); // Depth in cm (5-20)
  const [frequency, setFrequency] = useState(3.5); // MHz (2-10)
  
  // TGC (Time Gain Compensation) - Near, Mid, Far
  const [tgc, setTgc] = useState({ near: 0, mid: 0, far: 0 }); // -20 to +20

  // Animation State
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Drawing Function
    const draw = () => {
      // Clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Define Sector Shape (The "Pie")
      const cx = width / 2;
      const cy = 0; // Origin at top center
      const maxRadius = height;
      const angleWidth = Math.PI / 3; // 60 degrees sector

      // Generate Noise (Speckle) & Targets
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Factors
      const gainFactor = gain / 50; 
      // Higher freq = Higher attenuation per cm
      const attenuationCoeff = frequency * 0.5; 
      // Higher freq = Finer speckle (simulated by noise density/size roughly here)
      
      for (let y = 0; y < height; y++) {
        const radius = y;
        // Normalize depth (0 to 1) relative to current Depth setting
        // Screen height always represents `depth` cm.
        // So pixel y represents: (y / height) * depth cm
        const depthCm = (y / height) * depth;

        // Calculate Attenuation (Loss of signal with depth)
        // Attenuation (dB) ~ Freq * Depth
        const attenuation = depthCm * attenuationCoeff * 10; // amplified for visual

        // Calculate TGC Gain addition based on zone
        let tgcGain = 0;
        if (y < height * 0.33) tgcGain = tgc.near;
        else if (y < height * 0.66) tgcGain = tgc.mid;
        else tgcGain = tgc.far;

        // Net Signal Power
        // Base Noise (Tissue Texture)
        // We use pseudo-random based on x,y to keep texture static but noisy
        
        for (let x = 0; x < width; x++) {
          // Check if pixel is within Sector
          const dx = x - cx;
          const dy = y - cy;
          const pixelAngle = Math.atan2(dx, dy);
          const pixelRadius = Math.sqrt(dx*dx + dy*dy);

          if (Math.abs(pixelAngle) < angleWidth / 2 && pixelRadius < maxRadius) {
             // It's inside the sector
             
             // 1. Base Tissue Echogenicity (Random Speckle)
             let signal = (Math.random() * 50 + 20); 

             // 2. Add Targets (Simulated Cysts/Stones)
             // Cyst at 5cm (Anechoic/Black)
             // Stone at 10cm (Hyperechoic/Bright + Shadow)
             
             const target1Y = (5 / depth) * height; // 5cm target
             const target2Y = (10 / depth) * height; // 10cm target
             
             // Cyst (Dark Circle)
             if (Math.sqrt((x-cx)*(x-cx) + (y-target1Y)*(y-target1Y)) < 20) {
                 signal = 5; // Very low signal (Fluid)
             }

             // Stone (Bright Circle)
             if (Math.sqrt((x-(cx+40))*(x-(cx+40)) + (y-target2Y)*(y-target2Y)) < 15) {
                 signal = 200; // Very high signal (Calcification)
             }
             // Acoustic Shadow behind Stone
             if (y > target2Y && Math.abs(x - (cx+40)) < 15) {
                 signal *= 0.2; // Shadowing
             }

             // 3. Apply Gain, TGC, Attenuation
             let finalBrightness = signal * gainFactor + (tgcGain * 2) - attenuation;
             
             // 4. Frequency Blurring (Simulated by contrast reduction)
             // Low freq = blurry (not implemented fully here, simpler)
             
             finalBrightness = Math.max(0, Math.min(255, finalBrightness));

             const index = (y * width + x) * 4;
             data[index] = finalBrightness;     // R
             data[index + 1] = finalBrightness; // G
             data[index + 2] = finalBrightness; // B
             data[index + 3] = 255; // Alpha
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw Overlay UI (Scale Markers)
      ctx.fillStyle = '#00ff00';
      ctx.font = '10px monospace';
      for (let i = 1; i < depth; i++) {
          const yPos = (i / depth) * height;
          if (yPos < height) {
              ctx.fillRect(width/2 - 2, yPos, 4, 1);
              if (i % 5 === 0) ctx.fillText(`${i}cm`, width/2 + 5, yPos + 3);
          }
      }
    };

    draw();

  }, [gain, depth, frequency, tgc]);

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. Screen */}
      <div className="flex-1 bg-black rounded-3xl border-[10px] border-slate-800 relative overflow-hidden flex flex-col shadow-2xl">
         
         {/* Top Info Header */}
         <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
             <div className="text-slate-400 text-xs font-mono space-y-1">
                 <p><span className="text-white font-bold">MI:</span> 0.7 <span className="text-white font-bold ml-2">TIS:</span> 0.4</p>
                 <p>Gen. ABDOMEN</p>
                 <p>{frequency} MHz / {depth} cm</p>
             </div>
             <div className="text-slate-400 text-xs font-mono text-right">
                 <p className="text-white font-bold">BioMed General</p>
                 <p>{new Date().toLocaleTimeString()}</p>
             </div>
         </div>

         {/* Canvas */}
         <canvas 
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-full object-contain"
         />

         {/* TGC Overlay Visual (Right Side) */}
         <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-50 pointer-events-none">
             <div className="w-1 h-8 bg-white/20 rounded-full relative">
                 <div className="absolute w-2 h-2 bg-yellow-400 rounded-full -left-0.5" style={{ left: `${(tgc.near + 20) / 40 * 100}%` }}></div>
             </div>
             <div className="w-1 h-8 bg-white/20 rounded-full relative">
                 <div className="absolute w-2 h-2 bg-yellow-400 rounded-full -left-0.5" style={{ left: `${(tgc.mid + 20) / 40 * 100}%` }}></div>
             </div>
             <div className="w-1 h-8 bg-white/20 rounded-full relative">
                 <div className="absolute w-2 h-2 bg-yellow-400 rounded-full -left-0.5" style={{ left: `${(tgc.far + 20) / 40 * 100}%` }}></div>
             </div>
         </div>
      </div>

      {/* 2. Controls */}
      <div className="bg-slate-200 dark:bg-slate-900 p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-sm">
         <div className="flex gap-6">
             
             {/* Left: Main Knobs */}
             <div className="flex-1 grid grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-300 dark:border-slate-800">
                     <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                         <span>Gain (B-Mode)</span>
                         <span className="text-indigo-500">{gain}%</span>
                     </label>
                     <input 
                        type="range" min="0" max="100" 
                        value={gain} onChange={(e) => setGain(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                     />
                 </div>
                 
                 <div className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-300 dark:border-slate-800">
                     <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                         <span>Frequency</span>
                         <span className="text-purple-500">{frequency} MHz</span>
                     </label>
                     <input 
                        type="range" min="2" max="10" step="0.5"
                        value={frequency} onChange={(e) => setFrequency(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                     />
                     <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-bold">
                         <span>Penetration</span>
                         <span>Resolution</span>
                     </div>
                 </div>

                 <div className="col-span-2 bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-300 dark:border-slate-800">
                     <label className="text-xs font-bold text-slate-500 mb-2 flex justify-between">
                         <span>Depth</span>
                         <span className="text-blue-500">{depth} cm</span>
                     </label>
                     <input 
                        type="range" min="5" max="20" step="1"
                        value={depth} onChange={(e) => setDepth(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                     />
                 </div>
             </div>

             {/* Right: TGC Sliders */}
             <div className="w-1/3 bg-slate-300 dark:bg-slate-800 p-4 rounded-2xl border border-slate-400 dark:border-slate-700 flex flex-col justify-between">
                 <div className="text-center text-[10px] font-bold text-slate-500 uppercase mb-2">TGC Controls</div>
                 
                 {['near', 'mid', 'far'].map((zone) => (
                     <div key={zone} className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-slate-500 uppercase w-6">{zone}</span>
                         <input 
                            type="range" min="-30" max="30"
                            value={(tgc as any)[zone]} 
                            onChange={(e) => setTgc({...tgc, [zone]: Number(e.target.value)})}
                            className="flex-1 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                         />
                     </div>
                 ))}
             </div>

         </div>
      </div>

      <LearningObjective text="يوضح النموذج العلاقة العكسية بين التردد (Frequency) والاختراق (Penetration)، وكيفية استخدام معوض الكسب الزمني (TGC) لتصحيح فقدان الإشارة في الأعماق المختلفة (Attenuation Compensation)." />
    </div>
  );
};

export default UltrasoundSim;
