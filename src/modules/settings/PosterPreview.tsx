
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Download, 
  ZoomIn, 
  ZoomOut,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import PosterDesign from './components/PosterDesign';
import { FileService } from '../../core/services/fileService';

const PosterPreview: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scale, setScale] = useState(0.8); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Standard A4
  const BASE_WIDTH = 794; 
  const BASE_HEIGHT = 1123;

  // Auto-Fit Logic
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = window.innerWidth - 32; 
        const availableHeight = window.innerHeight - 120; 

        const scaleW = availableWidth / BASE_WIDTH;
        const scaleH = availableHeight / BASE_HEIGHT;

        const fitScale = Math.min(scaleW, scaleH);
        setScale(Math.min(fitScale, 1.2)); 
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-poster');
    if (!element) return;

    if (typeof (window as any).html2pdf === 'undefined') {
        alert("مكتبة PDF غير متوفرة حالياً.");
        return;
    }

    setIsDownloading(true);
    setSaveSuccess(false);

    try {
        const opt = {
            margin: 0,
            filename: `BioMed_Poster_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 3, 
                useCORS: true, 
                logging: false,
                scrollX: 0,
                scrollY: 0,
                width: BASE_WIDTH,
                height: BASE_HEIGHT
            },
            jsPDF: { unit: 'px', format: [BASE_WIDTH, BASE_HEIGHT], orientation: 'portrait' }
        };

        // 1. توليد ملف PDF كـ Base64 String
        const pdfWorker = (window as any).html2pdf().set(opt).from(element);
        const pdfOutput = await pdfWorker.outputPdf('datauristring'); // Returns base64 string

        // 2. حفظ الملف باستخدام الخدمة الجديدة
        await FileService.saveFile(opt.filename, pdfOutput, 'BioMed_OS/Posters');
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success after 3s
        
    } catch (error) {
        console.error("PDF Generation Error", error);
        alert("حدث خطأ أثناء حفظ الملف.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerQrUpload = () => {
      fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 font-sans flex flex-col overflow-hidden">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleQrUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* --- Toolbar --- */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <button onClick={() => navigate('/settings')} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-200 transition-colors">
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 rounded-full"><ZoomOut className="w-4 h-4 text-slate-500" /></button>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 rounded-full"><ZoomIn className="w-4 h-4 text-slate-500" /></button>
        </div>

        <button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading} 
            className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-full shadow-lg transition-all active:scale-95 disabled:bg-slate-400 ${
                saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
            {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
            ) : (
                <Download className="w-5 h-5" />
            )}
            <span className="hidden sm:inline font-bold text-xs">
                {saveSuccess ? 'تم الحفظ!' : 'حفظ في الجهاز'}
            </span>
        </button>
      </div>

      {/* --- Main Viewport (The "Studio") --- */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-auto bg-slate-200/50 dark:bg-black/20 flex items-start justify-center pt-24 pb-20"
      >
        <div 
            style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease-out',
                marginBottom: '100px',
            }}
        >
            <PosterDesign 
                id="printable-poster" 
                customQrImage={qrImage}
                onUploadQr={triggerQrUpload}
            />
        </div>
      </div>
    </div>
  );
};

export default PosterPreview;
