
import React, { useState, useEffect } from 'react';
import { Sparkles, X, Bot, Loader2, AlertCircle, CalendarClock } from 'lucide-react';
import { generateChecklistFromAI } from '../../../../core/services/geminiChecklistService';
import { PMTask, PMFrequency } from '../ChecklistLogic';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tasks: PMTask[]) => void;
  initialDeviceName?: string;
}

const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose, onSuccess, initialDeviceName }) => {
  const [deviceName, setDeviceName] = useState('');
  const [frequency, setFrequency] = useState<PMFrequency>('Monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialDeviceName) {
      setDeviceName(initialDeviceName);
    }
  }, [isOpen, initialDeviceName]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!deviceName.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const tasks = await generateChecklistFromAI(deviceName, frequency);
      onSuccess(tasks);
      onClose(); // Close on success
      setDeviceName(''); // Reset
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالمساعد الذكي. تأكد من الاتصال بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
        
        {/* Neon Header Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="p-8 relative z-10">
          
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all ${isLoading ? 'animate-pulse bg-indigo-500/20' : 'bg-indigo-500/10'}`}>
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              ) : (
                <Sparkles className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">المولد الذكي (AI Generator)</h2>
            <p className="text-slate-400 text-sm">
              أدخل اسم الجهاز والفترة الزمنية، وسيقوم الذكاء الاصطناعي ببناء قائمة فحص هندسية مخصصة.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="flex gap-3">
                {/* Device Name Input */}
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">اسم الجهاز</label>
                    <div className="relative group">
                        <input 
                        type="text" 
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="مثال: جهاز تنفس..."
                        disabled={isLoading}
                        autoFocus
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 pl-10 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 font-bold"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                </div>

                {/* Frequency Select */}
                <div className="w-1/3 space-y-2">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">الفترة</label>
                    <div className="relative">
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as PMFrequency)}
                            disabled={isLoading}
                            className="w-full h-[50px] bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-8 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 font-bold appearance-none text-sm cursor-pointer"
                        >
                            <option value="Weekly">أسبوعي</option>
                            <option value="Monthly">شهري</option>
                            <option value="Quarterly">ربع سنوي</option>
                            <option value="Semi-Annual">نصف سنوي</option>
                            <option value="Annual">سنوي</option>
                        </select>
                        <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!deviceName.trim() || isLoading}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                !deviceName.trim() || isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/25 active:scale-95'
              }`}
            >
              {isLoading ? 'جاري التحليل والبناء...' : 'توليد القائمة تلقائياً'}
              {!isLoading && <Sparkles className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
