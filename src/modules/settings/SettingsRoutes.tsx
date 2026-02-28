
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SettingsView from './SettingsView';
import DataManagementView from './DataManagementView';
import EngineerProfileView from './EngineerProfileView';
import LocationSettingsView from './LocationSettingsView';
import WarehouseSettingsView from './WarehouseSettingsView';
import NotificationsView from '../notifications/NotificationsView';
import SuppliersView from './SuppliersView';
import AIKeySettingsView from './AIKeySettingsView';
import PosterPreview from './PosterPreview';
import ProjectResourcesView from './ProjectResourcesView';
import ProjectArchitectureView from './ProjectArchitectureView';

const SettingsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<SettingsView />} />
      <Route path="data" element={<DataManagementView />} />
      <Route path="profile" element={<EngineerProfileView />} />
      <Route path="locations" element={<LocationSettingsView />} />
      <Route path="warehouse" element={<WarehouseSettingsView />} />
      <Route path="notifications" element={<NotificationsView />} />
      <Route path="suppliers" element={<SuppliersView />} />
      <Route path="ai-key" element={<AIKeySettingsView />} />
      
      {/* New Routes */}
      <Route path="resources" element={<ProjectResourcesView />} />
      <Route path="poster" element={<PosterPreview />} />
      <Route path="map" element={<ProjectArchitectureView />} />
    </Routes>
  );
};

export default SettingsRoutes;
