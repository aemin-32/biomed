
import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  ArrowRight, 
  UploadCloud, 
  HardDrive, 
  Link as LinkIcon, 
  Cloud, 
  Check, 
  Copy, 
  Save, 
  ExternalLink,
  Download
} from 'lucide-react';
import { Device } from '../../../../../core/database/types';
import { DEVICES } from '../../../../../core/database/mockData';

interface DocumentsTabProps {
  device: Device;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ device }) => {
  const [docViewMode, setDocViewMode] = useState<'LIST' | 'UPLOAD'>('LIST');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMethod, setUploadMethod] = useState<'FILE' | 'LINK' | null>(null); 
  const [, setRefresh] = useState(0); // Force re-render on save

  const [newFile, setNewFile] = useState<{
      title: string;
      type: 'Manual' | 'Report' | 'Certificate';
      fileSource: 'Local' | 'Drive' | null;
      fileName: string; 
      applyToSimilar: boolean;
  }>({
      title: '',
      type: 'Manual',
      fileSource: null,
      fileName: '',
      applyToSimilar: false
  });

  const similarDevices = DEVICES.filter(d => 
      d.manufacturer === device.manufacturer && 
      d.model === device.model && 
      d.id !== device.id
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setUploadMethod('FILE');
          setNewFile(prev => ({ 
              ...prev, 
              fileSource: 'Local', 
              fileName: file.name,
              title: prev.title || file.name.split('.')[0] 
          }));
      }
  };

  const handleLinkInput = (url: string) => {
      setNewFile(prev => ({
          ...prev,
          fileSource: 'Drive', 
          fileName: url
      }));
  };

  const handleSaveFile = () => {
      if (!newFile.title || !newFile.fileName) return;

      const newDoc = {
          id: `DOC-NEW-${Date.now()}`,
          title: newFile.title,
          type: newFile.type,
          date: new Date().toISOString().split('T')[0],
          size: newFile.fileSource === 'Local' ? '4.2 MB' : 'Link'
      };

      if (!device.documents) device.documents = [];
      device.documents.unshift(newDoc);

      if (newFile.applyToSimilar) {
          similarDevices.forEach(simDev => {
              if (!simDev.documents) simDev.documents = [];
              if (!simDev.documents.some(d => d.title === newDoc.title)) {
                  simDev.documents.unshift({ ...newDoc, id: `DOC-SIM-${Date.now()}-${Math.random()}` });
              }
          });
          alert(`تمت إضافة الملف للجهاز الحالي و ${similarDevices.length} أجهزة مشابهة.`);
      }

      setNewFile({ title: '', type: 'Manual', fileSource: null, fileName: '', applyToSimilar: false });
      setUploadMethod(null);
      setDocViewMode('LIST');
      setRefresh(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col">
        
        {/* 2A. Documents List */}
        {docViewMode === 'LIST' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">المستندات المتاحة</h3>
                    <button 
                        onClick={() => setDocViewMode('UPLOAD')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة مستند جديد
                    </button>
                </div>

                {device.documents && device.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {device.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group shadow-sm hover:shadow-md cursor-pointer">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 border border-red-100 dark:border-red-900/30">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base truncate mb-1">{doc.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{doc.type}</span>
                                        {doc.size === 'Link' ? (
                                            <span className="flex items-center gap-1 text-blue-500"><ExternalLink className="w-3 h-3" /> رابط</span>
                                        ) : (
                                            <span>• {doc.size}</span>
                                        )}
                                    </div>
                                </div>
                                <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-950 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <FileText className="w-10 h-10" />
                        </div>
                        <p className="text-slate-500 font-bold">لا توجد ملفات مرفقة لهذا الجهاز</p>
                        <button 
                            onClick={() => setDocViewMode('UPLOAD')}
                            className="mt-6 text-indigo-600 font-bold hover:underline"
                        >
                            رفع أول ملف
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* 2B. Upload Form */}
        {docViewMode === 'UPLOAD' && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
                <button 
                    onClick={() => { setDocViewMode('LIST'); setUploadMethod(null); }}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-6 font-bold transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                    عودة للقائمة
                </button>

                <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <UploadCloud className="w-6 h-6 text-indigo-500" />
                        رفع ملف جديد
                    </h3>

                    <div className="space-y-6">
                        {/* Selection Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <label 
                                className={`cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${uploadMethod === 'FILE' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                                onClick={() => setUploadMethod('FILE')}
                            >
                                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.doc,.docx,.jpg,.png" />
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploadMethod === 'FILE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <HardDrive className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">رفع ملف من الجهاز</span>
                                    <span className="text-[10px] text-slate-400">(PDF, Images)</span>
                                </div>
                            </label>

                            <button 
                                onClick={() => { setUploadMethod('LINK'); setNewFile(prev => ({...prev, fileSource: 'Drive', fileName: ''})); }}
                                className={`border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all ${uploadMethod === 'LINK' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${uploadMethod === 'LINK' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <LinkIcon className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">رابط Google Drive</span>
                                    <span className="text-[10px] text-slate-400">(URL / Share Link)</span>
                                </div>
                            </button>
                        </div>

                        {/* Dynamic Input based on selection */}
                        {uploadMethod === 'LINK' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">رابط الملف (Google Drive Link)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newFile.fileName}
                                        onChange={(e) => handleLinkInput(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                    <Cloud className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-[10px] text-amber-600 mt-1">ملاحظة: الروابط للحفظ فقط ولا يمكن للذكاء الاصطناعي قراءتها مباشرة لأسباب أمنية.</p>
                            </div>
                        )}

                        {uploadMethod === 'FILE' && newFile.fileName && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
                                <Check className="w-5 h-5 text-green-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-green-600 font-bold mb-0.5">تم اختيار الملف:</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{newFile.fileName}</p>
                                </div>
                            </div>
                        )}

                        {uploadMethod && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">عنوان الملف</label>
                                        <input 
                                            type="text" 
                                            value={newFile.title}
                                            onChange={(e) => setNewFile({...newFile, title: e.target.value})}
                                            placeholder="مثال: Service Manual 2024"
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الملف</label>
                                        <select 
                                            value={newFile.type}
                                            onChange={(e) => setNewFile({...newFile, type: e.target.value as any})}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="Manual">دليل (Manual)</option>
                                            <option value="Report">تقرير (Report)</option>
                                            <option value="Certificate">شهادة (Certificate)</option>
                                        </select>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setNewFile({...newFile, applyToSimilar: !newFile.applyToSimilar})}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                        newFile.applyToSimilar 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' 
                                        : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border mt-0.5 ${
                                        newFile.applyToSimilar ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white dark:bg-slate-800'
                                    }`}>
                                        {newFile.applyToSimilar && <Check className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${newFile.applyToSimilar ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                            تطبيق على الأجهزة المشابهة
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            سيتم إضافة الملف تلقائياً لـ <span className="font-bold text-slate-600 dark:text-slate-300">{similarDevices.length}</span> أجهزة أخرى من نفس الموديل.
                                        </p>
                                    </div>
                                    <Copy className={`w-5 h-5 ${newFile.applyToSimilar ? 'text-indigo-500' : 'text-slate-300'}`} />
                                </div>

                                <button 
                                    onClick={handleSaveFile}
                                    disabled={!newFile.title || !newFile.fileName}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Save className="w-5 h-5" />
                                    حفظ وإضافة للمكتبة
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DocumentsTab;
