
import React, { useState, useMemo } from 'react';
import { History, Calendar, User, FileText, ListChecks, CheckCircle2, XCircle, AlertTriangle, Package, X, ClipboardCheck, Wrench, Activity, AlertCircle, Coins, TrendingUp, Calculator } from 'lucide-react';
import { Device, MaintenanceLog } from '../../../core/database/types';
import { useLanguage } from '../../../core/context/LanguageContext';

interface DeviceHistoryLogProps {
  device: Device;
}

const DeviceHistoryLog: React.FC<DeviceHistoryLogProps> = ({ device }) => {
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const { t } = useLanguage();

  // --- Calculate Lifecycle Totals ---
  const lifecycleStats = useMemo(() => {
      const logs = device.logs || [];
      const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
      const repairCount = logs.filter(l => l.type === 'Repair').length;
      const pmCount = logs.filter(l => l.type === 'PM').length;
      
      // Aggregate all parts ever used
      const allPartsMap = new Map<string, number>();
      logs.forEach(log => {
          if (log.parts) {
              log.parts.forEach(partName => {
                  allPartsMap.set(partName, (allPartsMap.get(partName) || 0) + 1);
              });
          }
      });

      return { totalCost, repairCount, pmCount, allPartsMap };
  }, [device.logs]);

  const getLogIcon = (type: string) => {
    switch(type) {
        case 'PM': return <ClipboardCheck className="w-6 h-6" />;
        case 'Repair': return <Wrench className="w-6 h-6" />;
        default: return <Activity className="w-6 h-6" />;
    }
  };

  const getLogColor = (type: string) => {
    switch(type) {
        case 'PM': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'Repair': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
        
        {/* --- 1. Lifecycle Summary Dashboard --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cost Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Coins className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">إجمالي الصرف (TCO)</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white">${lifecycleStats.totalCost.toLocaleString()}</p>
                </div>
            </div>

            {/* Interventions Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Wrench className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">عدد الإصلاحات</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white">{lifecycleStats.repairCount}</p>
                </div>
            </div>

            {/* Parts Summary (Dropdown style visually) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1 col-span-1">
                <div className="flex items-center gap-3 mb-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase">مجموع القطع المستهلكة</p>
                </div>
                <div className="flex flex-wrap gap-1">
                    {Array.from(lifecycleStats.allPartsMap.entries()).length > 0 ? (
                        Array.from(lifecycleStats.allPartsMap.entries()).slice(0, 3).map(([name, count], idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                                {count > 1 ? `${name} (x${count})` : name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-slate-400 italic">لم يتم استهلاك قطع</span>
                    )}
                    {lifecycleStats.allPartsMap.size > 3 && (
                        <span className="text-[10px] text-slate-400 px-1 pt-1">+{lifecycleStats.allPartsMap.size - 3} المزيد</span>
                    )}
                </div>
            </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <History className="w-4 h-4" />
                {t('history.timeline')}
            </h3>
            
            <div className="space-y-8 relative before:absolute before:inset-y-0 before:right-[7px] rtl:before:right-[7px] ltr:before:left-[7px] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
            {device.logs && device.logs.map((log) => (
                <div 
                    key={log.id} 
                    className="relative pr-8 ltr:pl-8 ltr:pr-0 cursor-pointer group"
                    onClick={() => setSelectedLog(log)}
                >
                <div className={`absolute right-0 ltr:left-0 ltr:right-auto top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 transition-all group-hover:scale-125 group-hover:ring-medical-400 ${
                    log.type === 'Repair' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>
                
                <div className="flex justify-between items-start p-3 -m-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getLogColor(log.type)}`}>
                                {log.type === 'PM' ? t('history.type_pm') : t('history.type_repair')}
                            </span>
                            <span className="text-xs text-slate-400">{log.date}</span>
                        </div>
                        {/* Show Problem Summary first if available */}
                        {log.problemDescription ? (
                            <p className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-1">{log.problemDescription}</p>
                        ) : (
                            <p className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-1">{log.action}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{log.engineerName}</span>
                            {log.cost && log.cost > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 rounded">
                                        ${log.cost}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        {log.errorCode && (
                                <span className="text-[10px] font-mono font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded ml-2">
                                {log.errorCode}
                                </span>
                        )}
                        {log.parts && log.parts.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
                                <Package className="w-3 h-3" /> {log.parts.length}
                            </span>
                        )}
                    </div>
                </div>
                </div>
            ))}

            {(!device.logs || device.logs.length === 0) && (
                <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">{t('history.no_logs')}</p>
                </div>
            )}
            </div>
        </div>

        {/* Activity Log Modal */}
        {selectedLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setSelectedLog(null)}
                ></div>
                
                <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col max-h-[90vh]">
                    
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${getLogColor(selectedLog.type)}`}>
                                {getLogIcon(selectedLog.type)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {selectedLog.type === 'PM' ? t('history.type_pm') : t('history.type_repair')}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 mt-1">{selectedLog.id}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedLog(null)} 
                            className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Modal Body (Scrollable) */}
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        
                        {/* 1. Header Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {t('history.date')}
                                </p>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedLog.date}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {t('history.engineer')}
                                </p>
                                <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedLog.engineerName}</p>
                            </div>
                        </div>

                        {/* Cost Display for this specific log */}
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30 flex justify-between items-center">
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">تكلفة هذا الإجراء</span>
                            <span className="text-xl font-mono font-bold text-green-700 dark:text-green-300">
                                ${selectedLog.cost ? selectedLog.cost.toLocaleString() : '0'}
                            </span>
                        </div>

                        {/* 2. Error Code (If exists) */}
                        {selectedLog.errorCode && (
                            <div className="border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 ltr:right-auto ltr:left-0 w-1 h-full bg-red-500"></div>
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-red-500 shadow-sm z-10">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="z-10">
                                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-0.5">{t('history.error_code')}</p>
                                    <p className="font-mono font-bold text-slate-800 dark:text-white text-xl tracking-tight">{selectedLog.errorCode}</p>
                                </div>
                            </div>
                        )}

                        {/* 3. Problem Description (What was wrong) */}
                        {selectedLog.problemDescription && (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    {t('history.problem')}
                                </h4>
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl text-slate-700 dark:text-slate-200 text-sm leading-relaxed border border-amber-100 dark:border-amber-900/30">
                                    {selectedLog.problemDescription}
                                </div>
                            </div>
                        )}

                        {/* 4. Action Taken (The Solution) */}
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                {t('history.action_taken')}
                            </h4>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed border border-slate-200 dark:border-slate-800 shadow-sm">
                                {selectedLog.action}
                            </div>
                        </div>

                        {/* 5. Detailed Checklist Results */}
                        {selectedLog.checklistData && (
                            <div className="mt-2">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <ListChecks className="w-4 h-4 text-slate-400" />
                                    Checklist Results
                                </h4>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-right ltr:text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 w-5/12">Task</th>
                                                <th className="px-4 py-3 text-center">Value</th>
                                                <th className="px-4 py-3 text-center">Ref</th>
                                                <th className="px-4 py-3 text-center">Result</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {selectedLog.checklistData.tasks.map((task: any) => {
                                                const entry = selectedLog.checklistData?.entries[task.id];
                                                if (!entry) return null;
                                                const isPass = entry.status === 'pass';
                                                const hasRange = task.min !== undefined && task.max !== undefined;
                                                
                                                return (
                                                    <React.Fragment key={task.id}>
                                                        <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                                {task.label}
                                                            </td>
                                                            <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400 text-xs">
                                                                {entry.value ? (
                                                                    <span className="dir-ltr inline-block">
                                                                        {entry.value} {task.unit || ''}
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-xs font-mono text-slate-400 dir-ltr">
                                                                {hasRange ? `${task.min} - ${task.max}` : '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {isPass ? (
                                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Pass
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                        <XCircle className="w-3 h-3" />
                                                                        Fail
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {/* Note Row */}
                                                        {entry.notes && (
                                                            <tr className="bg-red-50/50 dark:bg-red-900/10">
                                                                <td colSpan={4} className="px-4 py-2 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                                                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                                                    Note: {entry.notes}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 6. Spare Parts (Interactive) */}
                        {selectedLog.parts && selectedLog.parts.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    {t('history.parts_used')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedLog.parts.map((part: string, i: number) => (
                                        <span 
                                        key={i}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            {part}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
                        <button 
                        onClick={() => setSelectedLog(null)}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-slate-900/10"
                        >
                            {t('history.close')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DeviceHistoryLog;
