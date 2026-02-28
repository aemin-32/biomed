
import { GoogleGenAI } from "@google/genai";
import { PMTask } from "../../modules/maintenance/pm/ChecklistLogic";

// Helper to get the best available API Key
const getApiKey = () => {
    // 1. User's custom key (Enterprise mode)
    const userKey = localStorage.getItem('BIOMED_USER_API_KEY');
    if (userKey) return userKey;
    
    // 2. Default Env Key (Demo mode)
    // NOTE: Vite injects this during build
    return process.env.API_KEY || '';
};

// --- SIMULATION DATA ---
const SIMULATED_TASKS: PMTask[] = [
    { id: 'SIM-1', label: 'التأكد من سلامة كابل الطاقة والقابس', type: 'pass_fail', critical: true },
    { id: 'SIM-2', label: 'تنظيف الفلاتر ومراوح التبريد', type: 'pass_fail', critical: false },
    { id: 'SIM-3', label: 'فحص البطارية الاحتياطية (Voltage)', type: 'number_input', min: 11.5, max: 13.5, unit: 'V', critical: true },
    { id: 'SIM-4', label: 'معايرة الشاشة والأزرار', type: 'pass_fail', critical: false },
    { id: 'SIM-5', label: 'اختبار الأداء التشغيلي (Self-Test)', type: 'pass_fail', critical: true }
];

export const generateChecklistFromAI = async (deviceName: string, frequency: string): Promise<PMTask[]> => {
  const apiKey = getApiKey();

  if (!apiKey) {
      // Return simulated data after a delay to mimic AI
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve(SIMULATED_TASKS.map(t => ({...t, id: `SIM-${Date.now()}-${Math.random()}`})));
          }, 2000);
      });
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const prompt = `
      You are an expert Senior Biomedical Engineer. 
      Create a comprehensive Preventive Maintenance (PM) checklist for a medical device: "${deviceName}".
      
      Target Frequency: ${frequency} (e.g. Weekly, Monthly, Annual).
      
      Rules:
      1. Output MUST be a strict JSON array. Do not include markdown formatting (like \`\`\`json).
      2. The array must contain objects matching this interface:
         interface PMTask {
           id: string; // generate a unique short string like "T1", "T2"
           label: string; // The instruction, e.g., "Check power cord integrity" (In Arabic)
           type: 'pass_fail' | 'number_input' | 'text_note';
           critical: boolean; // true if failure means device cannot be used
           min?: number; // REQUIRED if type is number_input. Typical lower limit.
           max?: number; // REQUIRED if type is number_input. Typical upper limit.
           unit?: string; // REQUIRED if type is number_input (e.g. V, A, Celsius, PSI, Ohm, J)
         }
      3. Provide 5-8 essential tasks tailored specifically for the "${frequency}" schedule.
         - Weekly: Visual inspection, cleaning, basic function check.
         - Monthly: Calibration verification, filter checks, operational tests.
         - Annual: Electrical safety safety, internal battery replacement, deep cleaning, full calibration.
      4. Language: Arabic (العربية).
      5. Include 'number_input' tasks for measurable parameters (Voltage, Pressure, Temperature, Resistance, Output).
         - CRITICAL: You MUST provide realistic engineering standards for 'min' and 'max'.
         - Example: "Electrical Safety - Ground Resistance" -> min: 0, max: 0.2, unit: "Ohm".
         - Example: "Defibrillator Output (200J setting)" -> min: 180, max: 220, unit: "J".
         - Example: "Ventilator PEEP Pressure" -> min: 4, max: 6, unit: "cmH2O".
      6. Mark safety-critical steps as critical: true.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Updated to gemini-3-flash-preview
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResponse = response.text;
    
    if (!textResponse) {
      throw new Error("No response from AI");
    }

    // Clean up if the model includes markdown blocks despite instructions
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const tasks = JSON.parse(cleanJson);
    
    // Validate/Sanitize IDs to ensure uniqueness in frontend
    return tasks.map((t: any, idx: number) => ({
      ...t,
      id: `AI-${Date.now()}-${idx}`
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    // Fallback to simulation on network error
    return SIMULATED_TASKS.map(t => ({...t, id: `FALLBACK-${Date.now()}-${Math.random()}`}));
  }
};
