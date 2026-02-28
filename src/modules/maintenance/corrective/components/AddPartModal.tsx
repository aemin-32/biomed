
import React, { useState, useMemo } from 'react';
import { 
  X, Search, Plus, Minus, Battery, ScrollText, Droplets, Activity, Cpu, 
  Monitor, Wrench, Package, ShoppingCart, Send, Check, Filter, Building2, 
  Globe, Network, AlertCircle, FileText 
} from 'lucide-react';
import { INVENTORY_ITEMS, LOCATIONS, SUPPLY_REQUESTS } from '../../../../core/database/mockData';
import { InventoryItem, SupplyRequest } from '../../../../core/database/types';
import { useAuth } from '../../../../core/context/AuthContext';
import NewPartRequestModal from './NewPartRequestModal';

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (part: InventoryItem, qty: number) => void;
  onRemoveOne?: (partId: string) => void;
  currentUsedParts?: InventoryItem[];
}

// Helper to map icons locally
const getIconForCategory = (category: string, name: string) => {
  const n = name.toLowerCase();
  if (n.includes('battery')) return Battery;
  if (n.includes('paper') || n.includes('report')) return ScrollText;
  if (n.includes('gel') || n.includes('liquid')) return Droplets;
  if (n.includes('sensor') || n.includes('cable')) return Activity;
  if (n.includes('board') || n.includes('cpu')) return Cpu;
  if (n.includes('lcd') || n.includes('screen')) return Monitor;
  if (category === 'Parts') return Wrench;
  return Package;
};

