
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BellRing,
  User,
  MapPin,
  Clock,
  Inbox,
  PlayCircle
} from 'lucide-react';
import { DEVICES, SERVICE_REQUESTS } from '../../core/database/mockData';
import { ServiceRequest } from '../../core/database/types';

// Ticket Card Component
const TicketCard: React.FC<{ ticket: ServiceRequest }> = ({ ticket }) => {
    const navigate = useNavigate();
    const isPaused = ticket.status === 'In Progress';
    
    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // 1. Update Ticket Status (In real app, API call)
        ticket.status = 'In Progress';
        
        // 2. Update Device Status to Maintenance (Ensure consistency)
        const deviceIdx = DEVICES.findIndex(d => d.id === ticket.deviceId);
        if (deviceIdx !== -1) {
            DEVICES[deviceIdx].status = 'Maintenance';
        }

        // 3. Navigate to Workbench with ticket context
        navigate(`/maintenance/workbench/${ticket.deviceId}`, { 
            state: { 
                ticketData: ticket // Pass the full ticket object
            } 
        });
    };

    return (
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border ${isPaused ? 'border-indigo-200 dark:border-indigo-900' : 'border-red-100 dark:border-red-900/30'} shadow-sm relative overflow-hidden group animate-in slide-in-from-bottom-2`}>
            {/* Priority Strip */}
            <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${
                ticket.priority === 'Critical' ? 'bg-red-500' : (isPaused ? 'bg-indigo-500' : 'bg-amber-500')
            }`}></div>

            <div className="flex justify-between items-start mb-3 pl-2">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                        {ticket.deviceName}
                        {ticket.priority === 'Critical' && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full animate-pulse border border-red-200">عاجل جداً</span>
                        )}
                        {isPaused && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-200">قيد التنفيذ/معلق</span>
                        )}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">{ticket.id}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>

            <div className="mb-5 pl-2">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{ticket.description}"
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> 
                        <span className="font-bold">{ticket.requestedBy}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> 
                        <span className="font-bold">{ticket.location}</span>
                    </span>
                </div>
            </div>

            <button 
                onClick={handleAction}
                className={`w-full py-3.5 text-white rounded-xl font-bold text-sm transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    isPaused 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-slate-900'
                }`}
            >
                {isPaused ? (
                    <>
                       <span>استكمال العمل (Resume)</span>
                       <PlayCircle className="w-4 h-4 rtl:rotate-180" />
                    </>
                ) : (
                    <>
                       <span>استلام المهمة وبدء الإصلاح</span>
                       <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </>
                )}
            </button>
        </div>
    );
};

const IncomingRequestsView: React.FC = () => {
  const navigate = useNavigate();
  // Get Open Tickets AND In Progress Tickets
  const incomingTickets = SERVICE_REQUESTS.filter(t => t.status === 'Open' || t.status === 'In Progress');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             البلاغات والمهام
             {incomingTickets.length > 0 && (
                 <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{incomingTickets.length}</span>
             )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">طلبات الإصلاح والمهام المعلقة</p>
        </div>
      </div>

      {/* Content */}
      {incomingTickets.length > 0 ? (
          <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                  <BellRing className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">بلاغات تتطلب إجراء</h2>
              </div>
              {incomingTickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} />
              ))}
          </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-400 border border-slate-200 dark:border-slate-800">
                  <Inbox className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">لا توجد بلاغات جديدة</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  جميع البلاغات تمت معالجتها أو لم يتم إرسال طلبات جديدة من الأقسام.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="mt-8 text-blue-600 font-bold text-sm hover:underline"
              >
                  العودة للرئيسية
              </button>
          </div>
      )}

    </div>
  );
};

export default IncomingRequestsView;
