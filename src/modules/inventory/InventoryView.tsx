
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Package, 
  AlertTriangle, 
  Battery, 
  ScrollText, 
  Activity, 
  Droplets,
  Filter,
  Cpu,
  Monitor,
  Wrench,
  CheckCircle2,
  XCircle,
  Settings2,
  Plus
} from 'lucide-react';
import { INVENTORY_ITEMS } from '../../core/database/mockData';
import { InventoryItem } from '../../core/database/types';
import InventoryItemDetailModal from './components/InventoryItemDetailModal';
import AddInventoryItemModal from './components/AddInventoryItemModal';
import { useLanguage } from '../../core/context/LanguageContext';

const InventoryView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Parts' | 'Consumables' | 'Low'>('All');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync Data
  useEffect(() => {
      setItems([...INVENTORY_ITEMS]);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesType = true;
      if (filterType === 'Parts') matchesType = item.category === 'Parts';
      if (filterType === 'Consumables') matchesType = item.category === 'Consumables';
      if (filterType === 'Low') matchesType = item.quantity <= item.minLevel;

      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, filterType]);

  const handleUpdateItem = (id: string, updates: Partial<InventoryItem>) => {
      // Update local
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      
      // Update global mock
      const index = INVENTORY_ITEMS.findIndex(i => i.id === id);
      if (index !== -1) {
          INVENTORY_ITEMS[index] = { ...INVENTORY_ITEMS[index], ...updates };
      }
  };

  const handleAddItem = (newItem: InventoryItem) => {
      INVENTORY_ITEMS.unshift(newItem);
      setItems([newItem, ...items]);
  };

  // Helper to map icons based on item name keywords (Mock visual enhancement)
  const getIconForItem = (item: InventoryItem) => {
      const n = item.name.toLowerCase();
      if (n.includes('battery')) return Battery;
      if (n.includes('paper') || n.includes('report')) return ScrollText;
      if (n.includes('gel') || n.includes('liquid')) return Droplets;
      if (n.includes('sensor') || n.includes('cable')) return Activity;
      if (n.includes('board') || n.includes('cpu')) return Cpu;
      if (n.includes('lcd') || n.includes('screen')) return Monitor;
      if (item.category === 'Parts') return Wrench;
      return Package;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('inventory.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('inventory.subtitle')}</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-bold text-sm">إضافة مادة</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 mb-6">
          <div className="relative">
            <input 
                type="text" 
                placeholder={t('inventory.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pr-11 pl-4 text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-800 dark:text-white"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                  { id: 'All', label: t('inventory.filter_all') },
                  { id: 'Low', label: t('inventory.filter_low') },
                  { id: 'Parts', label: t('inventory.filter_parts') },
                  { id: 'Consumables', label: t('inventory.filter_consumables') }
              ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                        filterType === f.id 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                      {f.label}
                  </button>
              ))}
          </div>
      </div>

      {/* List */}
      <div className="space-y-3">
          {filteredItems.length > 0 ? (
              filteredItems.map(item => {
                  const Icon = getIconForItem(item);
                  const isLow = item.quantity <= item.minLevel;
                  const isOut = item.quantity === 0;

                  return (
                    <div 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                            isOut ? 'border-red-200 dark:border-red-900/50' : 
                            isLow ? 'border-amber-200 dark:border-amber-900/50' : 
                            'border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500'
                        }`}
                    >
                        {/* Status Strip */}
                        <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${
                            isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></div>

                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                isOut ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                isLow ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate pl-2">{item.name}</h3>
                                    <div className="flex items-center gap-1">
                                        {isOut ? <XCircle className="w-4 h-4 text-red-500" /> : 
                                         isLow ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : 
                                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-1.5 rounded">{item.id}</span>
                                    <span className={`font-bold ${isLow ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {item.quantity} {t('app.unit_piece')}
                                    </span>
                                </div>
                                
                                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-2">
                                    <span>{t('inventory.location')} {item.location}</span>
                                    <div className="flex items-center gap-2">
                                        <span>{t('inventory.cost')} ${item.cost}</span>
                                        <button className="text-emerald-600 font-bold hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Settings2 className="w-3 h-3" /> {t('inventory.edit')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  );
              })
          ) : (
              <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Filter className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{t('inventory.no_results')}</p>
                  {items.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1">{t('inventory.import_hint')}</p>
                  )}
              </div>
          )}
      </div>

      {selectedItem && (
          <InventoryItemDetailModal 
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            item={selectedItem}
            onSave={handleUpdateItem}
          />
      )}

      <AddInventoryItemModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddItem}
      />

    </div>
  );
};

export default InventoryView;
