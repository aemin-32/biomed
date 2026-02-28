
import React from 'react';
import { X, Circle, CheckCircle2, AlertCircle } from 'lucide-react';
import { PMTask } from './ChecklistLogic';

export interface TaskValue {
  value: string | number | null;
  status: 'pass' | 'fail' | 'pending';
  notes: string;
}

interface TaskItemProps {
  task: PMTask;
  currentEntry: TaskValue;
  onChange: (updates: Partial<TaskValue>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, currentEntry, onChange }) => {
  const { status, value, notes } = currentEntry;

  const handleTogglePass = () => {
    // If it's already passed, toggle back to pending (undo)
    if (status === 'pass') {
      onChange({ status: 'pending', value: null });
    } else {
      // Otherwise set to pass
      onChange({ status: 'pass', value: 'Pass', notes: '' });
    }
  };

  const handleFail = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle fail or set fail
    if (status === 'fail') {
        onChange({ status: 'pending', value: null });
    } else {
        onChange({ status: 'fail', value: 'Fail' });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const val = parseFloat(rawVal);
    
    let newStatus: 'pass' | 'fail' | 'pending' = 'pending';
    
    if (rawVal === '') {
      newStatus = 'pending';
    } else if (task.min !== undefined && task.max !== undefined) {
      newStatus = (val >= task.min && val <= task.max) ? 'pass' : 'fail';
    } else {
      newStatus = 'pass';
    }

    onChange({ value: rawVal, status: newStatus });
  };

  return (
    <div className={`relative p-4 rounded-2xl border transition-all duration-200 ${
      status === 'pass' 
        ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900/50 shadow-sm' 
        : status === 'fail' 
          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700'
    }`}>
      
      <div className="flex items-start justify-between gap-4">
        
        {/* Content (Text) */}
        <div className="flex-1 pt-1.5 cursor-pointer" onClick={task.type === 'pass_fail' ? handleTogglePass : undefined}>
            <div className="flex items-start gap-2 mb-1">
                <span className={`text-sm font-bold leading-tight ${
                    status === 'pass' ? 'text-slate-500 line-through decoration-slate-300 dark:decoration-slate-700 opacity-80' : 
                    status === 'fail' ? 'text-red-700 dark:text-red-400' :
                    'text-slate-800 dark:text-white'
                }`}>
                    {task.label}
                </span>
                {task.critical && (
                    <span className="shrink-0 text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                        حرج
                    </span>
                )}
            </div>
            {task.instruction && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{task.instruction}</p>
            )}
        </div>

        {/* Controls (Icons/Inputs) */}
        <div className="flex items-center gap-3 self-start">
            
            {/* 1. Number Input Type */}
            {task.type === 'number_input' && (
                <div className="flex flex-col items-end gap-1">
                    {/* Range Guide (The "From-To" indicator) */}
                    {(task.min !== undefined && task.max !== undefined) && (
                        <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded dir-ltr">
                                {task.min} - {task.max}
                            </span>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="number"
                            value={value || ''}
                            onChange={handleNumberChange}
                            placeholder="-"
                            className={`w-24 py-2 px-3 text-center bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-sm focus:outline-none transition-colors ${
                                status === 'pass' ? 'border-green-500 text-green-600 dark:text-green-400' :
                                status === 'fail' ? 'border-red-500 text-red-600 dark:text-red-400' :
                                'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:border-blue-500'
                            }`}
                        />
                        {task.unit && (
                            <span className="absolute -bottom-4 right-1/2 translate-x-1/2 text-[9px] font-bold text-slate-400">
                                {task.unit}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 2. Pass/Fail Type (Toggle) */}
            {task.type === 'pass_fail' && (
                <>
                    {/* Fail Button (Visible if not passed, or if failed) */}
                    {status !== 'pass' && (
                        <button
                            onClick={handleFail}
                            className={`p-2 rounded-full transition-all active:scale-95 ${
                                status === 'fail'
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                                : 'text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title="تسجيل مشكلة"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Pass Toggle (Main) */}
                    <button
                        onClick={handleTogglePass}
                        className={`transition-all duration-300 rounded-full active:scale-90 ${
                            status === 'pass'
                            ? 'text-emerald-500 dark:text-emerald-400 scale-110'
                            : status === 'fail'
                                ? 'text-slate-200 dark:text-slate-700 scale-90' // Dimmed if failed
                                : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400'
                        }`}
                    >
                        {status === 'pass' ? (
                            <CheckCircle2 className="w-8 h-8 fill-emerald-50 dark:fill-emerald-900/20" />
                        ) : (
                            <Circle className="w-8 h-8 stroke-[1.5]" />
                        )}
                    </button>
                </>
            )}

            {/* 3. Text Note Type */}
            {task.type === 'text_note' && (
                 <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                    <input 
                        type="text" 
                        value={notes || ''}
                        onChange={(e) => onChange({ notes: e.target.value, status: e.target.value ? 'pass' : 'pending' })}
                        placeholder="أدخل ملاحظة..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-32"
                    />
                 </div>
            )}
        </div>
      </div>

      {/* Failure Reason Input (Appears when Failed) */}
      {status === 'fail' && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-1">
           <input 
             type="text" 
             value={notes}
             onChange={(e) => onChange({ notes: e.target.value })}
             placeholder="يرجى كتابة سبب الفشل أو وصف المشكلة..."
             className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 placeholder:text-red-300 dark:placeholder:text-red-700/50"
             autoFocus
           />
        </div>
      )}
    </div>
  );
};

export default TaskItem;
