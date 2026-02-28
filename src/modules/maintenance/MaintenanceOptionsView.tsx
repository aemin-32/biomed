
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Wrench, 
  Scale, 
  History, 
  Sparkles,
  PlayCircle,
  Siren,
  Trash2
} from 'lucide-react';
import { DEVICES, SERVICE_REQUESTS } from '../../core/database/mockData';
import BackButton from '../../components/ui/BackButton';

const MaintenanceOptionsView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const device = DEVICES.find(d => d.id === deviceId);

  // Check for active tickets or maintenance status
  const activeTicket = SERVICE_REQUESTS.find(t => t.deviceId === deviceId && t.status !== 'Closed');
  const isMaintenance = device?.status === 'Maintenance';
  const isDown = device?.status === 'Down';
  const isScrapped = device?.status === 'Scrapped';
  
  const hasActiveIssue = isMaintenance || isDown || !!activeTicket;

  const options = [
    {
      id: 'pm',
      title: 'صيانة وقائية (PM)',
      desc: 'قوائم الفحص',
      icon: ClipboardCheck,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'hover:border-green-500',
      action: () => navigate(`/maintenance/pm/${deviceId}`)
    },
    {
      id: 'corrective',
      title: hasActiveIssue ? 'استكمال العطل' : 'صيانة علاجية',
      desc: activeTicket ? 'بلاغ مفتوح' : 'إصلاح عطل',
      icon: hasActiveIssue ? Siren : Wrench,
      color: hasActiveIssue ? 'text-red-600' : 'text-orange-600',
      bg: hasActiveIssue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
      border: hasActiveIssue ? 'border-red-200 hover:border-red-500 ring-1 ring-red-100 dark:ring-red-900' : 'hover:border-orange-500',
      action: () => {
          if (activeTicket) {
              navigate(`/maintenance/workbench/${deviceId}`, { state: { ticketData: activeTicket } });
          } else if (isMaintenance) {
              navigate(`/maintenance/workbench/${deviceId}`);
          } else {
              navigate(`/maintenance/ticket/new/${deviceId}`);
          }
      }
    },
    {
      id: 'calibration',
      title: 'المعايرة',
      desc: 'فحص الدقة',
      icon: Scale,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'hover:border-blue-500',
      action: () => navigate('/tools/calibration', { state: { fromMaintenance: true, deviceId: device?.id, deviceName: device?.name, deviceType: device?.type, deviceModel: device?.model } })
    },
    {
      id: 'history',
      title: 'سجل الخدمة',
      desc: 'تاريخ الجهاز',
      icon: History,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'hover:border-purple-500',
      action: () => navigate(`/device/${deviceId}`, { state: { initialTab: 'history' } })
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors font-sans overflow-hidden">
      <div className="flex items-center gap-3 p-4 shrink-0">
        <BackButton />
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">خيارات الصيانة</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-none">
            {device ? `${device.name}` : deviceId}
          </p>
        </div>
      </div>

      <div className="px-4 flex-1 flex flex-col justify-start gap-4">
        {isScrapped ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center shadow-lg">
                <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-1">تالف (Scrapped)</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">تم إخراج هذا الجهاز من الخدمة.</p>
                <button 
                  onClick={() => navigate(`/device/${deviceId}`, { state: { initialTab: 'history' } })}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-2 rounded-xl font-bold shadow-md text-sm"
                >
                    السجل
                </button>
            </div>
        ) : (
          <>
              {/* Active Issue Banner - Compact */}
              {hasActiveIssue && (
                  <div className={`p-3 border rounded-2xl flex items-center gap-3 animate-pulse-slow shadow-sm shrink-0 ${
                      isDown 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
                  }`}>
                      <div className="p-2 bg-white/50 dark:bg-black/20 rounded-full">
                          {isDown ? <Siren className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                          <p className="font-bold text-xs">
                              {isDown ? 'الجهاز متوقف (Down)' : 'عملية معلقة'}
                          </p>
                          <p className="text-[10px] opacity-90 truncate">
                              {activeTicket ? activeTicket.description : 'متابعة الصيانة'}
                          </p>
                      </div>
                  </div>
              )}

              {/* 2x2 Grid for Options */}
              <div className="grid grid-cols-2 gap-3 flex-1 max-h-[360px]">
                  {options.map((opt) => (
                  <button
                      key={opt.id}
                      onClick={opt.action}
                      className={`relative flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm ${opt.border} transition-all active:scale-[0.98] text-center gap-2`}
                  >
                      <div className={`p-3 rounded-xl ${opt.bg} ${opt.color} shadow-inner`}>
                          <opt.icon className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                              {opt.title}
                          </h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {opt.desc}
                          </p>
                      </div>
                  </button>
                  ))}
              </div>
              
              {/* Scrap Button - Compact */}
              <button 
                  onClick={() => navigate(`/maintenance/scrap/${deviceId}`)}
                  className="mt-auto mb-6 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-bold">إخراج من الخدمة (Scrap)</span>
              </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MaintenanceOptionsView;
