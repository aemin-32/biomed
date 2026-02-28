
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  QrCode, 
  Search, 
  AlertTriangle, 
  User, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Zap, 
  MonitorX, 
  Volume2, 
  Stethoscope, 
  HelpCircle,
  Home,
  List,
  ChevronLeft
} from 'lucide-react';
import { DEVICES, SERVICE_REQUESTS } from '../../core/database/mockData';
import { ServiceRequest } from '../../core/database/types';
import { useAuth } from '../../core/context/AuthContext';

const ServiceRequestView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showMyDevices, setShowMyDevices] = useState(false);
  
  const [deviceId, setDeviceId] = useState('');
  const [deviceDetails, setDeviceDetails] = useState<any>(null);
  
  // Important Data Fields
  const [issueCategory, setIssueCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isPatientAffected, setIsPatientAffected] = useState<boolean | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  
  // Ticket ID for success screen
  const [ticketId, setTicketId] = useState('');

  // Handle passed state (Auto-select if device passed from profile)
  useEffect(() => {
      const passedDevice = (location.state as any)?.device;
      if (passedDevice) {
          setDeviceDetails(passedDevice);
          setStep(2); // Skip search step
      }
  }, [location.state]);

  // Filter Devices for "My Devices" list
  const myDevices = useMemo(() => {
      if (!user?.responsibleRooms || user.responsibleRooms.length === 0) return [];
      return DEVICES.filter(device => 
          user.responsibleRooms!.some(room => 
              device.location && device.location.includes(room)
          )
      );
  }, [user]);

  const handleDeviceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId.trim()) return;
    
    const device = DEVICES.find(d => d.id === deviceId.toUpperCase() || d.serialNumber === deviceId.toUpperCase());
    if (device) {
        setDeviceDetails(device);
        // Don't auto jump, let them confirm visual
    } else {
        alert('جهاز غير موجود، يرجى التأكد من الرمز (مثال: DEV-MRI-01)');
    }
  };

  const handleSelectFromList = (device: any) => {
      setDeviceDetails(device);
      setShowMyDevices(false);
      setStep(2);
  };

  const handleSubmit = () => {
    if (!description || !issueCategory || isPatientAffected === null || !deviceDetails) {
        alert('يرجى تعبئة جميع الحقول المطلوبة');
        return;
    }
    
    const newTicketId = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    
    // Create the Request Object
    const newRequest: ServiceRequest = {
        id: newTicketId,
        deviceId: deviceDetails.id,
        deviceName: deviceDetails.name,
        location: deviceDetails.location,
        department: deviceDetails.department || 'General',
        issueCategory: issueCategory,
        description: description,
        priority: isPatientAffected ? 'Critical' : 'Normal',
        isPatientAffected: isPatientAffected,
        requestedBy: user?.name || 'Unknown',
        contactPhone: contactPhone,
        timestamp: new Date().toISOString(),
        status: 'Open'
    };

    // 1. Push to Global Requests List
    SERVICE_REQUESTS.unshift(newRequest);

    // 2. Update Device Status to 'Down' (Reported)
    const devIndex = DEVICES.findIndex(d => d.id === deviceDetails.id);
    if (devIndex !== -1) {
        DEVICES[devIndex].status = 'Down';
    }

    setTicketId(newTicketId);
    setStep(3);
  };

  const categories = [
    { id: 'Power', label: 'لا يعمل (Power)', icon: Zap, color: 'text-amber-500' },
    { id: 'Display', label: 'الشاشة / العرض', icon: MonitorX, color: 'text-blue-500' },
    { id: 'Alarm', label: 'إنذار صوتي', icon: Volume2, color: 'text-red-500' },
    { id: 'Physical', label: 'كسر / ضرر', icon: Stethoscope, color: 'text-purple-500' },
    { id: 'Other', label: 'أخرى', icon: HelpCircle, color: 'text-slate-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors">
      
      {/* Header */}
      {step !== 3 && (
        <div className="bg-white dark:bg-slate-900 px-6 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-20">
            <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ArrowRight className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">طلب صيانة جديد</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">الخطوة {step} من 2</p>
            </div>
        </div>
      )}

      <div className="p-6 max-w-xl mx-auto space-y-6">
         
         {/* STEP 1: Identify Device */}
         {step === 1 && !showMyDevices && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="text-center py-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">تعريف الجهاز</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">للبدء، يرجى تحديد الجهاز العاطل</p>
                </div>

                {/* Scan Button */}
                <button 
                    onClick={() => navigate('/scanner')}
                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-6 rounded-3xl shadow-lg active:scale-95 transition-all flex flex-col items-center gap-3 group"
                >
                    <div className="w-16 h-16 bg-white/10 dark:bg-slate-200/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <QrCode className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-lg">مسح رمز الاستجابة (Scan QR)</span>
                </button>

                {/* Browse My Devices Button (NEW) */}
                <button 
                    onClick={() => setShowMyDevices(true)}
                    className="w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-800 active:scale-95 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                            <List className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="text-right">
                            <span className="font-bold block">اختر من أجهزتي</span>
                            <span className="text-xs opacity-70">عرض الأجهزة في الغرف المسؤولة عنها</span>
                        </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 opacity-50" />
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold">أو البحث بالرقم</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <form onSubmit={handleDeviceSearch} className="space-y-4">
                    <div className="relative">
                        <input 
                          type="text" 
                          value={deviceId}
                          onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
                          placeholder="مثال: DEV-MRI-01"
                          className="w-full p-4 pl-14 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg focus:border-emerald-500 focus:outline-none transition-colors uppercase placeholder:normal-case"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search className="w-6 h-6" />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={!deviceId.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-md transition-all active:scale-95"
                    >
                        بحث ومتابعة
                    </button>
                </form>

                {deviceDetails && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm">
                                <img src={deviceDetails.image} alt="" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{deviceDetails.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{deviceDetails.model}</p>
                                <div className="flex items-center gap-1 mt-1 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                    <MapPin className="w-3 h-3" />
                                    {deviceDetails.location}
                                </div>
                            </div>
                        </div>
                        <button 
                          onClick={() => setStep(2)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            تأكيد هذا الجهاز
                        </button>
                    </div>
                )}
            </div>
         )}

         {/* LIST: Browse My Devices */}
         {step === 1 && showMyDevices && (
             <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                 <button onClick={() => setShowMyDevices(false)} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4">
                     <ArrowRight className="w-4 h-4" />
                     العودة
                 </button>
                 
                 {myDevices.length > 0 ? (
                     myDevices.map(dev => (
                         <button 
                            key={dev.id}
                            onClick={() => handleSelectFromList(dev)}
                            className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 text-right hover:border-emerald-500 transition-all active:scale-95"
                         >
                             <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                 <img src={dev.image} className="w-full h-full object-cover rounded-xl opacity-80" alt="" />
                             </div>
                             <div className="flex-1">
                                 <h4 className="font-bold text-slate-800 dark:text-white text-sm">{dev.name}</h4>
                                 <p className="text-xs text-slate-500">{dev.location}</p>
                             </div>
                             <ChevronLeft className="w-4 h-4 text-slate-300" />
                         </button>
                     ))
                 ) : (
                     <div className="text-center py-10 text-slate-400">
                         <p>لا توجد أجهزة في الغرف المختارة.</p>
                     </div>
                 )}
             </div>
         )}

         {/* STEP 2: Fill Important Data */}
         {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                
                {/* Device Summary Mini */}
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-800">
                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{deviceDetails?.name}</span>
                    <span className="text-slate-400 text-xs mr-auto font-mono bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{deviceDetails?.id}</span>
                </div>

                {/* 1. Issue Category */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">نوع المشكلة</label>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setIssueCategory(cat.label)}
                              className={`p-4 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-2 ${
                                issueCategory === cat.label 
                                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white shadow-lg scale-[1.02]' 
                                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                              }`}
                            >
                                <cat.icon className={`w-6 h-6 ${issueCategory === cat.label ? 'text-white dark:text-slate-900' : cat.color}`} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Critical Safety Question (Redesigned) */}
                <div className={`p-5 rounded-2xl border-2 transition-colors ${
                    isPatientAffected === true 
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-500' 
                        : isPatientAffected === false
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}>
                    <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${isPatientAffected === true ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <label className="font-bold text-slate-800 dark:text-white text-base">هل الجهاز متصل بمريض حالياً؟</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">يحدد هذا السؤال أولوية الاستجابة</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsPatientAffected(true)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                                isPatientAffected === true 
                                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-red-50'
                            }`}
                        >
                            نعم (خطر)
                        </button>
                        <button 
                            onClick={() => setIsPatientAffected(false)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                                isPatientAffected === false
                                ? 'bg-green-600 text-white border-green-600 shadow-md' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-green-50'
                            }`}
                        >
                            لا (آمن)
                        </button>
                    </div>
                </div>

                {/* 3. Description & Contact */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">وصف إضافي</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="اشرح المشكلة باختصار..."
                            className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-28 text-sm font-medium resize-none transition-all"
                        ></textarea>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 px-1">رقم للتواصل (اختياري)</label>
                        <div className="relative">
                            <input 
                              type="tel" 
                              value={contactPhone}
                              onChange={(e) => setContactPhone(e.target.value)}
                              placeholder="رقم التحويلة أو الموبايل" 
                              className="w-full p-4 pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:to-teal-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <Send className="w-5 h-5" />
                        إرسال الطلب
                    </button>
                </div>
            </div>
         )}

         {/* STEP 3: Success Screen */}
         {step === 3 && (
             <div className="flex flex-col items-center justify-center pt-10 text-center animate-in zoom-in-95 duration-500">
                 <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/20">
                     <CheckCircle2 className="w-12 h-12" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">تم استلام الطلب بنجاح!</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                     تم تسجيل البلاغ وظهر الآن في لوحة تحكم المهندس.
                 </p>
                 
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 w-full mb-8 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">رقم التذكرة (Ticket ID)</p>
                     <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white tracking-widest">{ticketId}</p>
                 </div>

                 <button 
                   onClick={() => navigate('/nurse')}
                   className="w-full py-4 bg-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
                 >
                     <Home className="w-5 h-5" />
                     العودة للرئيسية
                 </button>
             </div>
         )}

      </div>
    </div>
  );
};

export default ServiceRequestView;
