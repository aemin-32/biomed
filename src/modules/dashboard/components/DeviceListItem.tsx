
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Activity, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import { Device, DeviceStatus } from '../../../core/database/types';

interface DeviceListItemProps {
  device: Device;
}

const DeviceListItem: React.FC<DeviceListItemProps> = ({ device }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            يعمل
          </span>
        );
      case 'Maintenance':
        return (
          <span className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Wrench className="w-3 h-3" />
            صيانة
          </span>
        );
      case 'Down':
        return (
          <span className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            عطلان
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={() => navigate(`/device/${device.id}`, { 
          state: { 
              device, 
              backPath: '/devices' // Explicitly tell the profile where to go back
          } 
      })}
      className="w-full flex items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-medical-500 dark:hover:border-medical-500 transition-all group text-right"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden ml-4">
         <img src={device.image} alt={device.name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-start mb-1">
           <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-medical-600 transition-colors">
             {device.name}
           </h3>
           {getStatusBadge(device.status)}
         </div>
         <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-0.5">{device.id}</p>
         <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
           <Activity className="w-3 h-3" />
           {device.location}
         </p>
      </div>

      <ChevronLeft className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-medical-500 transition-colors mr-2" />
    </button>
  );
};

export default DeviceListItem;
