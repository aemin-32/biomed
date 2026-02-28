import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Activity, Target } from 'lucide-react';
import { DeviceStandard } from '../data/specStandards';

interface PresetSelectorProps {
  presets: DeviceStandard[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({ presets, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDevice = presets.find(p => p.id === selectedId);

  return (
    <div className="relative mb-6" ref={containerRef}>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <Activity className="w-4 h-4 text-medical-500" />
        اختر الجهاز (Standard Preset)
      </label>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
          isOpen 
            ? 'border-medical-500 ring-4 ring-medical-500/10 bg-white dark:bg-slate-900' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-medical-300'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedDevice ? (
            <>
              <div className="w-10 h-10 rounded-lg bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center flex-shrink-0 text-medical-600 dark:text-medical-400 font-bold text-sm border border-medical-100 dark:border-medical-900/50">
                {selectedDevice.name.charAt(0)}
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                  {selectedDevice.name}
                </p>
                <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Ref:</span>
                    <span className="font-mono font-bold text-medical-600 dark:text-medical-400">
                        {selectedDevice.standardVal}
                    </span>
                    <span className="text-slate-400 font-medium">
                        {selectedDevice.unit}
                    </span>
                </div>
              </div>
            </>
          ) : (
            <span className="text-slate-400 font-medium px-1">-- إدخال يدوي (Manual Entry) --</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Manual Option */}
            <button
                onClick={() => {
                    onSelect('');
                    setIsOpen(false);
                }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 ${
                    selectedId === '' ? 'bg-slate-50 dark:bg-slate-800/50' : ''
                }`}
            >
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
                    <span className="text-xs">M</span>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">إدخال يدوي (Manual)</span>
                {selectedId === '' && <Check className="w-4 h-4 text-medical-600 mr-auto" />}
            </button>

            {/* Presets List */}
            <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => {
                            onSelect(preset.id);
                            setIsOpen(false);
                        }}
                        className={`w-full p-2.5 mb-1 flex items-center justify-between rounded-xl transition-all group ${
                            selectedId === preset.id 
                                ? 'bg-medical-50 dark:bg-medical-900/20 ring-1 ring-medical-200 dark:ring-medical-800' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3 text-right">
                             {/* Initials Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                                selectedId === preset.id 
                                    ? 'bg-white dark:bg-slate-900 text-medical-600' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700'
                            }`}>
                                {preset.name.substring(0, 2).toUpperCase()}
                            </div>
                            
                            {/* Text Info */}
                            <div>
                                <p className={`text-sm font-bold ${
                                    selectedId === preset.id ? 'text-medical-700 dark:text-medical-300' : 'text-slate-700 dark:text-slate-200'
                                }`}>
                                    {preset.name}
                                </p>
                                {/* Formatted Badge for Value */}
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Target className="w-3 h-3 text-slate-400" />
                                    <span className={`text-xs font-mono font-bold ${
                                        selectedId === preset.id ? 'text-medical-600 dark:text-medical-400' : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                        {preset.standardVal}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                        {preset.unit}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selectedId === preset.id && (
                            <div className="w-6 h-6 bg-medical-500 rounded-full flex items-center justify-center text-white shadow-sm shadow-medical-500/40">
                                <Check className="w-3.5 h-3.5" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default PresetSelector;