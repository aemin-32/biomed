import React, { useState, useEffect } from 'react';
import { X, Search, ScanBarcode, ArrowRight, Hash } from 'lucide-react';

interface ManualEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (id: string) => void;
}

const ManualEntryDialog: React.FC<ManualEntryDialogProps> = ({ isOpen, onClose, onSearch }) => {
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDeviceId('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = deviceId.trim();
    
    if (!trimmedId) {
      setError('يرجى إدخال معرف الجهاز');
      return;
    }
    
    setError('');
    onSearch(trimmedId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Main Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden scale-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-200">
        
        {/* Decorative Header Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-medical-500/10 to-blue-600/10 dark:from-medical-900/20 dark:to-slate-900/0 pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors z-10 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 p-8">
          
          {/* Header Icon & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-medical-100 dark:border-medical-900/50">
              <ScanBarcode className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">البحث عن أصل (Asset)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              أدخل الرقم المعرف للجهاز للوصول للملف
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Input Field */}
            <div className="mb-8">
              <div className={`relative group transition-all duration-300 ${error ? 'animate-shake' : ''}`}>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-500 transition-colors">
                  <Hash className="w-5 h-5" />
                </div>
                
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => {
                    setDeviceId(e.target.value.toUpperCase());
                    if (error) setError('');
                  }}
                  placeholder="DEV-0000"
                  className={`w-full bg-slate-50 dark:bg-slate-950 border-2 rounded-xl py-4 pr-12 pl-4 text-lg font-mono font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 outline-none transition-all ${
                    error 
                      ? 'border-red-300 focus:border-red-500 bg-red-50/30' 
                      : 'border-slate-100 dark:border-slate-800 focus:border-medical-500 focus:ring-4 focus:ring-medical-500/10'
                  }`}
                  autoFocus
                />
              </div>
              
              {/* Error Message */}
              <div className={`mt-2 text-center transition-all duration-300 ${error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0'}`}>
                <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 py-1 px-3 rounded-full inline-block">
                  {error}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              className="w-full bg-medical-600 hover:bg-medical-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-medical-500/30 hover:shadow-medical-500/40 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>عرض ملف الجهاز</span>
              <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            
            {/* Cancel (Mobile) */}
            <button 
              type="button"
              onClick={onClose}
              className="w-full mt-3 py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-sm transition-colors sm:hidden"
            >
              إلغاء الأمر
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryDialog;