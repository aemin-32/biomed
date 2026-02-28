
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Battery, Scale, History, Edit2, Check, X } from 'lucide-react';
import { Device } from '../../../core/database/types';
import { useLanguage } from '../../../core/context/LanguageContext';

interface DeviceTechnicalSpecsProps {
  device: Device;
}

const DeviceTechnicalSpecs: React.FC<DeviceTechnicalSpecsProps> = ({ device }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Edit Mode State
  const [isEditingPower, setIsEditingPower] = useState(false);
  const [powerSpecs, setPowerSpecs] = useState(device.powerSpecs || { voltage: 0, current: 0, frequency: 50 });

  const handleSavePower = () => {
      // In a real app, this would make an API call
      device.powerSpecs = {
          voltage: Number(powerSpecs.voltage),
          current: Number(powerSpecs.current),
          frequency: Number(powerSpecs.frequency)
      };
      setIsEditingPower(false);
  };

  const handleCancelPower = () => {
      setPowerSpecs(device.powerSpecs || { voltage: 0, current: 0, frequency: 50 });
      setIsEditingPower(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             
        {/* 1. Power Specs (Editable) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    {t('tech.power')}
                </h3>
                {!isEditingPower ? (
                    <button 
                        onClick={() => setIsEditingPower(true)}
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                    >
                        <Edit2 className="w-3 h-3" />
                        {t('profile.edit')}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleCancelPower} className="p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        <button onClick={handleSavePower} className="p-1 text-green-500 hover:text-green-600"><Check className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            
            <div className="p-5">
                {isEditingPower ? (
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block">Voltage (V)</label>
                            <input 
                                type="number" 
                                value={powerSpecs.voltage}
                                onChange={(e) => setPowerSpecs({...powerSpecs, voltage: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block">Current (A)</label>
                            <input 
                                type="number" 
                                value={powerSpecs.current}
                                onChange={(e) => setPowerSpecs({...powerSpecs, current: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 mb-1 block">Freq (Hz)</label>
                            <input 
                                type="number" 
                                value={powerSpecs.frequency}
                                onChange={(e) => setPowerSpecs({...powerSpecs, frequency: Number(e.target.value)})}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-center font-bold text-sm focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>
                ) : (
                    device.powerSpecs ? (
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xl font-mono font-bold text-slate-800 dark:text-white">{device.powerSpecs.voltage}<span className="text-xs ml-1 text-slate-400">V</span></p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">{t('tech.volt')}</p>
                            </div>
                            <div>
                                <p className="text-xl font-mono font-bold text-slate-800 dark:text-white">{device.powerSpecs.current}<span className="text-xs ml-1 text-slate-400">A</span></p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">{t('tech.current')}</p>
                            </div>
                            <div>
                                <p className="text-xl font-mono font-bold text-slate-800 dark:text-white">{device.powerSpecs.frequency}<span className="text-xs ml-1 text-slate-400">Hz</span></p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">{t('tech.freq')}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-2">{t('tech.no_data')}</p>
                    )
                )}
            </div>
        </div>

        {/* 2. Battery Specs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-500" />
                {t('tech.battery')}
            </h3>
            {device.batterySpecs?.hasBattery && (
                <button 
                onClick={() => navigate('/tools/battery')}
                className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100"
                >
                {t('tech.battery_calc')}
                </button>
            )}
        </div>
        <div className="p-5">
            {device.batterySpecs?.hasBattery ? (
                <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{device.batterySpecs.type}</p>
                    <p className="text-xs text-slate-500">Replacement: {device.batterySpecs.replacementDate || 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-mono font-bold text-slate-800 dark:text-white">{device.batterySpecs.capacitymAh} <span className="text-xs text-slate-400">mAh</span></p>
                    <p className="text-xs font-bold text-slate-400">{device.batterySpecs.voltage} V</p>
                </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-slate-400 justify-center py-2">
                <Battery className="w-5 h-5 opacity-50" />
                <span className="text-sm">Direct Power (No Battery)</span>
                </div>
            )}
        </div>
        </div>

        {/* 3. Calibration Specs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-500" />
                {t('tech.calibration')}
            </h3>
            <button 
                onClick={() => navigate('/tools/calibration', { state: { 
                    fromMaintenance: true, 
                    deviceId: device.id, 
                    deviceName: device.name, 
                    deviceType: device.type,
                    deviceModel: device.model,
                    customTolerance: device.calibrationSpecs?.tolerancePercent
                }})}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100"
            >
                {t('tech.open_assistant')}
            </button>
        </div>
        <div className="p-5">
            {device.calibrationSpecs ? (
                <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">{t('tech.last_cal')}</p>
                    <p className="font-bold text-slate-800 dark:text-white">{device.calibrationSpecs.lastDate}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">{t('tech.tolerance')}</p>
                    <p className="font-bold text-slate-800 dark:text-white dir-ltr">± {device.calibrationSpecs.tolerancePercent}%</p>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500">
                    <History className="w-3 h-3" />
                    <span>{t('tech.interval').replace('{months}', device.calibrationSpecs.intervalMonths.toString())}</span>
                </div>
                </div>
            ) : (
                <p className="text-sm text-slate-400 text-center py-2">{t('tech.no_data')}</p>
            )}
        </div>
        </div>

    </div>
  );
};

export default DeviceTechnicalSpecs;
