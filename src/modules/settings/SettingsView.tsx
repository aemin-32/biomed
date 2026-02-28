
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Database, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  ChevronLeft,
  Moon,
  UserCircle,
  Map,
  RotateCcw,
  Warehouse,
  Briefcase,
  Sparkles,
  FolderCog // Changed Icon
} from 'lucide-react';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useLanguage } from '../../core/context/LanguageContext';
import { NOTIFICATIONS_DATA } from '../../core/database/mockData';

const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();

  const handleSystemRestart = () => {
    if (window.confirm(t('app.confirm_restart'))) {
      window.location.reload();
    }
  };

  // Check unread
  const unreadCount = NOTIFICATIONS_DATA.filter(n => !n.isRead).length;

  const sections = [
    {
      title: t('settings.system'),
      items: [
        {
          id: 'ai_license',
          label: 'إعدادات الذكاء الاصطناعي (AI)',
          desc: 'إدارة مفاتيح API والترخيص',
          icon: Sparkles,
          color: 'text-rose-600',
          bg: 'bg-rose-50 dark:bg-rose-900/20',
          action: () => navigate('/settings/ai-key')
        },
        {
          id: 'locations',
          label: t('settings.locations'),
          desc: t('settings.locations_desc'),
          icon: Map,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          action: () => navigate('/settings/locations')
        },
        {
          id: 'warehouse',
          label: t('settings.warehouse'),
          desc: t('settings.warehouse_desc'),
          icon: Warehouse,
          color: 'text-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          action: () => navigate('/settings/warehouse')
        },
        {
          id: 'suppliers',
          label: t('settings.suppliers'),
          desc: t('settings.suppliers_desc'),
          icon: Briefcase,
          color: 'text-cyan-600',
          bg: 'bg-cyan-50 dark:bg-cyan-900/20',
          action: () => navigate('/settings/suppliers')
        },
        {
          id: 'data',
          label: t('settings.data'),
          desc: t('settings.data_desc'),
          icon: Database,
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          action: () => navigate('/settings/data')
        },
        {
          id: 'restart',
          label: t('settings.restart'),
          desc: t('settings.restart_desc'),
          icon: RotateCcw,
          color: 'text-red-600',
          bg: 'bg-red-50 dark:bg-red-900/20',
          action: handleSystemRestart
        },
        {
          id: 'resources',
          label: 'ملفات المشروع والبوستر',
          desc: 'الخارطة البرمجية وتصاميم الطباعة',
          icon: FolderCog,
          color: 'text-fuchsia-600',
          bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
          action: () => navigate('/settings/resources') // Changed Route
        }
      ]
    },
    {
      title: t('settings.personal'),
      items: [
        {
          id: 'profile',
          label: t('settings.profile'),
          desc: t('settings.profile_desc'),
          icon: User,
          color: 'text-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          action: () => navigate('/settings/profile')
        },
        {
          id: 'notifications',
          label: t('settings.notifications'),
          desc: t('settings.notifications_desc'),
          icon: Bell,
          color: 'text-teal-600',
          bg: 'bg-teal-50 dark:bg-teal-900/20',
          action: () => navigate('/settings/notifications'),
          badge: unreadCount > 0 ? unreadCount : undefined
        }
      ]
    },
    {
      title: t('settings.general'),
      items: [
        {
          id: 'security',
          label: t('settings.security'),
          desc: t('settings.security_desc'),
          icon: Shield,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          action: () => {} // Placeholder
        },
        {
          id: 'language',
          label: t('settings.language'),
          desc: language === 'ar' ? 'العربية (Arabic)' : 'English (الإنجليزية)',
          icon: Globe,
          color: 'text-slate-600',
          bg: 'bg-slate-50 dark:bg-slate-800',
          action: toggleLanguage 
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('settings.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Engineer Profile Card */}
      <div 
        onClick={() => navigate('/settings/profile')}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm mb-4 flex items-center justify-between hover:border-medical-500 dark:hover:border-medical-500 transition-colors cursor-pointer group"
      >
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-medical-50 dark:bg-medical-900/20 rounded-full flex items-center justify-center border border-medical-100 dark:border-medical-800 text-medical-600 dark:text-medical-400 group-hover:scale-110 transition-transform">
               <UserCircle className="w-8 h-8" />
            </div>
            <div>
               <h3 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-medical-600 transition-colors">المهندس علي</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400">مدير قسم الهندسة الطبية</p>
            </div>
         </div>
         <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 group-hover:bg-medical-50 group-hover:text-medical-600 transition-colors">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
         </div>
      </div>

      {/* Theme Toggle Special Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
               <Moon className="w-6 h-6" />
            </div>
            <div>
               <h3 className="font-bold text-slate-800 dark:text-white text-sm">{t('settings.theme')}</h3>
               <p className="text-xs text-slate-500">{t('settings.theme_desc')}</p>
            </div>
         </div>
         <ThemeToggle />
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-start group relative ${
                    itemIdx !== section.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                  }`}
                >
                  <div className={`p-3 rounded-xl ${item.bg} ${item.color} mx-4 relative`}>
                    <item.icon className="w-6 h-6" />
                    {item.badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                            {item.badge}
                        </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-medical-600 transition-colors text-start">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 text-start">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-medical-500 rtl:rotate-180" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center pb-8">
        <p className="text-xs text-slate-400 font-mono">{t('settings.version')}</p>
      </div>
    </div>
  );
};

export default SettingsView;
