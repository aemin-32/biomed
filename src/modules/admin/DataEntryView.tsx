import React, { useState } from 'react';
import { Activity, Package, Save, Server, Cpu } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';

const DataEntryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'devices' | 'inventory'>('devices');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 pt-12 pb-6 px-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">إدخال البيانات</h1>
            <p className="text-sm text-slate-500">إضافة أجهزة جديدة أو مواد للمخزن</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'devices'
                ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Activity className="w-5 h-5" />
            الأجهزة الطبية
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Package className="w-5 h-5" />
            مواد المخزن
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'devices' ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
                <Server className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">إضافة جهاز جديد</h2>
            </div>
            
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الجهاز</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="مثال: جهاز تنفس صناعي" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الشركة المصنعة</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="مثال: Philips" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الموديل</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="مثال: V60" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الرقم التسلسلي (SN)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono" placeholder="SN-XXXX-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">القسم</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option>العناية المركزة (ICU)</option>
                    <option>الطوارئ (ER)</option>
                    <option>العمليات (OR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">تاريخ التركيب</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              </div>

              <button type="button" className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-8">
                <Save className="w-5 h-5" />
                حفظ بيانات الجهاز
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">إضافة مادة للمخزن</h2>
            </div>
            
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم المادة / القطعة</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="مثال: حساس أكسجين (O2 Sensor)" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">رقم القطعة (Part Number)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono" placeholder="PN-XXXX" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الكمية المتوفرة</label>
                  <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الحد الأدنى للتنبيه</label>
                  <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" placeholder="5" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">التصنيف</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option>قطع غيار (Spare Parts)</option>
                    <option>مستهلكات (Consumables)</option>
                    <option>أدوات (Tools)</option>
                  </select>
                </div>
              </div>

              <button type="button" className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-8">
                <Save className="w-5 h-5" />
                إضافة للمخزن
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEntryView;
