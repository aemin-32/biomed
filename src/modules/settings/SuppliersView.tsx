
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Briefcase,
  ExternalLink,
  Plus
} from 'lucide-react';
import { SUPPLIERS, DEVICES } from '../../core/database/mockData';
import { useLanguage } from '../../core/context/LanguageContext';

const SuppliersView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate linked devices count for each supplier
  const suppliersWithCount = useMemo(() => {
      return SUPPLIERS.map(sup => {
          const count = DEVICES.filter(d => d.supplierId === sup.id).length;
          return { ...sup, deviceCount: count };
      });
  }, []);

  const filteredSuppliers = suppliersWithCount.filter(sup => 
      sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings')} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('suppliers.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('suppliers.subtitle')}</p>
          </div>
        </div>
        
        <button className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
          <input 
            type="text" 
            placeholder={t('suppliers.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pr-11 pl-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map(sup => (
              <div key={sup.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                  <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                              sup.type === 'Agent' ? 'bg-indigo-500' : 'bg-slate-500'
                          }`}>
                              {sup.name.charAt(0)}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight">{sup.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block ${
                                  sup.type === 'Agent' 
                                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' 
                                  : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}>
                                  {sup.type === 'Agent' ? t('suppliers.type_agent') : t('suppliers.type_distributor')}
                              </span>
                          </div>
                      </div>
                      
                      {sup.deviceCount > 0 && (
                          <div className="text-center bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                              <span className="block text-xs font-bold text-slate-800 dark:text-white">{sup.deviceCount}</span>
                              <span className="block text-[8px] text-slate-400 uppercase">{t('suppliers.devices')}</span>
                          </div>
                      )}
                  </div>

                  <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{sup.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{sup.address}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <a href={`tel:${sup.phone}`} className="flex items-center justify-center gap-2 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                          {t('suppliers.contact')}
                      </a>
                      <a href={`mailto:${sup.email}`} className="flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                          {t('suppliers.email')}
                      </a>
                  </div>
              </div>
          ))}
      </div>

    </div>
  );
};

export default SuppliersView;
