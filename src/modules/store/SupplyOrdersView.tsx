
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck,
  User,
  Calendar,
  Truck
} from 'lucide-react';
import { SUPPLY_REQUESTS, INVENTORY_ITEMS } from '../../core/database/mockData';
import { useLanguage } from '../../core/context/LanguageContext';
import { SupplyRequest } from '../../core/database/types';

const SupplyOrdersView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'Pending' | 'Ordered' | 'Received'>('Pending');
  const [requests, setRequests] = useState<SupplyRequest[]>(SUPPLY_REQUESTS);

  // Filter List
  const filteredRequests = useMemo(() => {
      // For History tab, we can show Received and Rejected
      if (activeTab === 'Received') return requests.filter(r => r.status === 'Received' || r.status === 'Rejected');
      return requests.filter(r => r.status === activeTab);
  }, [requests, activeTab]);

  // Actions
  const handleApprove = (id: string) => {
      if (window.confirm('هل أنت متأكد من اعتماد هذا الطلب وبدء الشراء؟')) {
          setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Ordered' } : r));
          
          // Update Global Mock
          const idx = SUPPLY_REQUESTS.findIndex(r => r.id === id);
          if (idx > -1) SUPPLY_REQUESTS[idx].status = 'Ordered';
      }
  };

  const handleReceive = (req: SupplyRequest) => {
      // 1. Update Request Status
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Received' } : r));
      const idx = SUPPLY_REQUESTS.findIndex(r => r.id === req.id);
      if (idx > -1) SUPPLY_REQUESTS[idx].status = 'Received';

      // 2. Update Inventory Stock
      if (req.partId) {
          const itemIdx = INVENTORY_ITEMS.findIndex(i => i.id === req.partId);
          if (itemIdx > -1) {
              INVENTORY_ITEMS[itemIdx].quantity += req.quantity;
              INVENTORY_ITEMS[itemIdx].lastUpdated = new Date().toISOString();
              alert(`✅ تم استلام ${req.quantity} قطع وإضافتها إلى الرصيد.`);
          } else {
              // If ID exists but not in array (rare edge case in mock), or new item logic needs to be handled
              alert('⚠️ القطعة غير موجودة في قاعدة البيانات الحالية، يرجى إضافتها يدوياً.');
          }
      } else {
          alert('⚠️ هذه مادة جديدة، يرجى الذهاب للمخزن وإضافتها كعنصر جديد.');
      }
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
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('orders.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('orders.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
          {[
              { id: 'Pending', label: t('orders.tab_pending'), icon: Clock },
              { id: 'Ordered', label: t('orders.tab_ordered'), icon: Truck },
              { id: 'Received', label: t('orders.tab_history'), icon: CheckCircle2 },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                    activeTab === tab.id 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-500' : ''}`} />
                  {tab.label}
              </button>
          ))}
      </div>

      {/* List */}
      <div className="space-y-4">
          {filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                      {/* Priority Stripe */}
                      <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${
                          req.priority === 'Urgent' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>

                      <div className="flex justify-between items-start mb-3">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{req.id}</span>
                                  {req.priority === 'Urgent' && (
                                      <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" /> عاجل
                                      </span>
                                  )}
                              </div>
                              <h3 className="font-bold text-slate-800 dark:text-white text-base">{req.partName}</h3>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{req.partId || 'New Item'}</p>
                          </div>
                          
                          <div className="text-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl min-w-[60px]">
                              <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('orders.qty')}</span>
                              <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">{req.quantity}</span>
                          </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3 mb-4">
                          <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {req.requesterName}
                          </span>
                          <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(req.requestDate).toLocaleDateString('en-GB')}
                          </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                          {activeTab === 'Pending' && (
                              <button 
                                onClick={() => handleApprove(req.id)}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                  <ShoppingCart className="w-4 h-4" />
                                  {t('orders.action_approve')}
                              </button>
                          )}

                          {activeTab === 'Ordered' && (
                              <button 
                                onClick={() => handleReceive(req)}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                  <PackageCheck className="w-4 h-4" />
                                  {t('orders.action_receive')}
                              </button>
                          )}

                          {activeTab === 'Received' && (
                              <div className="w-full text-center py-2 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                                  {t('orders.status_received')}
                              </div>
                          )}
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <ShoppingCart className="w-10 h-10" />
                  </div>
                  <p className="text-slate-500 font-medium">{t('orders.empty')}</p>
              </div>
          )}
      </div>

    </div>
  );
};

export default SupplyOrdersView;
