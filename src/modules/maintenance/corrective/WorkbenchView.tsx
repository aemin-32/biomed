
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Timer, Wrench, CheckCircle2, Calculator, 
  UserCircle, Clock, Truck, Power, Battery, FileText, 
  AlertTriangle, X, Siren, Zap, Scale, Settings, 
  Camera, Save, Thermometer, Microscope, ChevronDown, ChevronUp, BookOpen,
  Stethoscope, Clipboard, AlertCircle, History, Ban
} from 'lucide-react';
import { DEVICES, ENGINEER_ACTIVITIES, INVENTORY_ITEMS, SERVICE_REQUESTS } from '../../../core/database/mockData';
import { MaintenanceLog, InventoryItem } from '../../../core/database/types';
import RepairManager from './components/RepairManager';
import AddPartModal from './components/AddPartModal';
import QuickToolsModal from './components/QuickToolsModal';
import DeviceGuideModal from './components/DeviceGuideModal';
import HistoryModal from './components/HistoryModal';
import FeasibilityModal from './components/FeasibilityModal';
import CalibrationModal from './components/CalibrationModal';
import { useAuth } from '../../../core/context/AuthContext';

// --- Sub-Component: Quick Tool Button ---
const ToolBtn = ({ icon: Icon, label, onClick, active, colorClass }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 min-w-[70px] p-2 rounded-xl transition-all active:scale-95 ${
      active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : (colorClass || 'text-slate-500')}`} />
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

const WorkbenchView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Data
  const device = DEVICES.find(d => d.id === deviceId);
  const ticketData = (location.state as any)?.ticketData;
  const isResuming = device?.status === 'Maintenance';

  // --- Logic to restore parts if resuming ---
  const getInitialParts = (): InventoryItem[] => {
    if (isResuming && device?.logs && device.logs.length > 0) {
      const lastLog = device.logs[0];
      if (lastLog.parts && lastLog.parts.length > 0) {
        const restoredParts: InventoryItem[] = [];
        lastLog.parts.forEach(partName => {
           const item = INVENTORY_ITEMS.find(i => i.name === partName);
           if (item) restoredParts.push(item);
           else restoredParts.push({ 
             id: `OLD-${Math.random()}`, 
             name: partName, 
             category: 'Parts', 
             quantity: 0, 
             minLevel: 0, 
             location: 'Unknown', 
             cost: 0,
             condition: 'New',
             warehouseType: 'Main' 
           });
        });
        return restoredParts;
      }
    }
    return [];
  };

  // State
  const [secondsElapsed, setSecondsElapsed] = useState(0); 
  const [usedParts, setUsedParts] = useState<InventoryItem[]>(getInitialParts);
  const initialPartsCount = useRef(isResuming ? getInitialParts().length : 0);
  
  // --- New: Separate Engineer Diagnosis State ---
  const [diagnosisNotes, setDiagnosisNotes] = useState(''); // Engineer's Technical Notes
  const [actualErrorCode, setActualErrorCode] = useState(''); // The real error code found
  const [engineerName, setEngineerName] = useState(user?.name || '');
  
  // UI State for ALL Modals
  const [isPartModalOpen, setPartModalOpen] = useState(false);
  
  // The 6 Main Tool Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFeasibilityOpen, setIsFeasibilityOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const [showFullSpecs, setShowFullSpecs] = useState(false);
  
  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Financial Logic (Repair vs Replace) ---
  const purchaseCost = device?.purchaseCost || 0;
  const currentRepairCost = usedParts.reduce((sum, part) => sum + part.cost, 0);
  
  // Calculate BER Score Live
  const deviceAge = new Date().getFullYear() - new Date(device?.installDate || new Date()).getFullYear();
  const lifeExpectancy = 10; // Default
  const depreciatedValue = Math.max(purchaseCost * 0.1, purchaseCost * ((lifeExpectancy - deviceAge) / lifeExpectancy));
  const berScore = depreciatedValue > 0 ? (currentRepairCost / depreciatedValue) * 100 : 0;
  
  const isViable = berScore < 50;
  const isCritical = berScore > 80;

  // Handlers
  const addPart = (part: InventoryItem, qty: number) => {
    setUsedParts(prev => [...prev, ...Array(qty).fill(part)]);
  };

  const removePart = (index: number) => {
    setUsedParts(prev => prev.filter((_, i) => i !== index));
  };

  const removeOnePart = (partId: string) => {
    setUsedParts(prev => {
      const index = prev.findIndex(p => p.id === partId);
      if (index > -1) {
        const newArr = [...prev];
        newArr.splice(index, 1);
        return newArr;
      }
      return prev;
    });
  };

  const handleFinishRepair = (status: 'Operational' | 'Maintenance') => {
    // 1. Validation
    if (!engineerName.trim()) { 
        alert("يرجى تأكيد اسم المهندس"); 
        return; 
    }
    
    // Strict check only for FINAL operational status
    if (status === 'Operational') {
        if (!diagnosisNotes.trim()) { 
            alert("يرجى كتابة التشخيص الفني والإجراء المتبع قبل الإغلاق."); 
            return; 
        }
    }
    
    // 2. Create Log
    const finalAction = diagnosisNotes.trim() || (status === 'Maintenance' ? 'نقل للورشة / تعليق العمل' : 'إصلاح');
    
    const newLog: MaintenanceLog = {
      id: `LOG-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString().split('T')[0],
      engineerName: engineerName, 
      problemDescription: ticketData?.description || 'صيانة مباشرة', 
      action: finalAction, 
      type: 'Repair',
      cost: currentRepairCost,
      parts: usedParts.map(p => p.name), 
      errorCode: actualErrorCode || ticketData?.errorCode
    };

    // 3. Update Mock DB
    const idx = DEVICES.findIndex(d => d.id === deviceId);
    if (idx > -1) {
        DEVICES[idx].logs.unshift(newLog);
        DEVICES[idx].status = status;
        
        // If moving, update location text hypothetically
        if (status === 'Maintenance') {
            DEVICES[idx].location = 'ورشة الصيانة (BioMed Workshop)';
        }
    }

    // 4. Engineer Activity Log
    ENGINEER_ACTIVITIES.unshift({
        id: newLog.id, action: newLog.action, date: newLog.date, time: 'Now',
        type: 'Repair', device: device?.id || '', deviceName: device?.name || '',
        location: device?.location || '', parts: newLog.parts, errorCode: newLog.errorCode,
        engineerName: engineerName
    });

    // 5. Success Feedback & Navigate
    setTimeout(() => {
        if (status === 'Operational') alert("✅ تم إغلاق أمر العمل بنجاح");
        else alert("⚠️ تم نقل الجهاز / تعليق العمل");
        
        navigate('/maintenance');
    }, 100);
  };

  // Wrapper for Move Modal Confirmation
  const handleMoveConfirm = () => {
      handleFinishRepair('Maintenance');
      setIsMoveModalOpen(false);
  };

  if (!device) return <div>Device Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-36 font-sans transition-colors">
      
      {/* 1. WORKBENCH HEADER (The "Cockpit") */}
      <div className="bg-slate-900 text-white px-4 pt-4 pb-6 rounded-b-3xl shadow-lg relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         <div className="relative z-10">
             {/* Top Row: Back & Timer */}
             <div className="flex justify-between items-center mb-4">
                 <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                     <ArrowRight className="w-5 h-5" />
                 </button>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/80 rounded-full border border-indigo-400/30 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                     <Timer className="w-4 h-4 text-indigo-200 animate-pulse" />
                     <span className="font-mono font-bold tracking-widest text-sm">{formatTime(secondsElapsed)}</span>
                 </div>
                 <div className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-slate-300">
                     {ticketData ? `#${ticketData.id}` : 'Direct'}
                 </div>
             </div>

             {/* Device Summary Card */}
             <div className="flex gap-4 items-start">
                 <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0">
                     <img src={device.image} className="w-full h-full object-cover rounded-lg" alt="" />
                 </div>
                 <div className="flex-1 min-w-0">
                     <h1 className="font-bold text-lg leading-tight truncate">{device.name}</h1>
                     <p className="text-slate-400 text-xs font-mono mb-2">{device.model} • {device.id}</p>
                     
                     {/* Quick Specs (Always Visible) */}
                     <div className="flex gap-3 text-[10px] font-bold text-slate-300">
                         {device.powerSpecs && (
                             <span className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                 <Zap className="w-3 h-3 text-yellow-400" />
                                 {device.powerSpecs.voltage}V
                             </span>
                         )}
                         {device.batterySpecs && (
                             <span className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                 <Battery className="w-3 h-3 text-green-400" />
                                 {device.batterySpecs.capacitymAh}mAh
                             </span>
                         )}
                     </div>
                 </div>
                 <button 
                    onClick={() => setShowFullSpecs(!showFullSpecs)} 
                    className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                 >
                     {showFullSpecs ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                 </button>
             </div>

             {/* Expanded Specs Area */}
             {showFullSpecs && (
                 <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-2">
                     <div>
                         <span className="block text-slate-500 mb-1">القسم / الموقع</span>
                         <span className="font-bold">{device.department} - {device.location}</span>
                     </div>
                     <div>
                         <span className="block text-slate-500 mb-1">الوكيل / الضمان</span>
                         <span className="font-bold text-yellow-400">{device.warrantyExpiry || 'N/A'}</span>
                     </div>
                 </div>
             )}
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 relative z-20 space-y-4">
          
          {/* 2. INTEGRATED TOOLS STRIP (ALL POPUPS) */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide">
              {/* 1. History */}
              <ToolBtn 
                icon={History} 
                label="السجل" 
                colorClass="text-purple-500"
                onClick={() => setIsHistoryOpen(true)} 
              />
              
              {/* 2. Repair Feasibility */}
              <ToolBtn 
                icon={Ban} 
                label="جدوى الإصلاح" 
                colorClass="text-red-500"
                onClick={() => setIsFeasibilityOpen(true)} 
              />

              {/* 3. Guide */}
              <ToolBtn icon={BookOpen} label="الدليل" onClick={() => setIsGuideOpen(true)} />
              
              {/* 4. Calibration */}
              <ToolBtn 
                icon={Scale} 
                label="معايرة" 
                onClick={() => setIsCalibrationOpen(true)} 
              />
              
              {/* 5. Calculator */}
              <ToolBtn icon={Calculator} label="حاسبة" onClick={() => setIsCalculatorOpen(true)} />
              
              <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
              
              {/* 6. Move */}
              <ToolBtn icon={Truck} label="نقل" onClick={() => setIsMoveModalOpen(true)} />
          </div>

          {/* 3. REPORT INFO (FROM NURSE) - Collapsed/Compact */}
          {ticketData && (
              <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                      <h3 className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase mb-1">بلاغ المشغل / الممرض</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{ticketData.description}"</p>
                      <div className="flex gap-2 mt-2">
                          {ticketData.issueCategory && <span className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-orange-200 text-slate-500">{ticketData.issueCategory}</span>}
                          {ticketData.errorCode && <span className="text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-orange-200 text-red-500 font-mono">{ticketData.errorCode}</span>}
                      </div>
                  </div>
              </div>
          )}

          {/* 4. ENGINEER DIAGNOSIS BOX (THE MAIN WORKSPACE) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border-l-4 border-l-blue-500 border-y border-r border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      <Stethoscope className="w-6 h-6 text-blue-500" />
                      التشخيص الفني (Engineer Diagnosis)
                  </h3>
              </div>
              
              {/* Text Area for detailed findings */}
              <textarea 
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="اكتب هنا تفاصيل الفحص الدقيق، سبب العطل الحقيقي، والإجراءات التي قمت بها..."
                  className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none mb-3 font-medium placeholder:text-slate-400"
              />
              
              {/* Error Code & Engineer Name Row */}
              <div className="flex gap-3">
                  <div className="flex-1 relative">
                      <label className="text-[10px] font-bold text-slate-400 absolute -top-2 right-3 bg-white dark:bg-slate-900 px-1">كود العطل (إن وجد)</label>
                      <input 
                          type="text" 
                          value={actualErrorCode}
                          onChange={(e) => setActualErrorCode(e.target.value.toUpperCase())}
                          placeholder="مثال: ERR-505"
                          className="w-full pl-3 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase placeholder:normal-case"
                      />
                  </div>
                  <div className="flex-1 relative">
                      <label className="text-[10px] font-bold text-slate-400 absolute -top-2 right-3 bg-white dark:bg-slate-900 px-1">اسم المهندس</label>
                      <input 
                          type="text" 
                          value={engineerName}
                          onChange={(e) => setEngineerName(e.target.value)}
                          className="w-full pl-3 pr-9 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
              </div>
          </div>

          {/* 5. PARTS MANAGER & COST METER */}
          <RepairManager 
             usedParts={usedParts} 
             onAddClick={() => setPartModalOpen(true)}
             onRemovePart={removePart}
             totalCost={currentRepairCost.toFixed(2)}
          />

          {/* Financial Viability Meter (Live) */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${isCritical ? 'bg-red-50 border-red-200' : isViable ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      مؤشر الجدوى الاقتصادية (BER)
                  </h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                      {berScore.toFixed(1)}%
                  </span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : isViable ? 'bg-green-500' : 'bg-amber-500'}`} 
                    style={{ width: `${Math.min(berScore, 100)}%` }}
                  ></div>
              </div>
              <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-500">
                  <span>إصلاح (Safe)</span>
                  <span>{isCritical ? 'يوصى بالاستبدال' : isViable ? 'تكلفة مقبولة' : 'مراجعة'}</span>
                  <span>استبدال (Critical)</span>
              </div>
          </div>

      </div>

      {/* 6. Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto flex gap-3">
              <button 
                onClick={() => handleFinishRepair('Maintenance')}
                className="flex-1 py-3.5 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
              >
                  <Clock className="w-5 h-5" />
                  تعليق / انتظار
              </button>
              <button 
                onClick={() => handleFinishRepair('Operational')}
                className="flex-[2] py-3.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-medical-500/20 transition-all active:scale-95"
              >
                  <CheckCircle2 className="w-5 h-5" />
                  إتمام وحفظ التقرير
              </button>
          </div>
      </div>

      {/* --- ALL MODALS --- */}
      
      {/* 1. Add Part */}
      <AddPartModal 
        isOpen={isPartModalOpen} 
        onClose={() => setPartModalOpen(false)} 
        onAdd={addPart} 
        onRemoveOne={removeOnePart}
        currentUsedParts={usedParts} 
      />
      
      {/* 2. Calculator */}
      <QuickToolsModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      
      {/* 3. Guide */}
      <DeviceGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} device={device} />
      
      {/* 4. History (New) */}
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} device={device} />
      
      {/* 5. Feasibility (New) */}
      <FeasibilityModal isOpen={isFeasibilityOpen} onClose={() => setIsFeasibilityOpen(false)} device={device} currentRepairCost={currentRepairCost} />
      
      {/* 6. Calibration (New) */}
      <CalibrationModal isOpen={isCalibrationOpen} onClose={() => setIsCalibrationOpen(false)} device={device} />
      
      {/* 7. Move Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsMoveModalOpen(false)}>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">نقل الجهاز للورشة؟</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">سيتم تغيير الموقع والحالة تلقائياً.</p>
                <div className="flex gap-3">
                    <button onClick={() => setIsMoveModalOpen(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-600 dark:text-slate-300">إلغاء</button>
                    <button onClick={handleMoveConfirm} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">تأكيد النقل</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default WorkbenchView;
