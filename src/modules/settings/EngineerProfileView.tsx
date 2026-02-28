
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Edit2, 
  Save, 
  X,
  Award,
  Clock,
  CheckCircle2,
  Wrench,
  Activity,
  ClipboardCheck,
  Package,
  FileText,
  AlertTriangle,
  Scale,
  Box,
  MapPin,
  History,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { ENGINEER_ACTIVITIES } from '../../core/database/mockData';
import { useAuth } from '../../core/context/AuthContext';

interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

const EngineerProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // استيراد بيانات المستخدم المسجل
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);

  // Profile State - Initialized from Logged In User
  const [profile, setProfile] = useState({
    name: user?.name || '',
    title: user?.role === 'Engineer' ? 'مهندس طبي' : (user?.role || ''),
    id: user?.id || '',
    email: '', // يمكن إضافته لاحقاً في AuthContext
    phone: '',
    joinDate: new Date().toISOString().split('T')[0],
    department: user?.department || '',
    specialization: '', // حقل فارغ قابل للتعديل
    licenseId: '',
    shift: ''
  });

  // تحديث الحالة إذا تغير المستخدم (لضمان المزامنة)
  useEffect(() => {
    if (user) {
        setProfile(prev => ({
            ...prev,
            name: user.name,
            id: user.id,
            department: user.department || prev.department,
            title: user.role === 'Engineer' ? 'مهندس طبي' : user.role
        }));
    }
  }, [user]);

  // Certifications State - Start Empty (No fake data)
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // New Certification State
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', issuer: '', year: '' });

  // Use Shared Activity Log (Filtered for current user visually)
  const activities = ENGINEER_ACTIVITIES; // في تطبيق حقيقي يتم الفلترة حسب user.id

  // Mock Function to get part details
  const getPartDetails = (partName: string) => {
    const isConsumable = partName.includes('Paste') || partName.includes('Gel') || partName.includes('Filter') || partName.includes('Seal');
    const stock = Math.floor(Math.random() * 20);
    
    return {
      name: partName,
      category: isConsumable ? 'مستهلكات (Consumable)' : 'قطع غيار (Spare Part)',
      stockLevel: stock,
      sku: `PART-${Math.floor(Math.random() * 10000)}`,
      location: `رف ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}-${Math.floor(Math.random() * 5) + 1}`,
      usageHistory: [
        { date: '2023-10-24', device: 'MRI-01', action: 'Repair', qty: 1 },
      ]
    };
  };

  const handlePartClick = (partName: string) => {
    const details = getPartDetails(partName);
    setSelectedPart(details);
  };

  const handleSave = () => {
    setIsEditing(false);
    setIsAddingCert(false);
    // هنا يمكن إضافة كود لحفظ البيانات في قاعدة البيانات أو LocalStorage
  };

  const handleAddCertification = () => {
    if (newCert.title && newCert.issuer) {
      setCertifications([...certifications, { ...newCert, id: Date.now().toString() }]);
      setNewCert({ title: '', issuer: '', year: '' });
      setIsAddingCert(false);
    }
  };

  const handleDeleteCertification = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id));
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'PM': return <ClipboardCheck className="w-6 h-6" />;
      case 'Repair': return <Wrench className="w-6 h-6" />;
      case 'Calibration': return <Scale className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getLogColor = (type: string) => {
    switch(type) {
      case 'PM': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Repair': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Calibration': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button 
            onClick={() => navigate('/settings')} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
            <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">الملف الشخصي</h1>
        </div>
        
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            isEditing 
              ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' 
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ</span>
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              <span>تعديل</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. Main Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-medical-600 to-blue-600 opacity-90"></div>
           
           <div className="relative pt-10 flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl -mt-2 relative group">
                 <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                    <User className="w-12 h-12 text-slate-400" />
                 </div>
                 {isEditing && (
                   <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                     <CameraIcon className="w-8 h-8 text-white" />
                   </div>
                 )}
              </div>

              {/* Info Inputs */}
              <div className="flex-1 w-full space-y-4">
                 <div className="flex flex-col gap-2">
                    {isEditing ? (
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          placeholder="الاسم الكامل"
                          className="text-2xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 focus:ring-2 focus:ring-medical-500 outline-none w-full md:w-1/2"
                        />
                    ) : (
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
                    )}
                    
                    {isEditing ? (
                        <input 
                          type="text" 
                          value={profile.title}
                          onChange={(e) => setProfile({...profile, title: e.target.value})}
                          placeholder="المسمى الوظيفي"
                          className="text-sm font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 focus:ring-2 focus:ring-medical-500 outline-none w-full md:w-1/2"
                        />
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                           <Briefcase className="w-4 h-4" />
                           {profile.title}
                        </p>
                    )}
                 </div>

                 {/* Badges / Editable Fields */}
                 <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                       <input 
                         value={profile.id}
                         onChange={(e) => setProfile({...profile, id: e.target.value})}
                         placeholder="الرقم الوظيفي"
                         className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 w-32 text-center"
                       />
                    ) : (
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                           ID: {profile.id}
                        </span>
                    )}

                    {isEditing ? (
                        <input 
                          value={profile.department}
                          onChange={(e) => setProfile({...profile, department: e.target.value})}
                          placeholder="القسم / المستشفى"
                          className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800 w-48 text-center"
                        />
                    ) : (
                        <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-800">
                           {profile.department}
                        </span>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* 2. Professional Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Specialization */}
             <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-slate-400 mb-1">التخصص الدقيق</p>
                {isEditing ? (
                   <input 
                     value={profile.specialization}
                     onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                     placeholder="مثال: أجهزة تصوير"
                     className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 font-bold text-sm w-full"
                   />
                ) : (
                   <p className="font-bold text-slate-800 dark:text-white">{profile.specialization || 'غير محدد'}</p>
                )}
             </div>

             {/* Shift */}
             <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-slate-400 mb-1">ساعات العمل</p>
                {isEditing ? (
                   <input 
                     value={profile.shift}
                     onChange={(e) => setProfile({...profile, shift: e.target.value})}
                     placeholder="مثال: صباحي (8-3)"
                     className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 font-bold text-sm w-full"
                   />
                ) : (
                   <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-slate-400" />
                       <p className="font-bold text-slate-800 dark:text-white">{profile.shift || 'غير محدد'}</p>
                   </div>
                )}
             </div>

             {/* License */}
             <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-slate-400 mb-1">رقم الرخصة</p>
                {isEditing ? (
                   <input 
                     value={profile.licenseId}
                     onChange={(e) => setProfile({...profile, licenseId: e.target.value})}
                     placeholder="رقم الرخصة"
                     className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 font-bold text-sm w-full font-mono"
                   />
                ) : (
                   <p className="font-mono font-bold text-slate-800 dark:text-white">{profile.licenseId || '---'}</p>
                )}
             </div>
        </div>

        {/* 3. Certifications (Fully Editable - Start Empty) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    الشهادات والدورات
                </h3>
                {isEditing && (
                    <button 
                        onClick={() => setIsAddingCert(true)}
                        className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                    >
                        <Plus className="w-3 h-3" /> إضافة
                    </button>
                )}
             </div>

             <div className="space-y-3">
                 {certifications.map((cert) => (
                     <div key={cert.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0 relative group">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                           <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{cert.title}</p>
                            <p className="text-xs text-slate-500">{cert.issuer} • {cert.year}</p>
                        </div>
                        {isEditing && (
                            <button 
                                onClick={() => handleDeleteCertification(cert.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                     </div>
                 ))}

                 {/* New Cert Form */}
                 {isEditing && isAddingCert && (
                     <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                         <div className="grid gap-3">
                             <input 
                                placeholder="اسم الشهادة / الدورة"
                                value={newCert.title}
                                onChange={(e) => setNewCert({...newCert, title: e.target.value})}
                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-indigo-500"
                             />
                             <div className="flex gap-2">
                                <input 
                                    placeholder="الجهة المانحة"
                                    value={newCert.issuer}
                                    onChange={(e) => setNewCert({...newCert, issuer: e.target.value})}
                                    className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <input 
                                    placeholder="السنة"
                                    value={newCert.year}
                                    onChange={(e) => setNewCert({...newCert, year: e.target.value})}
                                    className="w-20 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-indigo-500"
                                />
                             </div>
                             <div className="flex gap-2 justify-end">
                                 <button onClick={() => setIsAddingCert(false)} className="text-xs px-3 py-1.5 text-slate-500">إلغاء</button>
                                 <button 
                                    onClick={handleAddCertification} 
                                    disabled={!newCert.title}
                                    className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
                                 >
                                     حفظ الشهادة
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}

                 {certifications.length === 0 && !isAddingCert && (
                     <p className="text-center text-xs text-slate-400 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                         {isEditing ? 'اضغط إضافة لإدخال شهاداتك' : 'لا توجد شهادات مضافة'}
                     </p>
                 )}
             </div>
        </div>

        {/* 4. Activity Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
             <Activity className="w-4 h-4" />
             آخر النشاطات (System Log)
           </h3>
           
           <div className="space-y-8 relative before:absolute before:inset-y-0 before:right-[7px] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
             {activities.slice(0, 5).map((act) => (
                <div 
                  key={act.id} 
                  className="relative pr-8 cursor-pointer group"
                  onClick={() => setSelectedLog(act)}
                >
                   <div className={`absolute right-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 transition-all group-hover:scale-125 ${
                      act.type === 'Repair' ? 'bg-amber-500' : 
                      act.type === 'PM' ? 'bg-emerald-500' : 
                      act.type === 'Calibration' ? 'bg-blue-500' : 'bg-slate-400'
                   }`}></div>
                   
                   <div className="flex justify-between items-start p-3 -m-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-0.5">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                 act.type === 'Repair' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                 act.type === 'PM' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                 act.type === 'Calibration' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                             }`}>
                                {act.type === 'PM' ? 'صيانة دورية' : act.type === 'Repair' ? 'إصلاح عطل' : act.type === 'Calibration' ? 'معايرة' : 'نظام'}
                             </span>
                             <span className="text-xs text-slate-400">{act.date}</span>
                         </div>
                         <p className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-1">{act.action}</p>
                         <p className="text-xs text-slate-500 font-medium">
                            {act.deviceName} <span className="font-mono text-slate-400">({act.device})</span>
                         </p>
                      </div>
                      
                      {act.parts && act.parts.length > 0 && (
                          <div className="flex flex-col items-end gap-1 ml-3">
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {act.parts.length} قطع
                              </span>
                          </div>
                      )}
                   </div>
                </div>
             ))}
           </div>
        </div>

      </div>

      {/* Activity Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setSelectedLog(null)}
            ></div>
            
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${getLogColor(selectedLog.type)}`}>
                            {getLogIcon(selectedLog.type)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {selectedLog.type === 'PM' ? 'صيانة دورية (PM)' : 
                                 selectedLog.type === 'Repair' ? 'صيانة علاجية (Repair)' : 
                                 selectedLog.type === 'Calibration' ? 'تقرير معايرة' : 'سجل نظام'}
                            </h3>
                            <p className="text-xs font-mono text-slate-500 mt-1">{selectedLog.id}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedLog(null)} 
                        className="p-2 bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Modal Body (Scrollable) */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Log Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                التاريخ
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedLog.date}</p>
                            <p className="text-[10px] text-slate-400">{selectedLog.time || '--:--'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                المهندس المنفذ
                            </p>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedLog.engineerName}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                             الجهاز والموقع
                        </p>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedLog.deviceName}</p>
                        <p className="text-xs text-slate-500">{selectedLog.location || selectedLog.device}</p>
                    </div>

                    {/* Error Code */}
                    {selectedLog.errorCode && (
                        <div className="border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-red-500 shadow-sm z-10">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="z-10">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-0.5">رمز العطل (Error Code)</p>
                                <p className="font-mono font-bold text-slate-800 dark:text-white text-xl tracking-tight">{selectedLog.errorCode}</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            تفاصيل الإجراء
                        </h4>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-600 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
                            {selectedLog.action}
                        </div>
                    </div>

                    {/* Spare Parts (Interactive) */}
                    {selectedLog.parts && selectedLog.parts.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-400" />
                                قطع الغيار المستهلكة
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">اضغط للتفاصيل</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedLog.parts.map((part: string, i: number) => (
                                    <button 
                                      key={i}
                                      onClick={() => handlePartClick(part)}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        {part}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
                    <button 
                    onClick={() => setSelectedLog(null)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-slate-900/10"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Part Details Modal (Stacked on top) */}
      {selectedPart && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
             onClick={() => setSelectedPart(null)}
           ></div>

           <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
              
              {/* Part Header */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-6 text-center border-b border-slate-100 dark:border-slate-800">
                 <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-500">
                    <Box className="w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{selectedPart.name}</h3>
                 <p className="text-xs font-mono text-slate-400">{selectedPart.sku}</p>
                 <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                    {selectedPart.category}
                 </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800">
                 <div className="p-4 text-center border-l border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">المتوفر في المخزن</p>
                    <p className={`text-xl font-bold ${selectedPart.stockLevel < 5 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                       {selectedPart.stockLevel} <span className="text-xs font-medium text-slate-400">قطعة</span>
                    </p>
                 </div>
                 <div className="p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">الموقع (Location)</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1">
                       <MapPin className="w-3 h-3 text-slate-400" />
                       {selectedPart.location}
                    </p>
                 </div>
              </div>

              {/* Usage History */}
              <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <History className="w-3 h-3" />
                    سجل الاستخدام
                 </h4>
                 <div className="space-y-2">
                    {selectedPart.usageHistory.map((hist: any, idx: number) => (
                       <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <div>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{hist.device}</p>
                             <p className="text-[10px] text-slate-400">{hist.date} • {hist.action}</p>
                          </div>
                          <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                             -{hist.qty}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Footer */}
              <div className="p-4">
                 <button 
                   onClick={() => setSelectedPart(null)}
                   className="w-full py-3 bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-sm transition-colors"
                 >
                    إغلاق
                 </button>
              </div>

           </div>
        </div>
      )}

    </div>
  );
};

// Helper component for camera icon to fix missing variable error
const CameraIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export default EngineerProfileView;
