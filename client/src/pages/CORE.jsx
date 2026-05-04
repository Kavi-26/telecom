import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  ShieldCheck,
  Zap,
  AlertOctagon,
  Cpu,
  Database,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  Share2,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

import Navbar from '../components/common/Navbar';
import { generateCoreElements, generateCorePerformance, generateCoreAlarms } from '../utils/coreMockData';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './CORE.css';

export default function COREPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const API_BASE = 'http://localhost:5000/api';

        const [coreRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/core`, config)
        ]);

        if (coreRes.status === 'fulfilled' && coreRes.value.data.length > 0) {
          setElements(coreRes.value.data);
        } else {
          setElements(generateCoreElements());
        }

        setPerfData(generateCorePerformance(10));
        setAlarms(generateCoreAlarms());
      } catch (err) {
        console.error('Error fetching CORE data:', err);
        setElements(generateCoreElements());
        setPerfData(generateCorePerformance(10));
        setAlarms(generateCoreAlarms());
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time metric simulation
    const interval = setInterval(() => {
      setElements(prev => prev.map(el => {
        if (el.status === 'down') {
          return { ...el, load: 0, latency: 0 };
        }

        const loadChange = (Math.random() * 4 - 2);
        const latencyChange = (Math.random() * 2 - 1);

        return {
          ...el,
          load: Math.min(100, Math.max(0, (el.load || 45) + loadChange)),
          latency: Math.min(20, Math.max(1, (el.latency || 6) + latencyChange))
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  
  const handleExport = (type) => {
    const columns = [
      { header: 'Element Name', dataKey: 'name' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Vendor', dataKey: 'vendor' }
    ];

    if (type === 'excel') {
      exportToExcel(filteredElements, `CORE_Elements_Inventory_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(filteredElements, columns, 'CORE Network Elements Report', `CORE_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const filteredElements = useMemo(() => {
    return elements.filter(el =>
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [elements, searchTerm]);

  const getLoadColor = (val) => {
    if (val > 85) return '#ef4444'; // Red
    if (val > 70) return '#f59e0b'; // Amber
    if (val > 50) return '#facc15'; // Yellow
    return '#22c55e'; // Green
  };

  const stats = useMemo(() => [
    { label: 'Core Elements', value: elements.length, icon: <Server size={20} />, trend: 'Steady', trendUp: true, color: 'var(--domain-core)' },
    { label: 'Avg Latency', value: '4.2 ms', icon: <Clock size={20} />, trend: '-0.5', trendUp: true, color: 'var(--brand-primary)' },
    { label: 'Attach Success', value: '99.4%', icon: <CheckCircle2 size={20} />, trend: '+0.2%', trendUp: true, color: 'var(--status-up)' },
    { label: 'Network Load', value: '45.2%', icon: <Zap size={20} />, trend: '+5.1%', trendUp: false, color: 'var(--brand-secondary)' },
  ], [elements]);


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {p.value.toFixed(2)} {p.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && elements.length === 0) {
    return (
      <div className="loading-center">
        <div className="spinner"></div>
        <p>Initializing CORE Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="core-dashboard-modern">
      <Navbar 
        title="CORE Network" 
        subtitle="Centralized monitoring of EPC and routing infrastructure" 
      />

      <div className="page-content">
        <div className="grid grid-4" style={{ marginBottom: '24px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ '--accent-color': stat.color }}>
              <div className="stat-header">
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-icon" style={{ '--icon-bg': `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Performance Trends Section */}
        <div className="grid grid-2" style={{ marginBottom: '24px' }}>
          {/* Latency & Success Rate */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Latency & Attach Success Rate</div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => val.split(' ')[0]} interval={6} />
                  <YAxis yAxisId="left" stroke="var(--brand-primary)" fontSize={10} unit="ms" domain={[0, 15]} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--brand-accent)" fontSize={10} unit="%" domain={[90, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency" unit="ms" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="attachSuccessRate" name="Attach Success" unit="%" stroke="var(--brand-accent)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="detachSuccessRate" name="Detach Success" unit="%" stroke="var(--brand-secondary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Throughput Trend */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Network Throughput (Gbps)</div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-secondary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--brand-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickFormatter={(val) => val.split(' ')[0]} interval={6} />
                  <YAxis stroke="var(--text-muted)" fontSize={10} unit="G" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="throughput" name="Throughput" unit="Gbps" stroke="var(--brand-secondary)" fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="main-grid" style={{ marginBottom: '24px', minHeight: '500px' }}>
          {/* Elements Visualization Section */}
          <div className="card elements-section" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} />
                Core Elements Status
              </div>
              <div className="status-legend">
                <span><span className="status-dot active" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4 }}></span> Active</span>
                <span><span className="status-dot idle" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4, background: 'var(--status-idle)', boxShadow: 'none', animation: 'none' }}></span> Idle</span>
                <span><span className="status-dot down" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4, background: 'var(--status-down)', boxShadow: 'none', animation: 'none' }}></span> Down</span>
              </div>
            </div>
            <div className="elements-grid" style={{ flex: 1, overflowY: 'auto' }}>
              {elements.map(el => (
                <div key={el.id} className={`element-node ${el.status}`}>
                  <div className="node-icon">
                    {el.type === 'HLR' ? <Database size={20} /> : el.type === 'Gateway' ? <Zap size={20} /> : <Server size={20} />}
                  </div>
                  <div className="node-info">
                    <div className="node-name">{el.name}</div>
                    <div className="node-type">{el.type}</div>
                  </div>
                  <div className={`node-status-badge ${el.status}`}>{el.status.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Alarms Feed */}
          <div className="card alarms-section" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} />
                Critical Core Alarms
              </div>
            </div>
            <div className="alarm-list" style={{ flex: 1, overflowY: 'auto' }}>
              {alarms.map(alarm => (
                <div key={alarm.id} className={`alarm-item ${alarm.severity}`}>
                  <div className="alarm-icon">
                    <AlertOctagon size={16} />
                  </div>
                  <div className="alarm-content">
                    <div className="alarm-header">
                      <span className="alarm-bts">{alarm.element}</span>
                      <span className="alarm-time">{alarm.time}</span>
                    </div>
                    <div className="alarm-type">{alarm.type}</div>
                    <div className="alarm-msg">{alarm.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Inventory Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Core Elements Inventory & KPIs</div>
            <div className="card-actions">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search elements..."
                  className="form-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}><Download size={14} /> Excel</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}><Download size={14} /> PDF</button>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Element Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Vendor</th>
                  <th>Latency</th>
                  <th>Success Rate</th>
                  <th>Load</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredElements.map(el => (
                  <tr key={el.id}>
                    <td style={{ fontWeight: 600 }}>{el.name}</td>
                    <td><span className="domain-pill core" style={{ fontSize: '10px' }}>{el.type}</span></td>
                    <td>
                      <span className={`badge ${el.status === 'active' ? 'badge-up' : el.status === 'idle' ? 'badge-idle' : 'badge-down'}`}>
                        {el.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>{el.vendor}</td>
                    <td style={{ 
                      color: el.status === 'down' ? '#ef4444' : el.latency > 15 ? '#ef4444' : el.latency > 10 ? '#f59e0b' : '#22c55e',
                      fontWeight: 700 
                    }}>
                      {el.status === 'down' ? 'OFFLINE' : `${Math.round(el.latency)} ms`}
                    </td>
                    <td style={{ color: el.status === 'down' ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                      {el.status === 'down' ? '0%' : '99.9%'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '60px', background: 'var(--bg-secondary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${el.load || 45}%`,
                              height: '100%',
                              background: getLoadColor(el.load || 45),
                              transition: 'all 0.5s ease'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '35px' }}>
                          {Math.round(el.load || 45)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedElement(el)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CORE Element Details Modal */}
      {selectedElement && (
        <div className="modal-overlay" onClick={() => setSelectedElement(null)}>
          <div className="modal-content bts-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--domain-core)' }}>
                  <Server size={24} />
                </div>
                <div>
                  <h2 className="modal-title">{selectedElement.name}</h2>
                  <p className="modal-subtitle">Type: {selectedElement.type} · Vendor: {selectedElement.vendor}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedElement(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className={`detail-value ${selectedElement.status === 'active' ? 'text-healthy' : 'text-critical'}`}>
                    {selectedElement.status?.toUpperCase()}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">IP Address</div>
                  <div className="detail-value">172.16.10.{Math.floor(Math.random() * 255)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">CPU Load</div>
                  <div className="detail-value">28%</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Memory Usage</div>
                  <div className="detail-value">4.2 GB / 16 GB</div>
                </div>
              </div>

              <div className="metrics-summary-grid">
                <div className="metric-box">
                  <div className="metric-label">Attach Success</div>
                  <div className="metric-value">99.9%</div>
                  <div className="metric-status good">Optimal</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Avg Latency</div>
                  <div className="metric-value">6 ms</div>
                  <div className="metric-status good">Low</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Active Sessions</div>
                  <div className="metric-value">1,450</div>
                  <div className="metric-status healthy">Normal</div>
                </div>
              </div>

              <div className="modal-chart-section">
                <h3 className="section-title">Throughput Trend (Gbps)</h3>
                <div style={{ height: '200px', width: '100%', marginTop: '12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perfData.slice(-12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="throughput" stroke="var(--domain-core)" fill="var(--domain-core)" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
