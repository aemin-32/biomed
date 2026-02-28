
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DEVICES, LOCATIONS } from '../../core/database/mockData';
import { Device } from '../../core/database/types';
import { 
  MapPin, 
  Calendar, 
  Activity, 
  FileText, 
  Edit, 
  Camera, 
  Save, 
  X, 
  Zap,
  Building2,
  User,
  ShieldCheck,
  Settings2,
  Download,
  Upload
} from 'lucide-react';
import DeviceTechnicalSpecs from './components/DeviceTechnicalSpecs';
import DeviceHistoryLog from './components/DeviceHistoryLog';
import { useLanguage } from '../../core/context/LanguageContext';
import BackButton from '../../components/ui/BackButton';

// --- Edit Device Modal Component ---
interface EditDeviceModalProps {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: Partial<Device>) => void;
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({ device, isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: device.name,
    manufacturer: device.manufacturer || '',
    model: device.model,
    serialNumber: device.serialNumber,
    image: device.image,
    department: device.department || '',
    location: device.location || '',
    responsiblePerson: device.responsiblePerson || '',
    installDate: device.installDate,
    // Power Specs
    powerVoltage: device.powerSpecs?.voltage || 220,
    powerCurrent: device.powerSpecs?.current || 0,
    powerFreq: device.powerSpecs?.frequency || 50,
  });

  // Dynamic Location Logic
  const departments = useMemo(() => LOCATIONS.filter(l => l.type === 'Department' && l.isEnabled), []);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Initialize department selection based on current device data
  useEffect(() => {
      if (isOpen) {
          const currentDept = departments.find(d => d.name === device.department);
          if (currentDept) setSelectedDeptId(currentDept.id);
      }
  }, [isOpen, device.department, departments]);

  const availableRooms = useMemo(() => {
      if (!selectedDeptId) return [];
      return LOCATIONS.filter(l => l.type === 'Room' && l.isEnabled && l.parentId === selectedDeptId);
  }, [selectedDeptId]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          location: '' // Reset room when department changes
      }));
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const room = availableRooms.find(r => r.id === id);
      setFormData(prev => ({ ...prev, location: room ? room.name : '' }));
  };

  const handleSubmit = () => {
      // Construct updated object
      const updates: Partial<Device> = {
          name: formData.name,
          manufacturer: formData.manufacturer,
          model: formData.model,
          serialNumber: formData.serialNumber,
          image: formData.image,
          department: formData.department,
          location: formData.location,
          responsiblePerson: formData.responsiblePerson,
          installDate: formData.installDate,
          powerSpecs: {
              voltage: Number(formData.powerVoltage),
              current: Number(formData.powerCurrent),
              frequency: Number(formData.powerFreq)
          }
      };
      onSave(updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                {t('profile.edit')}
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Image Section */}
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">صورة الجهاز</label>
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 relative group cursor-pointer" onClick={triggerFileSelect}>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
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
                            className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-xs flex flex-col items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-indigo-400 transition-all"
                        >
                            <Upload className="w-5 h-5 mb-1" />
                            <span>اضغط لرفع صورة من الكاميرا أو الملفات</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* General Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Model</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('profile.sn')}</label>
                    <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm font-mono" />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('profile.custodian')}</label>
                    <input type="text" name="responsiblePerson" value={formData.responsiblePerson} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm" />
                </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('profile.dept')}</label>
                    <select value={selectedDeptId} onChange={handleDeptChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm appearance-none">
                        <option value="">{t('devices.filter_dept_all')}</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('profile.room')}</label>
                    <select value={availableRooms.find(r => r.name === formData.location)?.id || ''} onChange={handleRoomChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm appearance-none">
                        <option value="">{t('devices.filter_room_all')}</option>
                        {availableRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Engineering Data - Power Specs (Updated Layout) */}
            <div>
                <h3 className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">
                    <Zap className="w-3.5 h-3.5" />
                    {t('tech.power')}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Voltage</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                name="powerVoltage" 
                                value={formData.powerVoltage} 
                                onChange={handleChange} 
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ltr:pr-8 rtl:pl-8 text-center" 
                            />
                            <span className="absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">V</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Current</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                name="powerCurrent" 
                                value={formData.powerCurrent} 
                                onChange={handleChange} 
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ltr:pr-8 rtl:pl-8 text-center" 
                            />
                            <span className="absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">A</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Frequency</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                name="powerFreq" 
                                value={formData.powerFreq} 
                                onChange={handleChange} 
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ltr:pr-8 rtl:pl-8 text-center" 
                            />
                            <span className="absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Hz</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <button 
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" />
                {t('profile.save_changes')}
            </button>
        </div>

      </div>
    </div>
  );
};

