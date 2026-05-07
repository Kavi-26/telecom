import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { 
  Network, 
  Activity, 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Filter,
  Download,
  Link as LinkIcon,
  Wifi,
  CloudLightning,
  CheckCircle2
} from 'lucide-react';
import { 
  MapContainer, 
  TileLayer, 
  Polyline, 
  Popup, 
  CircleMarker,
  LayersControl 
} from 'react-leaflet';
import { useTheme } from '../contexts/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
import { 
  generateTransportNodes, 
  generateTransportLinks, 
  generateTransportPerformance, 
  generateTransportAlarms 
} from '../utils/transportMockData';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './Transport.css';

export default function TransportPage() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);
  const { theme } = useTheme();
  const [links, setLinks] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const API_BASE = 'http://localhost:5000/api';
        
        const [transportRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/transport/links`, config)
        ]);

        if (transportRes.status === 'fulfilled' && transportRes.value.data.length > 0) {
          setLinks(transportRes.value.data);
          setNodes(generateTransportNodes());
        } else {
          setNodes(generateTransportNodes());
          setLinks(generateTransportLinks());
        }

        setPerfData(generateTransportPerformance(10));
        setAlarms(generateTransportAlarms());
      } catch (err) {
        console.error('Error fetching Transport data:', err);
        setNodes(generateTransportNodes());
        setLinks(generateTransportLinks());
        setPerfData(generateTransportPerformance(10));
        setAlarms(generateTransportAlarms());
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Simulate real-time utilization fluctuations
    const interval = setInterval(() => {
      setLinks(prevLinks => prevLinks.map(link => {
        if (link.status === 'down') return link;
        const fluctuation = (Math.random() - 0.5) * 2; // +/- 1%
        const newUtil = Math.min(Math.max(link.utilization + fluctuation, 5), 98);
        return { ...link, utilization: parseFloat(newUtil.toFixed(1)) };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = (type) => {
    const columns = [
      { header: 'Source', dataKey: 'from_name' },
      { header: 'Destination', dataKey: 'to_name' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Bandwidth (Gbps)', dataKey: 'bandwidth' },
      { header: 'Utilization (%)', dataKey: 'utilization' }
    ];

    // Flatten data for export
    const exportData = links.map(l => ({
      ...l,
      from_name: l.from.name,
      to_name: l.to.name
    }));

    if (type === 'excel') {
      exportToExcel(exportData, `Transport_Links_Inventory_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(exportData, columns, 'IP Transport Links Report', `Transport_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };


  const stats = useMemo(() => [
    { label: 'Network Backbone', value: '100 Gbps', icon: <Network size={20} />, trend: 'Stable', trendUp: true, color: 'var(--domain-ip)' },
    { label: 'Active Links', value: links.filter(l => l.status === 'up').length, icon: <LinkIcon size={20} />, trend: `${links.length} total`, trendUp: true, color: 'var(--status-up)' },
    { label: 'Avg Latency', value: '24.5 ms', icon: <Activity size={20} />, trend: '-2.1', trendUp: true, color: 'var(--brand-primary)' },
    { label: 'Packet Loss', value: '0.02%', icon: <AlertTriangle size={20} />, trend: 'Low', trendUp: true, color: 'var(--status-idle)' },
    { label: 'Traffic Load', value: '412 Gbps', icon: <Zap size={20} />, trend: '+8%', trendUp: true, color: 'var(--brand-secondary)' },
    { label: 'Link Faults', value: links.filter(l => l.status === 'down').length, icon: <CloudLightning size={20} />, trend: 'Critical', trendUp: false, color: 'var(--status-down)' },
  ], [links]);

  const [notification, setNotification] = useState(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRerouteTraffic = () => {
    setLoading(true);
    // Simulate SDN traffic re-routing and link recovery
    setTimeout(() => {
      setLinks(prev => prev.map(l => ({ ...l, status: 'up', utilization: Math.min(l.utilization, 65) })));
      setAlarms(prev => prev.filter(a => a.severity !== 'critical'));
      setLoading(false);
      showToast('Traffic Engineering Successful: Links restored and load balanced');
    }, 1800);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip" style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(10px)',
          color: 'var(--text-primary)'
        }}>
          <p className="label" style={{ fontWeight: 800, marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
              <span>{p.name}:</span>
              <span>{p.value.toFixed(2)} {p.unit || ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getLinkColor = (link) => {
    if (link.status === 'down') return '#ef4444'; // Red
    if (link.utilization > 85) return '#f59e0b'; // Amber
    if (link.utilization > 70) return '#facc15'; // Yellow
    return '#22c55e'; // Green
  };

  const getNodeColor = (node) => {
    switch (node.type) {
      case 'backbone': return 'var(--domain-ip)';
      case 'metro': return 'var(--brand-secondary)';
      case 'access': return 'var(--brand-accent)';
      default: return 'var(--brand-primary)';
    }
  };


  if (loading && nodes.length === 0) {
    return (
      <div className="loading-center">
        <div className="spinner"></div>
        <p>Initializing IP Transport Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="transport-dashboard" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar title="IP Transport Monitoring" subtitle="Network Backbone & Access Topology Dashboard" />
      
      <div className="page-content">
        {/* Link Failure & High Utilization Alert Banner */}
        {links.some(l => l.status === 'down' || l.utilization > 90) && (
          <div className="alert-banner critical">
            <CloudLightning className="animate-pulse" />
            <div className="alert-info">
              <div className="alert-title">CRITICAL NETWORK ALERT</div>
              <div className="alert-desc">
                {links.filter(l => l.status === 'down').length > 0 
                  ? `${links.filter(l => l.status === 'down').length} Link Failure(s) detected. Backbone stability compromised.` 
                  : `High link utilization detected on Backbone segments (>90%). Latency impact imminent.`
                }
              </div>
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ background: 'var(--status-down)', border: 'none', color: '#fff' }}
              onClick={handleRerouteTraffic}
            >
              Re-route Traffic
            </button>
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-6" style={{ marginBottom: '24px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card" style={{ '--accent-color': stat.color }}>
              <div className="stat-header">
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trend}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-icon" style={{ '--icon-bg': `${stat.color}15` }}>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Bandwidth & Latency Trends */}
        <div className="grid grid-2" style={{ marginBottom: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Backbone Traffic Trend (Gbps)</div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--domain-ip)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--domain-ip)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--text-secondary)" 
                    fontSize={12} 
                    tickFormatter={(val) => val.split(' ')[0]} 
                    interval={6} 
                    tick={{ fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)" 
                    fontSize={12} 
                    unit="G" 
                    tick={{ fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="traffic" name="Traffic" unit="Gbps" stroke="var(--domain-ip)" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Latency & Packet Loss (%)</div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--text-secondary)" 
                    fontSize={12} 
                    tickFormatter={(val) => val.split(' ')[0]} 
                    interval={6} 
                    tick={{ fontWeight: 600 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="var(--brand-primary)" 
                    fontSize={12} 
                    unit="ms" 
                    tick={{ fontWeight: 600 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="var(--brand-accent)" 
                    fontSize={12} 
                    unit="%" 
                    tick={{ fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency" unit="ms" stroke="var(--brand-primary)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="packetLoss" name="Packet Loss" unit="%" stroke="var(--brand-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="main-grid" style={{ marginBottom: '24px', minHeight: '500px' }}>
          {/* Topology Map Section */}
          <div className="card topology-section" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid var(--border)' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={18} />
                IP Backbone Topology
              </div>
              <div className="map-legend">
                <span><span className="status-dot up" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4 }}></span> Normal</span>
                <span><span className="status-dot degraded" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4, background: 'var(--status-degraded)' }}></span> Congested</span>
                <span><span className="status-dot down" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4, background: 'var(--status-down)' }}></span> Failure</span>
              </div>
            </div>
            <div style={{ flex: 1, zIndex: 1, minHeight: '400px' }}>
              <MapContainer 
                key={theme}
                center={[19.0760, 72.8777]} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                attributionControl={false}
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked={theme === 'light'} name="Street View">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer checked={theme === 'dark'} name="Satellite">
                    <TileLayer
                      attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                
                {/* Draw Links */}
                {links.map(link => (
                  <Polyline 
                    key={link.id}
                    positions={[
                      [link.from.lat, link.from.lng],
                      [link.to.lat, link.to.lng]
                    ]}
                    pathOptions={{ 
                      color: getLinkColor(link), 
                      weight: 3 + (link.bandwidth / 20),
                      opacity: 0.7 
                    }}
                  >
                    <Popup>
                      <div className="link-popup">
                        <strong>Link: {link.from.name} ↔ {link.to.name}</strong>
                        <div className="popup-grid">
                          <span>Status:</span> <span className={`badge ${link.status === 'up' ? 'badge-up' : 'badge-down'}`}>{link.status.toUpperCase()}</span>
                          <span>Bandwidth:</span> <span>{link.bandwidth} Gbps</span>
                          <span>Utilization:</span> <span style={{ color: getLinkColor(link) }}>{link.utilization}%</span>
                        </div>
                      </div>
                    </Popup>
                  </Polyline>
                ))}
 
                {/* Draw Nodes */}
                {nodes.map(node => (
                  <CircleMarker 
                    key={node.id}
                    center={[node.lat, node.lng]}
                    radius={node.type === 'backbone' ? 8 : 5}
                    pathOptions={{
                      color: getNodeColor(node),
                      fillColor: 'var(--bg-card)',
                      fillOpacity: 1,
                      weight: 3
                    }}
                  >
                    <Popup>
                      <div className="node-popup">
                        <strong>{node.name}</strong>
                        <div>Type: {node.type.toUpperCase()}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Transport Alarms Feed */}
          <div className="card alarms-section" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} />
                Network Path Alerts
              </div>
            </div>
            <div className="alarm-list" style={{ flex: 1, overflowY: 'auto' }}>
              {alarms.map(alarm => (
                <div key={alarm.id} className={`alarm-item ${alarm.severity}`}>
                  <div className="alarm-icon">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="alarm-content">
                    <div className="alarm-header">
                      <span className="alarm-bts">{alarm.link}</span>
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

        {/* Link Inventory Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Link Inventory & Utilization</div>
            <div className="card-actions">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search links..." 
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
                  <th>Link Segment</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Bandwidth</th>
                  <th>Utilization</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id}>
                    <td style={{ fontWeight: 600 }}>{link.from.name} ↔ {link.to.name}</td>
                    <td><span className="domain-pill ip" style={{ fontSize: '10px' }}>{link.type.toUpperCase()}</span></td>
                    <td>
                      <span className={`badge ${link.status === 'up' ? 'badge-up' : link.status === 'down' ? 'badge-down' : 'badge-idle'}`}>
                        {link.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{link.bandwidth} Gbps</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '100px', background: 'var(--bg-secondary)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${link.utilization}%`,
                              height: '100%',
                              background: getLinkColor(link),
                              transition: 'all 0.5s ease'
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '40px' }}>{link.utilization}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: getLinkColor(link), fontWeight: 700, fontSize: '11px' }}>
                        {link.status === 'down' ? 'CRITICAL' : link.utilization > 85 ? 'CONGESTED' : link.utilization > 70 ? 'WARNING' : 'HEALTHY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {notification && (
        <div className="notification-toast success">
          <CheckCircle2 size={18} />
          {notification}
        </div>
      )}
    </div>
  );
}

// Reuse Share2 icon since Topology needs it
function Share2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
