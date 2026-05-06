import { useState, useEffect } from 'react';
import {
  Radio, Server, Network,
  Activity, ShieldAlert, Zap,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  Wifi, ShieldCheck, Database, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import './Dashboard.css';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentAlarms, setRecentAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  const trendData = [
    { time: '08:00', health: 94, traffic: 45 },
    { time: '10:00', health: 92, traffic: 52 },
    { time: '12:00', health: 76, traffic: 88 },
    { time: '14:00', health: 85, traffic: 65 },
    { time: '16:00', health: 91, traffic: 48 },
    { time: '18:00', health: 95, traffic: 38 },
    { time: '20:00', health: 97, traffic: 32 },
  ];

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
            <h3 className="card-title">Network Domain Health</h3>
          </div>
          <div className="health-content">
            <HealthGauge value={health?.overall || 98} />
            <div className="health-details">
              <p>Your network is performing optimally. <strong>{stats?.activeAlarms || 0}</strong> active incidents require attention.</p>
              <button className="btn-details" onClick={() => setShowReport(true)}>View Health Report <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Network Trend Section - Now replaced the summary cards */}
        <div className="card trend-card">
          <div className="card-header">
            <div className="title-with-icon">
              <TrendingUp size={20} className="text-brand" />
              <h3 className="card-title">Network Performance Trend</h3>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot health"></span> Health</span>
              <span className="legend-item"><span className="dot traffic"></span> Load</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  width={25}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="health"
                  stroke="var(--brand-primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHealth)"
                />
                <Line
                  type="monotone"
                  dataKey="traffic"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
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
      {/* Health Report Modal */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="health-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Network Health Breakdown</h3>
              <button className="close-btn" onClick={() => setShowReport(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="overall-summary">
                <div className="summary-val">{health?.overall || 76}%</div>
                <div className="summary-text">Overall Infrastructure Stability Index</div>
              </div>

              <div className="domain-breakdown">
                <div className="domain-item">
                  <div className="domain-info">
                    <Radio size={18} />
                    <span>RAN Domain</span>
                  </div>
                  <div className="domain-bar">
                    <div className="bar-fill ran" style={{ width: '88%' }}></div>
                  </div>
                  <span className="domain-val">88%</span>
                </div>
                <div className="domain-item">
                  <div className="domain-info">
                    <Server size={18} />
                    <span>CORE Domain</span>
                  </div>
                  <div className="domain-bar">
                    <div className="bar-fill core" style={{ width: '92%' }}></div>
                  </div>
                  <span className="domain-val">92%</span>
                </div>
                <div className="domain-item">
                  <div className="domain-info">
                    <Network size={18} />
                    <span>IP / Transport</span>
                  </div>
                  <div className="domain-bar">
                    <div className="bar-fill transport" style={{ width: '64%' }}></div>
                  </div>
                  <span className="domain-val">64%</span>
                </div>
              </div>

              <div className="possible-result-box">
                <h4>Predictive Analysis</h4>
                <p>Based on current alarm trends, health is expected to <span className="trend-up">increase to 82%</span> in the next 4 hours following scheduled backbone maintenance.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
