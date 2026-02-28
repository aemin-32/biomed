
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Activity, 
  Zap, 
  Wind, 
  TestTube2,
  ChevronLeft,
  Stethoscope,
  Microscope,
  Pipette,
  Scan,
  Waves
} from 'lucide-react';

// Import Simulators
import CentrifugeSim from './simulators/CentrifugeSim';

// Simulator Definition Type
interface SimulatorDef {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  component: React.ComponentType;
}

// Data
const SIMULATORS: SimulatorDef[] = [
  {
    id: 'lab-centrifuge',
    category: 'المختبر (Laboratory)',
    title: 'جهاز الطرد المركزي',
    subtitle: 'Centrifuge Balancing & Safety',
    icon: TestTube2, // Or Microscope
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    component: CentrifugeSim
  }
];

const SimulationHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeSimId, setActiveSimId] = useState<string | null>(null);

  // Get active simulator object
  const activeSim = SIMULATORS.find(s => s.id === activeSimId);

  // Group unique categories
  const categories = Array.from(new Set(SIMULATORS.map(s => s.category)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 transition-colors pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => {
            if (activeSimId) setActiveSimId(null); // Back to menu
            else navigate('/'); // Back to dashboard
          }} 
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            {activeSim ? activeSim.title : 'منصة المحاكاة'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeSim ? activeSim.subtitle : 'بيئة تدريب افتراضية للأجهزة الطبية'}
          </p>
        </div>
      </div>

      {/* Content Area */}
      {activeSim ? (
        // --- DETAIL VIEW: Active Simulator ---
        <div className="max-w-4xl mx-auto min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
           <activeSim.component />
        </div>
      ) : (
        // --- MASTER VIEW: List of Devices ---
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
           {categories.map(cat => (
             <div key={cat}>
               <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                 {cat.includes('Lab') ? <Microscope className="w-4 h-4" /> : 
                  cat.includes('Diagnosis') ? <Stethoscope className="w-4 h-4" /> :
                  cat.includes('Imaging') ? <Scan className="w-4 h-4" /> :
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>}
                 {cat}
               </h3>
               
               <div className="grid grid-cols-1 gap-3">
                 {SIMULATORS.filter(s => s.category === cat).map(sim => (
                   <button
                     key={sim.id}
                     onClick={() => setActiveSimId(sim.id)}
                     className="relative w-full flex items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-medical-500 dark:hover:border-medical-500 hover:shadow-md transition-all group text-right overflow-hidden active:scale-[0.99]"
                   >
                      {/* Hover Accent Line */}
                      <div className={`absolute right-0 top-0 bottom-0 w-1 ${sim.color.replace('text', 'bg')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                      <div className={`p-4 rounded-xl ${sim.bg} ${sim.color} ml-4 group-hover:scale-110 transition-transform duration-300`}>
                        <sim.icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 z-10">
                        <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                          {sim.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {sim.subtitle}
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full text-slate-300 group-hover:text-medical-500 group-hover:bg-medical-50 dark:group-hover:bg-medical-900/20 transition-colors z-10">
                          <ChevronLeft className="w-5 h-5" />
                      </div>
                   </button>
                 ))}
               </div>
             </div>
           ))}
        </div>
      )}

    </div>
  );
};

export default SimulationHub;
