import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppLayout from './components/common/AppLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import RANPage from './pages/RAN';
import COREPage from './pages/CORE';
import TransportPage from './pages/Transport';
import ReportsPage from './pages/Reports';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';
import NocDashboard from './pages/NocDashboard';
import NocManager from './pages/NocManager';
import AlarmsPage from './pages/Alarms';
import DevicesPage from './pages/Devices';
import ResetPasswordPage from './pages/ResetPassword';
import api from './api/axios';
import './index.css';
import './pages/RAN.css';
import './pages/CORE.css';
import './pages/Transport.css';
import './pages/NocDashboard.css';
import './pages/NocManager.css';
import './pages/Reports.css';
import './pages/Users.css';
import './pages/Settings.css';
import './pages/Devices.css';
import './pages/Alarms.css';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="ran"        element={<RANPage />} />
        <Route path="core"       element={<COREPage />} />
        <Route path="transport"  element={<TransportPage />} />
        <Route path="reports"    element={<ReportsPage />} />
        <Route path="users"      element={<UsersPage />} />
        <Route path="settings"   element={<SettingsPage />} />
        <Route path="noc-supervisor" element={<NocDashboard />} />
        <Route path="noc-manager"    element={<NocManager />} />
        <Route path="devices"        element={<DevicesPage />} />
        <Route path="alarms"         element={<AlarmsPage />} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
