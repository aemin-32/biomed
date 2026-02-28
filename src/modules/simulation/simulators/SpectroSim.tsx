
import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  ArrowRight, 
  Pipette, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  FlaskConical,
  XCircle,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import LearningObjective from '../components/LearningObjective';

// Helper: Convert Wavelength (nm) to RGB Color String
const getWavelengthColor = (nm: number, alpha: number = 1) => {
  let r = 0, g = 0, b = 0;
  
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / (440 - 380); g = 0; b = 1; }
  else if (nm >= 440 && nm < 490) { r = 0; g = (nm - 440) / (490 - 440); b = 1; }
  else if (nm >= 490 && nm < 510) { r = 0; g = 1; b = -(nm - 510) / (510 - 490); }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / (580 - 510); g = 1; b = 0; }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / (645 - 580); b = 0; }
  else if (nm >= 645 && nm <= 750) { r = 1; g = 0; b = 0; }

  // Intensity correction
  let factor;
  if (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / (420 - 380);
  else if (nm >= 420 && nm < 700) factor = 1.0;
  else if (nm >= 700 && nm <= 750) factor = 0.3 + 0.7 * (750 - nm) / (750 - 700);
  else factor = 0;

  const R = Math.round(r * factor * 255);
  const G = Math.round(g * factor * 255);
  const B = Math.round(b * factor * 255);

  return `rgba(${R}, ${G}, ${B}, ${alpha})`;
};

