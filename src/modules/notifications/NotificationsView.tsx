
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BellRing, 
  Package, 
  CalendarClock, 
  AlertTriangle, 
  Info,
  Check
} from 'lucide-react';
import { NOTIFICATIONS_DATA } from '../../core/database/mockData';
import { useLanguage } from '../../core/context/LanguageContext';
import { AppNotification } from '../../core/database/types';

const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS_DATA);

  const handleMarkAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleAction = (notification: AppNotification) => {
      handleMarkAsRead(notification.id);
      if (notification.actionLink) {
          navigate(notification.actionLink);
      }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'Stock': return <Package className="w-5 h-5" />;
          case 'PM': return <CalendarClock className="w-5 h-5" />;
          case 'Alert': return <AlertTriangle className="w-5 h-5" />;
          default: return <Info className="w-5 h-5" />;
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'Stock': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
          case 'PM': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
          case 'Alert': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
          default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('notif.title')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('notif.subtitle')}</p>
          </div>
        </div>
        
        {notifications.some(n => !n.isRead) && (
            <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors"
            >
                {t('notif.mark_all_read')}
            </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
          {notifications.length > 0 ? (
              notifications.map(notif => (
                  <div 
                    key={notif.id}
                    onClick={() => handleAction(notif)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${
                        !notif.isRead 
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                      {!notif.isRead && (
                          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      )}
                      
                      <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getColor(notif.type)}`}>
                              {getIcon(notif.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                  <h3 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                      {notif.title}
                                  </h3>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                      {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                  {notif.message}
                              </p>
                          </div>
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <BellRing className="w-10 h-10" />
                  </div>
                  <p className="text-slate-500 font-medium">{t('notif.empty')}</p>
              </div>
          )}
      </div>

    </div>
  );
};

export default NotificationsView;
