import { useState, useEffect } from 'react';
import { 
  Wifi, 
  MapPin, 
  Activity, 
  Users, 
  Search, 
  RefreshCw,
  MoreVertical,
  ShieldCheck,
  Server
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './Devices.css';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/devices');
      setDevices(res.data);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleOpenDetails = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleExport = (type) => {
    const columns = [
      { header: 'Device ID', dataKey: 'id' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Location', dataKey: 'location' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Clients', dataKey: 'clients' },
      { header: 'IP Address', dataKey: 'ip' },
      { header: 'Firmware', dataKey: 'firmware' }
    ];

    if (type === 'excel') {
      exportToExcel(devices, `Devices_Inventory_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(devices, columns, 'Network Devices Inventory', `Devices_Report_${new Date().toISOString().split('T')[0]}`);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && devices.length === 0) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Scanning Network Devices...</p>
    </div>
  );

  return (
    <div className="devices-page">
      <Navbar 
        title="Device Management" 
        subtitle="Monitoring Wifi Access Points across all regions" 
        onRefresh={fetchDevices}
      />

      <div className="devices-header">
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID, name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="button-group">
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}>Excel</button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}>PDF</button>
          </div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ '--accent-color': 'var(--status-up)' }}>
          <div className="stat-header">
            <div className="stat-label">Online APs</div>
            <div className="stat-trend up">Stable</div>
          </div>
          <div className="stat-value">{devices.filter(d => d.status === 'online').length}</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(16,185,129,0.1)' }}><Wifi size={24} /></div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--brand-primary)' }}>
          <div className="stat-header">
            <div className="stat-label">Connected Clients</div>
            <div className="stat-trend up">+12%</div>
          </div>
          <div className="stat-value">{devices.reduce((acc, d) => acc + d.clients, 0)}</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(0,212,255,0.1)' }}><Users size={24} /></div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--brand-secondary)' }}>
          <div className="stat-header">
            <div className="stat-label">Security Protocol</div>
            <div className="stat-trend">Secure</div>
          </div>
          <div className="stat-value" style={{ fontSize: '24px' }}>WPA3-ENT</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(124,58,237,0.1)' }}><ShieldCheck size={24} /></div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--brand-accent)' }}>
          <div className="stat-header">
            <div className="stat-label">Latest Firmware</div>
            <div className="stat-trend">Current</div>
          </div>
          <div className="stat-value">v2.4.1</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(16,185,129,0.1)' }}><Server size={24} /></div>
        </div>
      </div>

      <div className="devices-table-container card">
        <table className="devices-table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Clients</th>
              <th>IP Address</th>
              <th>Firmware</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map(device => (
              <tr key={device.id}>
                <td className="id-cell">{device.id}</td>
                <td className="name-cell">
                  <div className="device-info-wrapper">
                    <div className={`status-dot ${device.status}`}></div>
                    {device.name}
                  </div>
                </td>
                <td>
                  <div className="loc-wrapper">
                    <MapPin size={14} />
                    {device.location}
                  </div>
                </td>
                <td>
                  <span className={`d-status-badge ${device.status}`}>
                    {device.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="clients-wrapper">
                    <Activity size={14} />
                    {device.clients}
                  </div>
                </td>
                <td className="ip-cell">{device.ip}</td>
                <td>{device.firmware}</td>
                <td>
                  <button 
                    className="more-btn" 
                    title="Manage (Read Only)"
                    onClick={() => handleOpenDetails(device)}
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDevices.length === 0 && (
          <div className="no-results">
            No devices found matching your search criteria.
          </div>
        )}
      </div>
      {/* Device Details Modal */}
      {isModalOpen && selectedDevice && (
        <div className="d-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="d-modal-content" onClick={e => e.stopPropagation()}>
            <div className="d-modal-header">
              <div className="d-modal-title">
                <div className={`status-dot ${selectedDevice.status}`}></div>
                <h2>Device Configuration Profile</h2>
              </div>
              <button className="d-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="d-modal-body">
              <div className="d-detail-grid">
                <div className="d-detail-item">
                  <label>Hardware ID</label>
                  <span>{selectedDevice.id}</span>
                </div>
                <div className="d-detail-item">
                  <label>Service Tag</label>
                  <span>{selectedDevice.name}</span>
                </div>
                <div className="d-detail-item">
                  <label>Physical Location</label>
                  <span>{selectedDevice.location}</span>
                </div>
                <div className="d-detail-item">
                  <label>IP Address</label>
                  <span>{selectedDevice.ip}</span>
                </div>
                <div className="d-detail-item">
                  <label>Current Status</label>
                  <span className={`d-status-badge ${selectedDevice.status}`}>
                    {selectedDevice.status.toUpperCase()}
                  </span>
                </div>
                <div className="d-detail-item">
                  <label>Firmware Version</label>
                  <span>{selectedDevice.firmware}</span>
                </div>
              </div>
              <div className="d-performance-section">
                <h3>Real-time Utilization</h3>
                <div className="d-stats-row">
                  <div className="d-stat-box">
                    <span className="d-stat-label">Active Clients</span>
                    <span className="d-stat-val">{selectedDevice.clients}</span>
                  </div>
                  <div className="d-stat-box">
                    <span className="d-stat-label">Uptime</span>
                    <span className="d-stat-val">12d 4h 22m</span>
                  </div>
                  <div className="d-stat-box">
                    <span className="d-stat-label">Signal Quality</span>
                    <span className="d-stat-val">98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
