
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Calendar, Trash2, AlertCircle, Clock } from 'lucide-react';
import { DEVICES } from '../../../core/database/mockData';
import { getTemplatesForDevice, PMChecklistTemplate, deleteTemplate, PMFrequency } from './ChecklistLogic';
import TaskItem, { TaskValue } from './TaskItem';

const PMChecklistView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  
  // Data Lookup
  const device = DEVICES.find(d => d.id === deviceId);
  
  // State
  const [availableTemplates, setAvailableTemplates] = useState<PMChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PMChecklistTemplate | null>(null);
  const [checklistValues, setChecklistValues] = useState<Record<string, TaskValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Templates on Mount
  useEffect(() => {
    if (device) {
        refreshTemplates();
    }
  }, [device]);

  const refreshTemplates = () => {
    if (device) {
        const templates = getTemplatesForDevice(device.model);
        setAvailableTemplates(templates);
        // Default to Weekly if exists, otherwise first available
        if (templates.length > 0 && !selectedTemplate) {
            const defaultTemplate = templates.find(t => t.frequency === 'Weekly') || templates[0];
            setSelectedTemplate(defaultTemplate);
        } else if (selectedTemplate) {
            // Re-verify selected template still exists (in case of deletion)
            const exists = templates.find(t => t.id === selectedTemplate.id);
            if (!exists && templates.length > 0) {
                setSelectedTemplate(templates[0]);
            } else if (!exists) {
                setSelectedTemplate(null);
            }
        }
    }
  };

  // Reset checklist when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialValues: Record<string, TaskValue> = {};
      selectedTemplate.tasks.forEach(task => {
        initialValues[task.id] = { value: null, status: 'pending', notes: '' };
      });
      setChecklistValues(initialValues);
    }
  }, [selectedTemplate]);

  // Handle Updates
  const handleTaskChange = (taskId: string, updates: Partial<TaskValue>) => {
    setChecklistValues(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates }
    }));
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return;
    if (window.confirm('هل أنت متأكد من حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.')) {
        deleteTemplate(selectedTemplate.id);
        setSelectedTemplate(null); // Clear selection to force refresh logic
        refreshTemplates();
    }
  };

  // Progress Calculation
  const totalTasks = selectedTemplate?.tasks.length || 0;
  const completedTasks = (Object.values(checklistValues) as TaskValue[]).filter(item => {
    if (item.status === 'pending') return false;
    if (item.status === 'pass') return true;
    if (item.status === 'fail' && item.notes.trim().length > 0) return true;
    return false;
  }).length;
  
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isComplete = totalTasks > 0 && progressPercent === 100;

  // Submit Handler
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Prepare data to pass to report view
    const reportPayload = {
        device: device,
        template: selectedTemplate,
        entries: checklistValues,
        submittedAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/maintenance/report/${deviceId}`, { state: { reportData: reportPayload } });
    }, 1000);
  };

  const getFrequencyLabel = (freq: PMFrequency) => {
      switch(freq) {
          case 'Weekly': return 'أسبوعي (Weekly)';
          case 'Monthly': return 'شهري (Monthly)';
          case 'Quarterly': return 'ربع سنوي (Quarterly)';
          case 'Semi-Annual': return 'نصف سنوي (Semi-Annual)';
          case 'Annual': return 'سنوي (Annual)';
          default: return freq;
      }
  };

  if (!device) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">الجهاز غير موجود</h2>
          <button onClick={() => navigate(-1)} className="text-blue-500 font-bold">عودة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-32 font-sans">
      
      {/* 1. Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="px-5 py-4">
            
            {/* Top Row: Back & Title */}
            <div className="flex items-center gap-3 mb-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">فحص الصيانة الوقائية</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{device.name}</p>
                </div>
            </div>

            {/* Selection Row: Frequency Dropdown */}
            {availableTemplates.length > 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            الفترة (Frequency)
                        </label>
                        
                        {/* Creation Date Badge */}
                        {selectedTemplate?.createdAt && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3" />
                                تم الإنشاء: {selectedTemplate.createdAt}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <select 
                            value={selectedTemplate?.id || ''} 
                            onChange={(e) => {
                                const t = availableTemplates.find(t => t.id === e.target.value);
                                if (t) setSelectedTemplate(t);
                            }}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-bold rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-medical-500"
                        >
                            {availableTemplates.map(t => (
                                <option key={t.id} value={t.id}>
                                    {getFrequencyLabel(t.frequency)}
                                </option>
                            ))}
                        </select>

                        {/* Delete Button (Only shows if template is custom/created manually, assuming IDs without generic names are custom, or simply allow all deletions for now) */}
                        {selectedTemplate && (
                            <button 
                                onClick={handleDeleteTemplate}
                                className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                title="حذف القائمة"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-200">لا توجد قوائم فحص متاحة لهذا الجهاز.</p>
                </div>
            )}
            
            {/* Progress Bar (Only if template selected) */}
            {selectedTemplate && (
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                        className={`h-full transition-all duration-500 ease-out rounded-full ${
                            isComplete ? 'bg-green-500' : 'bg-medical-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[3rem] text-left dir-ltr">
                        {Math.round(progressPercent)}%
                    </span>
                </div>
            )}
        </div>
      </div>

      {/* 2. Tasks List */}
      <div className="px-4 py-6 space-y-4">
        {selectedTemplate ? (
            selectedTemplate.tasks.map((task) => (
            <TaskItem 
                key={task.id}
                task={task}
                currentEntry={checklistValues[task.id] || { value: null, status: 'pending', notes: '' }}
                onChange={(updates) => handleTaskChange(task.id, updates)}
            />
            ))
        ) : (
            <div className="text-center py-10 text-slate-400">
                <p>يرجى اختيار فترة الصيانة لبدء الفحص</p>
                <button 
                    onClick={() => navigate('/maintenance/templates/new', { state: { initialDeviceType: `${device.type} ${device.model}`, deviceId: device.id } })}
                    className="mt-4 text-medical-600 font-bold hover:underline"
                >
                    + إنشاء قائمة جديدة
                </button>
            </div>
        )}
      </div>

      {/* 3. Footer Action */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40">
            <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                !isComplete
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-medical-600 hover:bg-medical-700 text-white shadow-medical-900/20'
            }`}
            >
            {isSubmitting ? (
                <span className="animate-pulse">جاري المعالجة...</span>
            ) : (
                <>
                <Save className="w-5 h-5" />
                <span>إكمال وإرسال التقرير</span>
                </>
            )}
            </button>
        </div>
      )}

    </div>
  );
};

export default PMChecklistView;
