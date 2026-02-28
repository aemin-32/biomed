
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Scale, CheckCircle2, AlertTriangle, Target, Activity, Settings2, Link as LinkIcon } from 'lucide-react';
import { CALIBRATION_PRESETS, DeviceStandard } from './data/specStandards';
import PresetSelector from './components/PresetSelector';
import BackButton from '../../components/ui/BackButton';

const CalibrationView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State from Navigation (Maintenance Context)
  const maintenanceContext = location.state as { 
    fromMaintenance?: boolean; 
    deviceId?: string; 
    deviceName?: string; 
    deviceType?: string;
    deviceModel?: string;
    customTolerance?: number;
  } | null;

  // Local State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  
  const [standard, setStandard] = useState<string>('');
  const [measured, setMeasured] = useState<string>('');
  const [tolerance, setTolerance] = useState<string>('5');
  const [isPercentage, setIsPercentage] = useState<boolean>(true);

  // Auto-selection Logic based on Maintenance Context
  useEffect(() => {
    if (maintenanceContext) {
      const type = (maintenanceContext.deviceType || '').toLowerCase();
      const model = (maintenanceContext.deviceModel || '').toLowerCase();
      const name = (maintenanceContext.deviceName || '').toLowerCase();

      // Broaden search: check type, name, AND model against preset names to find the best match
      const matchingPreset = CALIBRATION_PRESETS.find(p => {
        const pName = p.name.toLowerCase();
        // Check if preset name exists in any of the device identifiers
        return type.includes(pName) || pName.includes(type) ||
               name.includes(pName) || pName.includes(name) ||
               model.includes(pName);
      });

      if (matchingPreset) {
        setSelectedPresetId(matchingPreset.id);
        
        // 2. Try to find matching Variant (Brand/Model)
        let foundVariant = false;
        if (matchingPreset.variants) {
          // Search variants matching the model or name (e.g. "Eppendorf")
          const matchingVariant = matchingPreset.variants.find(v => 
            model.includes(v.name.toLowerCase()) || 
            name.includes(v.name.toLowerCase()) ||
            v.name.toLowerCase().includes(model)
          );
          
          if (matchingVariant) {
            handleVariantSelect(matchingPreset, matchingVariant.id);
            foundVariant = true;
          }
        }

        // If no variant matched, set defaults from the main preset
        if (!foundVariant) {
          setStandard(matchingPreset.standardVal.toString());
          setTolerance(matchingPreset.tolerance.toString());
          setIsPercentage(matchingPreset.isPercentage);
        }
      }
      
      // Override with custom tolerance from device profile if available
      if (maintenanceContext.customTolerance !== undefined) {
         setTolerance(maintenanceContext.customTolerance.toString());
      }
    }
  }, [maintenanceContext]);

  // Get current device object based on selection
  const currentDevice = CALIBRATION_PRESETS.find(d => d.id === selectedPresetId);

  // Logic
  const stdVal = parseFloat(standard);
  const measVal = parseFloat(measured);
  const tolVal = parseFloat(tolerance);

  let errorPercent = 0;
  let absError = 0;
  let isCalculable = !isNaN(stdVal) && !isNaN(measVal) && stdVal !== 0;
  let isPass = false;
  
  if (isCalculable) {
    absError = Math.abs(measVal - stdVal);
    errorPercent = (absError / stdVal) * 100;

    if (isPercentage) {
        isPass = errorPercent <= tolVal;
    } else {
        isPass = absError <= tolVal;
    }
  }

  // Handle Main Device Selection
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    setMeasured(''); // Reset measured
    
    const device = CALIBRATION_PRESETS.find(d => d.id === presetId);
    
    if (device) {
      // If device has variants, select the first one by default
      if (device.variants && device.variants.length > 0) {
        handleVariantSelect(device, device.variants[0].id);
      } else {
        // No variants, use default
        setSelectedVariantId('');
        setStandard(device.standardVal.toString());
        setTolerance(device.tolerance.toString());
        setIsPercentage(device.isPercentage);
      }
    } else {
      // Manual Mode
      setSelectedVariantId('');
      setStandard('');
      setTolerance('5');
      setIsPercentage(true);
    }
  };

  // Handle Variant (Brand) Selection
  const handleVariantSelect = (device: DeviceStandard, variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = device.variants?.find(v => v.id === variantId);
    
    if (variant) {
      setStandard(variant.standardVal.toString());
      setTolerance(variant.tolerance.toString());
      // Keep parent isPercentage unless we want variants to override it later
      setIsPercentage(device.isPercentage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">مساعد المعايرة</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Calibration & Accuracy Check</p>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Maintenance Context Info Banner */}
        {maintenanceContext && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-300">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-500 dark:text-blue-400 font-bold mb-0.5">معايرة جهاز مرتبط</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {maintenanceContext.deviceName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">{maintenanceContext.deviceId}</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        <div className={`p-8 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden border ${
          !isCalculable 
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
            : isPass 
              ? 'bg-green-500 border-green-400 shadow-xl shadow-green-500/20' 
              : 'bg-red-500 border-red-400 shadow-xl shadow-red-500/20'
        }`}>
          
          {/* Status Icon */}
          <div className={`p-4 rounded-full mb-4 transition-all ${
            !isCalculable 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
              : isPass 
                ? 'bg-white/20 text-white' 
                : 'bg-white/20 text-white'
          }`}>
            {!isCalculable ? <Scale className="w-10 h-10" /> : isPass ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <div className="text-center relative z-10">
            <h2 className={`text-4xl font-bold tracking-tight mb-2 ${
              !isCalculable ? 'text-slate-300 dark:text-slate-700' : 'text-white'
            }`}>
              {isCalculable ? `${errorPercent.toFixed(2)}%` : '--.--%'}
            </h2>
            <p className={`text-sm font-bold uppercase tracking-widest ${
               !isCalculable ? 'text-slate-400 dark:text-slate-600' : 'text-white/90'
            }`}>
              {!isCalculable ? 'أدخل القيم' : isPass ? 'ناجح / PASS' : 'فاشل / FAIL'}
            </p>
            {isCalculable && !isPercentage && (
                <p className="text-xs text-white/70 mt-1 font-mono">Diff: {absError.toFixed(2)} (Limit: {tolVal})</p>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            
            {/* 1. Device Selector */}
            <PresetSelector 
                presets={CALIBRATION_PRESETS}
                selectedId={selectedPresetId}
                onSelect={handlePresetSelect}
            />

            {/* 2. Brand/Variant Toggle (Conditional) */}
            {currentDevice?.variants && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 -mt-2 mb-4">
                <div className="flex items-center gap-2 mb-2">
                   <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                   <label className="text-xs font-bold text-slate-500 uppercase">اختر الشركة المصنعة (Brand)</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentDevice.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(currentDevice, variant.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        selectedVariantId === variant.id
                          ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Standard Value */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                القيمة المرجعية (Standard)
              </label>
              <input 
                type="number" 
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                placeholder="0.0"
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all"
              />
            </div>

            {/* 4. Measured Value */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                القيمة المقاسة (Measured)
              </label>
              <input 
                type="number" 
                value={measured}
                onChange={(e) => setMeasured(e.target.value)}
                placeholder="0.0"
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all"
              />
            </div>

            {/* 5. Tolerance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    حد السماحية (Tolerance)
                  </label>
                  <button 
                    onClick={() => setIsPercentage(!isPercentage)}
                    className="text-xs font-bold text-blue-500 hover:text-blue-600 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded"
                  >
                      {isPercentage ? 'نسبة مئوية (%)' : 'قيمة مطلقة (Absolute)'}
                  </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <input 
                    type="number" 
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                    className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                        {isPercentage ? '%' : '±'}
                    </span>
                </div>
                {/* Quick Toggle Buttons for % (only show if using percentage mode) */}
                {isPercentage && (
                    <div className="flex gap-2">
                    {[1, 5, 10].map(val => (
                        <button
                        key={val}
                        onClick={() => setTolerance(val.toString())}
                        className={`w-12 h-12 rounded-xl font-bold text-sm transition-all border ${
                            tolerance === val.toString()
                            ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white'
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                        >
                        {val}%
                        </button>
                    ))}
                    </div>
                )}
              </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CalibrationView;
