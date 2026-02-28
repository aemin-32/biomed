
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  Download,
  PieChart,
  Activity,
  Layers,
  Wrench
} from 'lucide-react';
import { DEVICES, SERVICE_REQUESTS, INVENTORY_ITEMS } from '../../core/database/mockData';
import { useLanguage } from '../../core/context/LanguageContext';

const AnalyticsView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // --- 1. Top Level Metrics ---
  const stats = useMemo(() => {
      const totalDevices = DEVICES.length;
      const operational = DEVICES.filter(d => d.status === 'Operational').length;
      const uptime = totalDevices > 0 ? (operational / totalDevices) * 100 : 0;
      
      const totalCost = DEVICES.reduce((sum, d) => {
          return sum + (d.logs?.reduce((lSum, log) => lSum + (log.cost || 0), 0) || 0);
      }, 0);

      const openTickets = SERVICE_REQUESTS.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
      
      const assetValue = DEVICES.reduce((sum, d) => sum + (d.purchaseCost || 0), 0);

      return { uptime, totalCost, openTickets, assetValue, totalDevices };
  }, []);

  // --- 2. Chart Data: Fault Categories (Pie) ---
  const faultDistribution = useMemo(() => {
      const counts: Record<string, number> = {
          'Power': 0, 'Software': 0, 'Mechanical': 0, 'Sensor': 0, 'Other': 0
      };
      SERVICE_REQUESTS.forEach(req => {
          if (counts[req.issueCategory] !== undefined) counts[req.issueCategory]++;
          else counts['Other']++;
      });
      
      const total = SERVICE_REQUESTS.length || 1;
      return Object.entries(counts).map(([key, val]) => ({
          label: key,
          value: val,
          percent: (val / total) * 100
      })).sort((a,b) => b.value - a.value);
  }, []);

  // --- 3. Table Data: Department Performance ---
  const deptStats = useMemo(() => {
      const depts: Record<string, { total: number, down: number }> = {};
      DEVICES.forEach(d => {
          const dept = d.department || 'Unassigned';
          if (!depts[dept]) depts[dept] = { total: 0, down: 0 };
          depts[dept].total++;
          if (d.status === 'Down' || d.status === 'Maintenance') depts[dept].down++;
      });
      return Object.entries(depts).map(([name, data]) => ({
          name,
          ...data,
          health: ((data.total - data.down) / data.total) * 100
      })).sort((a,b) => b.health - a.health);
  }, []);

  // Simple Export
  const handleExport = () => {
      alert("جاري إنشاء تقرير PDF شامل... (محاكاة)");
  };

  // Helper for Conic Gradient (Pie Chart)
  const getConicGradient = () => {
      let currentAngle = 0;
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; // blue, green, amber, red, purple
      
      const parts = faultDistribution.map((item, idx) => {
          const start = currentAngle;
          const end = currentAngle + item.percent;
          currentAngle = end;
          return `${colors[idx % colors.length]} ${start}% ${end}%`;
      });
      
      return `conic-gradient(${parts.join(', ')})`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('analytics.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.subtitle')}</p>
          </div>
        </div>
        
        <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors"
        >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('analytics.export_report')}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
          
          {/* 1. KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                          <Activity className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${stats.uptime > 90 ? 'text-green-500' : 'text-amber-500'}`}>
                          {stats.uptime > 90 ? 'Excellent' : 'Needs Attn'}
                      </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{t('analytics.uptime')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.uptime.toFixed(1)}%</h3>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                          <DollarSign className="w-5 h-5" />
                      </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{t('analytics.costs')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">${(stats.totalCost/1000).toFixed(1)}k</h3>
                  <p className="text-[10px] text-slate-400">Total Maintenance Spend</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                          <Wrench className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-red-500">{stats.openTickets} Active</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Work Orders</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{SERVICE_REQUESTS.length}</h3>
                  <p className="text-[10px] text-slate-400">Lifetime Tickets</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                          <Layers className="w-5 h-5" />
                      </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{t('analytics.total_assets')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">${(stats.assetValue/1000000).toFixed(2)}M</h3>
                  <p className="text-[10px] text-slate-400">{stats.totalDevices} Registered Devices</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 2. Fault Distribution (Pie Chart Simulation) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-1">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-500" />
                      {t('analytics.faults_distribution')}
                  </h3>
                  
                  <div className="flex flex-col items-center">
                      {/* CSS Conic Gradient Pie Chart */}
                      <div 
                        className="w-48 h-48 rounded-full shadow-inner mb-6 relative flex items-center justify-center"
                        style={{ background: getConicGradient() }}
                      >
                          <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                              <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{stats.openTickets}</span>
                          </div>
                      </div>

                      {/* Legend */}
                      <div className="w-full space-y-3">
                          {faultDistribution.map((item, idx) => {
                              const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500'];
                              return (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></div>
                                          <span className="text-slate-600 dark:text-slate-300 font-bold">{item.label}</span>
                                      </div>
                                      <div className="flex gap-3 text-slate-500">
                                          <span>{item.value}</span>
                                          <span className="w-8 text-right">{item.percent.toFixed(0)}%</span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>

              {/* 3. Department Performance (Table) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      {t('analytics.dept_performance')}
                  </h3>

                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                          <thead className="text-xs text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50">
                              <tr>
                                  <th className="px-4 py-3 rounded-r-lg">القسم</th>
                                  <th className="px-4 py-3 text-center">الإجمالي</th>
                                  <th className="px-4 py-3 text-center">أعطال</th>
                                  <th className="px-4 py-3 rounded-l-lg">الحالة الصحية</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {deptStats.map((dept, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                      <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">{dept.name}</td>
                                      <td className="px-4 py-4 text-center font-mono">{dept.total}</td>
                                      <td className="px-4 py-4 text-center font-mono text-red-500">{dept.down > 0 ? dept.down : '-'}</td>
                                      <td className="px-4 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                  <div 
                                                    className={`h-full rounded-full ${dept.health > 90 ? 'bg-emerald-500' : dept.health > 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${dept.health}%` }}
                                                  ></div>
                                              </div>
                                              <span className="text-xs font-bold w-8 text-left dir-ltr">{dept.health.toFixed(0)}%</span>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
};

export default AnalyticsView;
