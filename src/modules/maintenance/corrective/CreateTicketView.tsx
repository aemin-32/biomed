
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap, 
  Cpu, 
  Wrench, 
  Activity, 
  HelpCircle,
  AlertTriangle, 
  Siren,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Send,
  Bot
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { DEVICES, SERVICE_REQUESTS } from '../../../core/database/mockData';
import { ServiceRequest } from '../../../core/database/types';

// --- Types & Constants ---
type Priority = 'Normal' | 'Urgent' | 'Critical';
type Category = 'Power' | 'Software' | 'Mechanical' | 'Sensor' | 'Other';

const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: 'Power', label: 'مشكلة طاقة', icon: Zap },
  { id: 'Software', label: 'نظام/برمجة', icon: Cpu },
  { id: 'Mechanical', label: 'عطل ميكانيكي', icon: Wrench },
  { id: 'Sensor', label: 'حساسات/إشارة', icon: Activity },
  { id: 'Other', label: 'أخرى', icon: HelpCircle },
];

const PRIORITIES: { id: Priority; label: string; desc: string; color: string; icon: React.ElementType }[] = [
  { 
    id: 'Normal', 
    label: 'عادي', 
    desc: 'لا يؤثر على التشغيل', 
    color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', 
    icon: CheckCircle2 
  },
  { 
    id: 'Urgent', 
    label: 'عاجل', 
    desc: 'يؤثر جزئياً', 
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800', 
    icon: AlertTriangle 
  },
  { 
    id: 'Critical', 
    label: 'حرج جداً', 
    desc: 'الجهاز متوقف كلياً', 
    color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800', 
    icon: Siren 
  },
];

