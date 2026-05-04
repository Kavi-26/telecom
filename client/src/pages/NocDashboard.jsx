import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert, AlertTriangle, Info,
  Activity, Bell, Mail, RefreshCw,
  CheckCircle2, Clock, Search,
  ArrowUpRight, ArrowDownRight, Zap,
  Radio, HardDrive, Network, LayoutDashboard,
  MapPin, ExternalLink, Download, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import { generateBTSData, generateAlarms as generateRanAlarms } from '../utils/ranMockData';
import { generateCoreElements, generateCoreAlarms } from '../utils/coreMockData';
import { generateTransportLinks, generateTransportAlarms } from '../utils/transportMockData';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './NocDashboard.css';

export default function NocDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({
    ran: [],
    core: [],
    transport: [],
    alarms: []
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Attempt to fetch real data, fallback to mock if API fails
      let ranData, coreData, transportData, alarmsData;

      try {
        const res = await api.get('/ran/bts');
        ranData = res.data.map(b => ({
          ...b,
          type: b.technology || 'BTS',
          vendor: b.vendor || 'Generic',
          utilization: b.capacity_utilization || b.utilization || 45
        }));
      } catch { ranData = generateBTSData(); }

      try {
        const res = await api.get('/core/elements');
        coreData = res.data.map(e => ({
          ...e,
          type: e.type || 'Core Node',
          vendor: e.vendor || 'Generic',
          utilization: e.utilization || Math.floor(Math.random() * 40) + 20
        }));
      } catch { coreData = generateCoreElements(); }

      try {
        const res = await api.get('/transport/links');
        transportData = res.data.map(t => ({
          ...t,
          name: `${t.node_a} - ${t.node_b}`,
          type: t.link_type || 'Link',
          vendor: t.vendor || 'Generic',
          utilization: t.bandwidth_total ? Math.round((t.bandwidth_used / t.bandwidth_total) * 100) : 45
        }));
      } catch { transportData = generateTransportLinks(); }

      try {
        const res = await api.get('/alarms');
        alarmsData = res.data.map(a => ({
          id: a.id,
          domain: a.domain,
          name: a.element_name,
          element: a.element_name,
          bts: a.element_name,
          severity: a.priority,
          message: a.description,
          type: a.description?.toLowerCase().includes('down') ? 'Outage' : a.description?.toLowerCase().includes('capacity') ? 'Congestion' : 'Alert',
          time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: a.status
        }));
      } catch {
        alarmsData = [
          ...generateRanAlarms().map(a => ({ ...a, domain: 'RAN' })),
          ...generateCoreAlarms().map(a => ({ ...a, domain: 'CORE' })),
          ...generateTransportAlarms().map(a => ({ ...a, domain: 'Transport' }))
        ];
      }

      setData({
        ran: ranData,
        core: coreData,
        transport: transportData,
        alarms: alarmsData
      });
    } catch (err) {
      console.error('NOC Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/alarms/${id}/${action}`);
      showToast(`Alarm ${id} ${action === 'acknowledge' ? 'acknowledged' : 'resolved'} successfully`, 'success');
      fetchData();
    } catch (err) {
      console.error(`Error ${action}ing alarm:`, err);
      showToast(`Failed to ${action} alarm`, 'error');
    }
  };

  const handleExport = (type) => {
    const columns = [
      { header: 'Domain', dataKey: 'domain' },
      { header: 'Element', dataKey: 'element' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Severity', dataKey: 'severity' },
      { header: 'Message', dataKey: 'message' },
      { header: 'Time', dataKey: 'time' }
    ];

    const exportData = data.alarms.map(a => ({
      domain: a.domain || 'N/A',
      element: a.element || a.bts || a.link || a.name || 'N/A',
      type: a.type,
      severity: a.severity,
      message: a.message,
      time: a.time
    }));

    if (type === 'excel') {
      exportToExcel(exportData, `NOC_Incidents_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(exportData, columns, 'NOC Active Incidents Report', `NOC_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const results = [];

    // Safe search RAN
    (data.ran || []).forEach(b => {
      const name = b.name || '';
      const location = (b.lat && b.lng) ? `${Number(b.lat).toFixed(3)}, ${Number(b.lng).toFixed(3)}` : '';
      if (name.toLowerCase().includes(query) || location.includes(query)) {
        results.push({ id: b.id, name: name, category: 'Device', domain: 'RAN', icon: <Radio size={14} />, path: '/ran', desc: location });
      }
    });

    // Safe search CORE
    (data.core || []).forEach(e => {
      const name = e.name || '';
      const location = e.lat ? `${Number(e.lat).toFixed(3)}, ${Number(e.lng).toFixed(3)}` : '';
      if (name.toLowerCase().includes(query) || location.includes(query)) {
        results.push({ id: e.id, name: name, category: 'Element', domain: 'CORE', icon: <HardDrive size={14} />, path: '/core', desc: location });
      }
    });

    // Safe search Alarms
    (data.alarms || []).forEach(a => {
      const name = a.bts || a.element || a.link || 'System';
      const msg = a.message || '';
      if (name.toLowerCase().includes(query) || msg.toLowerCase().includes(query)) {
        results.push({ id: a.id, name: name, category: 'Incident', domain: a.domain || 'N/A', icon: <ShieldAlert size={14} />, desc: msg, path: '#' });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, data]);

  const healthScore = useMemo(() => {
    const alarms = data.alarms || [];
    const critical = alarms.filter(a => a.severity === 'critical').length;
    const major = alarms.filter(a => a.severity === 'major').length;
    return Math.max(0, 100 - (critical * 15) - (major * 5));
  }, [data.alarms]);

  const renderOverview = () => (
    <div className="dashboard-content">
      {/* Global KPI Summary Bar */}
      <div className="global-kpi-bar">
        <div className="kpi-item">
          <div className="kpi-icon ran"><Radio size={16} /></div>
          <div className="kpi-data">
            <span className="kpi-label">RAN Availability</span>
            <span className="kpi-value">99.82%</span>
          </div>
        </div>
        <div className="kpi-divider" />
        <div className="kpi-item">
          <div className="kpi-icon core"><HardDrive size={16} /></div>
          <div className="kpi-data">
            <span className="kpi-label">Core Stability</span>
            <span className="kpi-value">98.45%</span>
          </div>
        </div>
        <div className="kpi-divider" />
        <div className="kpi-item">
          <div className="kpi-icon transport"><Network size={16} /></div>
          <div className="kpi-data">
            <span className="kpi-label">IP Throughput</span>
            <span className="kpi-value">1.2 Tbps</span>
          </div>
        </div>
        <div className="kpi-divider" />
        <div className="kpi-item">
          <div className="kpi-icon alert"><ShieldAlert size={16} /></div>
          <div className="kpi-data">
            <span className="kpi-label">MTTR Avg.</span>
            <span className="kpi-value">14.2m</span>
          </div>
        </div>
      </div>

      <div className="noc-overview-grid">
        <div className="health-hero">
          <div className="health-gauge">
            <svg viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <circle className="gauge-bg" cx="50" cy="50" r="45" />
              <circle
                className="gauge-val"
                cx="50" cy="50" r="45"
                strokeDasharray={`${healthScore * 2.82} 282`}
                stroke="url(#gaugeGradient)"
              />
            </svg>
            <div className="gauge-text">
              <span className="value">{healthScore}%</span>
              <span className="label">Overall Health</span>
            </div>
          </div>
          <div className="health-details">
            <div className="status-badge-premium">
              <Zap size={14} className="animate-pulse" />
              SYSTEM {healthScore > 90 ? 'OPTIMAL' : healthScore > 70 ? 'DEGRADED' : 'CRITICAL'}
            </div>
            <h2>Holistic Network Visibility</h2>
            <p>
              Consolidated view of <strong>{(data.ran?.length || 0) + (data.core?.length || 0) + (data.transport?.length || 0)}</strong> managed elements.
              Active incidents are currently affecting {((data.alarms?.length || 0) / Math.max(1, (data.ran?.length || 0) + (data.core?.length || 0) + (data.transport?.length || 0)) * 100).toFixed(1)}% of infrastructure.
            </p>
            <div className="domain-health-bars">
              <div className="health-bar-item">
                <div className="label"><span>RAN</span><span>98%</span></div>
                <div className="bar"><div className="fill" style={{ width: '98%', background: '#10b981' }} /></div>
              </div>
              <div className="health-bar-item">
                <div className="label"><span>CORE</span><span>85%</span></div>
                <div className="bar"><div className="fill" style={{ width: '85%', background: '#f59e0b' }} /></div>
              </div>
              <div className="health-bar-item">
                <div className="label"><span>IP</span><span>100%</span></div>
                <div className="bar"><div className="fill" style={{ width: '100%', background: '#10b981' }} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="live-event-stream">
          <div className="stream-header">
            <h3><Activity size={16} /> Live Event Stream</h3>
            <span className="live-dot" />
          </div>
          <div className="stream-content">
            {(data.alarms || []).slice(0, 5).map((a, i) => (
              <div key={i} className="stream-item">
                <div className={`stream-indicator ${a.severity}`} />
                <div className="stream-info">
                  <span className="stream-time">{a.time}</span>
                  <span className="stream-msg">{a.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="domain-summary-cards">
        <div className="domain-card premium-ran">
          <div className="card-bg-icon"><Radio size={80} /></div>
          <h3>Radio Access Network</h3>
          <div className="big-stat">{data.ran.length}</div>
          <p>BTS Sites Online</p>
          <div className="mini-graph">
            {[40, 65, 50, 80, 70, 90].map((h, i) => <div key={i} style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <div className="domain-card premium-core">
          <div className="card-bg-icon"><HardDrive size={80} /></div>
          <h3>Core Elements</h3>
          <div className="big-stat">{data.core.length}</div>
          <p>IMS/EPC Clusters</p>
          <div className="mini-graph">
            {[60, 45, 75, 55, 85, 65].map((h, i) => <div key={i} style={{ height: `${h}%` }} />)}
          </div>
        </div>
        <div className="domain-card premium-ip">
          <div className="card-bg-icon"><Network size={80} /></div>
          <h3>IP Transport</h3>
          <div className="big-stat">{data.transport.length}</div>
          <p>Active Links</p>
          <div className="mini-graph">
            {[30, 55, 45, 65, 50, 70].map((h, i) => <div key={i} style={{ height: `${h}%` }} />)}
          </div>
        </div>
      </div>

      <div className="noc-panel mt-4">
        <div className="panel-header">
          <h2><Bell size={18} /> Critical Incident Feed</h2>
          <div className="card-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}><Download size={14} /> Excel</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}><Download size={14} /> PDF</button>
          </div>
        </div>
        <div className="noc-table-container">
          <table className="noc-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Source Element</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.alarms?.slice(0, 10).map(alarm => (
                <tr key={alarm.id} className="alarm-row">
                  <td>
                    <span className={`domain-chip ${alarm.domain?.toLowerCase() || 'ran'}`}>
                      {alarm.domain?.toLowerCase() === 'ran' ? <Radio size={10} style={{ marginRight: '6px' }} /> :
                        alarm.domain?.toLowerCase() === 'core' ? <HardDrive size={10} style={{ marginRight: '6px' }} /> :
                          <Network size={10} style={{ marginRight: '6px' }} />}
                      {alarm.domain || 'RAN'}
                    </span>
                  </td>
                  <td className="font-bold">
                    {alarm.bts || alarm.element || alarm.link || alarm.name || 'System'}
                  </td>
                  <td>{alarm.type}</td>
                  <td>
                    <span className={`badge badge-${alarm.severity}`}>
                      {alarm.severity}
                    </span>
                  </td>
                  <td className="text-dim">{alarm.time}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="noc-icon-btn" title="Acknowledge" onClick={() => handleAction(alarm.id, 'acknowledge')}><CheckCircle2 size={14} /></button>
                      <button className="noc-icon-btn" title="View Details"><ExternalLink size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDomainTab = (domain) => {
    const domainData = domain === 'ran' ? data.ran : domain === 'core' ? data.core : data.transport;
    const domainAlarms = (data.alarms || []).filter(a => (a.domain || 'RAN').toLowerCase() === domain);

    const domainStats = [
      { label: 'Total Elements', value: domainData.length, icon: domain === 'ran' ? <Radio size={20} /> : domain === 'core' ? <HardDrive size={20} /> : <Network size={20} />, trend: 'Healthy', trendUp: true, color: `var(--domain-${domain === 'ran' ? 'ran' : domain === 'core' ? 'core' : 'ip'})` },
      { label: 'SLA Performance', value: '98.5%', icon: <Zap size={20} />, trend: '+0.2%', trendUp: true, color: 'var(--brand-primary)' },
      { label: 'Active Incidents', value: domainAlarms.length, icon: <AlertTriangle size={20} />, trend: `${domainAlarms.filter(a => a.severity === 'critical').length} Critical`, trendUp: false, color: domainAlarms.length > 0 ? 'var(--status-down)' : 'var(--status-up)' },
      { label: 'Avg Latency', value: domain === 'ran' ? '12ms' : domain === 'core' ? '4.2ms' : '24ms', icon: <Clock size={20} />, trend: '-2.1', trendUp: true, color: 'var(--brand-secondary)' },
    ];

    return (
      <div className="dashboard-content">
        <div className="grid grid-4" style={{ marginBottom: '24px' }}>
          {domainStats.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ '--accent-color': stat.color }}>
              <div className="stat-header">
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trend}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-icon" style={{ '--icon-bg': `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            </div>
          ))}
        </div>

        <div className="noc-panel mt-4">
          <div className="panel-header">
            <h2>{domain === 'ran' ? <Radio size={18} /> : domain === 'core' ? <HardDrive size={18} /> : <Network size={18} />} {domain.toUpperCase()} Inventory & Operational Status</h2>
            <div className="card-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}><Download size={14} /> Export</button>
            </div>
          </div>
          <div className="noc-table-container">
            <table className="noc-table">
              <thead>
                <tr>
                  <th>Element Name</th>
                  <th>Type / Platform</th>
                  <th>Status</th>
                  <th>Capacity / Load</th>
                  <th>Location / Identity</th>
                </tr>
              </thead>
              <tbody>
                {domainData.map((item, idx) => (
                  <tr key={idx}>
                    <td className="font-bold">{item.name || item.id}</td>
                    <td><span className="domain-chip">{item.type}</span> · {item.vendor || 'N/A'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${item.status === 'up' || item.status === 'active' ? 'active' : 'down'}`}></span>
                        <span className={`status-text ${item.status === 'up' || item.status === 'active' ? 'active' : 'down'}`}>{item.status}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar" style={{ width: '80px', height: '6px' }}>
                          <div className={`progress-fill ${item.utilization > 80 ? 'high' : 'low'}`} style={{ width: `${item.utilization || 45}%` }}></div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{item.utilization || 45}%</span>
                      </div>
                    </td>
                    <td className="text-dim">
                      {item.lat ? `${Number(item.lat).toFixed(3)}, ${Number(item.lng).toFixed(3)}` : '172.24.12.' + (100 + idx)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading && data.ran.length === 0) {
    return (
      <div className="noc-dashboard-modern items-center justify-center">
        <RefreshCw className="spin text-brand" size={48} />
        <p className="mt-4 text-dim">Synchronizing Global Network State...</p>
      </div>
    );
  }

  return (
    <div className="noc-dashboard-modern">
      <Navbar
        title="NOC Supervisor Control"
        subtitle="Unified network monitoring and incident response"
        onRefresh={fetchData}
      />

      <div className="noc-header">
        <div className="noc-actions" style={{ justifyContent: 'space-between' }}>
          <div className="search-container" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search BTS, Core Nodes, IP Routers or Alarms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && <X size={16} className="cursor-pointer" onClick={() => setSearchQuery('')} />}
            </div>

            {searchQuery && filteredResults.length > 0 && (
              <div className="search-results">
                {filteredResults.map((result, i) => (
                  <div key={i} className="search-item" onClick={() => { setSearchQuery(''); result.path !== '#' && navigate(result.path); }}>
                    <div className="item-icon-wrapper">{result.icon}</div>
                    <div className="item-content">
                      <span className="item-name">{result.name}</span>
                      <div className="item-meta">
                        <span className="badge-mini">{result.category}</span>
                        <span>{result.domain}</span>
                      </div>
                      {result.desc && <p className="item-desc">{result.desc}</p>}
                    </div>
                    <ExternalLink size={14} className="jump-icon" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="refresh-btn" onClick={fetchData}>
            <RefreshCw size={18} /> Sync Now
          </button>
        </div>

        <div className="dashboard-tabs">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button className={activeTab === 'ran' ? 'active' : ''} onClick={() => setActiveTab('ran')}>
            <Radio size={18} /> Radio (RAN)
          </button>
          <button className={activeTab === 'core' ? 'active' : ''} onClick={() => setActiveTab('core')}>
            <HardDrive size={18} /> Core (EPC)
          </button>
          <button className={activeTab === 'transport' ? 'active' : ''} onClick={() => setActiveTab('transport')}>
            <Network size={18} /> IP Transport
          </button>
        </div>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab !== 'overview' && renderDomainTab(activeTab)}

      {toast && (
        <div className={`notification-toast ${toast.type}`}>
          <Info size={18} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
