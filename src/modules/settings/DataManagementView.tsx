
import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowRight, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Save,
  Package,
  Activity,
  ArrowUpCircle,
  Map,
  Building2,
  FileCode
} from 'lucide-react';
import { DEVICES, INVENTORY_ITEMS, LOCATIONS } from '../../core/database/mockData';
import { Device, InventoryItem, LocationConfig } from '../../core/database/types';

// Types for Import Logic
type ImportType = 'devices' | 'parts' | 'locations';

interface BaseRow {
  id: string; // Temporary Row ID
  status: 'New' | 'Duplicate' | 'Update' | 'Error';
  action: 'Import' | 'Update' | 'Skip';
  errorMsg?: string;
}

interface DeviceRow extends BaseRow {
  type: 'device';
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  deptCode: string; // Changed from department name to code
  roomCode: string; // Changed from location name to code
  resolvedLocation: string; // To display "A-1: Radiology - X-Ray"
  resolvedDepartment: string;
}

interface PartRow extends BaseRow {
  type: 'part';
  partName: string;
  partNumber: string; 
  category: 'Parts' | 'Consumables';
  cost: number;
  threshold: number;
  quantity: number;
  location: string;
  currentStock?: number; 
}

interface LocationRow extends BaseRow {
  type: 'location';
  entityType: 'Department' | 'Room';
  name: string;
  code: string;
  parentCode?: string; // For Rooms
}

type ImportedRow = DeviceRow | PartRow | LocationRow;

