import { useState, useEffect } from 'react';
import {
  Radio, Server, Network,
  Activity, ShieldAlert, Zap,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  Wifi, ShieldCheck, Database
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import './Dashboard.css';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentAlarms, setRecentAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [healthRes, ranRes, coreRes, transportRes, alarmsRes] = await Promise.all([
          api.get('/reports/network-health'),
          api.get('/ran/bts'),
          api.get('/core/elements'),
          api.get('/transport/links'),
          api.get('/alarms')
        ]);

        setHealth(healthRes.data);
        setStats({
          ran: ranRes.data.length,
          core: coreRes.data.length,
          transport: transportRes.data.length,
          activeAlarms: alarmsRes.data.filter(a => a.status === 'active').length
        });
        setRecentAlarms(alarmsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const HealthGauge = ({ value }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="health-gauge-large">
        <svg viewBox="0 0 110 110" className="circular-progress-lg">
          <circle className="circle-bg" cx="55" cy="55" r={radius} />
          <circle
            className="circle-fill"
            cx="55" cy="55" r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={value > 90 ? '#10b981' : value > 70 ? '#f59e0b' : '#ef4444'}
          />
        </svg>
        <div className="health-value-container">
          <span className="h-val">{value}%</span>
          <span className="h-label">HEALTH</span>
        </div>
      </div>
    );
  };

  if (loading && !health) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Building Network Overview...</p>
    </div>
  );

  return (
    <div className="overview-dashboard">
      <Navbar
        title="Network Overview"
        subtitle="Real-time status of your global telecommunications infrastructure"
      />

      <div className="overview-main-grid">
        {/* Health Section */}
        <div className="card health-card">
          <div className="card-header">
            <h3 className="card-title">Infrastructure Health</h3>
          </div>
          <div className="health-content">
            <HealthGauge value={health?.overall || 98} />
            <div className="health-details">
              <p>Your network is performing optimally. <strong>{stats?.activeAlarms || 0}</strong> active incidents require attention.</p>
              <button className="btn-details">View Health Report <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Domain Summary Cards */}
        <div className="domain-summary-grid">
          <div className="summary-card ran">
            <div className="s-card-icon"><Radio size={24} /></div>
            <div className="s-card-info">
              <span className="s-val">{stats?.ran || 0}</span>
              <span className="s-label">RAN Elements</span>
            </div>
            <div className="s-card-trend up"><ArrowUpRight size={16} /> 2.4%</div>
          </div>
          <div className="summary-card core">
            <div className="s-card-icon"><Server size={24} /></div>
            <div className="s-card-info">
              <span className="s-val">{stats?.core || 0}</span>
              <span className="s-label">CORE Nodes</span>
            </div>
            <div className="s-card-trend up"><ArrowUpRight size={16} /> 0.8%</div>
          </div>
          <div className="summary-card transport">
            <div className="s-card-icon"><Network size={24} /></div>
            <div className="s-card-info">
              <span className="s-val">{stats?.transport || 0}</span>
              <span className="s-label">Transport Links</span>
            </div>
            <div className="s-card-trend down"><ArrowDownRight size={16} /> 1.2%</div>
          </div>
          <div className="summary-card alarms">
            <div className="s-card-icon"><ShieldAlert size={24} /></div>
            <div className="s-card-info">
              <span className="s-val">{stats?.activeAlarms || 0}</span>
              <span className="s-label">Active Alarms</span>
            </div>
            <div className="s-card-status">Priority High</div>
          </div>
        </div>
      </div>

      <div className="overview-secondary-grid">
        {/* Recent Activity */}
        <div className="card activity-card">
          <div className="card-header">
            <h3 className="card-title">Critical Recent Activity</h3>
           
          </div>
          <div className="activity-list">
            {recentAlarms.length > 0 ? recentAlarms.map((alarm, idx) => (
              <div key={idx} className="activity-item">
                <div className={`activity-indicator ${alarm.priority}`}></div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-subject">{alarm.element_name}</span>
                    <span className="activity-time">{new Date(alarm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="activity-desc">{alarm.description}</p>
                </div>
              </div>
            )) : (
              <div className="empty-state">No critical activities reported.</div>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card insights-card">
          <div className="card-header">
            <h3 className="card-title">Network Insights</h3>
          </div>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon"><Zap size={18} /></div>
              <div className="insight-info">
                <h4>Peak Traffic Period</h4>
                <p>Expected in 2 hours across Mumbai South region.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon"><ShieldCheck size={18} /></div>
              <div className="insight-info">
                <h4>Security Protocol</h4>
                <p>98% of RAN elements are running WPA3-Enterprise.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon"><Database size={18} /></div>
              <div className="insight-info">
                <h4>Database Sync</h4>
                <p>Backup completed successfully at 04:00 AM.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
