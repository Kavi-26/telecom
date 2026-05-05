import { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Lock,
  Mail,
  Smartphone,
  History,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  User,
  Cpu,
  Link as LinkIcon,
  Activity,
  FileText,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/common/Navbar';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { theme, toggleTheme } = useTheme();

  // Settings State
  const [config, setConfig] = useState({
    platformName: 'TelcoVision NOC Enterprise',
    refreshInterval: 15,
    defaultDomain: 'ran',
    emailAlerts: true,
    smsAlerts: true,
    mfaEnabled: true,
    sessionTimeout: 12,
    retentionDays: 180,
    apiEndpoint: 'https://api.noc-central.telco.com/v1',
    userName: 'Admin Supervisor',
    userEmail: 'admin@telco-noc.com',
    userRole: 'Cluster Administrator'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Enterprise configuration synchronized successfully');
    }, 1200);
  };

  const handleAction = (actionName) => {
    showToast(`${actionName} process initialized...`, 'info');
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const navItems = [
    { id: 'general', label: 'General', icon: <Globe size={20} /> },
    { id: 'profile', label: 'User Profile', icon: <User size={20} /> },
    { id: 'notifications', label: 'Escalation', icon: <Bell size={20} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={20} /> },
    { id: 'api', label: 'Integrations', icon: <LinkIcon size={20} /> },
    { id: 'data', label: 'Maintenance', icon: <Database size={20} /> },
  ];

  return (
    <div className="settings-page">
      <Navbar
        title="Infrastructure Management"
        subtitle="Global cluster parameters, security protocols, and integration gateways"
      />

      <div className="settings-layout">
        <aside className="settings-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="icon-box">{item.icon}</div>
              {item.label}
            </button>
          ))}

          <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '0.5rem' }}>CLUSTER STATUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '11px', fontWeight: 700 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
              Nodes Online (12/12)
            </div>
          </div>
        </aside>

        <main className="settings-main">
          <div className="settings-card">
            {activeTab === 'general' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>System Configuration</h2>
                  <p>Master branding and operational polling parameters</p>
                </div>

                <div className="settings-group">
                  <div className="setting-row">
                    <label><Globe size={14} /> Platform Identifier</label>
                    <input
                      type="text"
                      value={config.platformName}
                      onChange={(e) => updateConfig('platformName', e.target.value)}
                    />
                  </div>
                  <div className="setting-row">
                    <label><Activity size={14} /> Data Polling (Seconds)</label>
                    <input
                      type="number"
                      value={config.refreshInterval}
                      onChange={(e) => updateConfig('refreshInterval', e.target.value)}
                    />
                  </div>
                  <div className="setting-row">
                    <label><Server size={14} /> Default Workspace</label>
                    <select
                      value={config.defaultDomain}
                      onChange={(e) => updateConfig('defaultDomain', e.target.value)}
                    >
                      <option value="ran">Radio Access Network</option>
                      <option value="core">Core Infrastructure</option>
                      <option value="ip">IP Transport Backhaul</option>
                    </select>
                  </div>
                  <div className="setting-row">
                    <label><Activity size={14} /> Interface Theme</label>
                    <select value={theme} onChange={toggleTheme}>
                      <option value="dark">OLED Dark (Standard)</option>
                      <option value="light">Solarized Light (High Contrast)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>User Profile</h2>
                  <p>Manage your account credentials and operational identity</p>
                </div>

                <div className="settings-group">
                  <div className="setting-row">
                    <label><User size={14} /> Full Name</label>
                    <input
                      type="text"
                      value={config.userName}
                      onChange={(e) => updateConfig('userName', e.target.value)}
                    />
                  </div>
                  <div className="setting-row">
                    <label><Mail size={14} /> Enterprise Email</label>
                    <input
                      type="email"
                      value={config.userEmail}
                      onChange={(e) => updateConfig('userEmail', e.target.value)}
                    />
                  </div>
                  <div className="setting-row full-width">
                    <label><Shield size={14} /> Role Permissions</label>
                    <input type="text" value={config.userRole} disabled />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>Alert Escalation Gateways</h2>
                  <p>Configure critical incident propagation across communication channels</p>
                </div>

                <div className="settings-group">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Email SMTP Relay</h4>
                      <p>Send automated incident reports to management</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={config.emailAlerts}
                        onChange={(e) => updateConfig('emailAlerts', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>SMS Gateway (Critical)</h4>
                      <p>Propagate P1 incidents via mobile paging</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={config.smsAlerts}
                        onChange={(e) => updateConfig('smsAlerts', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>External Integrations</h2>
                  <p>Manage API endpoints and third-party observability hooks</p>
                </div>

                <div className="settings-group">
                  <div className="setting-row full-width">
                    <label><LinkIcon size={14} /> Central API Endpoint</label>
                    <input
                      type="text"
                      value={config.apiEndpoint}
                      onChange={(e) => updateConfig('apiEndpoint', e.target.value)}
                    />
                  </div>
                  <div className="setting-row">
                    <label><Lock size={14} /> API Key (Read-only)</label>
                    <input type="password" value="sk_test_51MzS2..." disabled />
                  </div>
                  <div className="setting-row">
                    <label><Cpu size={14} /> Webhook Status</label>
                    <div style={{ padding: '0.75rem', background: '#10b98115', border: '1px solid #10b98130', borderRadius: '10px', color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
                      Operational (Active)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>Security & Audit</h2>
                  <p>Operational compliance and access control standards</p>
                </div>

                <div className="settings-group">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>2FA / MFA Enforcement</h4>
                      <p>Mandatory for all supervisor-level logins</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={config.mfaEnabled}
                        onChange={(e) => updateConfig('mfaEnabled', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="setting-row">
                    <label><History size={14} /> Session TTL (Hours)</label>
                    <input
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) => updateConfig('sessionTimeout', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>System Maintenance</h2>
                  <p>Database lifecycle management and analytical archiving</p>
                </div>

                <div className="settings-group">
                  <div className="setting-row">
                    <label><Database size={14} /> Retention (Days)</label>
                    <input
                      type="number"
                      value={config.retentionDays}
                      onChange={(e) => updateConfig('retentionDays', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }} className="full-width">
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleAction('System Backup')}>
                      <Download size={18} /> Run System Backup
                    </button>
                    <button className="btn-danger-outline" style={{ flex: 1 }} onClick={() => handleAction('Storage Purge')}>
                      <Trash2 size={18} /> Purge Archives
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recent System Changes</label>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border)', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <tr>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Identity</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem' }}>Update Polling Interval</td>
                          <td style={{ padding: '0.75rem' }}>admin_cluster_1</td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>10m ago</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.75rem' }}>Toggle SMTP Relay</td>
                          <td style={{ padding: '0.75rem' }}>system_auth</td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>1h ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-footer">
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
                style={{ minWidth: '180px' }}
              >
                {loading ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                {loading ? 'Synchronizing...' : 'Commit Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#06b6d4" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
