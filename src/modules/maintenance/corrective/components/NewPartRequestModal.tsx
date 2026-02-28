
import React, { useState } from 'react';
import { 
  X, Printer, FileText, Save, ArrowLeft, Building2, User, Calendar, 
  Package, Hash, Layers, AlertCircle, UploadCloud, Loader2, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../../../core/context/AuthContext';
import { FileService } from '../../../../core/services/fileService';

interface NewPartRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewPartRequestModal: React.FC<NewPartRequestModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [view, setView] = useState<'FORM' | 'PREVIEW'>('FORM');
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    partName: '',
    model: '', // Version/Model
    manufacturer: '',
    quantity: 1,
    reason: '',
    urgency: 'Normal'
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDevice = async () => {
    const element = document.getElementById('printable-report');
    if (!element) return;
    
    // Check if html2pdf is available globally
    if (typeof (window as any).html2pdf === 'undefined') {
        alert("مكتبة PDF غير متوفرة.");
        return;
    }

    setIsDownloading(true);
    setSaveSuccess(false);

    try {
        const fileName = `REQ_${Date.now()}.pdf`;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: fileName,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // 1. Generate PDF Data URI
        const worker = (window as any).html2pdf().set(opt).from(element);
        const pdfBase64 = await worker.outputPdf('datauristring');

        // 2. Save using FileService (Native)
        await FileService.saveFile(fileName, pdfBase64, 'BioMed_OS/Requests');
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

    } catch (error) {
        console.error("Save failed:", error);
        alert("حدث خطأ أثناء محاولة الحفظ.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!formData.partName) {
        alert("يرجى إدخال اسم القطعة على الأقل");
        return;
    }
    setView('PREVIEW');
  };

  // --- Print Styles ---
  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      html, body { height: auto !important; overflow: visible !important; background: white !important; }
      #printable-report, #printable-report * { visibility: visible; }
      #printable-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; color: black; border: none; box-shadow: none; z-index: 9999; display: block !important; }
      .no-print, .fixed, .absolute { display: none !important; }
    }
  `;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <style>{printStyles}</style>
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity no-print" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header (No Print) */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 no-print">
           <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
             <FileText className="w-5 h-5 text-indigo-500" />
             {view === 'FORM' ? 'طلب قطعة غير متوفرة' : 'معاينة طلب الشراء'}
           </h3>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-6">
            
            {/* VIEW 1: DATA ENTRY FORM */}
            {view === 'FORM' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            استخدم هذا النموذج لطلب قطع غيار غير موجودة في النظام. سيتم إنشاء تقرير رسمي لتقديمه لقسم المشتريات.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم القطعة (Item Name) <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={formData.partName}
                                onChange={e => setFormData({...formData, partName: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                                placeholder="مثال: Power Supply Unit 24V"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">الشركة المصنعة (Manufacturer)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={formData.manufacturer}
                                        onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                                        className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                                        placeholder="اختياري"
                                    />
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">الإصدار / الموديل (Model/Part No)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={formData.model}
                                        onChange={e => setFormData({...formData, model: e.target.value})}
                                        className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                                        placeholder="اختياري"
                                    />
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">الكمية المطلوبة</label>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                                    <button onClick={() => setFormData(prev => ({...prev, quantity: Math.max(1, prev.quantity - 1)}))} className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-700">-</button>
                                    <span className="flex-1 text-center font-bold text-lg">{formData.quantity}</span>
                                    <button onClick={() => setFormData(prev => ({...prev, quantity: prev.quantity + 1}))} className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-700">+</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">الأهمية</label>
                                <select 
                                    value={formData.urgency}
                                    onChange={e => setFormData({...formData, urgency: e.target.value})}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="Normal">عادي</option>
                                    <option value="Urgent">عاجل</option>
                                    <option value="Critical">حرج (توقف جهاز)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">مبررات الطلب (اختياري)</label>
                            <textarea 
                                value={formData.reason}
                                onChange={e => setFormData({...formData, reason: e.target.value})}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 h-24 resize-none"
                                placeholder="سبب الحاجة لهذه القطعة..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: REPORT PREVIEW (This part will be printed/saved) */}
            {view === 'PREVIEW' && (
                <div id="printable-report" className="bg-white text-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 mx-auto max-w-xl animate-in zoom-in-95 duration-300">
                    
                    {/* Report Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">طلب شراء مواد</h1>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Material Requisition Form</p>
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-slate-900 text-white flex items-center justify-center font-bold rounded">B</div>
                                <span className="font-bold">BioMed OS</span>
                            </div>
                            <p className="text-xs text-slate-500">Ref: REQ-{Date.now().toString().slice(-6)}</p>
                            <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    {/* Requester Info */}
                    <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-transparent print:border-slate-300">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">مقدم الطلب (Requested By)</p>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-sm">{user?.name || 'المهندس المختص'}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">القسم (Department)</p>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-sm">{user?.department || 'الهندسة الطبية'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Item Details Table */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-2 mb-4">تفاصيل المادة (Item Details)</h3>
                        
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-bold text-slate-500 w-1/3">اسم المادة</td>
                                    <td className="py-3 font-bold text-xl text-slate-900">{formData.partName}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-bold text-slate-500">الشركة المصنعة</td>
                                    <td className="py-3 font-medium">{formData.manufacturer || '-'}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-bold text-slate-500">الموديل / الإصدار</td>
                                    <td className="py-3 font-mono">{formData.model || '-'}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-bold text-slate-500">الكمية المطلوبة</td>
                                    <td className="py-3">
                                        <span className="bg-slate-900 text-white px-3 py-1 rounded-md font-bold text-sm print:bg-transparent print:text-black print:border print:border-black">
                                            {formData.quantity} قطعة
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-bold text-slate-500">درجة الأهمية</td>
                                    <td className="py-3 font-bold text-slate-800 uppercase">{formData.urgency}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Justification */}
                    {formData.reason && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-300 pb-2 mb-2">المبررات (Justification)</h3>
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100 print:bg-transparent print:border-none print:p-0">
                                {formData.reason}
                            </p>
                        </div>
                    )}

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-10 mt-12 pt-12 border-t-2 border-slate-100 print:mt-20 print:pt-4">
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 mb-8 uppercase">توقيع المهندس</p>
                            <div className="h-0.5 w-32 bg-slate-300 mx-auto"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 mb-8 uppercase">موافقة المدير</p>
                            <div className="h-0.5 w-32 bg-slate-300 mx-auto"></div>
                        </div>
                    </div>

                </div>
            )}

        </div>

        {/* Footer Actions (No Print) */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 no-print flex gap-3">
            {view === 'FORM' ? (
                <>
                    <button onClick={onClose} className="flex-1 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300">
                        إلغاء
                    </button>
                    <button 
                        onClick={handleGenerateReport} 
                        className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        إنشاء التقرير
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => setView('FORM')} className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2" title="تعديل">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">تعديل</span>
                    </button>
                    
                    {/* Native Download Button */}
                    <button 
                        onClick={handleSaveToDevice} 
                        disabled={isDownloading}
                        className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all ${
                            saveSuccess ? 'bg-green-600' : 'bg-sky-600 hover:bg-sky-700'
                        }`}
                    >
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : saveSuccess ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <UploadCloud className="w-5 h-5" />
                        )}
                        <span className="hidden sm:inline">
                            {saveSuccess ? 'تم الحفظ في الهاتف' : 'حفظ PDF'}
                        </span>
                        <span className="sm:hidden">
                            {saveSuccess ? 'OK' : 'PDF'}
                        </span>
                    </button>

                    <button 
                        onClick={handlePrint} 
                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" />
                        <span className="hidden sm:inline">طباعة</span>
                        <span className="sm:hidden">Print</span>
                    </button>
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default NewPartRequestModal;