const DataManagementView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialType = (location.state as any)?.initialType as ImportType | undefined;
  const [importType, setImportType] = useState<ImportType>(initialType || 'devices');
  const [step, setStep] = useState<1 | 2 | 3>(1); 
  const [importedRows, setImportedRows] = useState<ImportedRow[]>([]);
  const [stats, setStats] = useState({ new: 0, duplicates: 0, updates: 0, errors: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Step 1: Template Download ---
  const handleDownloadTemplate = () => {
    let headers = "";
    let sample = "";
    let filename = "";

    if (importType === 'devices') {
        // Updated Template to use CODES
        headers = "Name,Manufacturer,Model,SerialNumber,DepartmentCode (e.g. A),RoomCode (e.g. 1)\n";
        sample = `Philips MRI,Philips,Ingenia 3.0T,SN-998877,C,3\nGE CT Scan,GE,Revolution,SN-112233,C,2\nVentilator,Drager,V500,SN-5544,B,1`;
        filename = "devices_template_coded.csv";
    } else if (importType === 'parts') {
        headers = "Part Name,Part Number,Category,Unit Cost,Alert Threshold,Initial Quantity,Storage Location\n";
        sample = "Li-ion Battery,BAT-001,Parts,150,5,10,Shelf A-1\nThermal Gel,GEL-500,Consumables,15,10,50,Cabinet B";
        filename = "inventory_template.csv";
    } else {
        // Locations Template with Codes
        headers = "Type,Name,Code (Letter/Number),ParentDeptCode (For Rooms)\n";
        sample = "Department,Emergency,A,\nRoom,Resuscitation,1,A\nDepartment,ICU,B,\nRoom,Isolation,1,B";
        filename = "hospital_structure_template.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sample);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCodes = () => {
      // Helper to download a guide of existing codes
      const depts = LOCATIONS.filter(l => l.type === 'Department').map(d => `Dept: [${d.code}] ${d.name}`);
      const rooms = LOCATIONS.filter(l => l.type === 'Room').map(r => {
          const p = LOCATIONS.find(d => d.id === r.parentId);
          return `Room: [${p?.code || 'Gen'}-${r.code}] ${r.name} (in ${p?.name || 'General'})`;
      });
      const content = "Hospital Location Codes Guide (دليل رموز المستشفى)\n\n" + depts.join('\n') + "\n\n----------------\n\n" + rooms.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'location_codes_guide.txt';
      link.click();
  };

  // --- Step 1: File Upload & Parsing ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (importType === 'devices') parseDeviceCSV(text);
      else if (importType === 'parts') parsePartsCSV(text);
      else parseLocationsCSV(text);
    };
    reader.readAsText(file);
  };

  const parseDeviceCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const rows: ImportedRow[] = [];
    let newCount = 0, dupCount = 0, errCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      if (cols.length < 4) continue;

      const sn = cols[3]?.trim() || '';
      const deptCode = cols[4]?.trim() || '';
      const roomCode = cols[5]?.trim() || '';

      // --- Resolve Codes to Names ---
      const deptObj = LOCATIONS.find(l => l.type === 'Department' && l.code === deptCode);
      let roomObj = undefined;
      
      let resolvedDept = 'Unknown';
      let resolvedLoc = 'General';
      let rowStatus: BaseRow['status'] = 'New';
      let errorMsg = undefined;

      if (deptObj) {
          resolvedDept = deptObj.name;
          // Find room that belongs to this dept AND matches room code
          roomObj = LOCATIONS.find(l => l.type === 'Room' && l.parentId === deptObj.id && l.code === roomCode);
          if (roomObj) {
              resolvedLoc = roomObj.name;
          } else {
              resolvedLoc = `${deptObj.name} - Room ${roomCode} (غير معرفة)`;
          }
      } else if (deptCode) {
          errorMsg = `القسم غير موجود: ${deptCode}`;
          rowStatus = 'Error';
          errCount++;
      }

      // Check Duplicate SN
      const exists = DEVICES.find(d => d.serialNumber.toLowerCase() === sn.toLowerCase());
      if (exists) {
          rowStatus = 'Duplicate';
          dupCount++;
      } else if (!errorMsg) {
          newCount++;
      }

      rows.push({
        type: 'device',
        id: `row-${i}`,
        name: cols[0]?.trim() || 'Unknown',
        manufacturer: cols[1]?.trim() || '',
        model: cols[2]?.trim() || '',
        serialNumber: sn,
        deptCode,
        roomCode,
        resolvedDepartment: resolvedDept,
        resolvedLocation: resolvedLoc,
        status: rowStatus,
        action: rowStatus === 'New' ? 'Import' : 'Skip',
        errorMsg
      });
    }

    setImportedRows(rows);
    setStats({ new: newCount, duplicates: dupCount, updates: 0, errors: errCount });
    setStep(2);
  };

  const parsePartsCSV = (csvText: string) => {
    // ... existing parts logic ...
    // Keeping it simple for brevity, using same logic as before but wrapped
    const lines = csvText.split('\n');
    const rows: ImportedRow[] = [];
    let newCount = 0, updateCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length < 6) continue;
        const partNumber = cols[1]?.trim() || `GEN-${Math.floor(Math.random()*1000)}`;
        const existingPart = INVENTORY_ITEMS.find(p => p.id === partNumber || p.name === cols[0]?.trim());
        const isUpdate = !!existingPart;
        if (isUpdate) updateCount++; else newCount++;

        rows.push({
            type: 'part',
            id: `row-${i}`,
            partName: cols[0]?.trim() || 'Unknown',
            partNumber: partNumber,
            category: (cols[2]?.trim() as any) === 'Consumables' ? 'Consumables' : 'Parts',
            cost: parseFloat(cols[3]) || 0,
            threshold: parseInt(cols[4]) || 5,
            quantity: parseInt(cols[5]) || 0,
            location: cols[6]?.trim() || 'General',
            currentStock: existingPart ? existingPart.quantity : undefined,
            status: isUpdate ? 'Update' : 'New',
            action: isUpdate ? 'Update' : 'Import'
        });
    }
    setImportedRows(rows);
    setStats({ new: newCount, duplicates: 0, updates: updateCount, errors: 0 });
    setStep(2);
  };

  const parseLocationsCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const rows: ImportedRow[] = [];
    let newCount = 0, dupCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length < 3) continue;
        
        const type = cols[0]?.trim().toLowerCase() === 'room' ? 'Room' : 'Department';
        const name = cols[1]?.trim();
        const code = cols[2]?.trim().toUpperCase(); // Code is mandatory
        const parentCode = cols[3]?.trim().toUpperCase();

        if (!name || !code) continue;

        const exists = LOCATIONS.find(l => l.code === code && l.type === type);
        if (exists) dupCount++; else newCount++;

        rows.push({
            type: 'location',
            id: `loc-${i}`,
            entityType: type as 'Department' | 'Room',
            name,
            code,
            parentCode,
            status: exists ? 'Duplicate' : 'New',
            action: exists ? 'Skip' : 'Import'
        });
    }
    setImportedRows(rows);
    setStats({ new: newCount, duplicates: dupCount, updates: 0, errors: 0 });
    setStep(2);
  };

  // --- Step 2: Processing ---
  const handleProcessImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
        // ... (Logic for Parts is same as before) ...
        if (importType === 'parts') {
             const partsToProcess = importedRows.filter(r => r.type === 'part' && r.action !== 'Skip') as PartRow[];
             partsToProcess.forEach(row => {
                 if(row.action === 'Update') {
                     const item = INVENTORY_ITEMS.find(i => i.id === row.partNumber);
                     if(item) item.quantity += row.quantity;
                 } else {
                     INVENTORY_ITEMS.unshift({ 
                       id: row.partNumber, 
                       name: row.partName, 
                       category: row.category, 
                       cost: row.cost, 
                       quantity: row.quantity, 
                       minLevel: row.threshold, 
                       location: row.location,
                       condition: 'New',
                       warehouseType: 'Main'
                     });
                 }
             });
        } 
        else if (importType === 'locations') {
            const locsToProcess = importedRows.filter(r => r.type === 'location' && r.action === 'Import') as LocationRow[];
            const depts = locsToProcess.filter(r => r.entityType === 'Department');
            const rooms = locsToProcess.filter(r => r.entityType === 'Room');

            // 1. Add Departments
            depts.forEach(d => {
                if (!LOCATIONS.find(l => l.code === d.code && l.type === 'Department')) {
                    LOCATIONS.push({ id: `DEP-${d.code}`, name: d.name, code: d.code, type: 'Department', isEnabled: true });
                }
            });

            // 2. Add Rooms
            rooms.forEach(r => {
                let parentId = undefined;
                if (r.parentCode) {
                    const parent = LOCATIONS.find(l => l.type === 'Department' && l.code === r.parentCode);
                    parentId = parent?.id;
                }
                LOCATIONS.push({ id: `RM-${Date.now()}`, name: r.name, code: r.code, type: 'Room', isEnabled: true, parentId });
            });
        } 
        else {
            // Devices with Codes Resolved
            const devicesToProcess = importedRows.filter(r => r.type === 'device' && r.action === 'Import') as DeviceRow[];
            devicesToProcess.forEach(row => {
                DEVICES.unshift({
                    id: `DEV-${row.serialNumber}`,
                    name: row.name,
                    model: row.model,
                    manufacturer: row.manufacturer,
                    type: 'Medical Device',
                    serialNumber: row.serialNumber,
                    image: 'https://images.unsplash.com/photo-1516549655169-df83a0833860?auto=format&fit=crop&q=80&w=800',
                    location: row.resolvedLocation,
                    department: row.resolvedDepartment,
                    status: 'Operational',
                    installDate: new Date().toISOString().split('T')[0],
                    logs: []
                });
            });
        }
        setIsProcessing(false);
        setStep(3);
    }, 1500);
  };

  const handleActionChange = (id: string, newAction: 'Import' | 'Update' | 'Skip') => {
    setImportedRows(prev => prev.map(row => 
      row.id === id ? { ...row, action: newAction } : row
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors font-sans pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => { if(step === 1) navigate('/settings'); else setStep(1); }} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ArrowRight className="w-5 h-5" /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">إدارة البيانات الجماعية</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">استيراد وتصدير البيانات (Bulk Operations)</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Import Type Selector */}
            <div className="grid grid-cols-3 gap-4">
                {/* ... Buttons same as before ... */}
                <button onClick={() => setImportType('locations')} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${importType === 'locations' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-indigo-300'}`}><Building2 className="w-8 h-8" /><span className="font-bold text-xs sm:text-sm">الهيكلية (Locations)</span></button>
                <button onClick={() => setImportType('devices')} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${importType === 'devices' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-blue-300'}`}><Activity className="w-8 h-8" /><span className="font-bold text-xs sm:text-sm">أجهزة (Assets)</span></button>
                <button onClick={() => setImportType('parts')} className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${importType === 'parts' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-md' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-emerald-300'}`}><Package className="w-8 h-8" /><span className="font-bold text-xs sm:text-sm">مخزون (Inventory)</span></button>
            </div>

            {/* Template Download Card */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm">
                     <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-800 dark:text-white">
                        {importType === 'locations' ? 'قالب الهيكلية (مع الرموز)' :
                         importType === 'devices' ? 'قالب الأجهزة (بالرموز)' : 'قالب المخزون'}
                     </h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400">
                        {importType === 'devices' 
                            ? 'يعتمد على رموز الأقسام (A, B) والغرف (1, 2) لربط المواقع تلقائياً' 
                            : 'تحميل ملف CSV جاهز للتعبئة'
                        }
                     </p>
                  </div>
               </div>
               <div className="flex gap-2">
                   {importType === 'devices' && (
                       <button onClick={handleDownloadCodes} className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-700">
                           <FileCode className="w-4 h-4" /> دليل الرموز
                       </button>
                   )}
                   <button onClick={handleDownloadTemplate} className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" /> تحميل القالب
                   </button>
               </div>
            </div>

            {/* Upload Area */}
            <div className={`border-3 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 transition-colors cursor-pointer group ${importType === 'locations' ? 'border-indigo-200 hover:border-indigo-400' : importType === 'devices' ? 'border-blue-200 hover:border-blue-400' : 'border-emerald-200 hover:border-emerald-400'}`} onClick={() => fileInputRef.current?.click()}>
               <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
               <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${importType === 'locations' ? 'bg-indigo-50 text-indigo-500' : importType === 'devices' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  <UploadCloud className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">اضغط لرفع الملف</h3>
               <p className="text-slate-400 text-sm">أو قم بسحب وإفلات الملف هنا (CSV Only)</p>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <div><p className="text-xs font-bold text-green-600 uppercase">سجلات صالحة</p><p className="text-2xl font-bold">{stats.new}</p></div>
                </div>
                {stats.errors > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-center gap-3">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div><p className="text-xs font-bold text-red-600 uppercase">أخطاء في الرموز</p><p className="text-2xl font-bold">{stats.errors}</p></div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                     <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                           {importType === 'devices' && (
                               <>
                                <th className="p-4">الجهاز</th>
                                <th className="p-4">الرموز (Dept / Room)</th>
                                <th className="p-4">الموقع المكتشف</th>
                                <th className="p-4">الحالة</th>
                               </>
                           )}
                           {/* Add logic for others if needed, focusing on devices as requested */}
                           {importType !== 'devices' && <th className="p-4">اسم العنصر</th>}
                           <th className="p-4 text-center">الإجراء</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {importedRows.map((row) => (
                           <tr key={row.id} className={`transition-colors ${row.status === 'Error' ? 'bg-red-50/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                              
                              {row.type === 'device' && (
                                <>
                                    <td className="p-4 font-bold">{row.name}</td>
                                    <td className="p-4 font-mono text-xs">
                                        <span className="bg-indigo-100 text-indigo-700 px-1 rounded">{row.deptCode}</span>
                                        <span className="mx-1">-</span>
                                        <span className="bg-purple-100 text-purple-700 px-1 rounded">{row.roomCode}</span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                        {row.status === 'Error' ? <span className="text-red-500 font-bold">{row.errorMsg}</span> : row.resolvedLocation}
                                    </td>
                                    <td className="p-4">
                                        {row.status === 'New' && <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">جديد</span>}
                                        {row.status === 'Error' && <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold">خطأ</span>}
                                        {row.status === 'Duplicate' && <span className="text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs font-bold">مكرر</span>}
                                    </td>
                                </>
                              )}
                              
                              <td className="p-4 text-center">
                                 {row.status !== 'Error' && (
                                     <select value={row.action} onChange={(e) => handleActionChange(row.id, e.target.value as any)} className="bg-white border rounded text-xs p-1">
                                        <option value="Import">استيراد</option>
                                        <option value="Skip">تجاهل</option>
                                     </select>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
               <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl font-bold">إلغاء</button>
               <button onClick={handleProcessImport} disabled={isProcessing} className="flex-[2] py-3 bg-medical-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                  {isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                  <span>تأكيد الاستيراد</span>
               </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS (Same as before) */}
        {step === 3 && (
           <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                 <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">تم الاستيراد بنجاح!</h2>
              <div className="flex gap-4 mt-6">
                 <button onClick={() => navigate(importType === 'devices' ? '/devices' : '/inventory')} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg">عرض القائمة</button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default DataManagementView;
