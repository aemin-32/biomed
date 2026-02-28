
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'react-qr-scanner';
import { 
  X, 
  Flashlight, 
  Keyboard, 
  AlertCircle,
  ScanBarcode,
  Bug,
  Loader2
} from 'lucide-react';
import { useVibration } from '../../hooks/useVibration';
import ManualEntryDialog from './components/ManualEntryDialog';
import { useLanguage } from '../../core/context/LanguageContext';

const ScannerView: React.FC = () => {
  const navigate = useNavigate();
  const vibrate = useVibration();
  const { t } = useLanguage();
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sound feedback
  const playBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 1200;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }, []);

  const handleScan = (data: any) => {
    if (data && !scanResult) {
      const scannedText = data?.text || data; // Handle both object and string
      setScanResult(scannedText);
      
      // Feedback
      vibrate([50, 50, 50]);
      playBeep();
      
      // Redirect
      setTimeout(() => {
        navigate(`/device/${scannedText}`);
      }, 800);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    // Ignore ResizeObserver loop errors usually caused by QR library
    if (err?.message?.includes('ResizeObserver')) return;

    let msg = t('scanner.error_camera');
    if (err?.name === 'NotAllowedError') msg = t('scanner.error_permission');
    if (err?.name === 'NotFoundError') msg = t('scanner.error_no_camera');
    
    // Fix Error #310: Wrap state updates in setTimeout to avoid updates during render phase
    setTimeout(() => {
        setError(msg);
        setIsLoading(false);
    }, 0);
  };

  const handleLoad = () => {
    // Avoid immediate state update during render loop
    setTimeout(() => setIsLoading(false), 100);
  };

  // Simulation Logic
  const startSimulation = () => {
    setIsSimulating(true);
    setError(null);
    setIsLoading(false);
    
    // Simulate finding a code after 1.5 seconds
    setTimeout(() => {
      handleScan('DEV-MRI-01');
    }, 1500);
  };

  const toggleFlash = () => {
    // Flash implies real camera usage, might not work in all browsers
    setIsFlashOn(!isFlashOn);
    vibrate(20);
    
    // Try to actually toggle torch if supported
    const videoTrack = (document.querySelector('video') as any)?.srcObject?.getVideoTracks()[0];
    if (videoTrack && videoTrack.applyConstraints) {
       videoTrack.applyConstraints({
          advanced: [{ torch: !isFlashOn }]
       }).catch(() => console.log('Torch not supported'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-sans">
      
      {/* 1. Header / Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <button 
          onClick={() => navigate('/')} 
          className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all active:scale-95 pointer-events-auto"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-white font-bold text-lg drop-shadow-md tracking-wide">{t('scanner.title')}</h1>
        
        {/* Debug/Simulate Shortcut */}
        <button 
          onClick={startSimulation}
          className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/20 transition-all active:scale-95 pointer-events-auto"
          title={t('scanner.debug')}
        >
          <Bug className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Main Camera Area */}
      <div className="relative w-full h-full flex items-center justify-center bg-neutral-900 overflow-hidden">
        
        {/* Error State */}
        {error && !isSimulating ? (
          <div className="text-center p-8 max-w-sm bg-neutral-800 rounded-3xl mx-4 shadow-2xl border border-neutral-700 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{error}</h3>
            <p className="text-neutral-400 text-sm mb-6">{t('scanner.error_permission')}</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl font-bold text-sm transition-colors"
              >
                {t('scanner.retry')}
              </button>
              <button 
                onClick={startSimulation}
                className="w-full py-3 bg-medical-600 hover:bg-medical-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-medical-900/20 flex items-center justify-center gap-2"
              >
                <ScanBarcode className="w-4 h-4" />
                {t('scanner.simulate_btn')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Camera Feed OR Simulation Feed */}
            {isSimulating ? (
               <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <div className="text-center opacity-50 animate-pulse">
                     <ScanBarcode className="w-24 h-24 text-white mx-auto mb-4" />
                     <p className="text-white font-mono">Simulating Camera Feed...</p>
                  </div>
               </div>
            ) : (
               <div className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    onLoad={handleLoad}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    constraints={{
                    video: { facingMode: 'environment' }
                    }}
                />
               </div>
            )}
            
            {/* Loading State */}
            {isLoading && !isSimulating && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-medical-500 animate-spin" />
                  <p className="text-white text-sm font-medium animate-pulse">{t('scanner.loading')}</p>
                </div>
              </div>
            )}

            {/* 3. Overlay & Finder Pattern */}
            {!isLoading && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Dark Mask */}
                <div className="absolute inset-0 bg-black/50">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-transparent border-[3px] border-white/20 rounded-3xl overflow-hidden box-content shadow-[0_0_0_100vmax_rgba(0,0,0,0.7)]">
                    
                    {/* Active Corners */}
                    <div className={`absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] rounded-tl-xl transition-colors ${scanResult ? 'border-green-500' : 'border-medical-500'}`}></div>
                    <div className={`absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] rounded-tr-xl transition-colors ${scanResult ? 'border-green-500' : 'border-medical-500'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] rounded-bl-xl transition-colors ${scanResult ? 'border-green-500' : 'border-medical-500'}`}></div>
                    <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] rounded-br-xl transition-colors ${scanResult ? 'border-green-500' : 'border-medical-500'}`}></div>
                    
                    {/* Laser Scanning Animation */}
                    {!scanResult && (
                       <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-medical-400 to-transparent shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-laser opacity-80"></div>
                    )}
                  </div>
                </div>
                
                {/* Hint Text */}
                <div className="absolute bottom-36 left-0 right-0 text-center px-6">
                  <p className={`text-white font-bold backdrop-blur-md py-3 px-6 rounded-2xl inline-flex items-center gap-2 shadow-lg transition-all transform duration-300 ${scanResult ? 'bg-green-500 text-white scale-110' : 'bg-black/40 border border-white/10'}`}>
                    {scanResult ? (
                        <>
                           <CheckCircle2 className="w-5 h-5" />
                           {t('scanner.success')}
                        </>
                    ) : (
                        isSimulating ? t('scanner.simulating') : t('scanner.hint')
                    )}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pt-12 pb-10 px-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        <div className="flex items-end justify-center gap-12">
          
          {/* Flash Toggle */}
          <button 
            onClick={toggleFlash}
            className={`flex flex-col items-center gap-2 transition-all active:scale-95 group ${isFlashOn ? 'text-yellow-400' : 'text-slate-300 hover:text-white'}`}
          >
            <div className={`p-4 rounded-2xl transition-all ${isFlashOn ? 'bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-white/10 backdrop-blur-md group-hover:bg-white/20'}`}>
              <Flashlight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold tracking-wide">{t('scanner.flash')}</span>
          </button>

          {/* Manual Entry */}
          <button 
            onClick={() => setShowManualEntry(true)}
            className="flex flex-col items-center gap-2 text-slate-300 hover:text-white transition-all active:scale-95 group"
          >
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md group-hover:bg-white/20">
              <Keyboard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold tracking-wide">{t('scanner.manual')}</span>
          </button>
        </div>
      </div>

      {/* 5. Manual Entry Modal */}
      <ManualEntryDialog 
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSearch={(id) => {
            setShowManualEntry(false);
            navigate(`/device/${id}`);
        }}
      />
    </div>
  );
};

// Add check circle icon for success state locally if not imported
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default ScannerView;
