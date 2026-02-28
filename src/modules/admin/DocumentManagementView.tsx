import React, { useState } from 'react';
import { FileText, Upload, Search, Trash2, Download, FileUp } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';

interface DocumentData {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  deviceCategory: string;
}

const mockDocuments: DocumentData[] = [
  { id: 'DOC-001', name: 'دليل صيانة جهاز التنفس الصناعي', type: 'PDF', size: '4.2 MB', uploadDate: '2023-10-25', deviceCategory: 'Ventilator' },
  { id: 'DOC-002', name: 'مخططات جهاز تخطيط القلب', type: 'PDF', size: '1.8 MB', uploadDate: '2023-11-02', deviceCategory: 'ECG' },
  { id: 'DOC-003', name: 'دليل تشغيل جهاز الصدمات', type: 'PDF', size: '2.5 MB', uploadDate: '2023-11-15', deviceCategory: 'Defibrillator' },
];

const DocumentManagementView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents] = useState<DocumentData[]>(mockDocuments);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredDocs = documents.filter(doc => 
    doc.name.includes(searchTerm) || doc.deviceCategory.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 pt-12 pb-6 px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">إدارة الملفات والأدلة</h1>
              <p className="text-sm text-slate-500">رفع وإدارة أدلة التشغيل والصيانة (Manuals)</p>
            </div>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
          >
            <Upload className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="البحث عن ملف أو جهاز..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6 space-y-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg line-clamp-1">{doc.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-mono">{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.deviceCategory}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">لا توجد ملفات</h3>
            <p className="text-slate-500">لم يتم العثور على ملفات تطابق بحثك.</p>
          </div>
        )}
      </div>

      {/* Upload Modal (Placeholder) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-6 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">رفع ملف جديد</h2>
            
            <div className="space-y-4">
              {/* Drag & Drop Area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">اسحب الملف هنا أو انقر للاختيار</h3>
                <p className="text-sm text-slate-500">يدعم ملفات PDF, DOCX (الحد الأقصى 50MB)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الملف / الوصف</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="مثال: دليل صيانة جهاز..." />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نوع الجهاز المرتبط</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">اختر نوع الجهاز (اختياري)</option>
                  <option value="Ventilator">جهاز تنفس صناعي (Ventilator)</option>
                  <option value="ECG">تخطيط قلب (ECG)</option>
                  <option value="Defibrillator">جهاز صدمات (Defibrillator)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
              >
                بدء الرفع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagementView;
