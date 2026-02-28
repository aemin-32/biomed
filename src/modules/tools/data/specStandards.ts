
export interface DeviceVariant {
  id: string;
  name: string;        // Brand Name (e.g., Zoll, Philips)
  standardVal: number; // Specific Value for this brand
  tolerance: number;   // Specific Tolerance
  unit?: string;       // Optional unit override
}

export interface DeviceStandard {
  id: string;
  name: string;      // Device Name (English)
  unit: string;      // Default Unit
  standardVal: number; // Default Reference Value
  tolerance: number;   // Default Tolerance
  isPercentage: boolean; 
  variants?: DeviceVariant[]; // Optional list of brands
}

export const CALIBRATION_PRESETS: DeviceStandard[] = [
  { 
    id: 'defib', 
    name: 'Defibrillator', 
    unit: 'Joules', 
    standardVal: 200, 
    tolerance: 10, 
    isPercentage: true,
    variants: [
      { id: 'zoll', name: 'Zoll (Rectilinear)', standardVal: 200, tolerance: 10 },
      { id: 'philips', name: 'Philips (Biphasic)', standardVal: 150, tolerance: 10 },
      { id: 'lifepak', name: 'Physio-Control (Lifepak)', standardVal: 360, tolerance: 10 } // High energy
    ]
  },
  { 
    id: 'esu', 
    name: 'Electrosurgical Unit (ESU)', 
    unit: 'Watts', 
    standardVal: 300, 
    tolerance: 10, 
    isPercentage: true,
    variants: [
      { id: 'valleylab', name: 'ValleyLab (Pure Cut)', standardVal: 300, tolerance: 15 },
      { id: 'erbe', name: 'Erbe (Auto Cut)', standardVal: 200, tolerance: 10 },
      { id: 'bovie', name: 'Bovie (Coag)', standardVal: 80, tolerance: 20 }
    ]
  },
  {
    id: 'vent',
    name: 'Ventilator (Pressure)',
    unit: 'cmH2O',
    standardVal: 20,
    tolerance: 2,
    isPercentage: false,
    variants: [
      { id: 'drager', name: 'Dräger (Pmax)', standardVal: 30, tolerance: 2 },
      { id: 'maquet', name: 'Maquet Servo', standardVal: 25, tolerance: 1.5 },
      { id: 'ge', name: 'GE Carescape', standardVal: 20, tolerance: 2 }
    ]
  },
  {
    id: 'mri',
    name: 'MRI Scanner',
    unit: 'Tesla',
    standardVal: 3.0,
    tolerance: 2,
    isPercentage: true,
    variants: [
      { id: 'ingenia', name: 'Philips Ingenia', standardVal: 3.0, tolerance: 2 },
      { id: 'siemens', name: 'Siemens Magnetom', standardVal: 1.5, tolerance: 2 }
    ]
  },
  {
    id: 'centrifuge',
    name: 'Centrifuge',
    unit: 'RPM',
    standardVal: 3000,
    tolerance: 50,
    isPercentage: false,
    variants: [
       { id: 'eppendorf', name: 'Eppendorf', standardVal: 14000, tolerance: 100 },
       { id: 'thermo', name: 'Thermo Fisher', standardVal: 4000, tolerance: 50 },
       { id: 'hlemmer', name: 'Hettich', standardVal: 3500, tolerance: 50 }
    ]
  },
  { 
    id: 'bp_mon', 
    name: 'NIBP Monitor', 
    unit: 'mmHg', 
    standardVal: 120, 
    tolerance: 3, 
    isPercentage: false 
  },
  { 
    id: 'spo2', 
    name: 'Pulse Oximeter (SpO2)', 
    unit: '%', 
    standardVal: 97, 
    tolerance: 2, 
    isPercentage: false 
  },
  {
    id: 'ecg',
    name: 'ECG Simulator',
    unit: 'BPM',
    standardVal: 60,
    tolerance: 5,
    isPercentage: true
  },
  {
    id: 'flow',
    name: 'Infusion Pump',
    unit: 'ml/hr',
    standardVal: 100,
    tolerance: 5,
    isPercentage: true
  }
];
