
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/core/context/AuthContext';
import { LanguageProvider } from './src/core/context/LanguageContext';
import LoginView from './src/modules/auth/LoginView';

// Core Views (Engineer)
import DashboardView from './src/modules/dashboard/DashboardView';
import DeviceListView from './src/modules/dashboard/DeviceListView';
import ScannerView from './src/modules/scanner/ScannerView';
import DeviceProfileView from './src/modules/diagnostics/DeviceProfileView';
import InventoryView from './src/modules/inventory/InventoryView';
import SimulationHub from './src/modules/simulation/SimulationHub';

// Modular Routes (Engineer)
import MaintenanceRoutes from './src/modules/maintenance/MaintenanceRoutes';
import ToolsRoutes from './src/modules/tools/ToolsRoutes';
import SettingsRoutes from './src/modules/settings/SettingsRoutes';

// Nurse Views
import NurseDashboard from './src/modules/nurse/NurseDashboard';
import NurseRoomSelectionView from './src/modules/nurse/NurseRoomSelectionView';
import ServiceRequestView from './src/modules/nurse/ServiceRequestView';
import NurseRequestHistoryView from './src/modules/nurse/NurseRequestHistoryView';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginView />;
  }

  // --- NURSE ROUTING ---
  if (user.role === 'Nurse') {
    return (
        <HashRouter>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
                <Routes>
                    <Route path="/" element={<NurseDashboard />} />
                    <Route path="/nurse" element={<NurseDashboard />} />
                    <Route path="/nurse/select-rooms" element={<NurseRoomSelectionView />} />
                    <Route path="/nurse/request" element={<ServiceRequestView />} />
                    <Route path="/nurse/history" element={<NurseRequestHistoryView />} />
                    
                    {/* Shared Device View (Read Only Logic Handled Inside) */}
                    <Route path="/device/:deviceId" element={<DeviceProfileView />} />
                    <Route path="/scanner" element={<ScannerView />} />
                    
                    {/* Shared Simulation (Training) */}
                    <Route path="/simulation" element={<SimulationHub />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/nurse" replace />} />
                </Routes>
            </div>
        </HashRouter>
    );
  }

  // --- ENGINEER / ADMIN ROUTING ---
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <Routes>
          {/* Core Routes - Engineer/Admin View */}
          <Route path="/" element={<DashboardView />} />
          <Route path="/devices" element={<DeviceListView />} />
          <Route path="/scanner" element={<ScannerView />} />
          <Route path="/device/:deviceId" element={<DeviceProfileView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/simulation" element={<SimulationHub />} />
          
          {/* Modular Routes (Sub-routers) */}
          <Route path="/maintenance/*" element={<MaintenanceRoutes />} />
          <Route path="/tools/*" element={<ToolsRoutes />} />
          <Route path="/settings/*" element={<SettingsRoutes />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
