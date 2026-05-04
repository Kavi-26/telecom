import { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, AlertTriangle, Info, 
  Filter, Search, Mail, MessageSquare, 
  Bell, Clock, CheckCircle2, AlertOctagon,
  ChevronDown, Download, Share2
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import './NocManager.css';

export default function NocManager() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    slack: false,
    whatsapp: false
  });
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alarms');
      setAlarms(res.data);
    } catch (err) {
      console.error('Error fetching manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/alarms/${id}/${action}`);
      fetchData(); // Refresh list
      showToast(`Incident successfully ${action}ed`);
    } catch (err) {
      console.error(`Error ${action}ing alarm:`, err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlarms = useMemo(() => {
    return alarms.filter(a => {
      const matchDomain = filterDomain === 'all' || a.domain === filterDomain;
      const matchPriority = filterPriority === 'all' || a.priority === filterPriority;
      const matchSearch = a.element_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDomain && matchPriority && matchSearch;
    });
  }, [alarms, filterDomain, filterPriority, searchTerm]);

  const stats = useMemo(() => {
    return {
      critical: alarms.filter(a => a.priority === 'critical' && a.status === 'active').length,
      major: alarms.filter(a => a.priority === 'major' && a.status === 'active').length,
      minor: alarms.filter(a => a.priority === 'minor' && a.status === 'active').length
    };
  }, [alarms]);

  if (loading && alarms.length === 0) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>NOC Manager Console Initializing...</p>
    </div>
  );

  return (
    <div className="noc-manager-page">
      <Navbar 
        title="NOC Manager Console" 
        subtitle="Priority Alarm Management & Problem Escalation" 
        onRefresh={fetchData}
      />

      <div className="page-content">
        {/* Escalation Stats */}
        <div className="grid grid-3" style={{ marginBottom: '24px' }}>
          <div className="stat-card critical">
            <div className="stat-header">
              <span className="stat-label">Critical Disruptions</span>
              <span className="badge badge-critical">IMMEDIATE ACTION</span>
            </div>
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-icon"><AlertOctagon size={24} /></div>
          </div>
          <div className="stat-card major">
            <div className="stat-header">
              <span className="stat-label">Major Alarms</span>
              <span className="badge badge-major">ACTIVE</span>
            </div>
            <div className="stat-value">{stats.major}</div>
            <div className="stat-icon"><AlertTriangle size={24} /></div>
          </div>
          <div className="stat-card minor">
            <div className="stat-header">
              <span className="stat-label">Minor Issues</span>
              <span className="badge badge-minor">PENDING</span>
            </div>
            <div className="stat-value">{stats.minor}</div>
            <div className="stat-icon"><Info size={24} /></div>
          </div>
        </div>

        <div className="manager-main-grid">
          {/* Main Alarm Control Center */}
          <div className="card alarms-control-panel">
            <div className="card-header">
              <div className="card-title">Alarm Control Center</div>
              <div className="card-actions">
                <div className="search-box">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search incidents..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-group">
                <label><Filter size={14} /> Domain:</label>
                <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
                  <option value="all">All Domains</option>
                  <option value="RAN">RAN Network</option>
                  <option value="CORE">CORE System</option>
                  <option value="IP">IP Transport</option>
                </select>
              </div>
              <div className="filter-group">
                <label><ShieldAlert size={14} /> Priority:</label>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="manager-table">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Domain</th>
                    <th>Network Element</th>
                    <th>Description</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlarms.map(alarm => (
                    <tr key={alarm.id} className={`alarm-row ${alarm.priority}`}>
                      <td>
                        <span className={`prio-pill ${alarm.priority}`}>{alarm.priority.toUpperCase()}</span>
                      </td>
                      <td><span className="domain-chip">{alarm.domain}</span></td>
                      <td><strong>{alarm.element_name}</strong></td>
                      <td className="desc-cell">{alarm.description}</td>
                      <td>24m 12s</td>
                      <td>
                        <div className="action-group">
                          <button className="icon-btn" onClick={() => handleAction(alarm.id, 'acknowledge')} title="Acknowledge"><Clock size={14} /></button>
                          <button className="icon-btn" onClick={() => handleAction(alarm.id, 'resolve')} title="Resolve" style={{ color: '#10b981' }}><CheckCircle2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notification & Escalation Settings */}
          <div className="card settings-panel">
            <div className="card-header">
              <div className="card-title">Notification Channels</div>
            </div>
            <div className="settings-body">
              <p className="settings-desc">Receive instant alerts for Critical and Major incidents via your preferred channels.</p>
              
              <div className="notification-toggle-list">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <Mail size={20} className="text-brand" />
                    <div>
                      <div className="toggle-label">Email Notifications</div>
                      <div className="toggle-sub">Sends full incident reports</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.email} 
                    onChange={() => setNotificationSettings(s => ({...s, email: !s.email}))} 
                  />
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <MessageSquare size={20} style={{ color: '#4ade80' }} />
                    <div>
                      <div className="toggle-label">Slack / Teams</div>
                      <div className="toggle-sub">Real-time chat alerts</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.slack} 
                    onChange={() => setNotificationSettings(s => ({...s, slack: !s.slack}))} 
                  />
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <Bell size={20} style={{ color: '#22c55e' }} />
                    <div>
                      <div className="toggle-label">WhatsApp (NOC Group)</div>
                      <div className="toggle-sub">Urgent mobile alerts</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.whatsapp} 
                    onChange={() => setNotificationSettings(s => ({...s, whatsapp: !s.whatsapp}))} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="notification-toast">
          <Bell size={18} />
          {notification}
        </div>
      )}
    </div>
  );
}