const CreateTicketView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lookup Device
  const device = DEVICES.find(d => d.id === deviceId);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority>('Normal');
  const [errorCode, setErrorCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitMode, setSubmitMode] = useState<'repair' | 'report' | null>(null);

  // Handle incoming state
  useEffect(() => {
      const state = location.state as any;
      if (state) {
          if (state.initialDescription) setDescription(state.initialDescription);
          if (state.initialCategory) setSelectedCategory(state.initialCategory);
          if (state.initialDescription) setSelectedPriority('Urgent'); 
      }
  }, [location.state]);

  // AI Handler
  const handleAnalyzeError = async () => {
    if (!errorCode.trim()) return;

    // Get key from local or env
    const apiKey = localStorage.getItem('BIOMED_USER_API_KEY') || process.env.API_KEY || '';
    
    setIsAnalyzing(true);
    
    try {
      if (!apiKey) {
          // Demo Mode
          await new Promise(resolve => setTimeout(resolve, 1500));
          const demoText = `
**[وضع المحاكاة - Demo Mode]**
بناءً على الكود ${errorCode} للجهاز ${device?.model}:

**التشخيص المحتمل:**
يشير هذا الرمز عادةً إلى خلل في وحدة إمداد الطاقة (PSU) أو تذبذب في الجهد الداخل.

**الحل المقترح:**
1. تحقق من توصيلات الكهرباء الرئيسية.
2. افحص خرج الفولتية من الـ Power Supply.
3. إذا استمرت المشكلة، قد يتطلب استبدال المكثفات في البورد الرئيسي.
          `;
          setDescription(prev => prev ? prev + '\n\n' + demoText.trim() : demoText.trim());
      } else {
          // Real AI
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const prompt = `
          You are an expert biomedical engineer assistant.
          The user is reporting a fault for a medical device.
          
          Device Name: ${device?.name || 'Medical Device'}
          Model: ${device?.model || 'Generic'}
          Error Code: ${errorCode}
          
          Please provide a short diagnosis and suggested solution for this error code in Arabic.
          Output format:
          **التشخيص:** [Diagnosis]
          **الحل المقترح:** [Solution steps]
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview', 
              contents: prompt,
          });
          
          const text = response.text;
          if (text) {
               setDescription(prev => prev ? prev + '\n\n' + text.trim() : text.trim());
          }
      }
    } catch (error: any) {
      console.error("AI Analysis Failed", error);
      
      // Fallback to demo text on error to avoid blocking the user
      const demoText = `
**[تنبيه: تعذر الاتصال بالذكاء الاصطناعي - تم التبديل للمحاكاة]**
تحليل أولي للكود ${errorCode}:
قد يشير هذا العطل إلى مشكلة في الاتصال أو الحساسات. يرجى مراجعة دليل الصيانة.
      `;
      setDescription(prev => prev ? prev + '\n\n' + demoText.trim() : demoText.trim());
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handlers
  const handleSubmit = (mode: 'repair' | 'report') => {
    if (!selectedCategory || !description.trim()) {
      alert("يرجى تحديد نوع العطل وكتابة وصف المشكلة");
      return;
    }

    setIsSubmitting(true);
    setSubmitMode(mode);
    
    const newTicketId = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    const newTicket: ServiceRequest = {
        id: newTicketId,
        deviceId: deviceId || '',
        deviceName: device?.name || 'Unknown',
        location: device?.location || 'Unknown',
        department: device?.department || 'Engineering',
        issueCategory: selectedCategory,
        description: description,
        priority: selectedPriority,
        isPatientAffected: selectedPriority === 'Critical',
        requestedBy: 'المهندس (PM)',
        timestamp: new Date().toISOString(),
        status: mode === 'repair' ? 'In Progress' : 'Open'
    };

    SERVICE_REQUESTS.unshift(newTicket);

    if (device) {
        device.status = mode === 'repair' ? 'Maintenance' : 'Down';
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMode(null);

      if (mode === 'repair') {
          navigate(`/maintenance/workbench/${deviceId}`, { 
              state: {
                ticketData: {
                    ...newTicket,
                    errorCode: errorCode || null
                }
              }
          });
      } else {
          alert('تم تسجيل البلاغ بنجاح وإدراجه في قائمة المهام.');
          navigate(-1);
      }
    }, 1000);
  };

  if (!device) return <div className="p-6 text-center">جهاز غير موجود</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-32">
      
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">بلاغ عطل جديد</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {device.name} • {device.id}
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-8">
        
        <section className="animate-in slide-in-from-bottom-2 fade-in duration-300">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            تصنيف المشكلة
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <cat.icon className={`w-6 h-6 mb-2 ${selectedCategory === cat.id ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            مستوى الأهمية
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPriority(p.id)}
                className={`relative p-4 rounded-xl border-2 text-right transition-all ${
                  selectedPriority === p.id
                    ? `${p.color} ring-1 ring-offset-2 dark:ring-offset-slate-950`
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                   <p className="font-bold text-sm">{p.label}</p>
                   {selectedPriority === p.id && <p className="text-[10px] font-bold opacity-70">محدد</p>}
                </div>
                <p className="text-[10px] opacity-80">{p.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4 animate-in slide-in-from-bottom-6 fade-in duration-700">
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                رمز الخطأ (Error Code) <span className="text-slate-400 font-normal text-xs">- اختياري</span>
                </label>
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    تحليل ذكي
                </span>
            </div>
            
            <div className="relative">
                <input 
                type="text" 
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value.toUpperCase())}
                placeholder="مثال: ERR-404"
                className="w-full p-4 pl-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all placeholder:text-slate-300"
                />
                
                <button
                    onClick={handleAnalyzeError}
                    disabled={isAnalyzing || !errorCode.trim()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                           <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           <span>جاري التحليل...</span>
                        </>
                    ) : (
                        <>
                           <Bot className="w-3.5 h-3.5" />
                           <span>تحليل العطل</span>
                        </>
                    )}
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 mx-1">
                اضغط على "تحليل العطل" ليقوم المساعد الذكي بتشخيص المشكلة. في حالة عدم توفر إنترنت، سيتم استخدام قاعدة بيانات محلية (محاكاة).
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              وصف المشكلة
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="صف العطل والملاحظات الأولية هنا..."
              className="w-full p-4 h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all resize-none placeholder:text-slate-300"
            />
          </div>
        </section>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 transition-colors">
        <div className="max-w-xl mx-auto flex gap-3">
            <button
                onClick={() => handleSubmit('report')}
                disabled={isSubmitting || !selectedCategory || !description.trim()}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
                    isSubmitting || !selectedCategory || !description.trim()
                    ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20'
                }`}
            >
                {isSubmitting && submitMode === 'report' ? (
                    <span className="animate-pulse">جاري الإرسال...</span>
                ) : (
                    <>
                        <Send className="w-4 h-4 rtl:rotate-180" />
                        <span>تبليغ فقط</span>
                    </>
                )}
            </button>

            <button
                onClick={() => handleSubmit('repair')}
                disabled={isSubmitting || !selectedCategory || !description.trim()}
                className={`flex-[2] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    isSubmitting || !selectedCategory || !description.trim()
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-medical-600 hover:bg-medical-700 text-white shadow-medical-900/20'
                }`}
            >
                {isSubmitting && submitMode === 'repair' ? (
                    <span className="animate-pulse">جاري البدء...</span>
                ) : (
                    <>
                        <Stethoscope className="w-5 h-5" />
                        <span>بدء التشخيص والإصلاح</span>
                    </>
                )}
            </button>
        </div>
      </div>

    </div>
  );
};

export default CreateTicketView;
