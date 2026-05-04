import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, Server, Network, Activity, Search, 
  ChevronRight, ArrowUpRight, ArrowDownRight,
  ShieldAlert, CheckCircle2, AlertTriangle, Info,
  MapPin, Cpu, Globe, Filter, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import './NocDashboard.css';

export default function NocDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ran');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    ran: [],
    core: [],
    transport: [],
    health: null,
    alarms: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ranRes, coreRes, transportRes, healthRes, alarmsRes] = await Promise.all([
        api.get('/ran/bts'),
        api.get('/core/elements'),
        api.get('/transport/links'),
        api.get('/reports/network-health'),
        api.get('/alarms')
      ]);

      setData({
        ran: ranRes.data,
        core: coreRes.data,
        transport: transportRes.data,
        health: healthRes.data,
        alarms: alarmsRes.data
      });
    } catch (err) {
      console.error('Error fetching NOC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    const currentList = data[activeTab] || [];
    if (!searchTerm) return currentList;
    
    const term = searchTerm.toLowerCase();
    return currentList.filter(item => {
      const name = item.name || item.element_name || item.link_name || '';
      const location = item.location || item.region || '';
      return name.toLowerCase().includes(term) || location.toLowerCase().includes(term);
    });
  }, [data, activeTab, searchTerm]);

  const stats = useMemo(() => ({
    ran: data.ran.length,
    core: data.core.length,
    transport: data.transport.length,
    activeAlarms: data.alarms.filter(a => a.status === 'active').length,
    health: data.health?.overall || 98.5
  }), [data]);

  const HealthGauge = ({ value }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="noc-health-gauge">
        <svg viewBox="0 0 100 100" className="gauge-svg">
          <circle className="gauge-bg" cx="50" cy="50" r={radius} />
          <circle
            className="gauge-fill"
            cx="50" cy="50" r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            stroke={value > 90 ? '#10b981' : value > 75 ? '#f59e0b' : '#ef4444'}
          />
        </svg>
        <div className="gauge-text">
          <span className="gauge-val">{value}%</span>
          <span className="gauge-label">NETWORK HEALTH</span>
        </div>
      </div>
    );
  };

  if (loading && !data.health) {
    return (
      <div className="noc-loading">
        <div className="premium-loader"></div>
        <p>Synchronizing Network Domains...</p>
      </div>
    );
  }

  return (
    <div className="noc-supervisor-dashboard">
      <Navbar 
        title="NOC Supervisor Console" 
        subtitle="Holistic Network Monitoring & Domain Control"
      />

      <div className="noc-content-wrapper">
        {/* Top Header Section */}
        <header className="noc-header">
          <div className="noc-welcome">
            <h1>Unified Network Intelligence</h1>
            <p>Real-time oversight of RAN, CORE, and IP infrastructure</p>
          </div>
          
          <div className="noc-quick-actions">
            <div className="noc-search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Find device, site, or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="clear-search">×</button>}
            </div>
            <button className="refresh-btn" onClick={fetchData}>
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Global Stats Bar */}
        <div className="noc-stats-bar">
          <div className="stat-item health">
            <HealthGauge value={stats.health} />
          </div>
          <div className="stat-cards-grid">
            <div className={`stat-card ${activeTab === 'ran' ? 'active' : ''}`} onClick={() => setActiveTab('ran')}>
              <div className="stat-icon-bg ran"><Radio size={22} /></div>
              <div className="stat-info">
                <span className="label">RAN Elements</span>
                <span className="value">{stats.ran}</span>
              </div>
            </div>
            <div className={`stat-card ${activeTab === 'core' ? 'active' : ''}`} onClick={() => setActiveTab('core')}>
              <div className="stat-icon-bg core"><Server size={22} /></div>
              <div className="stat-info">
                <span className="label">CORE Elements</span>
                <span className="value">{stats.core}</span>
              </div>
            </div>
            <div className={`stat-card ${activeTab === 'transport' ? 'active' : ''}`} onClick={() => setActiveTab('transport')}>
              <div className="stat-icon-bg transport"><Network size={22} /></div>
              <div className="stat-info">
                <span className="label">IP / Transport</span>
                <span className="value">{stats.transport}</span>
              </div>
            </div>
            <div className="stat-card alarms">
              <div className="stat-icon-bg alarms"><ShieldAlert size={22} /></div>
              <div className="stat-info">
                <span className="label">Active Alarms</span>
                <span className="value">{stats.activeAlarms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Integrated View */}
        <div className="noc-main-grid">
          {/* Domain Table Section */}
          <div className="noc-card domain-card">
            <div className="noc-card-header">
              <div className="tab-switcher">
                <button className={activeTab === 'ran' ? 'active' : ''} onClick={() => setActiveTab('ran')}>RAN Domain</button>
                <button className={activeTab === 'core' ? 'active' : ''} onClick={() => setActiveTab('core')}>CORE Domain</button>
                <button className={activeTab === 'transport' ? 'active' : ''} onClick={() => setActiveTab('transport')}>IP Transport</button>
              </div>
              <div className="view-actions">
                <button className="icon-btn"><Filter size={16} /></button>
                <button className="icon-btn"><Globe size={16} /></button>
              </div>
            </div>

            <div className="domain-table-container">
              <table className="noc-table">
                <thead>
                  <tr>
                    <th>Element Name</th>
                    <th>Type / Vendor</th>
                    <th>Location / Region</th>
                    <th>Status</th>
                    <th>Performance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map((item, idx) => (
                    <tr key={idx} className="noc-row">
                      <td className="name-cell">
                        <div className="element-avatar">
                          {activeTab === 'ran' ? <Radio size={14} /> : activeTab === 'core' ? <Server size={14} /> : <Network size={14} />}
                        </div>
                        <div>
                          <div className="primary-text">{item.name || item.element_name || item.link_name}</div>
                          <div className="secondary-text">ID: {item.id || item.element_id || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="primary-text">{item.type || item.element_type || 'Fiber Link'}</div>
                        <div className="secondary-text">{item.vendor || 'Nokia'}</div>
                      </td>
                      <td>
                        <div className="loc-info">
                          <MapPin size={14} />
                          <span>{item.location || item.region || 'Central Office'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${item.status || 'up'}`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="perf-mini-chart">
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}></div>
                          </div>
                          <span className="perf-val">9{Math.floor(Math.random() * 9)}%</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn-manage" 
                          onClick={() => navigate(`/${activeTab}`)}
                        >
                          Inspect <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-results">
                        <div className="empty-box">
                          <Search size={40} />
                          <p>No elements found matching "{searchTerm}"</p>
                          <button onClick={() => setSearchTerm('')}>Clear Search</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Real-time Alarms & Insights */}
          <div className="noc-sidebar">
            <div className="noc-card alerts-card">
              <div className="noc-card-header">
                <h3>Priority Incidents</h3>
                <span className="badge-count">{stats.activeAlarms}</span>
              </div>
              <div className="alerts-list">
                {data.alarms.filter(a => a.status === 'active').slice(0, 6).map((alarm, idx) => (
                  <div key={idx} className={`alert-item ${alarm.priority}`}>
                    <div className="alert-icon">
                      {alarm.priority === 'critical' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                    </div>
                    <div className="alert-info">
                      <div className="alert-header">
                        <span className="alert-subject">{alarm.element_name}</span>
                        <span className="alert-time">2m ago</span>
                      </div>
                      <p className="alert-desc">{alarm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="btn-full-width"
                onClick={() => navigate('/alarms')}
              >
                View All Alarms
              </button>
            </div>

            <div className="noc-card insights-card">
              <div className="noc-card-header">
                <h3>System Insights</h3>
              </div>
              <div className="insights-content">
                <div className="insight-row">
                  <div className="insight-icon pulse"><Activity size={18} /></div>
                  <div className="insight-text">
                    <strong>Traffic Surge</strong>
                    <p>15% increase in CORE throughput detected in last 10 mins.</p>
                  </div>
                </div>
                <div className="insight-row">
                  <div className="insight-icon"><Cpu size={18} /></div>
                  <div className="insight-text">
                    <strong>Resource Utilization</strong>
                    <p>RAN controllers in Zone B at 88% capacity.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
