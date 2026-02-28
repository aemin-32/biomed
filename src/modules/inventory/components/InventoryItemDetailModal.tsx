
import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, AlertTriangle, Save, Info, Gauge, Building2, Box, Layers, MapPin } from 'lucide-react';
import { InventoryItem } from '../../../core/database/types';
import { LOCATIONS } from '../../../core/database/mockData';

interface InventoryItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onSave: (id: string, updates: Partial<InventoryItem>) => void;
}

const InventoryItemDetailModal: React.FC<InventoryItemDetailModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [minLevel, setMinLevel] = useState(item.minLevel);
  const [description, setDescription] = useState(item.description || '');
  const [quantity, setQuantity] = useState(item.quantity);
  const [currentLocation, setCurrentLocation] = useState(item.location);

  // Location Picker State
  const [isMoving, setIsMoving] = useState(false);
  const [selectedWh, setSelectedWh] = useState('');
  const [selectedCab, setSelectedCab] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');

  // Derived Lists for Picker
  const warehouses = useMemo(() => LOCATIONS.filter(l => l.type === 'Warehouse' && l.isEnabled), []);
  const cabinets = useMemo(() => LOCATIONS.filter(l => l.type === 'Cabinet' && l.isEnabled && l.parentId === selectedWh), [selectedWh]);
  const shelves = useMemo(() => LOCATIONS.filter(l => l.type === 'Shelf' && l.isEnabled && l.parentId === selectedCab), [selectedCab]);

  // Sync state when item changes
  useEffect(() => {
    if (isOpen) {
        setMinLevel(item.minLevel);
        setDescription(item.description || '');
        setQuantity(item.quantity);
        setCurrentLocation(item.location);
        setIsMoving(false);
        // Reset picker
        setSelectedWh('');
        setSelectedCab('');
        setSelectedShelf('');
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalLocation = currentLocation;
    
    // If moving mode is active and shelf selected, construct new location string
    if (isMoving && selectedShelf) {
        const wh = warehouses.find(w => w.id === selectedWh);
        const cab = cabinets.find(c => c.id === selectedCab);
        const sh = shelves.find(s => s.id === selectedShelf);
        
        const whCode = wh?.code || 'WH';
        const cabCode = cab?.code || 'CAB';
        const shCode = sh?.code || 'SH';

        finalLocation = `${whCode}-${cabCode}-${shCode}`;
    }

    onSave(item.id, {
        minLevel,
        description,
        quantity,
        location: finalLocation
    });
    onClose();
  };

  const isLow = quantity <= minLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
           <div className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                  isLow ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                  <Package className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{item.name}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">{item.id}</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            
            {/* 1. Location Management */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            الموقع الحالي
                        </h4>
                        {!isMoving && (
                            <p className="text-xs text-slate-500 mt-1 font-mono font-bold">{currentLocation}</p>
                        )}
                    </div>
                    {!isMoving && (
                        <button 
                            onClick={() => setIsMoving(true)}
                            className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg"
                        >
                            نقل
                        </button>
                    )}
                </div>

                {isMoving && (
                    <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-2">
                        {/* Warehouse */}
                        <div className="flex gap-2 items-center">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <select 
                                value={selectedWh}
                                onChange={e => { setSelectedWh(e.target.value); setSelectedCab(''); setSelectedShelf(''); }}
                                className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            >
                                <option value="">اختر المخزن...</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        {/* Cabinet */}
                        <div className={`flex gap-2 items-center ${!selectedWh ? 'opacity-50' : ''}`}>
                            <Box className="w-4 h-4 text-slate-400 shrink-0" />
                            <select 
                                value={selectedCab}
                                onChange={e => { setSelectedCab(e.target.value); setSelectedShelf(''); }}
                                disabled={!selectedWh}
                                className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            >
                                <option value="">اختر الخزانة...</option>
                                {cabinets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        {/* Shelf */}
                        <div className={`flex gap-2 items-center ${!selectedCab ? 'opacity-50' : ''}`}>
                            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                            <select 
                                value={selectedShelf}
                                onChange={e => setSelectedShelf(e.target.value)}
                                disabled={!selectedCab}
                                className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                            >
                                <option value="">اختر الرف...</option>
                                {shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button onClick={() => setIsMoving(false)} className="text-xs text-red-500 mr-2">إلغاء النقل</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Manual Quantity Adjustment */}
            <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">الرصيد الحالي</span>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setQuantity(Math.max(0, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >-</button>
                    <span className="text-xl font-mono font-bold w-8 text-center">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >+</button>
                </div>
            </div>

            {/* 3. Description Field */}
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">وصف القطعة / ملاحظات</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-medical-500 h-20 resize-none"
                />
            </div>

            {/* 4. Threshold Settings */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">إعدادات التنبيه</h4>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={minLevel}
                        onChange={(e) => setMinLevel(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-medical-600"
                    />
                    <span className="text-sm font-bold w-8 text-center">{minLevel}</span>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                إلغاء
            </button>
            <button 
                onClick={handleSave}
                className="flex-[2] py-3 bg-medical-600 hover:bg-medical-700 text-white rounded-xl font-bold shadow-lg shadow-medical-500/20 flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" />
                حفظ التغييرات
            </button>
        </div>

      </div>
    </div>
  );
};

export default InventoryItemDetailModal;
