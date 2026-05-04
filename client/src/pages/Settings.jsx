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
  AlertCircle
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
    platformName: 'Interactive NOC v2.0',
    refreshInterval: 30,
    defaultDomain: 'ran',
    emailAlerts: true,
    smsAlerts: false,
    mfaEnabled: true,
    sessionTimeout: 24,
    retentionDays: 90,
    apiEndpoint: 'https://api.noc-central.telco.com/v1'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API persistence
    setTimeout(() => {
      setLoading(false);
      showToast('Configuration synchronized across cluster');
    }, 1500);
  };

  const handleAction = (actionName) => {
    showToast(`${actionName} process initialized...`, 'info');
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const navItems = [
    { id: 'general', label: 'General', icon: <Globe size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={20} /> },
  ];

  return (
    <div className="settings-page">
      <Navbar 
        title="System Settings" 
        subtitle="Manage global platform parameters and infrastructure security" 
      />

      <div className="settings-layout">
        {/* Sidebar Navigation */}
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
        </aside>

        {/* Main Content Area */}
        <main className="settings-main">
          <div className="settings-card">
            {activeTab === 'general' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>General Configuration</h2>
                  <p>Core platform branding and global interface parameters</p>
                </div>

                <div className="settings-group">
                  <div className="setting-row">
                    <label>Platform Display Name</label>
                    <input 
                      type="text" 
                      value={config.platformName} 
                      onChange={(e) => updateConfig('platformName', e.target.value)}
                    />
                  </div>
                  <div className="setting-row">
                    <label>Data Polling Interval (Seconds)</label>
                    <input 
                      type="number" 
                      value={config.refreshInterval} 
                      onChange={(e) => updateConfig('refreshInterval', e.target.value)}
                    />
                  </div>
                  <div className="setting-row">
                    <label>Default Domain Landing</label>
                    <select 
                      value={config.defaultDomain} 
                      onChange={(e) => updateConfig('defaultDomain', e.target.value)}
                    >
                      <option value="ran">Radio Access (RAN)</option>
                      <option value="core">CORE Network</option>
                      <option value="ip">IP Transport</option>
                    </select>
                  </div>
                  <div className="setting-row">
                    <label>System Theme</label>
                    <select value={theme} onChange={toggleTheme}>
                      <option value="dark">Terminal Dark (OLED Optimized)</option>
                      <option value="light">Solarized Light</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>Notification Gateways</h2>
                  <p>Configure how the system escalates critical network alarms</p>
                </div>

                <div className="settings-group">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Email Escalation</h4>
                      <p>Send detailed PDF summaries for critical outages</p>
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
                      <h4>SMS Critical Paging</h4>
                      <p>Emergency paging via Twilio/AWS SNS gateway</p>
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

                  <div className="setting-row">
                    <label>Central API Endpoint</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        value={config.apiEndpoint}
                        onChange={(e) => updateConfig('apiEndpoint', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>Security & Compliance</h2>
                  <p>Access control and operational auditing parameters</p>
                </div>

                <div className="settings-group">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Multi-Factor Authentication</h4>
                      <p>Require TOTP token for supervisor-level access</p>
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
                    <label>Inactivity Session Timeout (Hours)</label>
                    <input 
                      type="number" 
                      value={config.sessionTimeout}
                      onChange={(e) => updateConfig('sessionTimeout', e.target.value)}
                    />
                  </div>

                  <div className="setting-row">
                    <label>Password Policy Enforcement</label>
                    <select>
                      <option>NIST 800-63 Standard</option>
                      <option>High Complexity (16+ Chars)</option>
                      <option>Enterprise Default</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="settings-section">
                <div className="section-title">
                  <h2>Data Lifecycle</h2>
                  <p>Manage historical logs and analytical data retention</p>
                </div>

                <div className="settings-group">
                  <div className="setting-row">
                    <label>Alarm History Retention (Days)</label>
                    <input 
                      type="number" 
                      value={config.retentionDays}
                      onChange={(e) => updateConfig('retentionDays', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleAction('Log Export')}>
                      <Download size={18} /> Export Syslogs
                    </button>
                    <button className="btn-danger-outline" style={{ flex: 1 }} onClick={() => handleAction('Archive Purge')}>
                      <Trash2 size={18} /> Purge Archives
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Common Footer */}
            <div className="settings-footer">
              <button 
                className="btn btn-primary" 
                onClick={handleSave} 
                disabled={loading}
                style={{ minWidth: '180px' }}
              >
                {loading ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
                {loading ? 'Synchronizing...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Feedback */}
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
