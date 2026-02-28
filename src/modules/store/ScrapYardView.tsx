
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Recycle, 
  Trash2, 
  CheckCircle2, 
  Package, 
  Building2, 
  Box, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { INVENTORY_ITEMS, LOCATIONS } from '../../core/database/mockData';
import { useLanguage } from '../../core/context/LanguageContext';
import { InventoryItem } from '../../core/database/types';

const ScrapYardView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Restock Modal State
  const [selectedWh, setSelectedWh] = useState('');
  const [selectedCab, setSelectedCab] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');

  // Derived Data
  const scrapItems = useMemo(() => items.filter(i => i.warehouseType === 'ScrapYard'), [items]);
  
  // Location Data for Dropdowns
  const warehouses = useMemo(() => LOCATIONS.filter(l => l.type === 'Warehouse' && l.isEnabled), []);
  const cabinets = useMemo(() => LOCATIONS.filter(l => l.type === 'Cabinet' && l.isEnabled && l.parentId === selectedWh), [selectedWh]);
  const shelves = useMemo(() => LOCATIONS.filter(l => l.type === 'Shelf' && l.isEnabled && l.parentId === selectedCab), [selectedCab]);

  // Actions
  const handleDispose = (id: string) => {
      if (window.confirm('هل أنت متأكد من إتلاف هذه القطعة نهائياً؟')) {
          setItems(prev => prev.filter(i => i.id !== id));
          // Update Global Mock
          const idx = INVENTORY_ITEMS.findIndex(i => i.id === id);
          if (idx > -1) INVENTORY_ITEMS.splice(idx, 1);
      }
  };

  const handleRestock = () => {
      if (!selectedItem) return;
      if (!selectedShelf) {
          alert('يرجى اختيار موقع تخزين مكتمل (مخزن > خزانة > رف)');
          return;
      }

      // Construct Location String
      const wh = warehouses.find(w => w.id === selectedWh);
      const cab = cabinets.find(c => c.id === selectedCab);
      const sh = shelves.find(s => s.id === selectedShelf);
      
      const locStr = `${wh?.code}-${cab?.code}-${sh?.code}`;

      // Update Item Properties
      const updatedItem = {
          ...selectedItem,
          warehouseType: 'Main' as const,
          condition: 'Refurbished' as const,
          location: locStr
      };

      // Update Local State
      setItems(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
      
      // Update Global Mock
      const idx = INVENTORY_ITEMS.findIndex(i => i.id === selectedItem.id);
      if (idx > -1) {
          INVENTORY_ITEMS[idx] = updatedItem;
      }

      setSelectedItem(null); // Close Modal
      resetLocation();
  };

  const resetLocation = () => {
      setSelectedWh('');
      setSelectedCab('');
      setSelectedShelf('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/store')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('scrapyard.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">إدارة القطع المستخرجة من الأجهزة التالفة</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scrapItems.length > 0 ? (
              scrapItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                      {/* Top Stripe */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                      
                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800">
                                  {item.id}
                              </span>
                              <h3 className="font-bold text-slate-800 dark:text-white mt-1 text-sm">{item.name}</h3>
                          </div>
                          <Recycle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      </div>

                      <div className="text-xs text-slate-500 space-y-1 mb-4">
                          <p className="flex items-center gap-1">
                              <Box className="w-3 h-3" /> 
                              {t('scrapyard.item_source')} <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{item.sourceDevice || 'Unknown'}</span>
                          </p>
                          <p className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {t('scrap.condition')}: <span className="font-bold text-orange-500">{item.condition}</span>
                          </p>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={() => handleDispose(item.id)}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-1 transition-colors"
                          >
                              <Trash2 className="w-4 h-4" />
                              {t('scrapyard.action_dispose')}
                          </button>
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                          >
                              <CheckCircle2 className="w-4 h-4" />
                              {t('scrapyard.action_restock')}
                          </button>
                      </div>
                  </div>
              ))
          ) : (
              <div className="col-span-full py-20 text-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Recycle className="w-10 h-10" />
                  </div>
                  <p className="font-bold">{t('scrapyard.empty')}</p>
              </div>
          )}
      </div>

      {/* Restock Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                  
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t('scrapyard.modal_title')}</h3>
                  <p className="text-sm text-slate-500 mb-6">{selectedItem.name}</p>

                  <div className="space-y-4 mb-6">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('scrapyard.condition_update')}
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">{t('scrapyard.select_location')}</label>
                          
                          {/* Warehouse */}
                          <div className="relative">
                              <select 
                                value={selectedWh}
                                onChange={(e) => { setSelectedWh(e.target.value); setSelectedCab(''); setSelectedShelf(''); }}
                                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                  <option value="">المخزن...</option>
                                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                              </select>
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>

                          {/* Cabinet */}
                          <div className={`relative ${!selectedWh ? 'opacity-50' : ''}`}>
                              <select 
                                value={selectedCab}
                                onChange={(e) => { setSelectedCab(e.target.value); setSelectedShelf(''); }}
                                disabled={!selectedWh}
                                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                  <option value="">الخزانة...</option>
                                  {cabinets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>

                          {/* Shelf */}
                          <div className={`relative ${!selectedCab ? 'opacity-50' : ''}`}>
                              <select 
                                value={selectedShelf}
                                onChange={(e) => setSelectedShelf(e.target.value)}
                                disabled={!selectedCab}
                                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                              >
                                  <option value="">الرف...</option>
                                  {shelves.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setSelectedItem(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm">
                          {t('app.cancel')}
                      </button>
                      <button 
                        onClick={handleRestock}
                        disabled={!selectedShelf}
                        className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
                      >
                          {t('scrapyard.confirm_restock')}
                      </button>
                  </div>

              </div>
          </div>
      )}

    </div>
  );
};

export default ScrapYardView;
