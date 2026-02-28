import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Database, Settings, Shield, Activity, Package } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import LogoutButton from '../../components/ui/LogoutButton';
import ThemeToggle from '../../components/ui/ThemeToggle';

const AdminDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const adminModules = [
    {
      id: 'users',
      title: 'إدارة المستخدمين',
      description: 'إضافة المهندسين وتحديد الصلاحيات',
      icon: Users,
      color: 'bg-indigo-500',
      path: '/admin/users'
    },
    {
      id: 'documents',
      title: 'إدارة الملفات والأدلة',
      description: 'رفع أدلة التشغيل والصيانة (Manuals)',
      icon: FileText,
      color: 'bg-emerald-500',
      path: '/admin/documents'
    },
    {
      id: 'data-entry',
      title: 'إدخال البيانات',
      description: 'إضافة أجهزة جديدة أو مواد للمخزن',
      icon: Database,
      color: 'bg-amber-500',
      path: '/admin/data-entry'
    },
    {
      id: 'system-settings',
      title: 'إعدادات النظام',
      description: 'التحكم العام في إعدادات التطبيق',
      icon: Settings,
      color: 'bg-slate-500',
      path: '/settings'
    }
  ];

  const engineerModules = [
    {
      id: 'devices',
      title: 'الأجهزة الطبية',
      description: 'عرض وإدارة جميع الأجهزة',
      icon: Activity,
      color: 'bg-blue-500',
      path: '/devices'
    },
    {
      id: 'inventory',
      title: 'المخزن',
      description: 'إدارة قطع الغيار والمستهلكات',
      icon: Package,
      color: 'bg-emerald-500',
      path: '/inventory'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-900 text-white pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">بوابة الإدارة</h1>
              <p className="text-indigo-100 text-sm opacity-90">مرحباً، {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Users className="w-6 h-6 text-indigo-200 mb-2" />
            <span className="text-2xl font-bold">12</span>
            <span className="text-xs text-indigo-100">مستخدم</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-200 mb-2" />
            <span className="text-2xl font-bold">45</span>
            <span className="text-xs text-indigo-100">جهاز</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center">
            <Package className="w-6 h-6 text-indigo-200 mb-2" />
            <span className="text-2xl font-bold">128</span>
            <span className="text-xs text-indigo-100">مادة مخزنية</span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="px-6 mt-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">المهام الإدارية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminModules.map((module) => (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 text-right hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{module.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{module.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">مهام المهندسين</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {engineerModules.map((module) => (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 text-right hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                  <module.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{module.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{module.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
