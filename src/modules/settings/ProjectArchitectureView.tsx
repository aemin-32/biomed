
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Printer, FolderOpen, FileCode, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { FileService } from '../../core/services/fileService';

// Full Project Structure Data
// Updated to reflect >108 files and >14500 lines of code
const PROJECT_STRUCTURE = [
  { type: 'file', name: 'package.json', size: '2 KB', lines: 60 },
  { type: 'file', name: 'tsconfig.json', size: '1 KB', lines: 35 },
  { type: 'file', name: 'vite.config.ts', size: '1 KB', lines: 25 },
  { type: 'file', name: 'tailwind.config.js', size: '2 KB', lines: 45 },
  { type: 'file', name: 'postcss.config.js', size: '1 KB', lines: 10 },
  { type: 'file', name: 'capacitor.config.ts', size: '1 KB', lines: 15 },
  { type: 'file', name: 'index.html', size: '2 KB', lines: 80 },
  { type: 'file', name: 'README_ZAYN.md', size: '3 KB', lines: 90 },
  { type: 'folder', name: 'android', children: [
      { type: 'file', name: 'build.gradle', size: '4 KB', lines: 120 },
      { type: 'file', name: 'AndroidManifest.xml', size: '3 KB', lines: 85 }
  ]},
  { type: 'folder', name: 'src', children: [
      { type: 'file', name: 'main.tsx', size: '1 KB', lines: 30 },
      { type: 'file', name: 'App.tsx', size: '4 KB', lines: 140 },
      { type: 'file', name: 'index.css', size: '5 KB', lines: 200 },
      { type: 'file', name: 'vite-env.d.ts', size: '1 KB', lines: 15 },
      { type: 'folder', name: 'core', children: [
          { type: 'folder', name: 'context', children: [
              { type: 'file', name: 'AuthContext.tsx', size: '3 KB', lines: 110 },
              { type: 'file', name: 'LanguageContext.tsx', size: '2 KB', lines: 85 }
          ]},
          { type: 'folder', name: 'database', children: [
              { type: 'file', name: 'types.ts', size: '6 KB', lines: 250 },
              { type: 'file', name: 'mockData.ts', size: '15 KB', lines: 600 },
              { type: 'folder', name: 'seeds', children: [
                  { type: 'file', name: 'devicesData.ts', size: '8 KB', lines: 320 },
                  { type: 'file', name: 'inventoryData.ts', size: '6 KB', lines: 240 },
                  { type: 'file', name: 'activitiesData.ts', size: '5 KB', lines: 180 },
                  { type: 'file', name: 'suppliersData.ts', size: '4 KB', lines: 150 },
                  { type: 'file', name: 'locationsData.ts', size: '5 KB', lines: 200 }
              ]}
          ]},
          { type: 'folder', name: 'services', children: [
              { type: 'file', name: 'fileService.ts', size: '3 KB', lines: 95 },
              { type: 'file', name: 'geminiChecklistService.ts', size: '4 KB', lines: 130 }
          ]},
          { type: 'folder', name: 'i18n', children: [
              { type: 'file', name: 'translations.ts', size: '12 KB', lines: 450 }
          ]},
          { type: 'folder', name: 'utils', children: [
              { type: 'file', name: 'dateUtils.ts', size: '2 KB', lines: 70 }
          ]},
          { type: 'folder', name: 'navigation', children: [
              { type: 'file', name: 'BackButtonHandler.tsx', size: '2 KB', lines: 60 }
          ]}
      ]},
      { type: 'folder', name: 'hooks', children: [
          { type: 'file', name: 'useOnlineStatus.ts', size: '1 KB', lines: 40 },
          { type: 'file', name: 'useVibration.ts', size: '1 KB', lines: 30 },
          { type: 'file', name: 'useTheme.ts', size: '2 KB', lines: 55 }
      ]},
      { type: 'folder', name: 'components', children: [
          { type: 'folder', name: 'ui', children: [
              { type: 'file', name: 'ThemeToggle.tsx', size: '2 KB', lines: 45 },
              { type: 'file', name: 'LogoutButton.tsx', size: '2 KB', lines: 50 },
              { type: 'file', name: 'BackButton.tsx', size: '2 KB', lines: 65 },
              { type: 'file', name: 'SmartDateInput.tsx', size: '3 KB', lines: 90 }
          ]}
      ]},
      { type: 'folder', name: 'modules', children: [
          { type: 'folder', name: 'auth', children: [
              { type: 'file', name: 'LoginView.tsx', size: '5 KB', lines: 180 }
          ]},
          { type: 'folder', name: 'dashboard', children: [
              { type: 'file', name: 'DashboardView.tsx', size: '7 KB', lines: 250 },
              { type: 'file', name: 'DeviceListView.tsx', size: '8 KB', lines: 280 },
              { type: 'file', name: 'StatsWidget.tsx', size: '2 KB', lines: 60 },
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'DeviceListItem.tsx', size: '4 KB', lines: 120 },
                  { type: 'file', name: 'AddDeviceModal.tsx', size: '9 KB', lines: 350 }
              ]}
          ]},
          { type: 'folder', name: 'scanner', children: [
              { type: 'file', name: 'ScannerView.tsx', size: '9 KB', lines: 320 },
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'ManualEntryDialog.tsx', size: '4 KB', lines: 140 }
              ]}
          ]},
          { type: 'folder', name: 'diagnostics', children: [
              { type: 'file', name: 'DeviceProfileView.tsx', size: '12 KB', lines: 450 },
              { type: 'file', name: 'DeviceDetailsView.tsx', size: '3 KB', lines: 80 },
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'DeviceTechnicalSpecs.tsx', size: '6 KB', lines: 220 },
                  { type: 'file', name: 'DeviceHistoryLog.tsx', size: '7 KB', lines: 260 }
              ]}
          ]},
          { type: 'folder', name: 'inventory', children: [
              { type: 'file', name: 'InventoryView.tsx', size: '8 KB', lines: 290 },
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'InventoryItemDetailModal.tsx', size: '6 KB', lines: 210 },
                  { type: 'file', name: 'AddInventoryItemModal.tsx', size: '7 KB', lines: 240 }
              ]}
          ]},
          { type: 'folder', name: 'maintenance', children: [
              { type: 'file', name: 'MaintenanceRoutes.tsx', size: '2 KB', lines: 50 },
              { type: 'file', name: 'MaintenanceDashboardView.tsx', size: '8 KB', lines: 270 },
              { type: 'file', name: 'MaintenanceOptionsView.tsx', size: '6 KB', lines: 200 },
              { type: 'file', name: 'IncomingRequestsView.tsx', size: '5 KB', lines: 180 },
              { type: 'folder', name: 'corrective', children: [
                  { type: 'file', name: 'CreateTicketView.tsx', size: '9 KB', lines: 320 },
                  { type: 'file', name: 'WorkbenchView.tsx', size: '16 KB', lines: 580 },
                  { type: 'folder', name: 'components', children: [
                      { type: 'file', name: 'TicketDetailsCard.tsx', size: '6 KB', lines: 210 },
                      { type: 'file', name: 'RepairManager.tsx', size: '5 KB', lines: 180 },
                      { type: 'file', name: 'AddPartModal.tsx', size: '8 KB', lines: 290 },
                      { type: 'file', name: 'QuickToolsModal.tsx', size: '5 KB', lines: 190 },
                      { type: 'file', name: 'DeviceGuideModal.tsx', size: '6 KB', lines: 220 },
                      { type: 'file', name: 'HistoryModal.tsx', size: '3 KB', lines: 100 },
                      { type: 'file', name: 'FeasibilityModal.tsx', size: '5 KB', lines: 180 },
                      { type: 'file', name: 'CalibrationModal.tsx', size: '4 KB', lines: 150 },
                      { type: 'file', name: 'NewPartRequestModal.tsx', size: '10 KB', lines: 380 },
                      { type: 'folder', name: 'guide', children: [
                          { type: 'file', name: 'AIGuideTab.tsx', size: '7 KB', lines: 260 },
                          { type: 'file', name: 'DocumentsTab.tsx', size: '6 KB', lines: 230 }
                      ]}
                  ]}
              ]},
              { type: 'folder', name: 'pm', children: [
                  { type: 'file', name: 'PMChecklistView.tsx', size: '9 KB', lines: 320 },
                  { type: 'file', name: 'PMTemplateCreator.tsx', size: '8 KB', lines: 280 },
                  { type: 'file', name: 'ReportView.tsx', size: '8 KB', lines: 290 },
                  { type: 'file', name: 'ChecklistLogic.ts', size: '4 KB', lines: 140 },
                  { type: 'file', name: 'TaskItem.tsx', size: '5 KB', lines: 180 },
                  { type: 'folder', name: 'components', children: [
                      { type: 'file', name: 'AIGeneratorModal.tsx', size: '5 KB', lines: 190 }
                  ]}
              ]},
              { type: 'folder', name: 'scrap', children: [
                  { type: 'file', name: 'ScrapDeviceView.tsx', size: '7 KB', lines: 260 }
              ]}
          ]},
          { type: 'folder', name: 'tools', children: [
              { type: 'file', name: 'ToolsRoutes.tsx', size: '2 KB', lines: 40 },
              { type: 'file', name: 'ToolsMenuView.tsx', size: '4 KB', lines: 130 },
              { type: 'file', name: 'BatteryCalcView.tsx', size: '4 KB', lines: 150 },
              { type: 'file', name: 'CalibrationView.tsx', size: '7 KB', lines: 260 },
              { type: 'file', name: 'UnitConverterView.tsx', size: '6 KB', lines: 220 },
              { type: 'file', name: 'RepairFeasibilityView.tsx', size: '7 KB', lines: 250 },
              { type: 'folder', name: 'data', children: [
                  { type: 'file', name: 'specStandards.ts', size: '3 KB', lines: 110 }
              ]},
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'PresetSelector.tsx', size: '4 KB', lines: 140 }
              ]}
          ]},
          { type: 'folder', name: 'settings', children: [
              { type: 'file', name: 'SettingsRoutes.tsx', size: '3 KB', lines: 90 },
              { type: 'file', name: 'SettingsView.tsx', size: '7 KB', lines: 240 },
              { type: 'file', name: 'DataManagementView.tsx', size: '10 KB', lines: 380 },
              { type: 'file', name: 'EngineerProfileView.tsx', size: '9 KB', lines: 340 },
              { type: 'file', name: 'LocationSettingsView.tsx', size: '8 KB', lines: 290 },
              { type: 'file', name: 'WarehouseSettingsView.tsx', size: '7 KB', lines: 260 },
              { type: 'file', name: 'SuppliersView.tsx', size: '5 KB', lines: 180 },
              { type: 'file', name: 'AIKeySettingsView.tsx', size: '4 KB', lines: 150 },
              { type: 'file', name: 'PosterPreview.tsx', size: '6 KB', lines: 210 },
              { type: 'file', name: 'ProjectResourcesView.tsx', size: '4 KB', lines: 130 },
              { type: 'file', name: 'ProjectArchitectureView.tsx', size: '15 KB', lines: 550 },
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'PosterDesign.tsx', size: '12 KB', lines: 420 }
              ]}
          ]},
          { type: 'folder', name: 'notifications', children: [
              { type: 'file', name: 'NotificationsView.tsx', size: '5 KB', lines: 170 }
          ]},
          { type: 'folder', name: 'simulation', children: [
              { type: 'file', name: 'SimulationHub.tsx', size: '5 KB', lines: 180 },
              { type: 'folder', name: 'components', children: [
                  { type: 'file', name: 'LearningObjective.tsx', size: '1 KB', lines: 30 }
              ]},
              { type: 'folder', name: 'simulators', children: [
                  { type: 'file', name: 'CentrifugeSim.tsx', size: '8 KB', lines: 290 },
                  { type: 'file', name: 'ECGSim.tsx', size: '7 KB', lines: 250 },
                  { type: 'file', name: 'DefibrSim.tsx', size: '6 KB', lines: 220 },
                  { type: 'file', name: 'VentSim.tsx', size: '5 KB', lines: 180 },
                  { type: 'file', name: 'SpectroSim.tsx', size: '9 KB', lines: 320 },
                  { type: 'file', name: 'XRaySim.tsx', size: '6 KB', lines: 210 },
                  { type: 'file', name: 'UltrasoundSim.tsx', size: '7 KB', lines: 240 }
              ]}
          ]},
          { type: 'folder', name: 'nurse', children: [
              { type: 'file', name: 'NurseDashboard.tsx', size: '6 KB', lines: 210 },
              { type: 'file', name: 'NurseRoomSelectionView.tsx', size: '9 KB', lines: 320 },
              { type: 'file', name: 'ServiceRequestView.tsx', size: '8 KB', lines: 280 },
              { type: 'file', name: 'NurseRequestHistoryView.tsx', size: '5 KB', lines: 190 }
          ]},
          { type: 'folder', name: 'store', children: [
              { type: 'file', name: 'StoreDashboard.tsx', size: '6 KB', lines: 220 },
              { type: 'file', name: 'ScrapYardView.tsx', size: '7 KB', lines: 260 },
              { type: 'file', name: 'SupplyOrdersView.tsx', size: '6 KB', lines: 230 }
          ]},
          { type: 'folder', name: 'analytics', children: [
              { type: 'file', name: 'AnalyticsView.tsx', size: '8 KB', lines: 280 }
          ]}
      ]}
  ]}
];

