import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Signal,
  Wifi,
  Activity,
  AlertTriangle,
  MapPin,
  BarChart3,
  TrendingUp,
  Users,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Filter,
  Download,
  X,
  Database,
  Cpu,
  Clock as ClockIcon
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
} from 'react-leaflet';
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
import Loading from '../components/common/Loading';
import { generateBTSData, generatePerformanceData, generateAlarms } from '../utils/ranMockData';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './RAN.css';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function RANPage() {
  const [activeBts, setActiveBts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btsList, setBtsList] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBts, setSelectedBts] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Use the API URL from environment or direct port
        const API_BASE = 'http://localhost:5000/api';

        const [btsRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/ran/bts`, config)
        ]);

        if (btsRes.status === 'fulfilled' && btsRes.value.data.length > 0) {
          setBtsList(btsRes.value.data);
        } else {
          setBtsList(generateBTSData());
        }

        setPerfData(generatePerformanceData(10));
        setAlarms(generateAlarms());
      } catch (err) {
        console.error('Error fetching RAN data:', err);
        setBtsList(generateBTSData());
        setPerfData(generatePerformanceData(10));
        setAlarms(generateAlarms());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = (type) => {
    const columns = [
      { header: 'BTS Name', dataKey: 'name' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Technology', dataKey: 'technology' },
      { header: 'Vendor', dataKey: 'vendor' },
      { header: 'RSRP (dBm)', dataKey: 'rsrp' },
      { header: 'SINR (dB)', dataKey: 'sinr' }
    ];

    if (type === 'excel') {
      exportToExcel(filteredBts, `RAN_BTS_Inventory_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(filteredBts, columns, 'RAN BTS Inventory Report', `RAN_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const filteredBts = useMemo(() => {
    return btsList.filter(bts =>
      bts.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bts.vendor && bts.vendor.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [btsList, searchTerm]);

  const stats = useMemo(() => [
    { label: 'Total BTS', value: btsList.length, icon: <Radio size={20} />, trend: '+0', trendUp: true, color: 'var(--brand-primary)' },
    { label: 'Active Cells', value: btsList.filter(b => b.status === 'up').length, icon: <Wifi size={20} />, trend: '98.2%', trendUp: true, color: 'var(--status-up)' },
    { label: 'Avg Signal', value: '-88 dBm', icon: <Signal size={20} />, trend: '-2.4', trendUp: false, color: 'var(--brand-accent)' },
    { label: 'Avg Util', value: '64.2%', icon: <Activity size={20} />, trend: '+5.1%', trendUp: false, color: 'var(--domain-ran)' },
  ], [btsList]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {p.value.toFixed(1)} {p.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && btsList.length === 0) {
    return <Loading message="Initializing RAN Dashboard..." />;
  }

  return (
    <div className="ran-dashboard-modern">
      <Navbar
        title="RAN Radio Access"
        subtitle="Real-time performance metrics and BTS geolocation"
      />

      <div className="page-content">
        {/* Critical Alerts Banner */}
        {alarms.some(a => a.severity === 'critical') && (
          <div className="alert-banner critical">
            <AlertTriangle className="animate-pulse" />
            <div className="alert-info">
              <div className="alert-title">CRITICAL NETWORK OUTAGE</div>
              <div className="alert-desc">
                Multiple BTS stations are reporting critical hardware failures. Network capacity is reduced by {((btsList.filter(b => b.status === 'down').length / btsList.length) * 100).toFixed(1)}%.
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ background: 'var(--status-down)', border: 'none', color: '#fff' }}>Immediate Action</button>
          </div>
        )}

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

        {/* Graphs Section */}
        <div className="grid grid-2" style={{ marginBottom: '24px' }}>
          {/* Capacity Utilization Graph */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} />
                Capacity Utilization (Last 10 Days)
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={perfData}>
                  <defs>
                    <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--domain-ran)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--domain-ran)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickFormatter={(val) => val.split(' ')[0]}
                    interval={6}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={10} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="utilization"
                    name="Utilization"
                    unit="%"
                    stroke="var(--domain-ran)"
                    fillOpacity={1}
                    fill="url(#colorUtil)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Signal Quality Graph */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} />
                Signal Quality Trends (RSRP / RSRQ / SINR)
              </div>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickFormatter={(val) => val.split(' ')[0]}
                    interval={6}
                  />
                  <YAxis yAxisId="left" stroke="var(--brand-primary)" fontSize={10} unit="dBm" domain={[-110, -60]} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--brand-accent)" fontSize={10} unit="dB" domain={[-25, 30]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rsrp"
                    name="RSRP"
                    unit="dBm"
                    stroke="var(--brand-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rsrq"
                    name="RSRQ"
                    unit="dB"
                    stroke="var(--brand-secondary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sinr"
                    name="SINR"
                    unit="dB"
                    stroke="var(--brand-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="main-grid" style={{ marginBottom: '24px', minHeight: '500px' }}>
          {/* Map Section */}
          <div className="card map-section" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid var(--border)' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} />
                BTS Location Map
              </div>
              <div className="map-legend">
                <span><span className="status-dot up" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4 }}></span> Active</span>
                <span><span className="status-dot down" style={{ display: 'inline-block', width: 8, height: 8, marginRight: 4, background: 'var(--status-down)', boxShadow: 'none', animation: 'none' }}></span> Down</span>
              </div>
            </div>
            <div style={{ flex: 1, zIndex: 1, minHeight: '400px' }}>
              <MapContainer
                center={[19.0760, 72.8777]}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />
                {btsList.map(bts => (
                  <Marker
                    key={bts.id}
                    position={[bts.lat || 19.07, bts.lng || 72.87]}
                    eventHandlers={{
                      click: () => setActiveBts(bts),
                    }}
                  >
                    <Popup className="bts-popup">
                      <div className="popup-content">
                        <h4>{bts.name}</h4>
                        <div className="popup-grid">
                          <span>Status:</span>
                          <span className={`badge ${bts.status === 'up' ? 'badge-up' : 'badge-down'}`}>{bts.status?.toUpperCase()}</span>
                          <span>Vendor:</span>
                          <span>{bts.vendor || 'N/A'}</span>
                          <span>Tech:</span>
                          <span>{bts.technology || 'N/A'}</span>
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '8px', width: '100%' }} onClick={() => setSelectedBts(bts)}>View Details</button>
                      </div>
                    </Popup>
                    <Circle
                      center={[bts.lat || 19.07, bts.lng || 72.87]}
                      radius={1500}
                      pathOptions={{
                        color: bts.status === 'up' ? 'var(--status-up)' : 'var(--status-down)',
                        fillColor: bts.status === 'up' ? 'var(--status-up)' : 'var(--status-down)',
                        fillOpacity: 0.1
                      }}
                    />
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Alarms / Notifications Section */}
          <div className="card alarms-section" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} />
                Live RAN Alarms
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
                      <span className="alarm-bts">{alarm.bts}</span>
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

        {/* BTS Status Table */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div className="card-title">BTS Device Status & Inventory</div>
            <div className="card-actions">
              <div className="search-box" style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search BTS..."
                  className="form-input"
                  style={{ paddingLeft: '32px', width: '200px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}><Download size={14} /> Excel</button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}><Download size={14} /> PDF</button>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>BTS Name</th>
                  <th>Status</th>
                  <th>Technology</th>
                  <th>Vendor</th>
                  <th>RSRP</th>
                  <th>SINR</th>
                  <th>Utilization</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredBts.map(bts => (
                  <tr key={bts.id}>
                    <td style={{ fontWeight: 600 }}>{bts.name}</td>
                    <td>
                      <span className={`badge ${bts.status === 'up' ? 'badge-up' : 'badge-down'}`}>
                        {bts.status?.toUpperCase()}
                      </span>
                    </td>
                    <td><span className="domain-pill ran" style={{ fontSize: '10px' }}>{bts.technology}</span></td>
                    <td>{bts.vendor || 'N/A'}</td>
                    <td style={{ color: bts.rsrp < -100 ? 'var(--status-down)' : 'inherit' }}>{bts.rsrp || '-88'} dBm</td>
                    <td>{bts.sinr || '15'} dB</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '60px' }}>
                          <div className="progress-fill low" style={{ width: '64%' }}></div>
                        </div>
                        <span>64%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>Just now</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Device Details Modal */}
      {selectedBts && (
        <div className="modal-overlay" onClick={() => setSelectedBts(null)}>
          <div className="modal-content bts-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon">
                  <Radio size={24} />
                </div>
                <div>
                  <h2 className="modal-title">{selectedBts.name}</h2>
                  <p className="modal-subtitle">Element ID: {selectedBts.id || 'BTS-001'} · {selectedBts.technology || '4G/LTE'}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedBts(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className={`detail-value ${selectedBts.status === 'up' ? 'text-healthy' : 'text-critical'}`}>
                    <span className={`status-dot ${selectedBts.status}`} style={{ display: 'inline-block', width: 8, height: 8, marginRight: 6 }}></span>
                    {selectedBts.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Vendor</div>
                  <div className="detail-value">{selectedBts.vendor || 'Ericsson'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Hardware Version</div>
                  <div className="detail-value">v4.2.1-base</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">IP Address</div>
                  <div className="detail-value">10.42.11.{Math.floor(Math.random() * 255)}</div>
                </div>
              </div>

              <div className="metrics-summary-grid">
                <div className="metric-box">
                  <div className="metric-label">Signal Quality (SINR)</div>
                  <div className="metric-value">14.2 dB</div>
                  <div className="metric-status good">Optimal</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Active Users</div>
                  <div className="metric-value">124</div>
                  <div className="metric-status warning">High Load</div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Uptime</div>
                  <div className="metric-value">14d 6h 22m</div>
                  <div className="metric-status healthy">Stable</div>
                </div>
              </div>

              <div className="modal-chart-section">
                <h3 className="section-title">Real-time Utilization Trend</h3>
                <div style={{ height: '200px', width: '100%', marginTop: '12px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perfData.slice(-12)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="utilization" stroke="var(--domain-ran)" fill="var(--domain-ran)" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedBts(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => navigate('/devices')}>Manage Device</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