// --- Main Device Profile View ---

const DeviceProfileView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Initialize device from passed state or find in DB
  const [device, setDevice] = useState<Device | undefined>(() => {
      const passed = (location.state as any)?.device;
      if (passed) return passed;
      return DEVICES.find(d => d.id === deviceId);
  });

  const [activeTab, setActiveTab] = useState((location.state as any)?.initialTab || 'general');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fallback: If accessed directly via URL, lookup might be needed in effect if DB is async
  useEffect(() => {
      if (!device && deviceId) {
          const found = DEVICES.find(d => d.id === deviceId);
          setDevice(found);
      }
  }, [deviceId, device]);

  if (!device) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
          Device not found
      </div>
  );

  const handleSaveDevice = (updates: Partial<Device>) => {
      if (device) {
          const updated = { ...device, ...updates };
          setDevice(updated);
          // Update global DB
          const idx = DEVICES.findIndex(d => d.id === device.id);
          if (idx > -1) DEVICES[idx] = updated;
          setIsEditModalOpen(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20 font-sans">
      
      {/* 1. Header with Actions */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-100 dark:border-slate-800">
          <div className="px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  {/* Using Smart Back Button */}
                  <BackButton />
                  
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">ملف الجهاز</h1>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 transition-colors"
                    title={t('profile.edit')}
                  >
                      <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate(`/maintenance/options/${device.id}`)}
                    className="p-2.5 text-white bg-medical-600 rounded-xl hover:bg-medical-700 transition-colors shadow-lg shadow-medical-500/30"
                    title={t('profile.maintenance_options')}
                  >
                      <Settings2 className="w-5 h-5" />
                  </button>
              </div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          
          {/* 2. Main Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-medical-500/5 rounded-bl-full pointer-events-none"></div>

              {/* Image */}
              <div className="w-full md:w-1/3 aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-inner group relative">
                  <img src={device.image} alt={device.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>Updated: 2023</span>
                  </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-6">
                  <div>
                      <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              device.status === 'Operational' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              device.status === 'Maintenance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                              <Activity className="w-3 h-3" />
                              {device.status}
                          </span>
                          <span className="text-slate-400 text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                              {device.id}
                          </span>
                      </div>
                      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1 leading-tight">{device.name}</h1>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{device.model} • {device.manufacturer}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {t('profile.room')}
                          </p>
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{device.location}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {t('profile.dept')}
                          </p>
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{device.department}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {t('profile.install_date')}
                          </p>
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{device.installDate}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {t('profile.custodian')}
                          </p>
                          <p className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-1">{device.responsiblePerson}</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* 3. Tabs & Content */}
          <div>
              <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6 w-full md:w-fit">
                  {['general', 'technical', 'history'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeTab === tab 
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                          {tab === 'general' ? t('profile.tab_general') : tab === 'technical' ? t('profile.tab_tech') : t('profile.tab_history')}
                      </button>
                  ))}
              </div>

              {activeTab === 'general' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" />
                              {t('profile.supplier_title')}
                          </h3>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Life Tech Systems</span>
                                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Agent</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-500">{t('profile.warranty_end')}</span>
                                  <span className="text-sm font-bold text-slate-800 dark:text-white">{device.warrantyExpiry}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Documents
                          </h3>
                          <div className="space-y-3">
                              {device.documents?.map(doc => (
                                  <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                      <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
                                          <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1">
                                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{doc.title}</p>
                                          <p className="text-[10px] text-slate-400">{doc.type} • {doc.size}</p>
                                      </div>
                                      <Download className="w-4 h-4 text-slate-300" />
                                  </div>
                              ))}
                              {(!device.documents || device.documents.length === 0) && (
                                  <p className="text-sm text-slate-400 text-center py-2">No documents available</p>
                              )}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'technical' && <DeviceTechnicalSpecs device={device} />}
              
              {activeTab === 'history' && <DeviceHistoryLog device={device} />}

          </div>

      </div>

      <EditDeviceModal 
        device={device} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveDevice}
      />

    </div>
  );
};

export default DeviceProfileView;
