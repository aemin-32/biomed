
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Thermometer, 
  Gauge, 
  ArrowDownUp, 
  Droplets, 
  Weight, 
  Ruler 
} from 'lucide-react';

type Category = 'pressure' | 'temp' | 'flow' | 'weight' | 'length';

const UnitConverterView: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [category, setCategory] = useState<Category>('pressure');
  const [value, setValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('bar');
  const [toUnit, setToUnit] = useState<string>('psi');
  const [result, setResult] = useState<string>('---');

  // Conversion Logic
  useEffect(() => {
    const val = parseFloat(value);
    if (isNaN(val)) {
      setResult('---');
      return;
    }

    let res = 0;

    switch (category) {
      case 'pressure': {
        // Base unit: Bar
        let inBar = 0;
        if (fromUnit === 'bar') inBar = val;
        if (fromUnit === 'psi') inBar = val / 14.5038;
        if (fromUnit === 'kpa') inBar = val / 100;
        if (fromUnit === 'mmhg') inBar = val / 750.062;

        if (toUnit === 'bar') res = inBar;
        if (toUnit === 'psi') res = inBar * 14.5038;
        if (toUnit === 'kpa') res = inBar * 100;
        if (toUnit === 'mmhg') res = inBar * 750.062;
        break;
      }
      case 'temp': {
        // Base unit: Celsius
        let inC = 0;
        if (fromUnit === 'c') inC = val;
        if (fromUnit === 'f') inC = (val - 32) * (5/9);
        if (fromUnit === 'k') inC = val - 273.15;

        if (toUnit === 'c') res = inC;
        if (toUnit === 'f') res = (inC * 9/5) + 32;
        if (toUnit === 'k') res = inC + 273.15;
        break;
      }
      case 'flow': {
        // Base unit: ml/hr
        let inMlHr = 0;
        if (fromUnit === 'mlhr') inMlHr = val;
        if (fromUnit === 'lmin') inMlHr = val * 60000; // 1 L/min = 60,000 ml/hr

        if (toUnit === 'mlhr') res = inMlHr;
        if (toUnit === 'lmin') res = inMlHr / 60000;
        break;
      }
      case 'weight': {
        // Base unit: kg
        let inKg = 0;
        if (fromUnit === 'kg') inKg = val;
        if (fromUnit === 'lb') inKg = val / 2.20462;
        if (fromUnit === 'g') inKg = val / 1000;

        if (toUnit === 'kg') res = inKg;
        if (toUnit === 'lb') res = inKg * 2.20462;
        if (toUnit === 'g') res = inKg * 1000;
        break;
      }
      case 'length': {
        // Base unit: cm
        let inCm = 0;
        if (fromUnit === 'cm') inCm = val;
        if (fromUnit === 'inch') inCm = val * 2.54;
        if (fromUnit === 'm') inCm = val * 100;

        if (toUnit === 'cm') res = inCm;
        if (toUnit === 'inch') res = inCm / 2.54;
        if (toUnit === 'm') res = inCm / 100;
        break;
      }
    }

    // Format result based on magnitude to avoid long decimals
    if (res === 0) setResult('0');
    else if (res < 0.001) setResult(res.toExponential(3));
    else setResult(res.toLocaleString('en-US', { maximumFractionDigits: 3 }));

  }, [value, fromUnit, toUnit, category]);

  // Handle switching categories
  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setValue('');
    setResult('---');
    
    // Set defaults for each category
    switch (cat) {
      case 'pressure':
        setFromUnit('bar');
        setToUnit('psi');
        break;
      case 'temp':
        setFromUnit('c');
        setToUnit('f');
        break;
      case 'flow':
        setFromUnit('mlhr');
        setToUnit('lmin');
        break;
      case 'weight':
        setFromUnit('kg');
        setToUnit('lb');
        break;
      case 'length':
        setFromUnit('cm');
        setToUnit('inch');
        break;
    }
  };

  const categories = [
    { id: 'pressure', label: 'الضغط', icon: Gauge, color: 'text-blue-500' },
    { id: 'temp', label: 'الحرارة', icon: Thermometer, color: 'text-orange-500' },
    { id: 'flow', label: 'الضخ', icon: Droplets, color: 'text-cyan-500' },
    { id: 'weight', label: 'الوزن', icon: Weight, color: 'text-emerald-500' },
    { id: 'length', label: 'الطول', icon: Ruler, color: 'text-purple-500' },
  ];

  const getActiveIcon = () => {
    switch (category) {
      case 'pressure': return <Gauge className="w-40 h-40" />;
      case 'temp': return <Thermometer className="w-40 h-40" />;
      case 'flow': return <Droplets className="w-40 h-40" />;
      case 'weight': return <Weight className="w-40 h-40" />;
      case 'length': return <Ruler className="w-40 h-40" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/tools')} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">محول الوحدات</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Engineering Unit Converter</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        
        {/* Category Tabs (Scrollable) */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as Category)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                category === cat.id
                  ? 'bg-white dark:bg-slate-800 border-medical-500 dark:border-medical-500 text-slate-800 dark:text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <cat.icon className={`w-4 h-4 ${category === cat.id ? cat.color : 'text-slate-400'}`} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Converter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden min-h-[300px]">
          
          {/* Input Section */}
          <div className="space-y-6 relative z-10">
            
            {/* From */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">من (From)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0"
                  className="flex-[2] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500 transition-all"
                  autoFocus
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl px-2 border-r-8 border-transparent outline-none cursor-pointer text-center"
                >
                  {category === 'pressure' && (
                    <>
                      <option value="bar">Bar</option>
                      <option value="psi">PSI</option>
                      <option value="kpa">kPa</option>
                      <option value="mmhg">mmHg</option>
                    </>
                  )}
                  {category === 'temp' && (
                    <>
                      <option value="c">°C</option>
                      <option value="f">°F</option>
                      <option value="k">K</option>
                    </>
                  )}
                  {category === 'flow' && (
                    <>
                      <option value="mlhr">ml/hr</option>
                      <option value="lmin">L/min</option>
                    </>
                  )}
                  {category === 'weight' && (
                    <>
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                      <option value="g">g</option>
                    </>
                  )}
                  {category === 'length' && (
                    <>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                      <option value="m">meter</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Swap Icon Divider */}
            <div className="flex justify-center -my-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-400">
                <ArrowDownUp className="w-5 h-5" />
              </div>
            </div>

            {/* To (Result) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">إلى (To)</label>
              <div className="flex gap-2">
                <div className="flex-[2] p-4 bg-medical-50 dark:bg-medical-900/10 border border-medical-100 dark:border-medical-900/30 rounded-xl text-xl font-bold text-medical-700 dark:text-medical-400 flex items-center">
                  {result}
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl px-2 border-r-8 border-transparent outline-none cursor-pointer text-center"
                >
                  {category === 'pressure' && (
                    <>
                      <option value="bar">Bar</option>
                      <option value="psi">PSI</option>
                      <option value="kpa">kPa</option>
                      <option value="mmhg">mmHg</option>
                    </>
                  )}
                  {category === 'temp' && (
                    <>
                      <option value="c">°C</option>
                      <option value="f">°F</option>
                      <option value="k">K</option>
                    </>
                  )}
                  {category === 'flow' && (
                    <>
                      <option value="mlhr">ml/hr</option>
                      <option value="lmin">L/min</option>
                    </>
                  )}
                  {category === 'weight' && (
                    <>
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                      <option value="g">g</option>
                    </>
                  )}
                  {category === 'length' && (
                    <>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                      <option value="m">meter</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
          
          {/* Decorative Background Icon */}
          <div className="absolute -bottom-6 -left-6 text-slate-100 dark:text-slate-800 pointer-events-none opacity-50">
             {getActiveIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverterView;