const FolderItem: React.FC<{ item: any; level?: number }> = ({ item, level = 0 }) => {
    return (
        <div style={{ paddingRight: `${level * 20}px` }} className="border-r border-slate-200 dark:border-slate-800 pr-4 my-1">
            <div className="flex items-center gap-2 py-1">
                {item.type === 'folder' ? (
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                ) : (
                    <FileCode className="w-4 h-4 text-blue-500" />
                )}
                <span className={`font-mono text-sm ${item.type === 'folder' ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.name}
                </span>
                {item.type === 'file' && (
                    <div className="mr-auto flex gap-4 text-xs font-mono text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{item.size}</span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <span>{item.lines} lines</span>
                    </div>
                )}
            </div>
            {item.children && (
                <div className="border-r border-slate-200 dark:border-slate-800 mr-2 pr-2">
                    {item.children.map((child: any, idx: number) => (
                        <FolderItem key={idx} item={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProjectArchitectureView: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate Totals
  const calculateTotals = (items: any[]) => {
      let files = 0;
      let lines = 0;
      const traverse = (nodes: any[]) => {
          nodes.forEach(node => {
              if (node.type === 'file') {
                  files++;
                  lines += node.lines || 0;
              }
              if (node.children) traverse(node.children);
          });
      };
      traverse(items);
      return { files, lines };
  };

  const { files, lines } = calculateTotals(PROJECT_STRUCTURE);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-map');
    if (!element) return;

    if (typeof (window as any).html2pdf === 'undefined') {
        alert("مكتبة PDF غير متوفرة.");
        return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `BioMed_SourceMap_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const pdfWorker = (window as any).html2pdf().set(opt).from(element);
        const pdfOutput = await pdfWorker.outputPdf('datauristring');

        await FileService.saveFile(opt.filename, pdfOutput, 'BioMed_OS/Docs');
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الحفظ");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings/resources')} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm transition-colors">
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">خارطة المشروع</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Technical Documentation</p>
            </div>
        </div>
        
        <button 
            onClick={handleDownloadPDF} 
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:bg-slate-400 ${
                saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 hover:bg-slate-900'
            }`}
        >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span className="font-bold text-xs">
                {saveSuccess ? 'تم الحفظ!' : 'حفظ PDF'}
            </span>
        </button>
      </div>

      {/* Printable Area */}
      <div id="printable-map" className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
          
          <div className="border-b-2 border-slate-100 dark:border-slate-800 pb-6 mb-6 flex justify-between items-end">
              <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">BioMed OS</h1>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Source Code Architecture Map</p>
              </div>
              <div className="text-left text-xs font-mono text-slate-400">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Ref: ARCH-V1.0</p>
              </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Files</p>
                  <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{files}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Lines (Approx)</p>
                  <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{lines.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tech Stack</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400 pt-1">React, TypeScript, Vite, Tailwind</p>
              </div>
          </div>

          {/* Tree Structure */}
          <div className="bg-slate-50/50 dark:bg-black/20 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" /> Project Structure
              </h3>
              <div dir="ltr" className="font-mono text-sm">
                  {PROJECT_STRUCTURE.map((item, idx) => (
                      <FolderItem key={idx} item={item} />
                  ))}
              </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400">Generated by BioMed OS Developer Tools</p>
          </div>

      </div>

    </div>
  );
};

export default ProjectArchitectureView;
