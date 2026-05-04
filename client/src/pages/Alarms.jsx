import { useState, useEffect } from 'react';
import { 
  AlertCircle, AlertTriangle, Info, Filter, 
  CheckCircle2, Clock, Mail, Bell, RefreshCw,
  Search, ShieldAlert, MoreVertical, Check
} from 'lucide-react';
import api from '../api/axios';
import './Alarms.css';

export default function Alarms() {
  const [alarms, setAlarms] = useState([]);
  const [summary, setSummary] = useState({ critical: 0, major: 0, minor: 0 });
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = await api.get('/alarms', {
        params: {
          domain: filterDomain || undefined,
          priority: filterPriority || undefined
        }
      });
      setAlarms(response.data);
      
      const summaryRes = await api.get('/alarms/summary');
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching alarms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [filterDomain, filterPriority]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/alarms/${id}/${action}`);
      fetchAlarms();
      showToast(`Alarm ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing alarm:`, error);
    }
  };

  const handleNotify = async (alarm) => {
    try {
      const response = await api.post(`/alarms/${alarm.id}/notify`);
      showToast(response.data.message || `Notification email sent for ${alarm.element_name}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast('Failed to send notification email');
    }
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="alarms-container">
      <div className="alarms-header">
        <div className="alarms-title">
          <h1>Alarm & Notification Management</h1>
          <p>Real-time network disruption monitoring and escalation</p>
        </div>
        <div className="alarms-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              className="filter-select"
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
            >
              <option value="">All Domains</option>
              <option value="RAN">RAN</option>
              <option value="CORE">CORE</option>
              <option value="IP">IP Transport</option>
            </select>
          </div>
          <div className="filter-group">
            <ShieldAlert size={16} />
            <select 
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <button className="notify-btn" onClick={() => fetchAlarms()}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="alarm-summary-grid">
        <div className="summary-card critical">
          <div className="summary-icon"><AlertCircle size={24} /></div>
          <div className="summary-details">
            <h3>Critical Alarms</h3>
            <div className="count">{summary.critical}</div>
          </div>
        </div>
        <div className="summary-card major">
          <div className="summary-icon"><AlertTriangle size={24} /></div>
          <div className="summary-details">
            <h3>Major Alarms</h3>
            <div className="count">{summary.major}</div>
          </div>
        </div>
        <div className="summary-card minor">
          <div className="summary-icon"><Info size={24} /></div>
          <div className="summary-details">
            <h3>Minor Alarms</h3>
            <div className="count">{summary.minor}</div>
          </div>
        </div>
      </div>

      <div className="alarms-list-container">
        <table className="alarms-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Priority</th>
              <th>Element</th>
              <th>Description</th>
              <th>Status</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alarms.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No alarms found matching the criteria.
                </td>
              </tr>
            ) : (
              alarms.map((alarm) => (
                <tr key={alarm.id}>
                  <td><span className="domain-tag" data-domain={alarm.domain}>{alarm.domain}</span></td>
                  <td>
                    <span className={`priority-badge ${alarm.priority}`}>
                      {alarm.priority}
                    </span>
                  </td>
                  <td><strong>{alarm.element_name}</strong></td>
                  <td>{alarm.description}</td>
                  <td>
                    <div className="status-badge">
                      <div className={`status-dot ${alarm.status}`} />
                      {alarm.status}
                    </div>
                  </td>
                  <td>{new Date(alarm.created_at).toLocaleString()}</td>
                  <td>
                    <div className="action-btns">
                      {alarm.status === 'active' && (
                        <button 
                          className="action-btn" 
                          onClick={() => handleAction(alarm.id, 'acknowledge')}
                          title="Acknowledge"
                        >
                          <Clock size={16} />
                        </button>
                      )}
                      {alarm.status !== 'resolved' && (
                        <button 
                          className="action-btn" 
                          onClick={() => handleAction(alarm.id, 'resolve')}
                          title="Resolve"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button 
                        className="action-btn" 
                        onClick={() => handleNotify(alarm)}
                        title="Send Email Notification"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {notification && (
        <div className="notification-toast">
          <Check size={20} />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
