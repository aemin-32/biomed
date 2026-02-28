
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Presentation, Code2, ArrowLeft } from 'lucide-react';

const ProjectResourcesView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/settings')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">موارد المشروع</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">ملفات الطباعة والوثائق التقنية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-10">
        
        {/* Card 1: Poster */}
        <button 
            onClick={() => navigate('/settings/poster')}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all group text-right flex flex-col justify-between min-h-[250px]"
        >
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Presentation className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">بوستر التطبيق</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    عرض وطباعة الملصق التعريفي للمشروع (Poster)، يحتوي على دورة العمل والمميزات الرئيسية بجودة عالية.
                </p>
            </div>
            <div className="mt-6 flex justify-end text-purple-600 font-bold items-center gap-2">
                <span>فتح الاستوديو</span>
                <ArrowLeft className="w-5 h-5" />
            </div>
        </button>

        {/* Card 2: Architecture Map */}
        <button 
            onClick={() => navigate('/settings/map')}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all group text-right flex flex-col justify-between min-h-[250px]"
        >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">خارطة المشروع البرمجية</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    تقرير تقني يوضح هيكلية المجلدات، الملفات، حجم الكود، وعدد الأسطر (Source Code Architecture Map).
                </p>
            </div>
            <div className="mt-6 flex justify-end text-blue-600 font-bold items-center gap-2">
                <span>عرض الخارطة</span>
                <ArrowLeft className="w-5 h-5" />
            </div>
        </button>

      </div>
    </div>
  );
};

export default ProjectResourcesView;
