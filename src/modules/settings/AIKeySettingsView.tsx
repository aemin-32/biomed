
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Key, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Trash2
} from 'lucide-react';

const AIKeySettingsView: React.FC = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'default'>('idle');

  useEffect(() => {
    const storedKey = localStorage.getItem('BIOMED_USER_API_KEY');
    if (storedKey) {
        setApiKey(storedKey);
        setStatus('saved');
    } else {
        setStatus('default');
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
        alert("الرجاء إدخال المفتاح أولاً");
        return;
    }
    // Basic validation (Gemini keys usually start with AIza)
    if (!apiKey.startsWith('AIza')) {
        if (!window.confirm("يبدو أن تنسيق المفتاح غير صحيح (عادة يبدأ بـ AIza). هل أنت متأكد من الحفظ؟")) {
            return;
        }
    }
    
    localStorage.setItem('BIOMED_USER_API_KEY', apiKey.trim());
    setStatus('saved');
    setTimeout(() => alert("تم حفظ مفتاح الترخيص بنجاح!"), 100);
  };

  const handleClear = () => {
      if (window.confirm("هل أنت متأكد من حذف المفتاح الخاص؟ سيعود النظام لاستخدام المفتاح الافتراضي (المجاني).")) {
          localStorage.removeItem('BIOMED_USER_API_KEY');
          setApiKey('');
          setStatus('default');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/settings')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">ترخيص الذكاء الاصطناعي</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">إدارة مفتاح (Enterprise API Key)</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
          
          {/* Status Card */}
          <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${
              status === 'saved' 
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900' 
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}>
              <div className={`p-3 rounded-full ${
                  status === 'saved' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'
              }`}>
                  <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-slate-800 dark:text-white">
                      {status === 'saved' ? 'الترخيص الخاص مفعل' : 'النسخة المجانية (Demo)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                      {status === 'saved' 
                        ? 'يتم استخدام مفتاحك الخاص لجميع عمليات التحليل.' 
                        : 'يتم استخدام المفتاح الافتراضي محدود الاستخدام.'}
                  </p>
              </div>
              {status === 'saved' && <CheckCircle2 className="w-6 h-6 text-rose-600" />}
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  مفتاح Gemini API
              </label>
              
              <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                      type={isVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-rose-500 focus:border-rose-500 sm:text-sm font-mono"
                  />
                  <button 
                      onClick={() => setIsVisible(!isVisible)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                      {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
              </div>

              <div className="flex gap-3">
                  <button 
                      onClick={handleSave}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                      <Save className="w-4 h-4" />
                      حفظ وتفعيل
                  </button>
                  
                  {status === 'saved' && (
                      <button 
                          onClick={handleClear}
                          className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="حذف المفتاح"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                  )}
              </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  <p className="font-bold mb-1">لماذا أستخدم مفتاحي الخاص؟</p>
                  <ul className="list-disc mr-4 space-y-1 opacity-90">
                      <li>إزالة القيود على عدد مرات الاستخدام اليومي.</li>
                      <li>ضمان سرعة استجابة أعلى وتحليل أدق.</li>
                      <li>البيانات الخاصة بك تبقى تحت إدارة حسابك في Google Cloud.</li>
                  </ul>
              </div>
          </div>

      </div>
    </div>
  );
};

export default AIKeySettingsView;
