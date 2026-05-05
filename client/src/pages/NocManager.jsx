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
  const [selectedAlarm, setSelectedAlarm] = useState(null);

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

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (id, action) => {
    // Optimistic UI update
    const previousAlarms = [...alarms];
    
    if (action === 'resolve') {
      setAlarms(prev => prev.filter(a => a.id !== id));
      showToast(`Incident #${id} has been resolved and archived`);
    } else {
      setAlarms(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
      showToast(`Incident #${id} acknowledged by operator`);
    }

    try {
      await api.put(`/alarms/${id}/${action}`);
      // If backend succeeds, we don't need to do anything since we updated optimistically
      // But we can fetch to be safe if needed
    } catch (err) {
      console.error(`Error ${action}ing alarm:`, err);
      // Revert on error
      setAlarms(previousAlarms);
      showToast(`Failed to ${action} incident. Please try again.`, 'error');
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
      critical: alarms.filter(a => a.priority === 'critical').length,
      major: alarms.filter(a => a.priority === 'major').length,
      minor: alarms.filter(a => a.priority === 'minor').length
    };
  }, [alarms]);

  const calculateDuration = (timestamp) => {
    if (!timestamp) return '2h 12m';
    const start = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    
    if (diff < 60) return `${diff}s`;
    
    const mins = Math.floor(diff / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${mins % 60}m`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m ${diff % 60}s`;
  };

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
                      <td><span className={`domain-pill ${alarm.domain?.toLowerCase()}`}>{alarm.domain}</span></td>
                      <td><strong>{alarm.element_name}</strong></td>
                      <td 
                        className="desc-cell clickable" 
                        onClick={() => setSelectedAlarm(alarm)}
                        title="Click to view full description"
                      >
                        {alarm.description}
                      </td>
                      <td className="duration-cell">
                        <div className="duration-pill">
                          <Clock size={12} />
                          {calculateDuration(alarm.created_at || alarm.timestamp)}
                        </div>
                      </td>
                      <td>
                        <div className="action-group">
                          <button 
                            className={`mgr-btn ack ${alarm.status === 'acknowledged' ? 'done' : ''}`}
                            onClick={() => handleAction(alarm.id, 'acknowledge')} 
                            disabled={alarm.status === 'acknowledged'}
                            title="Acknowledge Incident"
                          >
                            <Clock size={14} />
                            <span>{alarm.status === 'acknowledged' ? 'ACKED' : 'ACK'}</span>
                          </button>
                          <button 
                            className="mgr-btn resolve"
                            onClick={() => handleAction(alarm.id, 'resolve')} 
                            title="Mark as Resolved"
                          >
                            <CheckCircle2 size={14} />
                            <span>RESOLVE</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notification & Escalation Settings */}
          <div className="side-panels">
            <div className="card settings-panel">
              <div className="card-header">
                <div className="card-title">Notification Channels</div>
                <div className="badge badge-active">Active</div>
              </div>
              <div className="settings-body">
                <p className="settings-desc">Receive instant alerts for Critical and Major incidents via your preferred channels.</p>
                
                <div className="notification-toggle-list">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <Mail size={18} className="text-brand" />
                      <div>
                        <div className="toggle-label">Email Notifications</div>
                        <div className="toggle-sub">L1 - L3 Escalations</div>
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
                      <MessageSquare size={18} style={{ color: '#4ade80' }} />
                      <div>
                        <div className="toggle-label">Slack / Teams</div>
                        <div className="toggle-sub">L1 Immediate Alerts</div>
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
                      <Bell size={18} style={{ color: '#22c55e' }} />
                      <div>
                        <div className="toggle-label">WhatsApp (NOC Group)</div>
                        <div className="toggle-sub">Critical Only</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={notificationSettings.whatsapp} 
                      onChange={() => setNotificationSettings(s => ({...s, whatsapp: !s.whatsapp}))} 
                    />
                  </div>
                </div>

                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <Share2 size={14} />
                  Test All Channels
                </button>
              </div>
            </div>

            <div className="card escalation-panel" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <div className="card-title">Escalation Policy</div>
              </div>
              <div className="escalation-body">
                <div className="escalation-step">
                  <div className="step-level">L1</div>
                  <div className="step-content">
                    <div className="step-title">Initial Response</div>
                    <div className="step-desc">Acknowledge within 15m</div>
                  </div>
                </div>
                <div className="escalation-step">
                  <div className="step-level">L2</div>
                  <div className="step-content">
                    <div className="step-title">Manager Alert</div>
                    <div className="step-desc">Unresolved after 1h</div>
                  </div>
                </div>
                <div className="escalation-step active">
                  <div className="step-level">L3</div>
                  <div className="step-content">
                    <div className="step-title">Director Escalation</div>
                    <div className="step-desc">Critical after 4h</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card distribution-panel" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <div className="card-title">Domain Distribution</div>
              </div>
              <div className="dist-list">
                {['RAN', 'CORE', 'IP'].map(domain => {
                  const count = alarms.filter(a => a.domain === domain).length;
                  const total = alarms.length || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={domain} className="dist-item">
                      <div className="dist-info">
                        <span className="dist-label">{domain}</span>
                        <span className="dist-val">{count}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${domain.toLowerCase()}`} 
                          style={{ width: `${percent}%`, background: `var(--domain-${domain.toLowerCase()})` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alarm Detail Modal */}
      {selectedAlarm && (
        <div className="modal-overlay" onClick={() => setSelectedAlarm(null)}>
          <div className="card detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Incident Details</div>
              <button className="close-btn" onClick={() => setSelectedAlarm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Network Element</label>
                  <div className="detail-val"><strong>{selectedAlarm.element_name}</strong></div>
                </div>
                <div className="detail-item">
                  <label>Domain</label>
                  <div className="detail-val">
                    <span className={`domain-pill ${selectedAlarm.domain?.toLowerCase()}`}>
                      {selectedAlarm.domain}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Priority</label>
                  <div className="detail-val">
                    <span className={`prio-pill ${selectedAlarm.priority}`}>
                      {selectedAlarm.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>Duration</label>
                  <div className="detail-val">{calculateDuration(selectedAlarm.created_at || selectedAlarm.timestamp)}</div>
                </div>
              </div>
              
              <div className="detail-full-desc">
                <label>Full Description</label>
                <p>{selectedAlarm.description}</p>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    handleAction(selectedAlarm.id, 'acknowledge');
                    setSelectedAlarm(null);
                  }}
                  disabled={selectedAlarm.status === 'acknowledged'}
                >
                  <Clock size={14} />
                  Acknowledge
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    handleAction(selectedAlarm.id, 'resolve');
                    setSelectedAlarm(null);
                  }}
                >
                  <CheckCircle2 size={14} />
                  Resolve Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'error' ? <AlertOctagon size={18} /> : <CheckCircle2 size={18} />}
          {notification.message}
        </div>
      )}
    </div>
  );
}
