
import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Sparkles, 
  BookOpen
} from 'lucide-react';
import { Device } from '../../../../core/database/types';
import AIGuideTab from './guide/AIGuideTab';
import DocumentsTab from './guide/DocumentsTab';

interface DeviceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
}

const DeviceGuideModal: React.FC<DeviceGuideModalProps> = ({ isOpen, onClose, device }) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'ai' | 'docs'>('ai');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      {/* Main Container */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-5xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
           <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl sm:rounded-2xl">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                  <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-white">الدليل الفني</h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                      <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">{device.model}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{device.manufacturer}</span>
                  </p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Mobile Tabs (Visible only on small screens) */}
            <div className="flex md:hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button 
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'ai' 
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:text-indigo-400' 
                        : 'border-transparent text-slate-500'
                    }`}
                >
                    <Sparkles className="w-4 h-4" />
                    المساعد الذكي
                </button>
                <button 
                    onClick={() => setActiveTab('docs')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'docs' 
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:text-indigo-400' 
                        : 'border-transparent text-slate-500'
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    المستندات
                </button>
            </div>

            {/* Desktop Sidebar (Hidden on mobile) */}
            <div className="hidden md:flex w-64 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col p-4 gap-3 shrink-0">
                <button 
                    onClick={() => setActiveTab('ai')}
                    className={`p-4 rounded-2xl text-start transition-all flex items-center gap-3 ${
                        activeTab === 'ai' 
                        ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                >
                    <Sparkles className="w-5 h-5" />
                    <div>
                        <span className="block font-bold text-sm">المساعد الذكي</span>
                        <span className="block text-[10px] opacity-70">البحث داخل الكتالوج</span>
                    </div>
                </button>

                <button 
                    onClick={() => setActiveTab('docs')}
                    className={`p-4 rounded-2xl text-start transition-all flex items-center gap-3 ${
                        activeTab === 'docs' 
                        ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/10' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                >
                    <FileText className="w-5 h-5" />
                    <div>
                        <span className="block font-bold text-sm">الملفات والمستندات</span>
                        <span className="block text-[10px] opacity-70">{device.documents?.length || 0} ملف مرفق</span>
                    </div>
                </button>
            </div>

            {/* Main Viewing Area */}
            <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar p-4 sm:p-6 relative">
                {activeTab === 'ai' && <AIGuideTab device={device} />}
                {activeTab === 'docs' && <DocumentsTab device={device} />}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceGuideModal;
