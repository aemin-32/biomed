
import React from 'react';
import { 
  ScanBarcode, 
  FileText, 
  BrainCircuit, 
  CheckCircle2, 
  Lock, 
  Database, 
  Wrench, 
  Stethoscope, 
  History, 
  MapPin, 
  WifiOff, 
  Recycle, 
  Activity, 
  Zap, 
  Box, 
  Scale, 
  Ban, 
  ArrowLeftRight, 
  Warehouse, 
  Layers, 
  ArrowRight, 
  Network, 
  Gamepad2, 
  Play, 
  Shield, 
  Upload
} from 'lucide-react';

interface PosterDesignProps {
  id: string; 
  customQrImage?: string | null;
  onUploadQr?: () => void;
}

const PosterDesign: React.FC<PosterDesignProps> = ({ id, customQrImage, onUploadQr }) => {
  // Standard A4 Dimensions at 96 DPI (Web Standard)
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  return (
    <div 
        id={id}
        className="bg-slate-950 text-white shadow-2xl overflow-hidden flex flex-col relative shrink-0 font-sans"
        style={{ 
            width: `${A4_WIDTH}px`, 
            height: `${A4_HEIGHT}px`,
            margin: '0 auto', 
            position: 'relative',
            backgroundColor: '#020617' 
        }}
    >
        {/* --- Background Effects --- */}
        {/* Gradient Mesh */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" 
             style={{ 
                 background: 'radial-gradient(circle at 0% 0%, #4f46e5 0%, transparent 40%), radial-gradient(circle at 100% 100%, #06b6d4 0%, transparent 40%)' 
             }}>
        </div>
        {/* Hex Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ 
                 backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l25.98 15v30L30 60 4.02 45V15z\' fill-opacity=\'0.2\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                 backgroundSize: '30px 30px'
             }}>
        </div>

        {/* --- 1. HEADER (Branding) --- */}
        <div className="relative z-10 pt-14 px-12 text-center">
            <div className="inline-flex items-center gap-3 mb-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300">Hospital Engineering System</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter mb-1 text-white drop-shadow-2xl">
                BioMed <span className="text-indigo-500">OS</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium tracking-widest uppercase opacity-80">
                Complete Asset Lifecycle Management
            </p>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="flex-1 px-10 py-6 grid grid-rows-[auto_auto_auto] gap-6 relative z-10">
            
            {/* === ZONE 1: OPERATIONS & SIMULATION (Split Row) === */}
            <div className="grid grid-cols-3 gap-6">
                
                {/* 1.A THE OPERATIONS LOOP (2/3 Width) */}
                <div className="col-span-2 bg-slate-900/80 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden backdrop-blur-md shadow-2xl flex flex-col justify-between">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="tracking-wide text-slate-100">OPERATIONS LOOP</span>
                        </h3>

                        <div className="flex items-center justify-between relative px-2 mb-4">
                            {/* Connecting Line (Behind) */}
                            <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-full z-0"></div>
                            <div className="absolute top-1/2 left-8 right-1/2 h-1 bg-gradient-to-r from-rose-500/50 to-indigo-500/50 -translate-y-full z-0"></div>
                            <div className="absolute top-1/2 left-1/2 right-8 h-1 bg-gradient-to-r from-indigo-500/50 to-emerald-500/50 -translate-y-full z-0"></div>

                            {/* Step 1: Medical Staff */}
                            <div className="relative z-10 flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl border-2 border-rose-500/30 flex items-center justify-center shadow-lg group-hover:border-rose-500 transition-colors">
                                    <Stethoscope className="w-8 h-8 text-rose-400" />
                                </div>
                                <div className="text-center">
                                    <h4 className="font-bold text-white text-sm">Report</h4>
                                </div>
                            </div>

                            {/* Step 2: Engineer (Center - Highlighted) */}
                            <div className="relative z-20 flex flex-col items-center gap-2 -mt-4">
                                <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] border-4 border-indigo-400 relative group cursor-pointer">
                                    <ScanBarcode className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 border-2 border-white/20 rounded-[28px] m-1"></div>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-black text-white text-xl tracking-tight">SCAN</h4>
                                </div>
                            </div>

                            {/* Step 3: Record */}
                            <div className="relative z-10 flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl border-2 border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:border-emerald-500 transition-colors">
                                    <History className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <h4 className="font-bold text-white text-sm">Log</h4>
                                </div>
                            </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex justify-center gap-3">
                            <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                <MapPin className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-bold text-slate-300">Location</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] font-bold text-slate-300">Checklists</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1.B SIMULATION HUB (1/3 Width - New Placement) */}
                <div className="col-span-1 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-[2rem] p-6 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-purple-600/20 transition-colors"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-slate-900/80 rounded-2xl border border-purple-500/50 flex items-center justify-center mb-6 mx-auto shadow-xl shadow-purple-900/50 group-hover:scale-105 transition-transform duration-500">
                            <Gamepad2 className="w-10 h-10 text-purple-400" />
                        </div>
                        
                        <h3 className="text-2xl font-black text-white leading-none mb-2">SIMULATION</h3>
                        <p className="text-[10px] text-purple-200 font-bold uppercase tracking-[0.2em] mb-6">Virtual Training</p>
                        
                        <div className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-purple-600/20 transition-colors">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start Training</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === ZONE 2: INTELLIGENCE & TOOLS === */}
            <div className="grid grid-cols-5 gap-6">
                {/* Left: AI Diagram (3 cols) */}
                <div className="col-span-3 bg-slate-900/80 border border-indigo-500/30 rounded-[2rem] p-6 relative overflow-hidden flex flex-col justify-center">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full"></div>
                    
                    <h3 className="text-lg font-bold text-indigo-300 mb-6 flex items-center gap-2 relative z-10">
                        <BrainCircuit className="w-5 h-5" /> Local Intelligence
                    </h3>

                    <div className="flex items-center justify-between relative z-10">
                        {/* Input */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-sm">
                                <FileText className="w-6 h-6 text-slate-400" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Manuals</span>
                        </div>

                        {/* Arrow 1 */}
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-slate-700 to-indigo-500 mx-3 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                        </div>

                        {/* Brain Center */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-400 relative">
                                <BrainCircuit className="w-10 h-10 text-white" />
                                <div className="absolute -top-3 -right-3 bg-slate-900 border border-indigo-500 rounded-full p-1.5 shadow-sm">
                                    <WifiOff className="w-3 h-3 text-indigo-400" />
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="block text-xs text-white font-bold uppercase tracking-wider">Local AI</span>
                                <span className="text-[8px] text-indigo-300 uppercase font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">No Internet</span>
                            </div>
                        </div>

                        {/* Arrow 2 */}
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-indigo-500 to-emerald-500 mx-3 relative">
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </div>

                        {/* Output */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-sm">
                                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Solution</span>
                        </div>
                    </div>
                </div>

                {/* Right: Tools Grid (Restored to 4 Items) */}
                <div className="col-span-2 bg-slate-900/80 border border-amber-500/30 rounded-[2rem] p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                        <Wrench className="w-5 h-5" /> Engineering Kit
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1">
                        <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-800 transition-colors">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <span className="text-[10px] font-bold text-slate-300 leading-tight">Battery Calc</span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-800 transition-colors">
                            <Scale className="w-6 h-6 text-blue-400" />
                            <span className="text-[10px] font-bold text-slate-300 leading-tight">Calibration</span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-800 transition-colors">
                            <Ban className="w-6 h-6 text-red-400" />
                            <span className="text-[10px] font-bold text-slate-300 leading-tight">Feasibility</span>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-800 transition-colors">
                            <ArrowLeftRight className="w-6 h-6 text-purple-400" />
                            <span className="text-[10px] font-bold text-slate-300 leading-tight">Converter</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === ZONE 3: SUPPLY CHAIN & INVENTORY === */}
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-[2rem] p-6 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2 relative z-10">
                    <Database className="w-6 h-6" /> Smart Supply Chain
                </h3>

                <div className="flex items-center justify-between relative z-10">
                    {/* 1. Inbound/Network */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-emerald-900/30 rounded-2xl border border-emerald-500/50 flex items-center justify-center relative group">
                            <Network className="w-8 h-8 text-emerald-400" />
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                ORDER
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="block text-xs font-bold text-slate-300">Supply Network</span>
                            <span className="block text-[8px] text-emerald-400/80 font-medium tracking-wide">Inter-Hospital</span>
                        </div>
                    </div>

                    {/* Arrow Flow + Report */}
                    <div className="flex-1 flex flex-col items-center px-2">
                        <div className="w-full h-0.5 bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 relative flex items-center justify-center">
                             {/* Report Badge on line */}
                             <div className="bg-slate-900 border border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                                <FileText className="w-3 h-3 text-emerald-400" />
                                <span className="text-[7px] font-bold text-emerald-200 uppercase">Auto-Reqs</span>
                             </div>
                        </div>
                        <span className="text-[9px] text-emerald-500/80 mt-4 uppercase tracking-widest font-bold">Traceability</span>
                    </div>

                    {/* 2. Hierarchy Visual */}
                    <div className="flex items-center gap-3">
                        {/* Cabinet */}
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center">
                                <Box className="w-6 h-6 text-slate-400" />
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1">Cabinet A</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                        {/* Shelf */}
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-600 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-slate-400" />
                            </div>
                            <span className="text-[9px] text-slate-500 mt-1">Shelf 2</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-12 bg-slate-800 mx-6"></div>

                    {/* 3. Scrap Yard */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-orange-900/20 rounded-2xl border border-orange-500/50 flex items-center justify-center relative group">
                            <Recycle className="w-8 h-8 text-orange-400 group-hover:rotate-180 transition-transform duration-700" />
                            <div className="absolute -bottom-2 bg-orange-500/20 text-orange-400 text-[8px] font-bold px-2 py-0.5 rounded border border-orange-500/30">
                                SALVAGE
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="block text-xs font-bold text-slate-300">Scrap Yard</span>
                            <span className="block text-[8px] text-orange-400/80 font-medium tracking-wide">Parts Recovery</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* --- 4. FOOTER (Call to Action) --- */}
        <div className="mt-auto bg-white text-slate-900 px-10 py-8 flex items-center justify-between relative overflow-hidden">
            {/* Decor line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
            
            <div className="relative z-10 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    {/* Logo Replacement */}
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <Shield className="w-full h-full text-indigo-700 fill-slate-900 drop-shadow-2xl" strokeWidth={2} />
                        <BrainCircuit className="absolute w-7 h-7 text-cyan-400" strokeWidth={2} />
                    </div>
                    
                    <div>
                        <h2 className="font-black text-3xl tracking-tighter text-slate-900 leading-none">
                            BioMed <span className="text-indigo-600">OS</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">The Future of Medical Engineering</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Interactive Demo</span>
                    <span className="block text-lg font-bold text-slate-800">Scan to Explore</span>
                </div>
                
                {/* Uploadable QR Area */}
                <div 
                    className="p-1 bg-slate-900 rounded-xl shadow-2xl cursor-pointer hover:ring-4 hover:ring-indigo-500/50 transition-all"
                    onClick={onUploadQr}
                    title="Click to Upload Custom QR Code"
                >
                    <div className="bg-white p-2 rounded-lg relative group">
                        <img 
                            src={customQrImage || "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEV-MRI-01&color=0f172a"} 
                            alt="Scan" 
                            className="w-24 h-24 mix-blend-multiply object-contain"
                        />
                        {!customQrImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <Upload className="w-6 h-6 text-slate-900 mb-1" />
                                <span className="text-[8px] font-bold text-slate-900 uppercase">Upload</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PosterDesign;
