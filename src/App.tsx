
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/context/AuthContext';
import { LanguageProvider } from './core/context/LanguageContext';
import LoginView from './modules/auth/LoginView';
import BackButtonHandler from './core/navigation/BackButtonHandler';

// Core Views (Engineer)
import DashboardView from './modules/dashboard/DashboardView';
import DeviceListView from './modules/dashboard/DeviceListView';
import ScannerView from './modules/scanner/ScannerView';
import DeviceProfileView from './modules/diagnostics/DeviceProfileView';
import InventoryView from './modules/inventory/InventoryView';
import SimulationHub from './modules/simulation/SimulationHub';
import AnalyticsView from './modules/analytics/AnalyticsView';

// Modular Routes (Engineer)
import MaintenanceRoutes from './modules/maintenance/MaintenanceRoutes';
import ToolsRoutes from './modules/tools/ToolsRoutes';
import SettingsRoutes from './modules/settings/SettingsRoutes';
import AdminRoutes from './modules/admin/AdminRoutes';

// Nurse Views
import NurseDashboard from './modules/nurse/NurseDashboard';
import NurseRoomSelectionView from './modules/nurse/NurseRoomSelectionView';
import ServiceRequestView from './modules/nurse/ServiceRequestView';
import NurseRequestHistoryView from './modules/nurse/NurseRequestHistoryView';

// Store Manager Views
import StoreDashboard from './modules/store/StoreDashboard';
import ScrapYardView from './modules/store/ScrapYardView';
import SupplyOrdersView from './modules/store/SupplyOrdersView';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginView />;
  }

  // --- NURSE ROUTING ---
  if (user.role === 'Nurse') {
    return (
        <HashRouter>
            <BackButtonHandler />
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

  // --- STORE MANAGER ROUTING (New) ---
  if (user.role === 'StoreManager') {
    return (
      <HashRouter>
        <BackButtonHandler />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<StoreDashboard />} />
            <Route path="/store" element={<StoreDashboard />} />
            <Route path="/store/scrapyard" element={<ScrapYardView />} />
            <Route path="/store/orders" element={<SupplyOrdersView />} />
            
            {/* Shared Inventory View (Will need to be enhanced for Store Manager power users later) */}
            <Route path="/inventory" element={<InventoryView />} />
            
            <Route path="/settings/*" element={<SettingsRoutes />} />
            <Route path="/scanner" element={<ScannerView />} />

            <Route path="*" element={<Navigate to="/store" replace />} />
          </Routes>
        </div>
      </HashRouter>
    );
  }

  // --- ADMIN ROUTING ---
  if (user.role === 'Admin') {
    return (
      <HashRouter>
        <BackButtonHandler />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* Admin has access to all Engineer modules */}
            <Route path="/devices" element={<DeviceListView />} />
            <Route path="/scanner" element={<ScannerView />} />
            <Route path="/device/:deviceId" element={<DeviceProfileView />} />
            <Route path="/inventory" element={<InventoryView />} />
            <Route path="/simulation" element={<SimulationHub />} />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/maintenance/*" element={<MaintenanceRoutes />} />
            <Route path="/tools/*" element={<ToolsRoutes />} />
            
            <Route path="/settings/*" element={<SettingsRoutes />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </HashRouter>
    );
  }

  // --- ENGINEER ROUTING ---
  return (
    <HashRouter>
      <BackButtonHandler />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <Routes>
          {/* Core Routes - Engineer/Admin View */}
          <Route path="/" element={<DashboardView />} />
          <Route path="/devices" element={<DeviceListView />} />
          <Route path="/scanner" element={<ScannerView />} />
          <Route path="/device/:deviceId" element={<DeviceProfileView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/simulation" element={<SimulationHub />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          
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
