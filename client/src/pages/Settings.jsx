import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Save, RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/common/Navbar';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('System settings updated successfully');
    }, 1500);
  };

  return (
    <div className="settings-page">
      <Navbar 
        title="System Configuration" 
        subtitle="Global parameters and infrastructure control" 
      />

      <div className="settings-header-actions" style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="spin" size={18} /> : <Save size={18} />}
          {saving ? 'Applying...' : 'Save Configuration'}
        </button>
      </div>

      <div className="settings-container">
        <aside className="settings-sidebar">
          <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
            <Globe size={18} /> General
          </button>
          <button className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>
            <Bell size={18} /> Notifications
          </button>
          <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
            <Shield size={18} /> Security
          </button>
          <button className={activeTab === 'database' ? 'active' : ''} onClick={() => setActiveTab('database')}>
            <Database size={18} /> Data Management
          </button>
        </aside>

        <main className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="input-group">
                <label>Platform Name</label>
                <input type="text" defaultValue="Interactive v2.0" />
              </div>
              <div className="input-group">
                <label>Refresh Interval (seconds)</label>
                <input type="number" defaultValue="30" />
              </div>
              <div className="input-group">
                <label>Default Domain</label>
                <select defaultValue="ran">
                  <option value="ran">Radio Access Network</option>
                  <option value="core">Core Network</option>
                  <option value="ip">IP Transport</option>
                </select>
              </div>
              <div className="input-group">
                <label>Theme</label>
                <select value={theme} onChange={toggleTheme}>
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="settings-section">
              <h2>Notification Thresholds</h2>
              <div className="toggle-group">
                <label>Email Alerts for Critical Alarms</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="input-group">
                <label>Major Alarm SLA (minutes)</label>
                <input type="number" defaultValue="15" />
              </div>
              <div className="input-group">
                <label>Critical Alarm Escalation Email</label>
                <input type="email" defaultValue="noc-escalation@telco.com" />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security & Access</h2>
              <div className="toggle-group">
                <label>Enable Multi-Factor Authentication</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="input-group">
                <label>Session Timeout (hours)</label>
                <input type="number" defaultValue="24" />
              </div>
              <div className="input-group">
                <label>Password Complexity</label>
                <select defaultValue="high">
                  <option value="low">Basic</option>
                  <option value="med">Medium</option>
                  <option value="high">Advanced (Alpha-numeric + Symbol)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="settings-section">
              <h2>Database Maintenance</h2>
              <div className="input-group">
                <label>Data Retention Period (Days)</label>
                <input type="number" defaultValue="90" />
              </div>
              <div className="action-buttons">
                <button className="secondary-btn">Export System Logs</button>
                <button className="danger-btn">Purge Historical Alarms</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
