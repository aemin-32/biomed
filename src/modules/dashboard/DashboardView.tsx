
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Activity, 
  AlertTriangle, 
  Package, 
  Wrench, 
  Gamepad2, 
  Calculator, 
  Wifi, 
  WifiOff,
  User,
  Settings,
  ScanBarcode
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useAuth } from '../../core/context/AuthContext';
import { useLanguage } from '../../core/context/LanguageContext';
import StatsWidget from './StatsWidget';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LogoutButton from '../../components/ui/LogoutButton';
import { DEVICES, INVENTORY_ITEMS, SERVICE_REQUESTS } from '../../core/database/mockData';

const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options));
  }, [language]);

  const urgentCount = SERVICE_REQUESTS.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  // const lowStockCount = INVENTORY_ITEMS.filter(i => i.quantity <= i.minLevel).length; // Removed as requested

  const handleScanClick = () => navigate('/scanner');
  const handleModuleClick = (path: string) => navigate(path);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Compact Header */}
      <header className="px-4 pt-4 pb-2 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 rounded-b-2xl mb-3 transition-colors shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-medical-100 dark:bg-medical-900/30 rounded-xl flex items-center justify-center border border-medical-500 text-medical-600 dark:text-medical-400 shadow-sm">
               <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                {t('dashboard.role_engineer')}
              </p>
              <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                {user?.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
            <LogoutButton />
          </div>
        </div>
        <div className="flex justify-between items-center px-1">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700">
            {currentDate}
            </p>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              isOnline 
                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
        </div>
      </header>

      <main className="px-4 space-y-3 flex-1 overflow-y-auto pb-4">
        {/* Very Compact Scanner Widget */}
        <div 
          onClick={handleScanClick}
          className="relative overflow-hidden bg-gradient-to-br from-medical-600 to-medical-500 dark:from-medical-700 dark:to-medical-600 rounded-2xl p-3 text-white shadow-md shadow-medical-500/20 dark:shadow-none cursor-pointer active:scale-[0.98] group flex items-center justify-between"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{t('dashboard.smart_scanner')}</h2>
              <p className="text-blue-50 text-[10px] opacity-90">
                {t('dashboard.scan_desc')}
              </p>
            </div>
          </div>
          <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/10 relative z-10">
                <ScanBarcode className="w-4 h-4 text-white" /> 
          </div>
          <QrCode className="absolute -bottom-4 -left-2 w-20 h-20 text-white opacity-5 rotate-12" />
        </div>

        {/* Compact Stats Grid (2 Columns - Low Stock Removed) */}
        <div className="grid grid-cols-2 gap-3">
           <StatsWidget 
              title={t('dashboard.total_devices')}
              value={DEVICES.length} 
              icon={Activity} 
              colorClass="text-blue-600 dark:text-blue-400" 
              onClick={() => navigate('/devices')}
          />
          <StatsWidget 
              title={t('dashboard.urgent_tasks')}
              value={urgentCount} 
              icon={AlertTriangle} 
              colorClass="text-red-500 dark:text-red-400" 
              trend={urgentCount > 0 ? `🔴 ${t('dashboard.action_required')}` : undefined}
              onClick={() => navigate('/maintenance/requests')}
          />
        </div>

        {/* Quick Access Grid (2x2 Layout) */}
        <div className="pt-2">
          <h3 className="text-slate-400 dark:text-slate-500 font-bold mb-2 text-[10px] uppercase px-1">
            {t('dashboard.quick_access')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Maintenance */}
            <button onClick={() => handleModuleClick('/maintenance')} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-all active:scale-95">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"><Wrench className="w-5 h-5" /></div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{t('module.maintenance')}</span>
            </button>
            
            {/* 2. Tools */}
            <button onClick={() => handleModuleClick('/tools')} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-all active:scale-95">
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"><Calculator className="w-5 h-5" /></div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{t('module.tools')}</span>
            </button>

            {/* 3. Simulation */}
            <button onClick={() => handleModuleClick('/simulation')} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-all active:scale-95">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"><Gamepad2 className="w-5 h-5" /></div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{t('module.simulation')}</span>
            </button>

            {/* 4. Inventory */}
            <button onClick={() => handleModuleClick('/inventory')} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-all active:scale-95">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"><Package className="w-5 h-5" /></div>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{t('module.inventory')}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
