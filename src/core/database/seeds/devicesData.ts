
import { Device } from '../types';

export const DEVICES_DATA: Device[] = [
  {
    id: 'DEV-MRI-01',
    name: 'Philips MRI Scanner',
    manufacturer: 'Philips Healthcare',
    model: 'Ingenia 3.0T',
    type: 'MRI Scanner',
    serialNumber: 'SN-PH-7782-X',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0833860?auto=format&fit=crop&q=80&w=800',
    location: 'غرفة الرنين المغناطيسي (MRI)',
    department: 'الأشعة (Radiology)',
    responsiblePerson: 'د. سارة (رئيس القسم)',
    status: 'Operational',
    isPortable: false,
    installDate: '2022-01-15',
    purchaseCost: 1200000, // Expensive
    supplierId: 'SUP-001', 
    warrantyExpiry: '2025-01-15', 
    powerSpecs: {
      voltage: 480,
      current: 150,
      frequency: 60,
      power: 75000
    },
    batterySpecs: { hasBattery: false }, 
    calibrationSpecs: {
      lastDate: '2023-10-01',
      intervalMonths: 6,
      tolerancePercent: 2
    },
    documents: [
      { id: 'DOC-1', title: 'Service Manual V2.0', type: 'Manual', date: '2022-01-15', size: '12 MB' },
      { id: 'DOC-2', title: 'Calibration Cert', type: 'Certificate', date: '2023-10-01', size: '1.5 MB' }
    ],
    logs: [
      {
        id: 'LOG-001',
        date: '2023-10-01',
        engineerName: 'Eng. Ahmed Ali',
        problemDescription: 'Routine preventive maintenance schedule.',
        action: 'Quarterly PM - Helium level check and filter replacement',
        type: 'PM',
        cost: 500,
        parts: ['Air Filter', 'Cryogen Seal']
      },
      {
        id: 'LOG-002',
        date: '2023-08-15',
        engineerName: 'Eng. Sarah Mahmoud',
        problemDescription: 'Intermittent signal loss on Coil Channel 3 during brain scans. Artifacts appearing in images.',
        action: 'Replaced coil connector due to bent pins found during inspection.',
        type: 'Repair',
        cost: 3500, // High repair cost
        errorCode: 'ERR-COIL-09',
        parts: ['Coil Connector Type-C']
      },
      {
        id: 'LOG-003',
        date: '2023-05-20',
        engineerName: 'Eng. Ahmed Ali',
        problemDescription: 'System requested software update patch for new sequence protocols.',
        action: 'Software update to version 5.2.1 and system calibration',
        cost: 0,
        type: 'PM'
      }
    ]
  },
  {
    id: 'DEV-CT-05',
    name: 'GE Revolution CT',
    manufacturer: 'GE HealthCare',
    model: 'Revolution Evo',
    type: 'CT Scanner',
    serialNumber: 'SN-GE-7741-CT',
    image: 'https://images.unsplash.com/photo-1581093458791-9f302e6d8359?auto=format&fit=crop&q=80&w=800',
    location: 'غرفة المفراس (CT Scan)',
    department: 'الأشعة (Radiology)',
    responsiblePerson: 'التقني سامي',
    status: 'Operational',
    isPortable: false,
    installDate: '2023-01-20',
    purchaseCost: 850000,
    supplierId: 'SUP-003', 
    warrantyExpiry: '2026-01-20',
    powerSpecs: {
      voltage: 480,
      current: 125,
      frequency: 60,
      power: 72000
    },
    batterySpecs: { hasBattery: false },
    calibrationSpecs: {
      lastDate: '2024-01-15',
      intervalMonths: 3,
      tolerancePercent: 1
    },
    documents: [
       { id: 'DOC-CT-1', title: 'Operator Manual', type: 'Manual', date: '2023-01-20', size: '24 MB' }
    ],
    logs: []
  },
  {
    id: 'DEV-VEN-02',
    name: 'Drager Ventilator',
    manufacturer: 'Dräger',
    model: 'Evita Infinity V500',
    type: 'Ventilator',
    serialNumber: 'SN-DR-9921-V',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    location: 'العنبر العام - سرير 12',
    department: 'العناية المركزة (ICU)',
    responsiblePerson: 'ممرض أحمد',
    status: 'Down',
    isPortable: true,
    installDate: '2021-06-10',
    purchaseCost: 25000,
    supplierId: 'SUP-002', 
    warrantyExpiry: '2023-06-10', 
    powerSpecs: {
      voltage: 220,
      current: 2.5,
      frequency: 50
    },
    batterySpecs: {
      hasBattery: true,
      type: 'Li-ion',
      capacitymAh: 4500,
      voltage: 24,
      replacementDate: '2023-01-15'
    },
    calibrationSpecs: {
      lastDate: '2023-09-10',
      intervalMonths: 12,
      tolerancePercent: 5
    },
    documents: [
      { id: 'DOC-3', title: 'User Manual', type: 'Manual', date: '2021-06-10', size: '4 MB' }
    ],
    logs: [
      {
        id: 'LOG-004',
        date: '2023-10-25',
        engineerName: 'Eng. Karim Omar',
        problemDescription: 'Device reported "Flow Sensor Failure" alarm continuously. Calibration failed.',
        action: 'Replaced Flow Sensor X2 and performed successful flow calibration.',
        type: 'Repair',
        cost: 150,
        errorCode: 'ERR-FLOW-SENS',
        parts: ['Flow Sensor X2']
      },
      {
        id: 'LOG-005',
        date: '2023-09-10',
        engineerName: 'Eng. Layla Hassan',
        problemDescription: 'Scheduled Annual Preventive Maintenance.',
        action: 'Annual PM - Battery replacement and O2 cell calibration',
        cost: 300,
        type: 'PM',
        parts: ['O2 Cell', 'Battery Pack']
      }
    ]
  },
  {
    id: 'DEV-DEF-01',
    name: 'Philips HeartStart',
    manufacturer: 'Philips',
    model: 'HeartStart XL',
    type: 'Defibrillator',
    serialNumber: 'SN-PH-5541-D',
    image: 'https://images.unsplash.com/photo-1583912267550-d413b0d77569?auto=format&fit=crop&q=80&w=800',
    location: 'غرفة الإنعاش (Resuscitation)',
    department: 'الطوارئ (ER)',
    responsiblePerson: 'د. حسام',
    status: 'Operational',
    isPortable: true,
    installDate: '2022-03-20',
    purchaseCost: 8000,
    supplierId: 'SUP-001', 
    warrantyExpiry: '2024-03-20',
    powerSpecs: {
      voltage: 220,
      current: 1.5,
      frequency: 50
    },
    batterySpecs: {
      hasBattery: true,
      type: 'SLA (Sealed Lead Acid)',
      capacitymAh: 2000,
      voltage: 12,
      replacementDate: '2022-03-20'
    },
    calibrationSpecs: {
      lastDate: '2023-10-20',
      intervalMonths: 6,
      tolerancePercent: 10 
    },
    documents: [
       { id: 'DOC-4', title: 'Service Manual', type: 'Manual', date: '2022-03-20', size: '8 MB' }
    ],
    logs: [
      {
        id: 'LOG-010',
        date: '2023-10-20',
        engineerName: 'Eng. Ahmed Ali',
        problemDescription: 'Monthly Safety Check.',
        action: 'Monthly PM - Energy discharge test (200J) passed',
        cost: 0,
        type: 'PM'
      }
    ]
  },
  {
    id: 'DEV-CEN-03',
    name: 'Centrifuge 5424R',
    manufacturer: 'Eppendorf',
    model: '5424R',
    type: 'Lab Equipment',
    serialNumber: 'SN-EP-3341-C',
    image: 'https://plus.unsplash.com/premium_photo-1676325102583-0839e57d7a1f?auto=format&fit=crop&q=80&w=800',
    location: 'مختبر أمراض الدم (Hematology)',
    department: 'المختبر (Lab)',
    responsiblePerson: 'محللة منى',
    status: 'Maintenance',
    isPortable: true,
    installDate: '2020-11-05',
    purchaseCost: 4500,
    supplierId: 'SUP-004', 
    warrantyExpiry: '2021-11-05', 
    powerSpecs: {
      voltage: 220,
      current: 3,
      frequency: 50
    },
    batterySpecs: { hasBattery: false },
    calibrationSpecs: {
      lastDate: '2023-04-15',
      intervalMonths: 12,
      tolerancePercent: 5 
    },
    logs: [
      {
        id: 'LOG-007',
        date: '2023-10-26',
        engineerName: 'Eng. Mona Zaki',
        problemDescription: 'Excessive vibration during high speed spin.',
        action: 'Rotor balancing and cleaning of debris under the lid.',
        cost: 50,
        type: 'PM'
      },
      {
        id: 'LOG-008',
        date: '2023-04-15',
        engineerName: 'Eng. Mona Zaki',
        problemDescription: 'Regular check.',
        action: 'Routine cleaning and temperature stability test',
        cost: 0,
        type: 'PM'
      }
    ]
  }
];
