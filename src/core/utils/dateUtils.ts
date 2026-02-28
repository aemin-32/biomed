/**
 * Parses various date string formats into a standard YYYY-MM-DD string.
 * Supported formats:
 * - YYYY-MM-DD (ISO)
 * - YYYY/MM/DD or YYYY\MM\DD
 * - YYMMDD (Compact, assumes 20xx)
 * - YYYYMMDD (Compact)
 * - DD/MM/YYYY (Regional)
 */
export const parseSmartDate = (input: string): string | null => {
  if (!input) return null;
  
  const clean = input.trim();
  
  // 1. Check for Standard ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return isValidDate(clean) ? clean : null;
  }

  // 2. Check for Compact YYMMDD (e.g., 251130 -> 2025-11-30)
  if (/^\d{6}$/.test(clean)) {
    const y = '20' + clean.substring(0, 2);
    const m = clean.substring(2, 4);
    const d = clean.substring(4, 6);
    const dateStr = `${y}-${m}-${d}`;
    return isValidDate(dateStr) ? dateStr : null;
  }
  
  // 3. Check for Compact YYYYMMDD (e.g., 20251130)
  if (/^\d{8}$/.test(clean)) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    const dateStr = `${y}-${m}-${d}`;
    return isValidDate(dateStr) ? dateStr : null;
  }

  // 4. Handle Separators (\, /, -, .)
  const parts = clean.split(/[\\\/\-\.]/);
  if (parts.length === 3) {
    let y = parts[0];
    let m = parts[1];
    let d = parts[2];

    // Detect format based on length
    if (y.length === 4) {
       // YYYY/MM/DD
       const dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
       return isValidDate(dateStr) ? dateStr : null;
    } else if (d.length === 4) {
       // DD/MM/YYYY -> Convert to YYYY-MM-DD
       const dateStr = `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`;
       return isValidDate(dateStr) ? dateStr : null;
    } else {
       // Ambiguous 2-digit year (e.g. 25/11/30)
       // Assuming YYYY/MM/DD or YY/MM/DD based on user prompt context "2025\11\30"
       // We default 2-digit first part to year 20xx
       const dateStr = `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
       return isValidDate(dateStr) ? dateStr : null;
    }
  }

  return null;
};

// Helper to validate the resulting date components
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const timestamp = date.getTime();
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
  
  // Double check components to avoid rollovers (e.g. April 31 -> May 1)
  const [y, m, d] = dateString.split('-').map(Number);
  return date.getUTCFullYear() === y && 
         (date.getUTCMonth() + 1) === m && 
         date.getUTCDate() === d;
};
