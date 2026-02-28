
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MaintenanceDashboardView from './MaintenanceDashboardView';
import MaintenanceOptionsView from './MaintenanceOptionsView';
import IncomingRequestsView from './IncomingRequestsView';
import PMTemplateCreator from './pm/PMTemplateCreator';
import PMChecklistView from './pm/PMChecklistView';
import ReportView from './pm/ReportView';
import CreateTicketView from './corrective/CreateTicketView';
import WorkbenchView from './corrective/WorkbenchView';
import ScrapDeviceView from './scrap/ScrapDeviceView';

const MaintenanceRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MaintenanceDashboardView />} />
      <Route path="requests" element={<IncomingRequestsView />} /> 
      <Route path="templates/new" element={<PMTemplateCreator />} />
      <Route path="options/:deviceId" element={<MaintenanceOptionsView />} />
      <Route path="pm/:deviceId" element={<PMChecklistView />} />
      <Route path="report/:deviceId" element={<ReportView />} />
      <Route path="ticket/new/:deviceId" element={<CreateTicketView />} />
      <Route path="workbench/:deviceId" element={<WorkbenchView />} />
      <Route path="scrap/:deviceId" element={<ScrapDeviceView />} />
    </Routes>
  );
};

export default MaintenanceRoutes;