const SpectroSim = () => {
  // --- State ---
  const [wavelength, setWavelength] = useState(520); // nm (Green is absorbed by Red samples)
  const [concentration, setConcentration] = useState(0); // 0.0 - 2.0 (Simulated Molar)
  const [isCuvetteIn, setIsCuvetteIn] = useState(false);
  const [isLidClosed, setIsLidClosed] = useState(false);
  const [blankValue, setBlankValue] = useState(0);
  const [readout, setReadout] = useState(0);
  const [mode, setMode] = useState<'ABS' | 'TRANS'>('ABS');

  // --- Physics Logic ---
  useEffect(() => {
    // If lid is open, ambient light floods detector -> Error or invalid
    if (!isLidClosed) {
      setReadout(0); // Display stays at 0 or dashes
      return;
    }

    if (!isCuvetteIn) {
      // Empty chamber: 100% Transmittance (Air) => 0 Absorbance
      const rawAbs = 0;
      updateReadout(rawAbs);
      return;
    }

    // Beer-Lambert Simulation
    // Sample is "Red Dye", so it absorbs complementary color (Green ~520nm)
    // Peak Absorbance at 520nm.
    const peakNm = 520;
    const bandWidth = 60; // How wide the absorption spectrum is
    
    // Gaussian-ish curve for absorption spectrum
    const spectrumFactor = Math.exp(-Math.pow(wavelength - peakNm, 2) / (2 * Math.pow(bandWidth, 2)));
    
    // A = coeff * concentration
    // We assume path length (l) = 1cm, coeff is arbitrary for sim
    let rawAbs = (concentration * 1.5) * spectrumFactor;

    // Apply Calibration (Blanking)
    // Abs_displayed = Abs_measured - Abs_blank
    // Ideally, blanking is done with Solvent (Conc=0). 
    // If user blanks with sample, future readings are relative to that sample.
    const finalAbs = Math.max(0, rawAbs - blankValue);

    updateReadout(finalAbs);

  }, [wavelength, concentration, isCuvetteIn, isLidClosed, blankValue, mode]);

  const updateReadout = (abs: number) => {
    // Add tiny sensor noise
    const noise = (Math.random() - 0.5) * 0.002;
    const val = Math.max(0, abs + noise);

    if (mode === 'TRANS') {
        // T = 10^-A
        // If A=0 -> T=1 (100%)
        // If A=1 -> T=0.1 (10%)
        const trans = Math.pow(10, -val) * 100;
        setReadout(trans);
    } else {
        setReadout(val);
    }
  };

  const handleZero = () => {
    if (!isLidClosed) return; // Cannot zero with lid open
    // Calculate current raw absorbance and set it as offset
    // Re-calculating raw logic here for the offset
    const peakNm = 520;
    const bandWidth = 60;
    const spectrumFactor = Math.exp(-Math.pow(wavelength - peakNm, 2) / (2 * Math.pow(bandWidth, 2)));
    const currentRawAbs = isCuvetteIn ? (concentration * 1.5 * spectrumFactor) : 0;
    
    setBlankValue(currentRawAbs);
  };

  // --- Visuals ---
  const beamColor = getWavelengthColor(wavelength, 0.8);
  // The sample color visually is Red (fixed for this sample type), opacity based on concentration
  const sampleVisualColor = `rgba(220, 20, 60, ${0.1 + (concentration * 0.4)})`; 
  
  // Output beam intensity (for visual only)
  // If Transmittance is high, beam is bright. If Low, beam is dim.
  const absForVisual = isCuvetteIn ? (concentration * 1.5 * Math.exp(-Math.pow(wavelength - 520, 2) / (2 * Math.pow(60, 2)))) : 0;
  const transVisual = Math.pow(10, -absForVisual); // 0 to 1
  const outputBeamColor = getWavelengthColor(wavelength, Math.max(0.1, transVisual));

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. Visualizer (Optical Path) */}
      <div className="flex-1 bg-slate-900 rounded-3xl relative overflow-hidden border-4 border-slate-800 shadow-2xl flex flex-col min-h-[350px]">
         
         {/* Background Tech Grid */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>

         {/* Optical Components Container */}
         <div className="flex-1 flex items-center justify-center gap-0 px-8 relative z-10">
            
            {/* Light Source */}
            <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full bg-yellow-100 shadow-[0_0_30px_rgba(253,224,71,0.6)] flex items-center justify-center transition-opacity ${!isLidClosed ? 'opacity-20' : 'opacity-100'}`}>
                    <Sun className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">SOURCE</span>
            </div>

            {/* Beam 1 (Source -> Monochromator) */}
            <div className="h-1 w-16 bg-white shadow-[0_0_10px_white] opacity-50 transition-all duration-300"></div>

            {/* Monochromator (Prism Visual) */}
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[40px] border-b-slate-700 opacity-80 relative">
               <div className="absolute top-10 left-[-20px] text-[8px] text-slate-500 text-center w-[40px]">PRISM</div>
            </div>

            {/* Beam 2 (Mono -> Sample) - Colored */}
            <div className="h-2 flex-1 transition-colors duration-300 relative group" style={{ backgroundColor: isLidClosed ? beamColor : 'transparent', boxShadow: isLidClosed ? `0 0 15px ${beamColor}` : 'none' }}>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {wavelength}nm
                </span>
            </div>

            {/* Sample Chamber */}
            <div className="relative w-24 h-32 border-4 border-slate-600 bg-slate-800/50 rounded-lg flex items-end justify-center overflow-hidden mx-1">
                {/* Lid Visual */}
                <div className={`absolute top-0 left-0 right-0 h-full bg-slate-800 z-20 transition-all duration-500 ease-in-out origin-top border-b-4 border-slate-500 flex items-center justify-center ${isLidClosed ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-10'}`}>
                    <Lock className="w-6 h-6 text-slate-500" />
                </div>

                {/* Cuvette */}
                <div className={`w-12 h-20 border-2 border-white/30 rounded-b-md relative transition-all duration-500 ${isCuvetteIn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ backgroundColor: sampleVisualColor }}>
                    {/* Liquid Level */}
                    <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-t from-black/20 to-transparent"></div>
                    {/* Reflection */}
                    <div className="absolute top-2 left-1 w-1 h-16 bg-white/20 rounded-full"></div>
                </div>
            </div>

            {/* Beam 3 (Sample -> Detector) - Attenuated */}
            <div className="h-2 flex-1 transition-all duration-300" style={{ backgroundColor: isLidClosed ? outputBeamColor : 'transparent', boxShadow: isLidClosed ? `0 0 10px ${outputBeamColor}` : 'none' }}></div>

            {/* Detector */}
            <div className="w-10 h-16 bg-slate-700 rounded-l-xl border-r-4 border-r-green-500 flex items-center justify-center shadow-lg relative">
                <Eye className="w-5 h-5 text-green-400" />
                <span className="absolute -bottom-6 text-[10px] text-slate-500 font-mono">SENSOR</span>
            </div>

         </div>

         {/* Chamber Status Indicator (Top Right) */}
         <div className="absolute top-4 right-4 flex gap-2">
             <span className={`px-2 py-1 rounded text-xs font-bold ${isCuvetteIn ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-500'}`}>
                 {isCuvetteIn ? 'Cuvette Loaded' : 'Empty Chamber'}
             </span>
             <span className={`px-2 py-1 rounded text-xs font-bold ${isLidClosed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 {isLidClosed ? 'Lid Closed' : 'Lid Open'}
             </span>
         </div>
      </div>

      {/* 2. Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
         
         <div className="flex gap-6">
             
             {/* Left: Screen & Main Controls */}
             <div className="flex-1 space-y-4">
                 {/* LCD Screen */}
                 <div className="bg-[#9ea792] p-4 rounded-xl shadow-inner border-4 border-slate-300 dark:border-slate-700 font-mono relative overflow-hidden">
                     <div className="absolute inset-0 bg-black/5 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
                     <div className="flex justify-between items-end relative z-10 text-slate-800">
                         <div>
                             <span className="text-xs font-bold opacity-60 block mb-1">
                                 {wavelength} nm | {mode}
                             </span>
                             <span className="text-4xl font-bold tracking-widest">
                                 {!isLidClosed ? '---' : readout.toFixed(3)}
                             </span>
                         </div>
                         <span className="text-xl font-bold">{mode === 'TRANS' ? '%T' : 'A'}</span>
                     </div>
                 </div>

                 {/* Buttons Row */}
                 <div className="flex gap-2">
                     <button 
                       onClick={() => setMode(mode === 'ABS' ? 'TRANS' : 'ABS')}
                       className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                     >
                        Mode: {mode}
                     </button>
                     <button 
                       onClick={handleZero}
                       disabled={!isLidClosed}
                       className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <RotateCcw className="w-4 h-4" />
                        0.00 / Blank
                     </button>
                 </div>
             </div>

             {/* Right: Interaction Controls */}
             <div className="flex-1 space-y-5">
                 
                 {/* Wavelength Slider */}
                 <div>
                     <label className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                         <span>Wavelength (nm)</span>
                         <span style={{ color: beamColor }} className="drop-shadow-sm">{wavelength} nm</span>
                     </label>
                     <input 
                        type="range" min="400" max="700" step="10" 
                        value={wavelength} onChange={(e) => setWavelength(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-600 dark:accent-slate-400"
                     />
                     <div className="h-1 w-full mt-2 rounded-full bg-gradient-to-r from-purple-500 via-green-500 to-red-500 opacity-50"></div>
                 </div>

                 {/* Sample Concentration */}
                 <div>
                     <label className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                         <span>Sample Concentration (Red Dye)</span>
                         <span className="text-red-500">{concentration.toFixed(1)} M</span>
                     </label>
                     <input 
                        type="range" min="0" max="2" step="0.1" 
                        value={concentration} onChange={(e) => setConcentration(Number(e.target.value))}
                        disabled={!isCuvetteIn}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500 disabled:opacity-50"
                     />
                 </div>

                 {/* Mechanical Controls */}
                 <div className="grid grid-cols-2 gap-2">
                     <button 
                        onClick={() => setIsCuvetteIn(!isCuvetteIn)}
                        disabled={isLidClosed}
                        className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${
                            isCuvetteIn 
                            ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-800' 
                            : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800'
                        } ${isLidClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                        {isCuvetteIn ? <XCircle className="w-4 h-4" /> : <FlaskConical className="w-4 h-4" />}
                        {isCuvetteIn ? 'Remove Cuvette' : 'Insert Sample'}
                     </button>

                     <button 
                        onClick={() => setIsLidClosed(!isLidClosed)}
                        className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all ${
                            !isLidClosed
                            ? 'border-slate-200 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:border-slate-700' 
                            : 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800'
                        }`}
                     >
                        {isLidClosed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {isLidClosed ? 'Open Lid' : 'Close Lid'}
                     </button>
                 </div>

             </div>
         </div>

      </div>

      <LearningObjective text="يوضح هذا النموذج مبدأ قانون بير-لامبرت (Beer-Lambert Law)، حيث تزداد الامتصاصية (Absorbance) بزيادة التركيز (Concentration)، ويكون الامتصاص أقصى ما يمكن عند الطول الموجي المكمل للون العينة." />
    </div>
  );
};

export default SpectroSim;
