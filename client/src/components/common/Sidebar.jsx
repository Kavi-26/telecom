import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Radio, Server, Network, Bell, BarChart2,
  LogOut, Wifi, ChevronLeft, ChevronRight, Settings, User,
  ShieldAlert, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Sidebar.css';
import logo from '../../assets/logo.png';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', roles: ['admin','noc_manager','noc_supervisor','analyst','operator'] },
  { to: '/ran',       icon: Radio,           label: 'RAN',      roles: ['admin','noc_supervisor','ran_engineer','analyst','operator'] },
  { to: '/core',      icon: Server,          label: 'CORE',     roles: ['admin','noc_supervisor','core_engineer','analyst','operator'] },
  { to: '/transport', icon: Network,         label: 'IP Transport', roles: ['admin','noc_supervisor','ip_engineer','analyst','operator'] },
  { to: '/noc-manager',   icon: ShieldAlert,     label: 'Manager Console', roles: ['admin','noc_manager'] },
  { to: '/noc-supervisor',icon: LayoutDashboard,  label: 'Supervisor Dashboard', roles: ['admin','noc_supervisor'] },
  { to: '/devices',       icon: Wifi,            label: 'Devices',  roles: ['admin','operator'] },
  { to: '/reports',       icon: BarChart2,       label: 'Reports',  roles: ['admin','analyst'] },
  { to: '/users',         icon: User,            label: 'Users',    roles: ['admin'] },
  { to: '/settings',      icon: Settings,        label: 'Settings', roles: ['admin'] },
];

const ROLE_LABELS = {
  admin: 'Administrator',
  noc_manager: 'NOC Manager',
  noc_supervisor: 'NOC Supervisor',
  ran_engineer: 'RAN Engineer',
  core_engineer: 'CORE Engineer',
  ip_engineer: 'IP TRANSPORT Engineer',
  analyst: 'Network Analyst',
  operator: 'Operator',
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allowedNav = NAV_ITEMS.filter(n => !user || n.roles.includes(user.role));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src={logo} alt="L" style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
          </div>
          {!collapsed && <span className="logo-text">Interactive</span>}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {allowedNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="nav-icon" />
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              <User size={16} />
            </div>
            {!collapsed && (
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{ROLE_LABELS[user.role] || user.role}</span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: '4px', flexDirection: collapsed ? 'column' : 'row' }}>
          <button
            className="logout-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{ flex: 1 }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
            style={{ flex: 1 }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
