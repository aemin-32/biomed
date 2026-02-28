
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertOctagon,
  X,
  Bot,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PMTask, PMFrequency, PMChecklistTemplate, addTemplate } from './ChecklistLogic';
import { generateChecklistFromAI } from '../../../core/services/geminiChecklistService';
import AIGeneratorModal from './components/AIGeneratorModal';

// --- Main Creator View ---
const PMTemplateCreator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialDeviceType = (location.state as any)?.initialDeviceType || '';
  const deviceId = (location.state as any)?.deviceId; // Get device ID to redirect back

  const [deviceType, setDeviceType] = useState(initialDeviceType);
  const [frequency, setFrequency] = useState<PMFrequency>('Monthly');
  const [tasks, setTasks] = useState<PMTask[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTask = () => {
    const newTask: PMTask = {
      id: `MANUAL-${Date.now()}`,
      label: '',
      type: 'pass_fail',
      critical: false
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<PMTask>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAIGenerated = (aiTasks: PMTask[]) => {
    setTasks(aiTasks);
  };

  const handleSave = () => {
    if (!deviceType || tasks.length === 0) {
      alert('يرجى إدخال اسم نوع الجهاز وإضافة مهمة واحدة على الأقل.');
      return;
    }
    
    setIsSaving(true);

    // Create the actual template object
    const newTemplate: PMChecklistTemplate = {
        id: `CUSTOM-${Date.now()}`,
        deviceType: deviceType.trim(),
        frequency: frequency,
        tasks: tasks
    };

    // Save it to the "Database" (Memory)
    addTemplate(newTemplate);

    setTimeout(() => {
      setIsSaving(false);
      
      if (deviceId) {
        // Redirect directly to the checklist page so the user sees the result immediately
        navigate(`/maintenance/pm/${deviceId}`);
      } else {
        alert('تم حفظ نموذج الصيانة بنجاح!');
        navigate(-1);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">منشئ النماذج</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">إنشاء قوائم فحص جديدة (PM Templates)</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95 flex items-center gap-2 animate-pulse-slow"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">توليد بالذكاء الاصطناعي</span>
          <span className="sm:hidden">AI</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الجهاز (Device Type)</label>
                 <input 
                   type="text" 
                   value={deviceType}
                   onChange={(e) => setDeviceType(e.target.value)}
                   placeholder="مثال: جهاز تنفس صناعي"
                   className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5">دورية التكرار (Frequency)</label>
                 <select 
                   value={frequency}
                   onChange={(e) => setFrequency(e.target.value as PMFrequency)}
                   className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500"
                 >
                    <option value="Weekly">أسبوعي</option>
                    <option value="Monthly">شهري</option>
                    <option value="Quarterly">ربع سنوي</option>
                    <option value="Semi-Annual">نصف سنوي</option>
                    <option value="Annual">سنوي</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Tasks Builder */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">قائمة المهام ({tasks.length})</h3>
              <button onClick={handleAddTask} className="text-xs font-bold text-medical-600 flex items-center gap-1 hover:bg-medical-50 dark:hover:bg-medical-900/20 px-2 py-1 rounded">
                 <Plus className="w-3 h-3" />
                 إضافة يدوية
              </button>
           </div>

           {tasks.length === 0 ? (
             <div 
               onClick={() => setIsAIModalOpen(true)}
               className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group"
             >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                   <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">القائمة فارغة</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                   اضغط هنا لتوليد القائمة باستخدام الذكاء الاصطناعي
                </p>
             </div>
           ) : (
             <div className="space-y-3">
               {tasks.map((task, index) => (
                 <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 animate-in slide-in-from-bottom-2">
                    <div className="flex gap-4 items-center">
                        <div className="bg-slate-100 dark:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                        {index + 1}
                        </div>
                        
                        <input 
                            type="text" 
                            value={task.label}
                            onChange={(e) => handleUpdateTask(task.id, { label: e.target.value })}
                            placeholder="وصف المهمة (مثال: قياس حرارة وحدة التبريد)"
                            className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold focus:outline-none focus:border-medical-500"
                        />

                        <div className="flex items-center gap-2 shrink-0">
                            <button 
                                onClick={() => handleUpdateTask(task.id, { critical: !task.critical })}
                                className={`p-2 rounded-lg transition-colors ${
                                task.critical 
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                                }`}
                                title="Critical Task"
                            >
                                <AlertOctagon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Configuration Row */}
                    <div className="flex gap-4 pl-12">
                       <div className="flex-1">
                         <select 
                           value={task.type}
                           onChange={(e) => handleUpdateTask(task.id, { type: e.target.value as any })}
                           className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
                         >
                           <option value="pass_fail">نعم/لا (Pass/Fail)</option>
                           <option value="number_input">قيمة رقمية (Numeric Range)</option>
                           <option value="text_note">ملاحظة نصية (Text)</option>
                         </select>
                       </div>

                       {task.type === 'number_input' && (
                         <div className="flex gap-2 flex-[2] animate-in fade-in slide-in-from-left-2">
                           <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full p-2.5 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold focus:border-medical-500 focus:outline-none"
                                    value={task.min || ''}
                                    onChange={(e) => handleUpdateTask(task.id, { min: parseFloat(e.target.value) })}
                                />
                                <span className="absolute -top-2 right-2 bg-white dark:bg-slate-900 px-1 text-[9px] text-slate-400">Min</span>
                           </div>
                           <div className="relative flex-1">
                                <input 
                                    type="number" 
                                    placeholder="100" 
                                    className="w-full p-2.5 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold focus:border-medical-500 focus:outline-none"
                                    value={task.max || ''}
                                    onChange={(e) => handleUpdateTask(task.id, { max: parseFloat(e.target.value) })}
                                />
                                <span className="absolute -top-2 right-2 bg-white dark:bg-slate-900 px-1 text-[9px] text-slate-400">Max</span>
                           </div>
                           <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Unit (e.g. °C)"
                                    value={task.unit || ''}
                                    onChange={(e) => handleUpdateTask(task.id, { unit: e.target.value })}
                                    className="w-full p-2.5 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:border-medical-500 focus:outline-none" 
                                />
                           </div>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-lg z-40">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg bg-medical-600 hover:bg-medical-700 text-white transition-all active:scale-95"
        >
           {isSaving ? 'جاري الحفظ...' : 'حفظ النموذج'}
        </button>
      </div>
      
      <AIGeneratorModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onSuccess={handleAIGenerated}
        initialDeviceName={deviceType}
      />
    </div>
  );
};

export default PMTemplateCreator;
