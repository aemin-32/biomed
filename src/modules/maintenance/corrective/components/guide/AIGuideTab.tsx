
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Search, 
  Sparkles, 
  Paperclip, 
  X, 
  FileText, 
  ImageIcon, 
  Clock,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { Device } from '../../../../../core/database/types';
import { GoogleGenAI } from "@google/genai";

interface AIGuideTabProps {
  device: Device;
}

const AIGuideTab: React.FC<AIGuideTabProps> = ({ device }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const [isSimulation, setIsSimulation] = useState(false);
  
  // AI Context (Image or PDF)
  const [contextFile, setContextFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Cooldown State
  const [cooldown, setCooldown] = useState(0);

  // Check Key on Mount
  useEffect(() => {
      const apiKey = localStorage.getItem('BIOMED_USER_API_KEY') || process.env.API_KEY || '';
      setHasKey(!!apiKey);
  }, []);

  // Timer Effect for Cooldown
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleContextFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              const mimeType = file.type;
              setContextFile({
                  name: file.name,
                  data: result.split(',')[1],
                  mimeType: mimeType
              });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAnalyze = async () => {
    if (!query.trim() && !contextFile) return;
    
    setIsAnalyzing(true);
    setAiResponse(null);
    setErrorMsg(null);
    setIsSimulation(false);

    const apiKey = localStorage.getItem('BIOMED_USER_API_KEY') || process.env.API_KEY || '';

    // --- 1. DEMO MODE (If no key is present) ---
    if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        setIsSimulation(true);
        setAiResponse(`
**⚠️ ملاحظة: هذا رد افتراضي (محاكاة) لعدم وجود مفتاح API.**

بناءً على الكتالوج الفني (الافتراضي) للجهاز **${device.manufacturer} ${device.model}**:

1. **تشخيص المشكلة:** "${query}" غالباً تشير إلى خلل في دائرة الطاقة (Power Board) أو تلف في الفيوز الداخلي.
2. **الإجراء المقترح:**
   - افحص الفيوز F1 الموجود خلف الجهاز (T3.15A).
   - تأكد من ثبات كابلات التوصيل الداخلية (Jumper Cables).
   - راجع الصفحة 45 في دليل الصيانة (قسم Troubleshooting).
        `);
        setIsAnalyzing(false);
        setCooldown(5);
        return;
    }

    // --- 2. REAL AI MODE ---
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        let contents: any[] = [];
        
        if (contextFile) {
            contents.push({
                inlineData: {
                    mimeType: contextFile.mimeType,
                    data: contextFile.data
                }
            });
        }

        const promptText = `
        SYSTEM ROLE: You are a specialized Technical Support Bot for the ${device.manufacturer} ${device.model}.
        STRICT INSTRUCTION: 
        - Answer the user's query based on general engineering knowledge if no doc is attached, or strictly from the doc if attached.
        USER QUERY: "${query}"
        OUTPUT LANGUAGE: Arabic (Technical).
        `;
        
        contents.push({ text: promptText });

        const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [{ parts: contents }],
        });

        setAiResponse(response.text || 'لم يتم العثور على إجابة.');
        setIsSimulation(false);

    } catch (error: any) {
        console.error("AI Error:", error);
        
        // --- Fallback to Simulation on Error ---
        setIsSimulation(true);
        setAiResponse(`
**⚠️ تعذر الاتصال بالذكاء الاصطناعي الحقيقي (خطأ في الشبكة أو المفتاح).**
**هذا رد تلقائي (محاكاة) لتوضيح عمل النظام:**

بناءً على المعلومات المتوفرة لـ **${device.model}**:
1. تأكد من توصيل الجهاز بمصدر طاقة مستقر.
2. تحقق من رموز الخطأ على الشاشة.
3. (هذا النص يظهر لأن الاتصال بخادم Gemini لم ينجح).
        `);
        
        let userMessage = "حدث خطأ في الاتصال. تم عرض رد تجريبي.";
        if (error.message?.includes('403') || error.message?.includes('API_KEY')) userMessage = "مفتاح API غير صالح. تم التبديل للمحاكاة.";
        else if (error.message?.includes('429')) userMessage = "تجاوز الحد المجاني. تم التبديل للمحاكاة.";
        
        setErrorMsg(userMessage);
    } finally {
        setIsAnalyzing(false);
        setCooldown(10);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6">
        
        {/* Warning Banner if No Key */}
        {!hasKey && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-3 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                    <span>وضع <b>Demo</b>. لتفعيل AI الحقيقي، أضف مفتاح API.</span>
                </div>
                <button 
                    onClick={() => navigate('/settings/ai-key')}
                    className="text-xs font-bold underline hover:text-indigo-800"
                >
                    إعداد
                </button>
            </div>
        )}

        <div className="text-center mb-4 sm:mb-8">
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/30 mb-3">
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-1">اسأل الكتالوج</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                {hasKey 
                    ? "قم بإرفاق ملف الكتالوج (PDF) أو صورة المخطط، وسأقوم بالإجابة من المحتوى." 
                    : "تجربة المحادثة الذكية مع الكتالوج (وضع المحاكاة)."}
            </p>
        </div>

        {/* Search Bar & Actions Container (Revised Layout) */}
        <div className="relative shadow-lg rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 sm:p-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500/50">
            {/* Text Input Area */}
            <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب سؤالك هنا (مثال: ماذا يعني الخطأ E3؟)"
                className="block w-full p-2 bg-transparent rounded-xl text-base sm:text-lg font-medium focus:outline-none resize-none h-20 sm:h-16 custom-scrollbar placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !isAnalyzing && cooldown === 0 && (e.preventDefault(), handleAnalyze())}
            />
            
            {/* Toolbar Area */}
            <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                
                {/* Left: Attach */}
                <div className="flex items-center">
                    <input 
                        type="file" 
                        ref={aiFileInputRef} 
                        accept="application/pdf,image/*" 
                        className="hidden" 
                        onChange={handleContextFileSelect}
                    />
                    <button 
                        onClick={() => aiFileInputRef.current?.click()}
                        className={`p-2 rounded-xl border font-bold transition-all flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                            contextFile 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                        title="إرفاق كتالوج (PDF) أو صورة"
                    >
                        <Paperclip className="w-5 h-5" />
                        {contextFile && <span className="text-xs max-w-[100px] truncate hidden sm:inline">{contextFile.name}</span>}
                    </button>
                </div>

                {/* Right: Action Button */}
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !query.trim() || cooldown > 0}
                    className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                        isAnalyzing || !query.trim() || cooldown > 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/30'
                    }`}
                >
                    {isAnalyzing ? (
                        <span className="animate-pulse text-xs">جاري البحث...</span> 
                    ) : cooldown > 0 ? (
                        <div className="flex items-center gap-1 text-xs">
                            <Clock className="w-4 h-4" />
                            <span>{cooldown}s</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-xs sm:text-sm">إرسال</span>
                            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* File Preview Indicator */}
        {contextFile && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                        {contextFile.mimeType.includes('pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">الملف المرجعي مفعل</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 max-w-[180px] sm:max-w-xs truncate">{contextFile.name}</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setContextFile(null); if(aiFileInputRef.current) aiFileInputRef.current.value = ''; }}
                    className="text-slate-400 hover:text-red-500 p-2"
                    title="إزالة الملف"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* Error Message */}
        {errorMsg && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 sm:p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-200">{errorMsg}</p>
            </div>
        )}

        {/* AI Response */}
        {aiResponse && (
            <div className={`border rounded-2xl p-5 sm:p-8 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden ${
                isSimulation 
                ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                : 'bg-white dark:bg-slate-950 border-indigo-100 dark:border-indigo-900 shadow-sm'
            }`}>
                {/* Source Indicator Badge */}
                <div className={`absolute top-4 left-4 px-2 sm:px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                    isSimulation 
                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' 
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                }`}>
                    {isSimulation ? <Cpu className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                    {isSimulation ? 'محاكاة' : 'Gemini AI'}
                </div>

                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <Sparkles className={`w-5 h-5 ${isSimulation ? 'text-slate-400' : 'text-indigo-500'}`} />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                        الإجابة المقترحة
                    </span>
                </div>
                <div className="prose prose-sm sm:prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed" dir="rtl">
                    {aiResponse.split('\n').map((line, i) => {
                        if (line.trim().startsWith('**')) return <h3 key={i} className="font-bold text-indigo-600 dark:text-indigo-400 mt-4 sm:mt-6 mb-2 text-base sm:text-lg">{line.replace(/\*\*/g, '')}</h3>;
                        if (line.trim().startsWith('-') || line.trim().startsWith('*')) return <li key={i} className="list-disc mr-5 mb-1">{line.replace(/^[-*]\s*/, '')}</li>;
                        if (line.trim().match(/^\d+\./)) return <li key={i} className="list-decimal mr-5 mb-1 font-bold">{line}</li>;
                        return <p key={i} className="mb-2">{line}</p>;
                    })}
                </div>
            </div>
        )}
    </div>
  );
};

export default AIGuideTab;
