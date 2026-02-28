
import React, { useState, useMemo } from 'react';
import { X, Package, Save, Building2, Box, Layers, DollarSign, AlertCircle, Hash, ScanBarcode } from 'lucide-react';
import { LOCATIONS, INVENTORY_ITEMS } from '../../../core/database/mockData';
import { InventoryItem } from '../../../core/database/types';

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

const AddInventoryItemModal: React.FC<AddInventoryItemModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '', // New field for manual ID
    name: '',
    category: 'Parts' as const,
    quantity: 0,
    minLevel: 5,
    cost: 0,
    description: ''
  });

  const [idError, setIdError] = useState('');

  // Location State
  const [selectedWh, setSelectedWh] = useState('');
  const [selectedCab, setSelectedCab] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');

  // Derived Lists
  const warehouses = useMemo(() => LOCATIONS.filter(l => l.type === 'Warehouse' && l.isEnabled), []);
  const cabinets = useMemo(() => LOCATIONS.filter(l => l.type === 'Cabinet' && l.isEnabled && l.parentId === selectedWh), [selectedWh]);
  const shelves = useMemo(() => LOCATIONS.filter(l => l.type === 'Shelf' && l.isEnabled && l.parentId === selectedCab), [selectedCab]);

  if (!isOpen) return null;

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toUpperCase(); // Force uppercase for consistency
      setFormData({ ...formData, id: val });
      setIdError(''); // Clear error while typing
  };

  const handleSave = () => {
    // 1. Validation
    if (!formData.name.trim()) {
        alert('يرجى إدخال اسم المادة');
        return;
    }

    let finalId = formData.id.trim();

    // 2. Check ID Duplication if entered manually
    if (finalId) {
        const exists = INVENTORY_ITEMS.find(item => item.id === finalId);
        if (exists) {
            setIdError(`المعرف "${finalId}" مستخدم بالفعل لمادة: ${exists.name}`);
            return;
        }
    } else {
        // Auto-generate if empty
        finalId = `INV-${Math.floor(Math.random() * 10000)}`;
    }

    // 3. Construct Location String (USING CODES)
    let locationStr = 'GEN';
    if (selectedShelf) {
        const wh = warehouses.find(w => w.id === selectedWh);
        const cab = cabinets.find(c => c.id === selectedCab);
        const sh = shelves.find(s => s.id === selectedShelf);
        
        const whCode = wh?.code || 'WH';
        const cabCode = cab?.code || 'CAB';
        const shCode = sh?.code || 'SH';
        
        locationStr = `${whCode}-${cabCode}-${shCode}`;
    } else if (selectedWh) {
        const wh = warehouses.find(w => w.id === selectedWh);
        locationStr = wh?.code || 'WH';
    }

    const newItem: InventoryItem = {
        id: finalId,
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        minLevel: formData.minLevel,
        cost: formData.cost,
        description: formData.description,
        location: locationStr,
        lastUpdated: new Date().toISOString().split('T')[0],
        condition: 'New',
        warehouseType: 'Main'
    };

    onSave(newItem);
    // Reset form
    setFormData({
        id: '',
        name: '',
        category: 'Parts',
        quantity: 0,
        minLevel: 5,
        cost: 0,
        description: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900">
           <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
             <Package className="w-5 h-5 text-emerald-500" />
             إضافة مادة جديدة
           </h3>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* Basic Info */}
            <div className="space-y-4">
                {/* ID Input */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">رقم القطعة / المعرف (ID)</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={formData.id}
                            onChange={handleIdChange}
                            className={`w-full p-3 pl-10 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 transition-all ${
                                idError 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500'
                            }`}
                            placeholder="اتركه فارغاً للتوليد التلقائي (INV-...)"
                        />
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    {idError && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-bold">
                            <AlertCircle className="w-3 h-3" /> {idError}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم المادة / القطعة</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500"
                        placeholder="مثال: فلتر بكتيري"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">التصنيف</label>
                        <select 
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value as any})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none"
                        >
                            <option value="Parts">قطع غيار (Parts)</option>
                            <option value="Consumables">مستهلكات (Consumables)</option>
                            <option value="Tools">عدد وأدوات (Tools)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">التكلفة ($)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={formData.cost}
                                onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                                className="w-full p-3 pl-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none"
                            />
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">الكمية الأولية</label>
                        <input 
                            type="number" 
                            value={formData.quantity}
                            onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">حد التنبيه (Low Stock)</label>
                        <input 
                            type="number" 
                            value={formData.minLevel}
                            onChange={e => setFormData({...formData, minLevel: Number(e.target.value)})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Location Selection */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    تحديد الموقع (Storage Location)
                </h4>
                
                {/* 1. Warehouse */}
                <div className="flex gap-2 items-center">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <select 
                        value={selectedWh}
                        onChange={e => { setSelectedWh(e.target.value); setSelectedCab(''); setSelectedShelf(''); }}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                    >
                        <option value="">اختر المخزن...</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>

                {/* 2. Cabinet */}
                <div className={`flex gap-2 items-center transition-opacity ${!selectedWh ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Box className="w-4 h-4 text-slate-400 shrink-0" />
                    <select 
                        value={selectedCab}
                        onChange={e => { setSelectedCab(e.target.value); setSelectedShelf(''); }}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                    >
                        <option value="">اختر الخزانة/الدولاب...</option>
                        {cabinets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* 3. Shelf */}
                <div className={`flex gap-2 items-center transition-opacity ${!selectedCab ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                    <select 
                        value={selectedShelf}
                        onChange={e => setSelectedShelf(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                    >
                        <option value="">اختر الرف...</option>
                        {shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {warehouses.length === 0 && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        لم يتم تعريف مخازن. اذهب للإعدادات لإضافة الهيكلية.
                    </p>
                )}
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50/50 dark:bg-slate-900">
            <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                إلغاء
            </button>
            <button 
                onClick={handleSave}
                disabled={!!idError}
                className={`flex-[2] py-3 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                    idError 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                }`}
            >
                <Save className="w-4 h-4" />
                حفظ وإضافة
            </button>
        </div>

      </div>
    </div>
  );
};

export default AddInventoryItemModal;
