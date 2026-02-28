import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardView from './AdminDashboardView';
import UserManagementView from './UserManagementView';
import DocumentManagementView from './DocumentManagementView';
import DataEntryView from './DataEntryView';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboardView />} />
      <Route path="/users" element={<UserManagementView />} />
      <Route path="/documents" element={<DocumentManagementView />} />
      <Route path="/data-entry" element={<DataEntryView />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
