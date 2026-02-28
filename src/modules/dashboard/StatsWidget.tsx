import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  trend?: string;
  onClick?: () => void;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ title, value, icon: Icon, colorClass, trend, onClick }) => {
  // Determine background color for the icon container based on the text color class
  const bgClass = colorClass.replace('text-', 'bg-');
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 active:scale-95 hover:shadow-md' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        {trend && <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{trend}</span>}
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatsWidget;