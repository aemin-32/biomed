
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  Printer,
  XCircle,
  AlertTriangle,
  Siren,
  Save
} from 'lucide-react';
import { PMChecklistTemplate } from './ChecklistLogic';
import { TaskValue } from './TaskItem';
import { Device, MaintenanceLog } from '../../../core/database/types';
import { DEVICES, ENGINEER_ACTIVITIES } from '../../../core/database/mockData';
import { useAuth } from '../../../core/context/AuthContext';

interface ReportData {
    device: Device;
    template: PMChecklistTemplate;
    entries: Record<string, TaskValue>;
    submittedAt: string;
}

const ReportView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Get data from navigation state
  const reportData = (location.state as any)?.reportData as ReportData | undefined;

  // Formatting helpers
  const reportDateObj = reportData ? new Date(reportData.submittedAt) : new Date();
  const dateStr = reportDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const isoDate = reportDateObj.toISOString().split('T')[0]; // YYYY-MM-DD for DB
  const timeStr = reportDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  // Generate a consistent ID for this session
  const [reportId] = useState(`PM-${reportDateObj.getFullYear()}-${Math.floor(Math.random() * 10000)}`);

  // Calculate failures
  const failedTasksInfo = useMemo(() => {
    if (!reportData) return { count: 0, notes: '' };
    
    let count = 0;
    let notesArr: string[] = [];

    reportData.template.tasks.forEach(task => {
        const entry = reportData.entries[task.id];
        if (entry.status === 'fail') {
            count++;
            notesArr.push(`- ${task.label}: ${entry.notes || 'Failed'}`);
        }
    });

    return { count, notes: notesArr.join('\n') };
  }, [reportData]);

  const handleSave = (nextAction: 'close' | 'ticket') => {
    if (!reportData) return;
    setIsSaving(true);
    
    // 1. Calculate Results Summary
    const isPerfect = failedTasksInfo.count === 0;
    const currentEngineerName = user?.name || 'Engineer';
    
    // 2. Create Maintenance Log Object
    const newLog: MaintenanceLog = {
        id: reportId,
        date: isoDate,
        engineerName: currentEngineerName, // Dynamic Name
        type: 'PM',
        // Create a descriptive action string based on results
        action: `Preventive Maintenance (${reportData.template.frequency}) - ${isPerfect ? 'Completed Successfully' : `${failedTasksInfo.count} Issues Found`}`,
        errorCode: failedTasksInfo.count > 0 ? 'NEEDS-ATTENTION' : undefined,
        parts: [],
        checklistData: {
            tasks: reportData.template.tasks,
            entries: reportData.entries
        }
    };

    // 3. Update the Global Mock Database (DEVICES)
    const deviceIndex = DEVICES.findIndex(d => d.id === reportData.device.id);
    if (deviceIndex !== -1) {
        // Add log to top of history
        DEVICES[deviceIndex].logs.unshift(newLog);
        
        // Update Last Maintenance Date
        if (DEVICES[deviceIndex].calibrationSpecs) {
             DEVICES[deviceIndex].calibrationSpecs!.lastDate = isoDate;
        }
    }

    // 4. Update Engineer Activity Log
    ENGINEER_ACTIVITIES.unshift({
        id: newLog.id,
        action: newLog.action,
        date: newLog.date,
        time: timeStr,
        type: 'PM',
        device: reportData.device.id,
        deviceName: reportData.device.name,
        location: reportData.device.location,
        parts: [],
        errorCode: newLog.errorCode || null,
        engineerName: currentEngineerName
    });

    // Simulate API delay then redirect
    setTimeout(() => {
      setIsSaving(false);
      
      if (nextAction === 'ticket') {
          // Navigate to Create Ticket View with Pre-filled Description
          navigate(`/maintenance/ticket/new/${reportData.device.id}`, { 
              state: {
                initialDescription: `**Issues detected during PM check:**\n\n${failedTasksInfo.notes}\n\nPlease take necessary action.`,
                initialCategory: 'Other' 
              }
          });
      } else {
          // Navigate back to history
          if (reportData.device.id) {
              navigate(`/device/${reportData.device.id}`, { state: { initialTab: 'history' } });
          } else {
              navigate('/');
          }
      }
    }, 1200);
  };

  if (!reportData) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div className="text-center p-6">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Report Data</h2>
                  <p className="text-slate-500 mb-6">Please complete the checklist first</p>
                  <button onClick={() => navigate('/')} className="text-blue-600 font-bold">Go to Dashboard</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 pb-32 transition-colors">
      
      {/* Navigation Header */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">Report Preview</h1>
      </div>

      {/* THE PAPER DOCUMENT */}
      <div className="max-w-3xl mx-auto bg-white text-slate-900 shadow-xl shadow-slate-300/50 dark:shadow-black/50 rounded-xl overflow-hidden print:shadow-none relative">
        
        {/* Decorative Top Border */}
        <div className={`h-2 w-full ${failedTasksInfo.count > 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-medical-600 to-blue-600'}`}></div>

        <div className="p-8 sm:p-10 space-y-8">
          
          {/* 1. Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-medical-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  B
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-800">BioMed OS</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Medical Engineering Dept.</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-800">Service Report</h2>
              <p className="text-sm font-mono text-slate-500 mb-1">#{reportId}</p>
              <p className="text-xs text-slate-400">{dateStr} • {timeStr}</p>
            </div>
          </div>

          {/* 2. Device Info Grid */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Asset Information</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Device Name</p>
                <p className="font-bold text-slate-800 text-sm">{reportData.device.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Model</p>
                <p className="font-bold text-slate-800 text-sm">{reportData.device.model}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Asset ID</p>
                <p className="font-mono font-bold text-slate-800 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {reportData.device.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Location</p>
                <p className="font-bold text-slate-800 text-sm">{reportData.device.location}</p>
              </div>
            </div>
          </div>

          {/* 3. Checklist Summary Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Maintenance Checklist Summary</h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-right">Task Description</th>
                    <th className="px-4 py-3 text-center">Value</th>
                    <th className="px-4 py-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.template.tasks.map((task) => {
                    const entry = reportData.entries[task.id];
                    const isPass = entry.status === 'pass';
                    const hasValue = entry.value && task.type === 'number_input';
                    
                    return (
                      <React.Fragment key={task.id}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-700 text-right">{task.label}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600">
                            {hasValue ? (
                                <span className="dir-ltr inline-block">
                                    {entry.value} {task.unit}
                                </span>
                            ) : (
                                '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPass ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                <CheckCircle2 className="w-3 h-3" /> Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full text-xs">
                                <XCircle className="w-3 h-3" /> Fail
                              </span>
                            )}
                          </td>
                        </tr>
                        {/* Show Note Row if Failed */}
                        {!isPass && entry.notes && (
                            <tr className="bg-red-50/30">
                                <td colSpan={3} className="px-4 py-2 text-right">
                                    <p className="text-xs text-red-600 font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        Note: {entry.notes}
                                    </p>
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

          {/* 4. Signature Section (Manual Only) */}
          <div className="pt-8 mt-8 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-8">Engineer Signature</p>
                <div className="border-b-2 border-slate-300 w-64 mb-2"></div>
                <p className="text-sm font-bold text-slate-800">{user?.name || 'Engineer'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Signed: {timeStr}
                </p>
              </div>
              
              <div className="text-right">
                 {failedTasksInfo.count > 0 && (
                     <div className="text-red-500 font-bold text-sm uppercase border-2 border-red-500 px-3 py-1 rounded inline-block mb-2">
                         Attention Required
                     </div>
                 )}
                 <p className="text-xs text-slate-400 mt-2">BioMed OS generated report</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. Floating Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transition-colors">
        <div className="max-w-3xl mx-auto flex gap-3">
          
          {failedTasksInfo.count > 0 ? (
              /* FAILED STATE BUTTONS */
              <>
                <button 
                    onClick={() => handleSave('ticket')}
                    disabled={isSaving}
                    className="flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 bg-red-600 hover:bg-red-700 text-white shadow-red-900/20"
                >
                    {isSaving ? (
                        <span className="animate-pulse">Saving...</span>
                    ) : (
                        <>
                            <Siren className="w-5 h-5" />
                            <span>Save & Open Ticket</span>
                        </>
                    )}
                </button>

                <button 
                    onClick={() => handleSave('close')}
                    disabled={isSaving}
                    className="flex-1 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    <span className="hidden sm:inline">Save & Close</span>
                    <span className="sm:hidden">Close</span>
                </button>
              </>
          ) : (
              /* PASSED STATE BUTTONS */
              <>
                <button 
                    onClick={() => handleSave('close')}
                    disabled={isSaving}
                    className="flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 bg-medical-600 hover:bg-medical-700 text-white shadow-medical-900/20"
                >
                    {isSaving ? (
                        <span className="animate-pulse">Saving...</span>
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Save to History</span>
                        </>
                    )}
                </button>

                <button className="px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">
                    <Share2 className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={() => window.print()}
                    className="px-4 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                </button>
              </>
          )}
          
        </div>
      </div>

    </div>
  );
};

export default ReportView;
