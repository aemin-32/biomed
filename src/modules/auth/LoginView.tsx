
import React, { useState } from 'react';
import { Activity, ArrowRight, User, Stethoscope, Wrench } from 'lucide-react';
import { useAuth, UserRole } from '../../core/context/AuthContext';
import { useLanguage } from '../../core/context/LanguageContext';

const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  
  const [role, setRole] = useState<UserRole>('Engineer');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
        login(role, userName, userId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans transition-colors">
      
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-medical-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-medical-500/30 transform rotate-3 hover:rotate-6 transition-transform duration-500">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">BioMed OS</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">نظام تشغيل الهندسة الطبية الذكي</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 animate-in slide-in-from-bottom-4 fade-in">
            
            {/* Role Selection - Updated to 3 Columns */}
            <div className="grid grid-cols-3 gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                    type="button"
                    onClick={() => setRole('Admin')}
                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                        role === 'Admin'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md transform scale-[1.02]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    <User className={`w-5 h-5 ${role === 'Admin' ? 'fill-current' : ''}`} />
                    مدير النظام
                </button>
                <button
                    type="button"
                    onClick={() => setRole('Engineer')}
                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                        role === 'Engineer'
                        ? 'bg-white dark:bg-slate-700 text-medical-600 dark:text-medical-400 shadow-md transform scale-[1.02]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    <Wrench className={`w-5 h-5 ${role === 'Engineer' ? 'fill-current' : ''}`} />
                    {t('dashboard.role_engineer')}
                </button>
                <button
                    type="button"
                    onClick={() => setRole('Nurse')}
                    className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                        role === 'Nurse'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md transform scale-[1.02]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    <Stethoscope className={`w-5 h-5 ${role === 'Nurse' ? 'fill-current' : ''}`} />
                    كادر طبي
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white transition-all duration-300">
                        {role === 'Admin' ? 'دخول الإدارة' : role === 'Engineer' ? 'دخول المهندسين' : 'دخول الكادر الطبي'}
                    </h2>
                    <p className="text-xs text-slate-500">يرجى إدخال بياناتك للمتابعة</p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الاسم الكامل</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="أدخل اسمك هنا..."
                            autoFocus
                            className="w-full p-4 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الرقم الوظيفي (اختياري)</label>
                    <input 
                        type="text" 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="ID Number"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={!userName.trim()}
                    className={`w-full py-4 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 ${
                        !userName.trim() 
                        ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                        : role === 'Admin'
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                            : role === 'Engineer' 
                                ? 'bg-medical-600 hover:bg-medical-700 shadow-medical-500/30'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
                    }`}
                >
                    <span>دخول للنظام</span>
                    <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                </button>
            </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          {t('settings.version')}
        </p>
      </div>
    </div>
  );
};

export default LoginView;
