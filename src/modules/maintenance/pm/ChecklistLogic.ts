
/**
 * Preventive Maintenance (PM) Checklist Logic
 * Refactored to support Frequency-Based Hierarchy (Weekly, Monthly, Annual)
 */

export type TaskType = 'pass_fail' | 'number_input' | 'text_note';
export type PMFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';

export interface PMTask {
  id: string;
  label: string;
  type: TaskType;
  min?: number;       // For number_input: Minimum acceptable value
  max?: number;       // For number_input: Maximum acceptable value
  unit?: string;      // For number_input: e.g., 'PSI', 'RPM', 'Joules', '%'
  critical: boolean;  // If true, failure here flags the whole device as 'Down'
  instruction?: string; // Optional help text
}

export interface PMChecklistTemplate {
  id: string;
  deviceType: string;
  frequency: PMFrequency;
  createdAt?: string; // Date string (YYYY-MM-DD)
  tasks: PMTask[];
}

// --- DATABASE OF TEMPLATES ---

export let PM_TEMPLATES: PMChecklistTemplate[] = [
  // 1. MRI Scanner (The complex example)
  {
    id: 'MRI-WEEKLY',
    deviceType: 'MRI Scanner',
    frequency: 'Weekly',
    createdAt: '2023-01-01',
    tasks: [
      { 
        id: 'T1', 
        label: 'مستوى الهيليوم (Helium Level)', 
        type: 'number_input', 
        min: 50, 
        max: 100, 
        unit: '%', 
        critical: true,
        instruction: 'Ensure level is above 50%. If below, order refill immediately.'
      },
      { 
        id: 'T2', 
        label: 'غطاء زر الطوارئ (Quench Guard)', 
        type: 'pass_fail', 
        critical: true 
      },
      { 
        id: 'T3', 
        label: 'نظافة غرفة المغناطيس', 
        type: 'pass_fail', 
        critical: false 
      }
    ]
  },
  {
    id: 'MRI-MONTHLY',
    deviceType: 'MRI Scanner',
    frequency: 'Monthly',
    createdAt: '2023-01-01',
    tasks: [
      { 
        id: 'M1', 
        label: 'جودة الصورة (SNR Check)', 
        type: 'pass_fail', 
        critical: false 
      },
      { 
        id: 'M2', 
        label: 'فحص موصلات الكويلات (Coils)', 
        type: 'pass_fail', 
        critical: true 
      },
      {
        id: 'M3', 
        label: 'درجة حرارة الماء المبرد (Chiller)', 
        type: 'number_input', 
        min: 18, 
        max: 22, 
        unit: '°C', 
        critical: true 
      }
    ]
  },

  // 2. Defibrillator
  {
    id: 'DEFIB-MONTHLY',
    deviceType: 'Defibrillator',
    frequency: 'Monthly',
    createdAt: '2023-02-15',
    tasks: [
      { id: 'D1', label: 'الفحص الظاهري للكابلات', type: 'pass_fail', critical: false },
      { id: 'D2', label: 'اختبار التفريغ (Discharge 200J)', type: 'number_input', min: 190, max: 210, unit: 'J', critical: true }
    ]
  },
  {
    id: 'DEFIB-ANNUAL',
    deviceType: 'Defibrillator',
    frequency: 'Annual',
    createdAt: '2023-02-15',
    tasks: [
      { id: 'DA1', label: 'معايرة الطاقة الكهربائية', type: 'pass_fail', critical: true },
      { id: 'DA2', label: 'استبدال البطارية الداخلية', type: 'pass_fail', critical: true },
      { id: 'DA3', label: 'اختبار السلامة الكهربائية (Electrical Safety)', type: 'pass_fail', critical: true }
    ]
  },

  // 3. Ventilator
  {
    id: 'VENT-MONTHLY',
    deviceType: 'Ventilator',
    frequency: 'Monthly',
    createdAt: '2023-03-10',
    tasks: [
      { id: 'V1', label: 'معايرة حساس الأكسجين (O2 Cell)', type: 'number_input', min: 20, max: 22, unit: '%', critical: true },
      { id: 'V2', label: 'فحص دائرة التنفس (Breathing Circuit)', type: 'pass_fail', critical: true }
    ]
  }
];

// --- LOGIC HELPER ---

/**
 * Adds a new template to the runtime database.
 */
export const addTemplate = (template: PMChecklistTemplate) => {
  // Add creation date if missing
  if (!template.createdAt) {
    template.createdAt = new Date().toISOString().split('T')[0];
  }
  
  // Check if ID exists to avoid duplicates if accidentally called twice
  if (!PM_TEMPLATES.find(t => t.id === template.id)) {
      PM_TEMPLATES.push(template);
      console.log("Template Saved to Memory:", template);
  }
};

/**
 * Deletes a template from the runtime database.
 */
export const deleteTemplate = (templateId: string) => {
  PM_TEMPLATES = PM_TEMPLATES.filter(t => t.id !== templateId);
  console.log("Template Deleted:", templateId);
};

/**
 * Returns ALL available templates/frequencies for a given device model.
 * It maps the model name to a generic Device Type first.
 */
export const getTemplatesForDevice = (deviceModel: string): PMChecklistTemplate[] => {
  if (!deviceModel) return [];
  const model = deviceModel.toLowerCase().trim();
  
  // 1. Try to find mapped generic type
  let genericType = '';
  if (model.includes('mri') || model.includes('ingenia')) genericType = 'MRI Scanner';
  else if (model.includes('defib') || model.includes('zoll') || model.includes('heartstart')) genericType = 'Defibrillator';
  else if (model.includes('vent') || model.includes('drager')) genericType = 'Ventilator';
  else if (model.includes('infusion')) genericType = 'Infusion Pump';
  
  // 2. Filter logic:
  return PM_TEMPLATES.filter(t => {
    const templateType = t.deviceType.toLowerCase().trim();
    
    // Exact match on generic type logic (e.g. system defined templates)
    if (genericType && templateType === genericType.toLowerCase()) return true;
    
    // Improved Fuzzy Matching:
    return model.includes(templateType) || templateType.includes(model);
  });
};
