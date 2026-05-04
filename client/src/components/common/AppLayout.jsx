import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatBox from './ChatBox';
import './AppLayout.css';

// Role → allowed paths mapping
const ROLE_PATHS = {
  admin: ['*'],
  noc_manager: ['/dashboard', '/noc-manager', '/reports'],
  noc_supervisor: ['/dashboard', '/ran', '/core', '/transport', '/noc-supervisor', '/reports'],
  ran_engineer: ['/dashboard', '/ran', '/reports'],
  core_engineer: ['/dashboard', '/core', '/reports'],
  ip_engineer: ['/dashboard', '/transport', '/reports'],
  analyst: ['/dashboard', '/ran', '/core', '/transport', '/reports', '/noc-supervisor', '/noc-manager'],
  operator: ['/dashboard', '/ran', '/core', '/transport', '/noc-supervisor', '/devices'],
};

function canAccess(role, path) {
  const allowed = ROLE_PATHS[role] || [];
  return allowed.includes('*') || allowed.some(p => path.startsWith(p));
}

export default function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading Interactive...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!canAccess(user.role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Outlet />
      </main>
      <ChatBox domain={location.pathname.split('/')[1] || 'general'} />
    </div>
  );
}
