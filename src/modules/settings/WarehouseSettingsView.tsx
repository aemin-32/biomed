
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Plus, 
  Warehouse, 
  Box, 
  Layers, 
  Trash2, 
  ChevronDown, 
  FolderOpen
} from 'lucide-react';
import { LOCATIONS } from '../../core/database/mockData';
import { LocationConfig } from '../../core/database/types';
import { useLanguage } from '../../core/context/LanguageContext';

const WarehouseSettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Local state to manage adding new items
  const [locations, setLocations] = useState<LocationConfig[]>(LOCATIONS);
  
  // Tab State: 'Warehouse' | 'Cabinet' | 'Shelf'
  const [activeTab, setActiveTab] = useState<'Warehouse' | 'Cabinet' | 'Shelf'>('Warehouse');

  // Input State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // Filtering Lists
  const warehouses = locations.filter(l => l.type === 'Warehouse');
  const cabinets = locations.filter(l => l.type === 'Cabinet');
  const shelves = locations.filter(l => l.type === 'Shelf');

  // Logic to get parent list for dropdown
  const getParentList = () => {
      if (activeTab === 'Cabinet') return warehouses;
      if (activeTab === 'Shelf') return cabinets;
      return [];
  };

  const handleAddItem = () => {
      if (!newName.trim() || !newCode.trim()) {
          alert('يرجى إدخال الاسم والرمز');
          return;
      }
      if ((activeTab !== 'Warehouse') && !selectedParentId) {
          alert('يرجى اختيار الحاوية (الأب)');
          return;
      }

      const newItem: LocationConfig = {
          id: `${activeTab === 'Warehouse' ? 'WH' : activeTab === 'Cabinet' ? 'CAB' : 'SH'}-${Date.now()}`,
          name: newName.trim(),
          code: newCode.trim().toUpperCase(),
          type: activeTab,
          isEnabled: true,
          parentId: activeTab !== 'Warehouse' ? selectedParentId : undefined
      };

      setLocations([...locations, newItem]);
      LOCATIONS.push(newItem); // Sync with global mock
      setNewName('');
      setNewCode('');
  };

  const handleDelete = (id: string) => {
      if (window.confirm('هل أنت متأكد من الحذف؟')) {
          setLocations(prev => prev.filter(l => l.id !== id));
          // Remove from global mock properly
          const idx = LOCATIONS.findIndex(l => l.id === id);
          if (idx > -1) LOCATIONS.splice(idx, 1);
      }
  };

  const getParentName = (parentId?: string) => {
      const parent = locations.find(l => l.id === parentId);
      return parent ? parent.name : '???';
  };

  // List to display based on tab
  const currentList = useMemo(() => {
      if (activeTab === 'Warehouse') return warehouses;
      if (activeTab === 'Cabinet') return cabinets;
      return shelves;
  }, [activeTab, warehouses, cabinets, shelves]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/settings')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('warehouse.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">تخطيط الهيكلية (Warehouses &rarr; Cabinets &rarr; Shelves)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
          
          {/* Tabs */}
          <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
              {[
                  { id: 'Warehouse', label: t('warehouse.wh'), icon: Warehouse },
                  { id: 'Cabinet', label: t('warehouse.cab'), icon: Box },
                  { id: 'Shelf', label: t('warehouse.sh'), icon: Layers },
              ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id as any);
                        setSelectedParentId(''); // Reset parent selection when switching tabs
                    }}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                  </button>
              ))}
          </div>

          {/* Add Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
              <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {activeTab === 'Warehouse' ? t('warehouse.add_wh') : activeTab === 'Cabinet' ? t('warehouse.add_cab') : t('warehouse.add_sh')}
              </h3>
              
              <div className="flex flex-col md:flex-row gap-4">
                  {/* Parent Dropdown (If not Warehouse) */}
                  {activeTab !== 'Warehouse' && (
                      <div className="md:w-1/3">
                          <div className="relative">
                              <select 
                                value={selectedParentId}
                                onChange={(e) => setSelectedParentId(e.target.value)}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm appearance-none focus:outline-none focus:border-indigo-500"
                              >
                                  <option value="">{t('warehouse.select_parent')}</option>
                                  {getParentList().map(p => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                              </select>
                              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                      </div>
                  )}

                  <div className="flex-1 flex gap-3">
                      <div className="w-24">
                          <input 
                            type="text" 
                            placeholder="Code"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            className="w-full p-3 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:border-indigo-500 uppercase"
                          />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Name (e.g. Main Rack)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                      />
                      <button 
                        onClick={handleAddItem}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl shadow-lg shadow-indigo-500/20"
                      >
                          <Plus className="w-5 h-5" />
                      </button>
                  </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{t('warehouse.code_hint')}</p>
          </div>

          {/* List Section */}
          <div className="space-y-3">
              {currentList.length > 0 ? (
                  currentList.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group">
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                                  activeTab === 'Warehouse' 
                                  ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                  : activeTab === 'Cabinet'
                                    ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                              }`}>
                                  {item.code}
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-800 dark:text-white">{item.name}</h4>
                                  {item.parentId && (
                                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                          <FolderOpen className="w-3 h-3" />
                                          <span>Inside: {getParentName(item.parentId)}</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                          
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-10 text-slate-400">
                      <p>{t('warehouse.empty')}</p>
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};

export default WarehouseSettingsView;
