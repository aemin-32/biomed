
import React, { useState } from 'react';
import { FileText, AlertTriangle, Sparkles, Search, Bot, ChevronRight, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Markdown Helper Component
const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return <p className="text-slate-500 italic">لا يوجد وصف</p>;

  return (
    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-2">
      {content.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        const isList = trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
        const parts = line.split(/(\*\*.*?\*\*)/g);

        return (
          <div key={i} className={`relative ${isList ? 'pr-5' : ''}`}>
             {isList && (
                <span className="absolute right-0 top-2 w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
             )}
             <p>
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <span key={j} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</span>;
                  }
                  return <span key={j}>{part}</span>;
                })}
             </p>
          </div>
        );
      })}
    </div>
  );
};

interface TicketDetailsCardProps {
  ticketData: any;
}

const TicketDetailsCard: React.FC<TicketDetailsCardProps> = ({ ticketData }) => {
  // State for AI Analysis
  const [inputCode, setInputCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputCode.trim()) return;

    // Use stored key or default
    const apiKey = localStorage.getItem('BIOMED_USER_API_KEY') || process.env.API_KEY || '';
    if (!apiKey) {
        setAiResult("لم يتم العثور على مفتاح API في الإعدادات.");
        return;
    }

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const prompt = `
        You are an expert Biomedical Engineer Assistant.
        
        Context:
        - Device: ${ticketData?.deviceName || 'Medical Device'}
        - Original Issue: ${ticketData?.description || 'N/A'}
        
        New Finding/Input by Engineer: "${inputCode}"
        
        Task:
        1. Identify what this new code or symptom means for this specific device.
        2. Provide a concise bullet-point list of potential causes.
        3. Suggest 3 immediate troubleshooting steps.
        
        Language: Arabic (Professional Technical).
        Format: Markdown (Bold for key terms). Keep it short and actionable.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Updated
        contents: prompt,
      });

      setAiResult(response.text || 'تعذر الحصول على استجابة. حاول مرة أخرى.');
    } catch (error: any) {
      console.error("AI Error", error);
      let errorMsg = "حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من الإنترنت.";
      if (error.message?.includes('429')) errorMsg = "تجاوزت الحد المجاني المسموح.";
      else if (error.message?.includes('403')) errorMsg = "مفتاح API غير صالح.";
      
      setAiResult(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
      
      {/* 1. Original Ticket Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border-l-4 border-l-blue-600 border-y border-r border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg text-slate-800 dark:text-white font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                تفاصيل البلاغ الأصلي
            </h3>
            <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-slate-400 uppercase font-bold">الأولوية</span>
                <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-lg text-xs font-bold border border-red-200 dark:border-red-900">
                <AlertTriangle className="w-3 h-3" />
                {ticketData?.priority || 'Critical'}
                </span>
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <MarkdownRenderer content={ticketData?.description} />
            </div>

            {ticketData?.errorCode && (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg w-fit">
                    <span className="text-xs font-bold text-slate-500 uppercase">رمز الخطأ المسجل:</span>
                    <span className="text-slate-800 dark:text-white font-mono font-bold text-sm">
                        {ticketData.errorCode}
                    </span>
                </div>
            )}
        </div>
      </div>

      {/* 2. AI Engineering Assistant Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-500/30 relative overflow-hidden">
         {/* Decorative Background */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
         <Bot className="absolute -bottom-6 -left-6 w-32 h-32 text-indigo-500/5 dark:text-indigo-500/10 rotate-12" />

         <div className="relative z-10">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                المساعد الهندسي الذكي
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                هل وجدت رمز خطأ جديد أو ملاحظة أثناء الفحص؟ أدخلها هنا ليقوم النظام بتحليلها.
            </p>

            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="أدخل الكود (مثال: ERR-303) أو وصف المشكلة..."
                        className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputCode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
                >
                    {isAnalyzing ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>جاري التحليل...</span>
                        </>
                    ) : (
                        <>
                           <span>تحليل</span>
                           <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                    )}
                </button>
            </div>

            {/* AI Result Area */}
            {aiResult && (
                <div className="bg-white dark:bg-slate-950/50 rounded-xl border border-indigo-100 dark:border-indigo-500/30 p-5 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Bot className="w-4 h-4" />
                        النتيجة والتشخيص
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        <MarkdownRenderer content={aiResult} />
                    </div>
                    <div className="mt-3 flex justify-end">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            تم التوليد بواسطة Gemini AI
                        </span>
                    </div>
                </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default TicketDetailsCard;
