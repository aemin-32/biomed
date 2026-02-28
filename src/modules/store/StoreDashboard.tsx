
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Settings, 
  User, 
  Warehouse, 
  Recycle, 
  Truck, 
  Network,
  Search,
  AlertOctagon,
  ScanBarcode
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useLanguage } from '../../core/context/LanguageContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LogoutButton from '../../components/ui/LogoutButton';
import StatsWidget from '../dashboard/StatsWidget';
import { INVENTORY_ITEMS, SUPPLY_REQUESTS } from '../../core/database/mockData';

const StoreDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Stats Calculation
  const totalItems = INVENTORY_ITEMS.length;
  const lowStockItems = INVENTORY_ITEMS.filter(i => i.quantity <= i.minLevel).length;
  // Calculate value only for New items
  const inventoryValue = INVENTORY_ITEMS
    .filter(i => i.condition === 'New')
    .reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0);
  
  const scrapItemsCount = INVENTORY_ITEMS.filter(i => i.warehouseType === 'ScrapYard').length;
  
  // Pending Orders Count
  const pendingOrders = SUPPLY_REQUESTS.filter(r => r.status === 'Pending').length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors font-sans">
      
      {/* Header */}
      <header className="px-6 pt-8 pb-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-slate-900/50 rounded-b-3xl mb-6 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center border border-amber-500 text-amber-700 dark:text-amber-400">
               <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('dashboard.role_store')}
              </p>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                {user?.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/settings')}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="px-5 space-y-6 flex-1">
        
        {/* Main Search Bar */}
        <div className="relative">
            <input 
                type="text" 
                placeholder="بحث في الشبكة المخزنية..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pr-11 pl-4 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
            <StatsWidget 
                title={t('store.total_items')}
                value={totalItems} 
                icon={Package} 
                colorClass="text-blue-600 dark:text-blue-400" 
                onClick={() => navigate('/inventory')}
            />
            <StatsWidget 
                title={t('dashboard.low_stock')}
                value={lowStockItems} 
                icon={AlertOctagon} 
                colorClass="text-red-500 dark:text-red-400" 
                trend={lowStockItems > 0 ? "Critical" : "Good"}
                onClick={() => navigate('/inventory')} // Ideally filter by low
            />
            <StatsWidget 
                title={t('store.value')}
                value={`$${(inventoryValue/1000).toFixed(1)}k`} 
                icon={Warehouse} 
                colorClass="text-emerald-600 dark:text-emerald-400" 
            />
            <StatsWidget 
                title={t('store.salvaged_parts')}
                value={scrapItemsCount} 
                icon={Recycle} 
                colorClass="text-amber-600 dark:text-amber-400" 
                onClick={() => navigate('/store/scrapyard')}
            />
        </div>

        {/* Main Modules Grid */}
        <h3 className="text-slate-700 dark:text-slate-300 font-bold text-base mt-2">إدارة العمليات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Scrap Yard (Special Feature) */}
            <button 
                onClick={() => navigate('/store/scrapyard')}
                className="flex items-center p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 text-white relative overflow-hidden group transition-transform active:scale-95"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-colors"></div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mr-4 border border-white/30">
                    <Recycle className="w-8 h-8 text-white" />
                </div>
                <div className="text-right flex-1 z-10">
                    <h3 className="font-bold text-lg mb-1">{t('store.scrap_yard')}</h3>
                    <p className="text-xs text-orange-100 opacity-90">{t('store.scrap_desc')}</p>
                </div>
            </button>

            {/* 2. Main Inventory */}
            <button onClick={() => navigate('/inventory')} className="flex items-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all active:scale-95 group">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 ml-4 group-hover:scale-110 transition-transform">
                    <Package className="w-8 h-8" />
                </div>
                <div className="text-right flex-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">جرد المخزون</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">إدارة المواد (جديد ومستعمل)</p>
                </div>
            </button>

            {/* 3. Incoming Orders */}
            <button 
                onClick={() => navigate('/store/orders')}
                className="flex items-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all active:scale-95 group relative overflow-hidden"
            >
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400 ml-4 group-hover:scale-110 transition-transform">
                    <Truck className="w-8 h-8" />
                </div>
                <div className="text-right flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{t('store.orders')}</h3>
                        {pendingOrders > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{pendingOrders} جديد</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">استلام ومتابعة الشحنات</p>
                </div>
            </button>

            {/* 4. Network View */}
            <button className="flex items-center p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all active:scale-95 group">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 ml-4 group-hover:scale-110 transition-transform">
                    <Network className="w-8 h-8" />
                </div>
                <div className="text-right flex-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{t('store.network')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">مخازن الأقسام والمستشفيات</p>
                </div>
            </button>

        </div>

      </main>
    </div>
  );
};

export default StoreDashboard;
