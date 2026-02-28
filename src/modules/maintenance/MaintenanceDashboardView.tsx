
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  AlertTriangle, 
  Activity,
  ChevronLeft,
  CalendarClock,
  Wrench,
  Filter,
  History,
  Hash
} from 'lucide-react';
import { DEVICES } from '../../core/database/mockData';
import { Device } from '../../core/database/types';
import { useLanguage } from '../../core/context/LanguageContext';

// Helper to calculate PM Status
const getPMStatus = (device: Device) => {
  if (!device.calibrationSpecs) return null;
  
  const lastDate = new Date(device.calibrationSpecs.lastDate);
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + device.calibrationSpecs.intervalMonths);
  
  const today = new Date();
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return status object
  return { 
    isDue: diffDays <= 30, 
    isOverdue: diffDays < 0,
    daysRemaining: diffDays 
  };
};

const DeviceCard: React.FC<{ device: Device; isPMView?: boolean }> = ({ device, isPMView }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const pmStatus = getPMStatus(device);
  const isDown = device.status === 'Down';
  const isMaintenance = device.status === 'Maintenance';

  const getFrequencyLabel = (months?: number) => {
    if (!months) return '';
    if (months <= 1) return t('maint.monthly');
    if (months <= 3) return t('maint.quarterly');
    if (months <= 6) return t('maint.semi_annual');
    return t('maint.annual');
  };

  // --- PM VIEW CARD DESIGN (Horizontal Layout) ---
  if (isPMView && device.calibrationSpecs) {
      const freqLabel = getFrequencyLabel(device.calibrationSpecs.intervalMonths);
      const isOverdue = pmStatus?.isOverdue;
      const days = pmStatus ? Math.abs(pmStatus.daysRemaining) : 0;
      
      return (
        <button 
          onClick={() => navigate(`/device/${device.id}`, { 
              state: { 
                  backPath: '/maintenance',
                  initialTab: 'technical' // Useful for PM context
              } 
          })}
          className="w-full flex items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-medical-500 dark:hover:border-medical-500 hover:shadow-md transition-all group text-right mb-3"
        >
           {/* Image */}
           <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden ml-4 border border-slate-100 dark:border-slate-700">
                <img src={device.image} alt={device.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
           </div>

           {/* Content Area */}
           <div className="flex-1 min-w-0 flex flex-col gap-2">
               
               {/* Row 1: Name (Right) --- Days Indicator (Left) */}
               <div className="flex justify-between items-start">
                   <div>
                       <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate pl-2 group-hover:text-medical-600 transition-colors">
                            {device.name}
                       </h3>
                       {/* Added Device ID here */}
                       <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                           <Hash className="w-3 h-3" />
                           {device.id}
                       </p>
                   </div>
                   
                   {/* Days Indicator (Prominent) */}
                   <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border ${
                       isOverdue 
                       ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900' 
                       : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900'
                   }`}>
                       <CalendarClock className="w-3.5 h-3.5" />
                       <span>{isOverdue ? t('maint.overdue').replace('{days}', days.toString()) : t('maint.remaining').replace('{days}', days.toString())}</span>
                   </div>
               </div>

               {/* Row 2: Frequency --- Last Date (Horizontal Line) */}
               <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                   {/* Frequency Badge */}
                   <span className="font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {freqLabel}
                   </span>
                   
                   <span className="text-slate-300 dark:text-slate-700">|</span>

                   {/* Last Date */}
                   <span className="flex items-center gap-1 opacity-90">
                       <History className="w-3 h-3 text-slate-400" />
                       <span>{t('maint.last_check')}</span>
                       <span className="font-mono dir-ltr font-medium text-slate-700 dark:text-slate-300">
                           {device.calibrationSpecs.lastDate}
                       </span>
                   </span>
               </div>
           </div>

           <ChevronLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-medical-500 transition-colors mr-1 flex-shrink-0 rtl:rotate-180" />
        </button>
      );
  }

  // --- CORRECTIVE VIEW CARD DESIGN (Original Logic) ---
  let badge = null;
  if (isDown) {
      badge = (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">{t('maint.status_down')}</span>
          </div>
      );
  } else if (isMaintenance) {
       badge = (
          <div className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-amber-200 dark:border-amber-900/50">
              <Wrench className="w-4 h-4" />
              <span className="text-xs font-bold">{t('maint.status_maintenance')}</span>
          </div>
      );     
  } else {
      badge = (
          <div className="bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{t('maint.status_stable')}</span>
          </div>
      );
  }

  return (
    <button 
      onClick={() => navigate(`/maintenance/options/${device.id}`, { 
          state: { 
              backPath: '/maintenance',
              initialTab: isDown || isMaintenance ? 'history' : 'general'
          } 
      })}
      className="w-full flex items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-medical-500 dark:hover:border-medical-500 hover:shadow-md transition-all group text-right mb-3"
    >
      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden ml-4 relative border border-slate-100 dark:border-slate-700">
        <img src={device.image} alt={device.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
        {(isDown) && (
           <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-center mb-1">
           <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-medical-600 transition-colors">
             {device.name}
           </h3>
           <div className="flex-shrink-0 mr-2 scale-90 origin-right">
                {badge}
           </div>
         </div>
         <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1">
           <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500">{device.id}</span>
           <span>•</span>
           <span>{device.location}</span>
         </p>
      </div>

      <ChevronLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-medical-500 transition-colors mr-2 flex-shrink-0 rtl:rotate-180" />
    </button>
  );
};

const MaintenanceDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'corrective' | 'pm'>('corrective');

  // Filter Logic
  const correctiveDevices = DEVICES.filter(d => d.status === 'Down' || d.status === 'Maintenance');
  
  const pmDevices = DEVICES.filter(d => {
    const pmStatus = getPMStatus(d);
    return d.status === 'Operational' && (pmStatus?.isDue || pmStatus?.isOverdue);
  });

  const otherDevices = DEVICES.filter(d => !correctiveDevices.includes(d) && !pmDevices.includes(d));

  const currentList = activeTab === 'corrective' ? correctiveDevices : pmDevices;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('maint.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('maint.subtitle')}</p>
            </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder={t('maint.search_placeholder')}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pr-11 pl-4 rtl:pl-11 rtl:pr-4 text-sm font-medium focus:outline-none focus:border-medical-500 focus:ring-1 focus:ring-medical-500 transition-all text-slate-800 dark:text-white"
        />
        <Search className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>

      {/* Tabs Selector */}
      <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6">
        <button 
           onClick={() => setActiveTab('corrective')}
           className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
               activeTab === 'corrective' 
               ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' 
               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
           }`}
        >
           <AlertTriangle className="w-4 h-4" />
           <span>{t('maint.tab_faults')} ({correctiveDevices.length})</span>
        </button>
        <button 
           onClick={() => setActiveTab('pm')}
           className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
               activeTab === 'pm' 
               ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
               : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
           }`}
        >
           <CalendarClock className="w-4 h-4" />
           <span>{t('maint.tab_pm')} ({pmDevices.length})</span>
        </button>
      </div>

      {/* Dynamic List */}
      <div className="space-y-1 animate-in slide-in-from-bottom-4 duration-300 min-h-[200px]">
        {currentList.length > 0 ? (
            currentList.map(device => (
              <DeviceCard key={device.id} device={device} isPMView={activeTab === 'pm'} />
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                  <Filter className="w-8 h-8" />
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-medium">
                   {activeTab === 'corrective' ? t('maint.no_faults') : t('maint.pm_complete')}
               </p>
               <p className="text-xs text-slate-400 mt-1">{t('maint.system_ok')}</p>
            </div>
        )}
      </div>

      {/* Other Devices Section */}
      {otherDevices.length > 0 && (
        <div className="mt-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-2 mb-3 px-1 border-t border-slate-200 dark:border-slate-800 pt-6">
                <Activity className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('maint.other_devices')}</h2>
            </div>
            <div className="space-y-1 opacity-80 hover:opacity-100 transition-opacity">
                {otherDevices.slice(0, 3).map(device => (
                    <DeviceCard key={device.id} device={device} />
                ))}
            </div>
        </div>
      )}

    </div>
  );
};

export default MaintenanceDashboardView;