const AddPartModal: React.FC<AddPartModalProps> = ({ isOpen, onClose, onAdd, onRemoveOne, currentUsedParts = [] }) => {
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  // Filters
  const [activeFilter, setActiveFilter] = useState<'All' | 'Parts' | 'Consumables'>('All');
  // Scope: Local (My Hospital) vs Global (Central/Other Hospitals)
  const [searchScope, setSearchScope] = useState<'Local' | 'Global'>('Local');
  
  // New Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Hierarchical Location Filters (Local Only)
  const [selectedWhId, setSelectedWhId] = useState('');
  const [selectedCabId, setSelectedCabId] = useState('');
  const [selectedShId, setSelectedShId] = useState('');

  // Derive Location Dropdown Options
  const warehouses = useMemo(() => LOCATIONS.filter(l => l.type === 'Warehouse' && l.isEnabled), []);
  const cabinets = useMemo(() => LOCATIONS.filter(l => l.type === 'Cabinet' && l.isEnabled && l.parentId === selectedWhId), [selectedWhId]);
  const shelves = useMemo(() => LOCATIONS.filter(l => l.type === 'Shelf' && l.isEnabled && l.parentId === selectedCabId), [selectedCabId]);

  if (!isOpen) return null;

  const filteredParts = INVENTORY_ITEMS.filter(item => {
    // 1. Scope Filter
    if (searchScope === 'Local' && item.warehouseType === 'External') return false;
    if (searchScope === 'Global' && item.warehouseType !== 'External') return false;

    // 2. Search Logic (Name or ID)
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 3. Category Filter
    let matchesType = true;
    if (activeFilter === 'Parts') matchesType = item.category === 'Parts';
    if (activeFilter === 'Consumables') matchesType = item.category === 'Consumables';

    // 4. Location Hierarchy Filter (Only relevant for Local)
    let matchesLocation = true;
    if (searchScope === 'Local' && selectedWhId) {
        const wh = LOCATIONS.find(l => l.id === selectedWhId);
        if (!wh || !wh.code || !item.location.includes(wh.code)) {
            matchesLocation = false;
        } else if (selectedCabId) {
            const cab = LOCATIONS.find(l => l.id === selectedCabId);
            if (!cab || !cab.code || !item.location.includes(cab.code)) {
                matchesLocation = false;
            } else if (selectedShId) {
                const sh = LOCATIONS.find(l => l.id === selectedShId);
                if (!sh || !sh.code || !item.location.includes(sh.code)) {
                    matchesLocation = false;
                }
            }
        }
    }

    return matchesSearch && matchesType && matchesLocation;
  });

  const handleRequestOrder = (part: InventoryItem) => {
      // Logic for requesting existing item (restock)
      const newRequest: SupplyRequest = {
          id: `REQ-${Date.now()}`,
          partName: part.name,
          partId: part.id,
          quantity: 1, 
          requesterName: user?.name || 'مهندس',
          requestDate: new Date().toISOString(),
          status: 'Pending',
          priority: 'Normal'
      };
      SUPPLY_REQUESTS.unshift(newRequest);
      alert(`✅ تم إرسال طلب ${searchScope === 'Global' ? 'نقل من المركز' : 'شراء'} للمادة: ${part.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">إضافة قطعة / طلب مادة</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        {/* Search & Filters Box */}
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            
            {/* Scope Tabs (Local vs Global) + New Request Button */}
            <div className="flex gap-2">
                <div className="flex-1 flex p-1 bg-slate-200 dark:bg-slate-950 rounded-xl">
                    <button 
                        onClick={() => setSearchScope('Local')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${searchScope === 'Local' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        <Building2 className="w-3.5 h-3.5" /> المخزن المحلي
                    </button>
                    <button 
                        onClick={() => setSearchScope('Global')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${searchScope === 'Global' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Globe className="w-3.5 h-3.5" /> المركز / أخرى
                    </button>
                </div>
                
                {/* Dedicated New Request Button */}
                <button 
                    onClick={() => setIsRequestModalOpen(true)}
                    className="px-3 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center gap-1 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors"
                    title="طلب شراء مادة غير موجودة بالنظام"
                >
                    <FileText className="w-4 h-4" />
                    <span className="text-[9px]">طلب خاص</span>
                </button>
            </div>

            {/* Search Input */}
            <div className="relative">
                <input 
                type="text" 
                placeholder={searchScope === 'Local' ? "بحث في المخزن المحلي..." : "بحث في الشبكة المركزية..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {['All', 'Parts', 'Consumables'].map((filter) => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap flex items-center gap-1 ${
                        activeFilter === filter 
                        ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    {filter === 'All' && <Filter className="w-3 h-3" />}
                    {filter === 'All' ? 'الكل' : filter === 'Parts' ? 'قطع غيار' : 'مستهلكات'}
                </button>
            ))}
            </div>

            {/* Location Hierarchy Filters (Only Local) */}
            {searchScope === 'Local' && (
                <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2">
                    {/* Warehouse */}
                    <div className="relative">
                        <select
                            value={selectedWhId}
                            onChange={(e) => { setSelectedWhId(e.target.value); setSelectedCabId(''); setSelectedShId(''); }}
                            className="w-full pl-7 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold appearance-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">المخزن (الكل)</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <Building2 className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            )}
        </div>

        {/* List */}
        <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
            {filteredParts.length > 0 ? filteredParts.map(part => {
                const Icon = getIconForCategory(part.category, part.name);
                const isOutOfStock = part.quantity <= 0;
                const addedCount = currentUsedParts.filter(p => p.id === part.id).length;

                return (
                    <div key={part.id} className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 ${
                        isOutOfStock ? 'bg-red-50/50 dark:bg-red-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                        {/* Item Details */}
                        <div className="flex items-center gap-4 text-right">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                isOutOfStock 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-500' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{part.name}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono mt-1 text-slate-500">
                                    {searchScope === 'Global' && (
                                        <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded text-[9px]">
                                            <Globe className="w-3 h-3 inline mr-1" />
                                            {part.location}
                                        </span>
                                    )}
                                    {searchScope === 'Local' && (
                                        <span className="bg-blue-50 text-blue-600 px-1.5 rounded text-[9px] dark:bg-blue-900/20 dark:text-blue-300">
                                            {part.location}
                                        </span>
                                    )}
                                    <span className={`${isOutOfStock ? 'text-red-500 font-bold' : ''}`}>
                                        Stock: {part.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {searchScope === 'Local' ? (
                                !isOutOfStock ? (
                                    <>
                                        {addedCount > 0 && onRemoveOne && (
                                            <>
                                                <button onClick={() => onRemoveOne(part.id)} className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:bg-red-200"><Minus className="w-4 h-4" /></button>
                                                <span className="font-bold w-6 text-center">{addedCount}</span>
                                            </>
                                        )}
                                        <button 
                                            onClick={() => onAdd(part, 1)}
                                            className={`px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2 text-xs font-bold ${addedCount > 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{addedCount > 0 ? 'زيادة' : 'استخدام'}</span>
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => handleRequestOrder(part)}
                                        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 text-[10px] font-bold flex items-center gap-1 hover:bg-red-50 shadow-sm"
                                    >
                                        <ShoppingCart className="w-3 h-3" />
                                        طلب شراء
                                    </button>
                                )
                            ) : (
                                // Global Scope Actions
                                <button 
                                    onClick={() => handleRequestOrder(part)}
                                    className="px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-100 border border-indigo-200"
                                >
                                    <Network className="w-3 h-3" />
                                    طلب نقل
                                </button>
                            )}
                        </div>
                    </div>
                );
            }) : (
                <div className="py-12 text-center text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">لم يتم العثور على القطعة</p>
                    <p className="text-xs opacity-70 mb-4">
                        {searchScope === 'Local' ? 'جرب البحث في الشبكة المركزية' : 'القطعة غير متوفرة في أي مخزن'}
                    </p>
                    
                    {searchScope === 'Local' ? (
                        <button 
                            onClick={() => setSearchScope('Global')}
                            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg"
                        >
                            بحث في المستشفيات الأخرى
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsRequestModalOpen(true)}
                            className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 mx-auto"
                        >
                            <Send className="w-3 h-3 rtl:rotate-180" />
                            إنشاء طلب لقطعة غير معرفة
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button 
                onClick={onClose}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
                <Check className="w-5 h-5" />
                <span>إتمام الاختيار ({currentUsedParts.length})</span>
            </button>
        </div>

      </div>

      {/* New Part Request Modal (Layered on top) */}
      <NewPartRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
};

export default AddPartModal;
