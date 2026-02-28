
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, Scale, ArrowLeftRight, ArrowRight, ChevronLeft, Calculator, Ban } from 'lucide-react';
import { useLanguage } from '../../core/context/LanguageContext';

const ToolsMenuView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tools = [
    {
      id: 'battery',
      title: t('tools.battery_title'),
      desc: t('tools.battery_desc'),
      icon: Battery,
      path: '/tools/battery',
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'feasibility',
      title: 'قرار الإصلاح (BER)',
      desc: 'حساب الجدوى الاقتصادية للإصلاح',
      icon: Ban,
      path: '/tools/feasibility',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      id: 'calibration',
      title: t('tools.calibration_title'),
      desc: t('tools.calibration_desc'),
      icon: Scale,
      path: '/tools/calibration',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'converter',
      title: t('tools.converter_title'),
      desc: t('tools.converter_desc'),
      icon: ArrowLeftRight,
      path: '/tools/converter',
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('tools.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('tools.subtitle')}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.path)}
            className="flex items-center p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-medical-500 dark:hover:border-medical-500 hover:shadow-md transition-all active:scale-95 text-start group"
          >
            <div className={`p-4 rounded-xl ${tool.bg} ${tool.color} mx-4 group-hover:scale-110 transition-transform`}>
              <tool.icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{tool.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{tool.desc}</p>
            </div>
            <div className="text-slate-300 dark:text-slate-600 group-hover:text-medical-500 dark:group-hover:text-medical-400 transition-colors">
               <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolsMenuView;
