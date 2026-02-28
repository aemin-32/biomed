
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Siren, 
  Settings2, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  Activity,
  History,
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { DEVICES } from '../../core/database/mockData';
import LogoutButton from '../../components/ui/LogoutButton';

const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
      if (user && (!user.responsibleRooms || user.responsibleRooms.length === 0)) {
          navigate('/nurse/select-rooms');
      }
  }, [user, navigate]);

  const myDevices = useMemo(() => {
      if (!user?.responsibleRooms || user.responsibleRooms.length === 0) return [];
      
      return DEVICES.filter(device => {
          return user.responsibleRooms!.some(room => 
              device.location && device.location.includes(room)
          );
      });
  }, [user, DEVICES]);

  const devicesDown = myDevices.filter(d => d.status === 'Down');
  const devicesMaintenance = myDevices.filter(d => d.status === 'Maintenance');
  const zoneStatus = devicesDown.length > 0 ? 'Critical' : devicesMaintenance.length > 0 ? 'Warning' : 'Safe';

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors overflow-hidden">
      {/* Compact Header */}
      <header className="px-4 pt-4 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
         <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm">
                    <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-slate-800 dark:text-white">أهلاً، {user?.name}</h1>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <Building2 className="w-3 h-3" />
                        <span>نطاق العمل: {user?.responsibleRooms?.length || 0} غرف</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-1">
                <LogoutButton className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors" />
            </div>
         </div>
      </header>

      <main className="p-4 space-y-4 flex-1 overflow-y-auto">
         {/* Compact Status Card */}
         <div className={`rounded-2xl p-4 shadow-md border transition-all relative overflow-hidden ${
             zoneStatus === 'Safe' 
             ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400' 
             : zoneStatus === 'Critical'
                ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-red-400 shadow-red-500/30'
                : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800'
         }`}>
            <div className="absolute -right-4 -top-4 opacity-10"><Activity className="w-24 h-24" /></div>
            
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                        {zoneStatus === 'Safe' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        {zoneStatus === 'Safe' ? 'الوضع مستقر' : zoneStatus === 'Critical' ? 'عطل طارئ' : 'صيانة'}
                    </h2>
                    <p className={`text-xs ${zoneStatus === 'Warning' ? 'text-slate-500' : 'text-white/80'}`}>
                        {zoneStatus === 'Safe' 
                            ? 'جميع الأجهزة تعمل بكفاءة.' 
                            : `${devicesDown.length} متوقفة و ${devicesMaintenance.length} في الصيانة.`}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-center min-w-[70px] ${zoneStatus !== 'Warning' ? 'bg-white/20 backdrop-blur-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <span className="block text-[10px] opacity-80 uppercase">الأجهزة</span>
                    <span className="block text-xl font-bold font-mono">{myDevices.length}</span>
                </div>
            </div>
         </div>

         {/* Compact Action Grid (Single Row) */}
         <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={() => navigate('/nurse/request')} 
                className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-red-300 h-24"
            >
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm">
                    <Siren className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white text-center">تبليغ عطل</span>
            </button>
            
            <button 
                onClick={() => navigate('/nurse/history')} 
                className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-300 h-24"
            >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <History className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white text-center">السجل</span>
            </button>
            
            <button 
                onClick={() => navigate('/nurse/select-rooms')} 
                className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:border-purple-300 h-24"
            >
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                    <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white text-center">غرفي</span>
            </button>
         </div>

         {/* Compact Active Alerts List */}
         {devicesDown.length > 0 && (
             <div className="pt-2">
                 <h3 className="text-xs font-bold text-slate-500 mb-2 px-1 uppercase tracking-wider">تنبيهات نشطة</h3>
                 <div className="space-y-2">
                     {devicesDown.map(device => (
                         <div key={device.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border-l-4 border-l-red-500 border-y border-r border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate">{device.name}</h4>
                                 <p className="text-[10px] text-slate-500 truncate">{device.location}</p>
                             </div>
                             <button onClick={() => navigate('/nurse/history')} className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded hover:bg-red-100 transition-colors">متابعة</button>
                         </div>
                     ))}
                 </div>
             </div>
         )}
      </main>
    </div>
  );
};

export default NurseDashboard;
