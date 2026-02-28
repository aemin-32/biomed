
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ArrowRight, Keyboard, ScanBarcode, Hash, Camera, QrCode, Printer, Download, 
  Tag, MapPin, User, FileText, Activity, Save, Zap, Truck, Anchor, Upload
} from 'lucide-react';
import { Device, DeviceStatus } from '../../../core/database/types';
import { LOCATIONS } from '../../../core/database/mockData';
import SmartDateInput from '../../../components/ui/SmartDateInput';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Device) => void;
  existingDevices: Device[];
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose, onSave, existingDevices }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalView, setModalView] = useState<'selection' | 'form'>('selection');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    department: '',
    location: '',
    responsiblePerson: '',
    status: 'Operational' as DeviceStatus,
    isPortable: true, // Default to true
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0833860?auto=format&fit=crop&q=80&w=800',
    // Power Specs
    powerVoltage: '',
    powerCurrent: '',
    powerFreq: '50'
  });

  // Track selected Department ID to filter rooms
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Dynamic Locations Data
  const departments = useMemo(() => LOCATIONS.filter(l => l.type === 'Department' && l.isEnabled), []);
  const availableRooms = useMemo(() => {
      if (!selectedDeptId) return [];
      return LOCATIONS.filter(l => l.type === 'Room' && l.isEnabled && l.parentId === selectedDeptId);
  }, [selectedDeptId]);

  if (!isOpen) return null;

  const handleAddOption = (type: string) => {
    if (type === 'scan') {
      onClose();
      navigate('/scanner');
    } else if (type === 'manual') {
      setModalView('form');
    } else {
      alert(`سيتم فتح واجهة ${type === 'serial' ? 'البحث بالسيريال' : ''} قريباً`);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      setSelectedDeptId(id);
      
      const dept = departments.find(d => d.id === id);
      setFormData(prev => ({ 
          ...prev, 
          department: dept ? dept.name : '', 
          location: '' // Reset location when department changes
      }));
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const room = availableRooms.find(r => r.id === id);
      setFormData(prev => ({ ...prev, location: room ? room.name : '' }));
  };

  const handleStatusSelect = (status: DeviceStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = () => {
    if (!formData.name) {
        alert("يرجى إدخال اسم الجهاز");
        return;
    }

    // Duplicate Check
    if (formData.serialNumber && formData.serialNumber.trim() !== '') {
      const normalizedInputSN = formData.serialNumber.trim().toUpperCase();
      const duplicateDevice = existingDevices.find(d => 
        d.serialNumber && d.serialNumber.trim().toUpperCase() === normalizedInputSN
      );

      if (duplicateDevice) {
        const confirmNav = window.confirm(
          `⚠️ تنبيه: تكرار جهاز\n\nعذراً، هذا الجهاز ذو الرقم التسلسلي (${duplicateDevice.serialNumber}) مسجل مسبقاً.\n\nهل تريد الانتقال إلى ملف الجهاز المسجل بدلاً من إنشاء جهاز جديد؟`
        );
        if (confirmNav) {
          onClose();
          navigate(`/device/${duplicateDevice.id}`, { state: { device: duplicateDevice } });
        }
        return; 
      }
    }

    const newDevice: Device = {
        id: formData.serialNumber ? `DEV-${formData.serialNumber}` : `DEV-${Math.floor(Math.random() * 9000) + 1000}`,
        name: formData.name,
        model: formData.model || 'Unknown Model',
        type: 'Medical Device',
        manufacturer: formData.manufacturer,
        serialNumber: formData.serialNumber || 'N/A',
        image: formData.image,
        location: formData.location || 'Unassigned',
        department: formData.department,
        status: formData.status,
        isPortable: formData.isPortable,
        responsiblePerson: formData.responsiblePerson,
        installDate: new Date().toISOString().split('T')[0],
        powerSpecs: {
            voltage: parseFloat(formData.powerVoltage) || 220,
            current: parseFloat(formData.powerCurrent) || 0,
            frequency: parseFloat(formData.powerFreq) || 50,
        },
        logs: []
    };

    onSave(newDevice);
    setModalView('selection'); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
             {modalView === 'form' && (
                <button onClick={() => setModalView('selection')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                </button>
             )}
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">
               {modalView === 'selection' ? 'إضافة جهاز جديد' : 'بيانات الجهاز الجديد'}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {modalView === 'selection' ? (
            <div className="p-6">
                <div className="grid grid-cols-1 gap-4">
                    {/* Manual */}
                    <button onClick={() => handleAddOption('manual')} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:shadow-md transition-all group text-right">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Keyboard className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-0.5">إضافة يدوية</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">تعبئة بيانات الجهاز يدوياً في النموذج</p>
                        </div>
                    </button>
                    {/* Scan */}
                    <button onClick={() => handleAddOption('scan')} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-medical-500 dark:hover:border-medical-500 hover:shadow-md transition-all group text-right">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ScanBarcode className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-0.5">مسح الباركود / QR</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">استخدام الكاميرا لمسح كود الجهاز</p>
                        </div>
                    </button>
                </div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
                {/* Section 1: Identity */}
                <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-medical-600 dark:text-medical-400 uppercase tracking-wider mb-4">
                        <Tag className="w-4 h-4" />
                        بيانات الهوية
                    </h3>
                    
                    {/* Image Upload Area */}
                    <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <label className="block text-xs font-bold text-slate-500 mb-2">صورة الجهاز</label>
                        <div className="flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700" onClick={triggerFileSelect}>
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <button 
                                    onClick={triggerFileSelect}
                                    className="w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl flex flex-col items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                >
                                    <Camera className="w-5 h-5 mb-1" />
                                    التقاط صورة / رفع ملف
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم الجهاز</label>
                            <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="مثال: Philips MRI" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الشركة المصنعة</label>
                            <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleFormChange} placeholder="مثال: Philips" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الموديل</label>
                            <input type="text" name="model" value={formData.model} onChange={handleFormChange} placeholder="مثال: Ingenia 3.0T" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الرقم التسلسلي</label>
                            <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleFormChange} placeholder="SN-XXXX-XXXX" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm font-mono focus:outline-none focus:ring-2 focus:ring-medical-500" />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                {/* Section 2: Location (Dynamic) */}
                <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4">
                        <MapPin className="w-4 h-4" />
                        الموقع (من إعدادات النظام)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">القسم</label>
                            <select 
                                value={selectedDeptId} 
                                onChange={handleDeptChange} 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 appearance-none"
                            >
                                <option value="">اختر القسم...</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.code ? `[${dept.code}] ` : ''}{dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الموقع / الغرفة</label>
                            {selectedDeptId ? (
                                <select 
                                    value={availableRooms.find(r => r.name === formData.location)?.id || ''} 
                                    onChange={handleRoomChange}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-medical-500 appearance-none"
                                >
                                    <option value="">اختر الغرفة...</option>
                                    {availableRooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.code ? `[${room.code}] ` : ''}{room.name}
                                        </option>
                                    ))}
                                    {availableRooms.length === 0 && <option disabled>لا توجد غرف مسجلة لهذا القسم</option>}
                                </select>
                            ) : (
                                <div className="w-full p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                                    يرجى اختيار القسم أولاً
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                {/* Section 3: Technical Specs */}
                <section>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4">
                        <Zap className="w-4 h-4" />
                        البيانات الهندسية (Power)
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">الجهد (Volt)</label>
                            <div className="relative">
                                <input type="number" name="powerVoltage" value={formData.powerVoltage} onChange={handleFormChange} placeholder="220" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">V</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">التيار (Amp)</label>
                            <div className="relative">
                                <input type="number" name="powerCurrent" value={formData.powerCurrent} onChange={handleFormChange} placeholder="5" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">A</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">التردد (Freq)</label>
                            <div className="relative">
                                <input type="number" name="powerFreq" value={formData.powerFreq} onChange={handleFormChange} placeholder="50" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hz</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                {/* Section 4: Status & Portability */}
                <section>
                     <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                        <Activity className="w-4 h-4" />
                        الحالة وقابلية النقل
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Status Toggle */}
                        <div className="flex gap-2">
                            {['Operational', 'Maintenance', 'Down'].map((status) => {
                                const isSelected = formData.status === status;
                                const colorClass = isSelected 
                                    ? (status === 'Operational' ? 'bg-green-600 text-white' : status === 'Maintenance' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white')
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500';
                                
                                return (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusSelect(status as DeviceStatus)}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${colorClass}`}
                                    >
                                        {status === 'Operational' ? 'فعال' : status === 'Maintenance' ? 'صيانة' : 'عاطل'}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Portability Toggle */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                            <div className={`p-2 rounded-lg ${formData.isPortable ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                {formData.isPortable ? <Truck className="w-6 h-6" /> : <Anchor className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <span className="block font-bold text-sm text-slate-800 dark:text-white">
                                    {formData.isPortable ? 'جهاز قابل للنقل' : 'جهاز ثابت (غير قابل للنقل)'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {formData.isPortable ? 'يمكن نقله إلى ورشة الصيانة' : 'يتم صيانته في موقعه حصراً (مثل الرنين)'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setFormData(prev => ({ ...prev, isPortable: !prev.isPortable }))}
                                className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${formData.isPortable ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                            >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-800">
           {modalView === 'selection' ? (
             <p className="text-center text-xs text-slate-400">اختر طريقة الإضافة للمتابعة</p>
           ) : (
             <button 
               onClick={handleSubmit}
               className="w-full bg-medical-600 hover:bg-medical-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-medical-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                 <Save className="w-5 h-5" />
                 <span>حفظ وإضافة الجهاز</span>
             </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default AddDeviceModal;
