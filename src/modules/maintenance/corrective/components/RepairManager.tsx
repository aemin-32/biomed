
import React from 'react';
import { Package, Plus, Trash2, Battery, ScrollText, Droplets, Activity, Cpu, Monitor, Wrench } from 'lucide-react';
import { InventoryItem } from '../../../../core/database/types';

// Helper to map icons locally
const getIconForCategory = (category: string, name: string) => {
  const n = name.toLowerCase();
  if (n.includes('battery')) return Battery;
  if (n.includes('paper') || n.includes('report')) return ScrollText;
  if (n.includes('gel') || n.includes('liquid')) return Droplets;
  if (n.includes('sensor') || n.includes('cable')) return Activity;
  if (n.includes('board') || n.includes('cpu')) return Cpu;
  if (n.includes('lcd') || n.includes('screen')) return Monitor;
  if (category === 'Parts') return Wrench;
  return Package;
};

interface RepairManagerProps {
  usedParts: InventoryItem[];
  onAddClick: () => void;
  onRemovePart: (index: number) => void;
  totalCost: string;
}

const RepairManager: React.FC<RepairManagerProps> = ({ usedParts, onAddClick, onRemovePart, totalCost }) => {
  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
        {/* Spare Parts Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
            <h3 className="text-slate-800 dark:text-white font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            قطع الغيار المستهلكة
            </h3>
            <button 
            onClick={onAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
            <Plus className="w-4 h-4" />
            إضافة قطعة
            </button>
        </div>

        <div className="flex-1 p-5">
            {usedParts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                <Package className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">لم يتم إضافة أي قطع غيار</p>
                <p className="text-xs opacity-70">اضغط "إضافة قطعة" لاستعراض المخزن</p>
            </div>
            ) : (
            <div className="space-y-3">
                {usedParts.map((part, idx) => {
                const Icon = getIconForCategory(part.category, part.name);
                return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 shadow-sm">
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">{part.name}</p>
                            <p className="text-xs text-slate-500 font-mono">ID: {part.id}</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">${part.cost}</span>
                        <button 
                            onClick={() => onRemovePart(idx)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                );
                })}
            </div>
            )}
        </div>

        {/* Cost Estimator Footer */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <div>
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Estimated Cost</p>
            <p className="text-slate-400 text-[10px]">Includes Parts & Labor (Standard Rate)</p>
            </div>
            <div className="text-right">
            <div className="flex items-start justify-end gap-1">
                <span className="text-emerald-400 text-lg font-bold">$</span>
                <span className="text-4xl font-mono font-bold tracking-tighter">{totalCost}</span>
            </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default RepairManager;
