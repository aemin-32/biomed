
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  AlertCircle,
  Search,
  Filter,
  CalendarDays
} from 'lucide-react';
import { SERVICE_REQUESTS, DEVICES } from '../../core/database/mockData';
import { useAuth } from '../../core/context/AuthContext';

const NurseRequestHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'All' | 'Open' | 'Closed'>('All');

  // Get tickets related to nurse's rooms
  const myTickets = useMemo(() => {
    if (!user?.responsibleRooms) return [];
    
    // 1. Find devices in my rooms
    const myDeviceIds = DEVICES.filter(d => 
        user.responsibleRooms!.some(room => d.location && d.location.includes(room))
    ).map(d => d.id);

    // 2. Find tickets for these devices OR tickets requested by this user name
    return SERVICE_REQUESTS.filter(t => 
        myDeviceIds.includes(t.deviceId) || t.requestedBy === user.name
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [user]);

  const filteredTickets = myTickets.filter(t => {
      if (filter === 'All') return true;
      if (filter === 'Open') return t.status === 'Open' || t.status === 'In Progress';
      if (filter === 'Closed') return t.status === 'Closed';
      return true;
  });

  const getStatusConfig = (status: string) => {
      switch(status) {
          case 'Open': return { label: 'بانتظار المهندس', color: 'bg-red-100 text-red-700', icon: Clock };
          case 'In Progress': return { label: 'جاري العمل', color: 'bg-amber-100 text-amber-700', icon: Wrench };
          case 'Closed': return { label: 'تم الإصلاح', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
          default: return { label: status, color: 'bg-slate-100', icon: AlertCircle };
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20 transition-colors">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate('/nurse')} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ArrowRight className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">سجل البلاغات</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">متابعة حالة الطلبات السابقة</p>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {['All', 'Open', 'Closed'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        filter === f 
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    {f === 'All' ? 'الكل' : f === 'Open' ? 'نشطة' : 'مكتملة'}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
          {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => {
                  const status = getStatusConfig(ticket.status);
                  const StatusIcon = status.icon;
                  const date = new Date(ticket.timestamp);

                  return (
                      <div key={ticket.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-start mb-2">
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${status.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  <span>{status.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {date.toLocaleDateString('en-GB')}
                              </span>
                          </div>
                          
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{ticket.deviceName}</h3>
                          <p className="text-xs text-slate-500 mb-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg leading-relaxed">
                              {ticket.description}
                          </p>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400">{ticket.id}</span>
                              {ticket.status === 'Closed' && (
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      تم الإغلاق
                                  </span>
                              )}
                          </div>
                      </div>
                  );
              })
          ) : (
              <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                      <Filter className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">لا توجد بلاغات في هذا التصنيف</p>
              </div>
          )}
      </div>

    </div>
  );
};

export default NurseRequestHistoryView;
