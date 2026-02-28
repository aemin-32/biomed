
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Trash2, 
  Recycle, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Save, 
  Package, 
  Cpu, 
  Monitor, 
  Battery, 
  Zap, 
  Minus 
} from 'lucide-react';
import { DEVICES, INVENTORY_ITEMS, ENGINEER_ACTIVITIES } from '../../../core/database/mockData';
import { useLanguage } from '../../../core/context/LanguageContext';
import { InventoryItem } from '../../../core/database/types';

// Mock suggestion of parts based on device type
const getSuggestedParts = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    const suggestions = [
        { name: 'Power Supply Unit', category: 'Parts', icon: Zap },
        { name: 'Main Logic Board', category: 'Parts', icon: Cpu },
        { name: 'Display Panel/Screen', category: 'Parts', icon: Monitor },
        { name: 'Internal Battery', category: 'Parts', icon: Battery },
        { name: 'Cooling Fan', category: 'Parts', icon: Recycle },
    ];
    
    // Customize based on type if needed
    if (type.includes('vent')) {
        suggestions.push({ name: 'Turbine Blower', category: 'Parts', icon: Recycle });
        suggestions.push({ name: 'Flow Sensor Module', category: 'Parts', icon: Cpu });
    }
    
    return suggestions;
};

const ScrapDeviceView: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const device = DEVICES.find(d => d.id === deviceId);
  const suggestedParts = device ? getSuggestedParts(device.type) : [];

  // State
  const [reason, setReason] = useState('BER');
  const [step, setStep] = useState(1); // 1: Confirm, 2: Salvage, 3: Finish
  const [salvagedItems, setSalvagedItems] = useState<any[]>([]); // Items to add to inventory

  if (!device) return <div>Device Not Found</div>;

  // Add item to salvage list
  const handleAddPart = (partTemplate: any) => {
      const newItem = {
          id: `SALV-${Date.now()}`,
          name: partTemplate.name,
          category: 'Parts', // Default
          condition: 'Used', // Default
          quantity: 1,
          icon: partTemplate.icon
      };
      setSalvagedItems([...salvagedItems, newItem]);
  };

  const handleRemovePart = (id: string) => {
      setSalvagedItems(salvagedItems.filter(i => i.id !== id));
  };

  const handleUpdatePart = (id: string, field: string, value: any) => {
      setSalvagedItems(salvagedItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleConfirmScrap = () => {
      // 1. Update Device Status
      const idx = DEVICES.findIndex(d => d.id === device.id);
      if (idx > -1) {
          DEVICES[idx].status = 'Scrapped';
          DEVICES[idx].location = 'Scrap Yard / Warehouse';
      }

      // 2. Add Salvaged Parts to Inventory
      salvagedItems.forEach(item => {
          const newInvItem: InventoryItem = {
              id: `PART-${Math.floor(Math.random() * 10000)}`,
              name: item.name,
              category: 'Parts',
              condition: item.condition,
              quantity: item.quantity,
              minLevel: 0,
              cost: 0, // Zero cost for salvaged items initially
              location: 'Scrap Yard',
              warehouseType: 'ScrapYard',
              sourceDevice: device.id,
              description: `Salvaged from ${device.name} (${device.id})`
          };
          INVENTORY_ITEMS.unshift(newInvItem);
      });

      // 3. Log Activity
      ENGINEER_ACTIVITIES.unshift({
          id: `SCRAP-${Date.now()}`,
          action: `Device Scrapped - Salvaged ${salvagedItems.length} parts`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
          type: 'System',
          device: device.id,
          deviceName: device.name,
          location: 'Scrap Yard',
          parts: salvagedItems.map(i => i.name),
          engineerName: 'Current User', // Should get from context
          errorCode: null
      });

      // Navigate to Dashboard or Inventory
      navigate('/devices');
  };

  // --- Step 1: Confirmation ---
  if (step === 1) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
            <div className="max-w-md mx-auto space-y-6 pt-10">
                
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
                        <Trash2 className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('scrap.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-mono">{device.name} • {device.id}</p>
                </div>

                {/* Warning Card */}
                <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                        <p className="text-sm text-red-800 dark:text-red-200 font-bold leading-relaxed">
                            {t('scrap.warning')}
                        </p>
                    </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">{t('scrap.reason')}</label>
                    {[
                        { id: 'BER', label: t('scrap.reason_cost') },
                        { id: 'PARTS', label: t('scrap.reason_parts') },
                        { id: 'AGE', label: t('scrap.reason_age') }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setReason(opt.id)}
                            className={`w-full p-4 rounded-xl border-2 text-right transition-all flex justify-between items-center ${
                                reason === opt.id 
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                            <span className="font-bold">{opt.label}</span>
                            {reason === opt.id && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <button onClick={() => navigate(-1)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold">
                        {t('app.cancel')}
                    </button>
                    <button onClick={() => setStep(2)} className="flex-[2] py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
                        <span>متابعة للتفكيك</span>
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- Step 2: Salvage Parts ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep(1)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full">
                <ArrowRight className="w-5 h-5 rtl:rotate-180 text-slate-500" />
            </button>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('scrap.salvage_title')}</h1>
                <p className="text-xs text-slate-500">{t('scrap.salvage_desc')}</p>
            </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Suggestions */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">قطع مقترحة لهذا الجهاز</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {suggestedParts.map((part, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleAddPart(part)}
                            className="flex-shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-emerald-500 transition-colors group"
                        >
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 group-hover:text-emerald-500 transition-colors">
                                <part.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{part.name}</span>
                            <Plus className="w-4 h-4 text-emerald-500 ml-2" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Salvage List */}
            <div className="space-y-4">
                {salvagedItems.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <Recycle className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">لم يتم اختيار أي قطع</p>
                        <p className="text-xs text-slate-400 mt-1">اضغط على المقترحات أعلاه لإضافة قطع صالحة</p>
                    </div>
                ) : (
                    salvagedItems.map((item, idx) => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{item.name}</h4>
                                </div>
                                <button onClick={() => handleRemovePart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">{t('scrap.condition')}</label>
                                    <select 
                                        value={item.condition}
                                        onChange={(e) => handleUpdatePart(item.id, 'condition', e.target.value)}
                                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-bold border border-slate-200 dark:border-slate-700"
                                    >
                                        <option value="Used">{t('scrap.cond_used')}</option>
                                        <option value="Refurbished">{t('scrap.cond_refurb')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">الكمية</label>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleUpdatePart(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold"
                                        ><Minus className="w-4 h-4" /></button>
                                        <span className="flex-1 text-center font-bold">{item.quantity}</span>
                                        <button 
                                            onClick={() => handleUpdatePart(item.id, 'quantity', item.quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold"
                                        ><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase">{t('store.scrap_yard')}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-white">سيتم إضافة {salvagedItems.length} قطع</p>
            </div>
            <button 
                onClick={handleConfirmScrap}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
                <Trash2 className="w-5 h-5" />
                {t('scrap.confirm')}
            </button>
        </div>
    </div>
  );
};

export default ScrapDeviceView;
