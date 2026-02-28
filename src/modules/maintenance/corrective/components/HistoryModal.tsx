
import React from 'react';
import { X, History } from 'lucide-react';
import { Device } from '../../../../core/database/types';
import DeviceHistoryLog from '../../../diagnostics/components/DeviceHistoryLog';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, device }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <History className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">سجل الجهاز</h3>
                  <p className="text-xs text-slate-500 font-mono">{device.name}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 dark:bg-slate-950">
            <DeviceHistoryLog device={device} />
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
