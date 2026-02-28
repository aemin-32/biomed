
import { LocationConfig } from '../types';

export const LOCATIONS_DATA: LocationConfig[] = [
  // --- Departments (Letters) ---
  { id: 'DEP-ER', name: 'الطوارئ (ER)', code: 'A', type: 'Department', isEnabled: true },
  { id: 'DEP-ICU', name: 'العناية المركزة (ICU)', code: 'B', type: 'Department', isEnabled: true },
  { id: 'DEP-RAD', name: 'الأشعة (Radiology)', code: 'C', type: 'Department', isEnabled: true },
  { id: 'DEP-LAB', name: 'المختبر (Lab)', code: 'D', type: 'Department', isEnabled: true },
  { id: 'DEP-OP', name: 'العمليات (OT)', code: 'E', type: 'Department', isEnabled: true },
  
  // --- NEW: BioMed Department ---
  { id: 'DEP-MAIN', name: 'ورشة الهندسة الطبية (BioMed)', code: 'W', type: 'Department', isEnabled: true },

  // --- Rooms (Numbers) ---
  
  // BioMed Workshop Rooms (Parent: W)
  { id: 'RM-MAIN-01', name: 'الورشة العامة (General)', code: '1', type: 'Room', isEnabled: true, parentId: 'DEP-MAIN' },
  { id: 'RM-MAIN-02', name: 'مختبر الإلكترونيات', code: '2', type: 'Room', isEnabled: true, parentId: 'DEP-MAIN' },
  { id: 'RM-MAIN-03', name: 'منطقة الاستلام والتسليم', code: '3', type: 'Room', isEnabled: true, parentId: 'DEP-MAIN' },

  // ER Rooms (Parent: A)
  { id: 'RM-ER-01', name: 'غرفة الإنعاش', code: '1', type: 'Room', isEnabled: true, parentId: 'DEP-ER' },

  // ICU Rooms (Parent: B)
  { id: 'RM-ICU-01', name: 'غرفة العزل 1', code: '1', type: 'Room', isEnabled: true, parentId: 'DEP-ICU' },
  { id: 'RM-ICU-02', name: 'العنبر العام', code: '2', type: 'Room', isEnabled: true, parentId: 'DEP-ICU' },

  // Radiology Rooms (Parent: C)
  { id: 'RM-RAD-01', name: 'الأشعة السينية (X-Ray)', code: '1', type: 'Room', isEnabled: true, parentId: 'DEP-RAD' },
  { id: 'RM-RAD-02', name: 'المفراس (CT Scan)', code: '2', type: 'Room', isEnabled: true, parentId: 'DEP-RAD' },
  { id: 'RM-MRI', name: 'الرنين المغناطيسي (MRI)', code: '3', type: 'Room', isEnabled: true, parentId: 'DEP-RAD' },

  // Lab Rooms (Parent: D)
  { id: 'RM-LAB-01', name: 'أمراض الدم', code: '1', type: 'Room', isEnabled: true, parentId: 'DEP-LAB' },
  { id: 'RM-LAB-02', name: 'الكيمياء الحيوية', code: '2', type: 'Room', isEnabled: true, parentId: 'DEP-LAB' },
  { id: 'RM-LAB-03', name: 'الأحياء المجهري', code: '3', type: 'Room', isEnabled: true, parentId: 'DEP-LAB' },

  // General
  { id: 'RM-GEN-01', name: 'المخزن الرئيسي', code: '99', type: 'Room', isEnabled: true },

  // --- WAREHOUSE STRUCTURE ---
  
  // Level 1: Warehouses
  { id: 'WH-MAIN', name: 'المخزن الرئيسي (Main Warehouse)', code: 'WH1', type: 'Warehouse', isEnabled: true },
  { id: 'WH-ER', name: 'مخزن الطوارئ المصغر', code: 'WH2', type: 'Warehouse', isEnabled: true },

  // Level 2: Cabinets (Inside WH-MAIN)
  { id: 'CAB-A', name: 'دولاب A (قطع غيار)', code: 'A', type: 'Cabinet', isEnabled: true, parentId: 'WH-MAIN' },
  { id: 'CAB-B', name: 'دولاب B (مستهلكات)', code: 'B', type: 'Cabinet', isEnabled: true, parentId: 'WH-MAIN' },

  // Level 3: Shelves (Inside CAB-A)
  { id: 'SH-A1', name: 'رف 1 (إلكترونيات)', code: '1', type: 'Shelf', isEnabled: true, parentId: 'CAB-A' },
  { id: 'SH-A2', name: 'رف 2 (ميكانيك)', code: '2', type: 'Shelf', isEnabled: true, parentId: 'CAB-A' },
  
  // Level 3: Shelves (Inside CAB-B)
  { id: 'SH-B1', name: 'رف 1 (فلاتر)', code: '1', type: 'Shelf', isEnabled: true, parentId: 'CAB-B' },
];
