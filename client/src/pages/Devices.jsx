import { useState, useEffect } from 'react';
import { 
  Wifi, 
  MapPin, 
  Activity, 
  Users, 
  Search, 
  RefreshCw,
  ShieldCheck,
  Server,
  Zap,
  Settings
} from 'lucide-react';
import api from '../api/axios';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import './Devices.css';

export default function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isReadOnly = user?.role === 'operator';

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices');
      setDevices(res.data);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceAction = async (action) => {
    if (isReadOnly) return;
    setIsActionLoading(true);
    // Simulate API call for device management
    setTimeout(() => {
      setIsActionLoading(false);
      alert(`${action} successful for ${selectedDevice.name}`);
    }, 1500);
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

  const stats = {
    online: devices.filter(d => d.status === 'online').length,
    totalClients: devices.reduce((acc, d) => acc + d.clients, 0),
    avgUptime: '99.9%',
    firmware: 'v2.4.1'
  };

  if (loading && devices.length === 0) return (
    <div className="noc-loading">
      <div className="premium-loader"></div>
      <p>Synchronizing Device Inventory...</p>
    </div>
  );

  return (
    <div className="devices-management-page">
      <Navbar 
        title="Device Management" 
        subtitle="Monitoring Wifi Access Points across all regions" 
        onRefresh={fetchDevices}
      />

      <div className="devices-content-wrapper">
        <header className="devices-view-header">
          <div className="devices-welcome">
            <h1>Hardware Inventory</h1>
            <p>Real-time oversight of {devices.length} network nodes</p>
          </div>
          
          <div className="devices-top-actions">
            <div className="devices-search-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Find by ID, name or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="clear-search">×</button>}
            </div>
            <div className="export-controls">
              <button className="export-btn excel" onClick={() => handleExport('excel')}>
                <Activity size={16} /> Excel
              </button>
              <button className="export-btn pdf" onClick={() => handleExport('pdf')}>
                <ShieldCheck size={16} /> PDF
              </button>
            </div>
          </div>
        </header>

        <div className="devices-stats-grid">
          <div className="d-stat-card online">
            <div className="d-stat-icon-bg"><Wifi size={24} /></div>
            <div className="d-stat-info">
              <span className="label">Online Access Points</span>
              <span className="value">{stats.online}</span>
              <span className="trend-label positive">STABLE</span>
            </div>
          </div>
          <div className="d-stat-card clients">
            <div className="d-stat-icon-bg"><Users size={24} /></div>
            <div className="d-stat-info">
              <span className="label">Total Connected Clients</span>
              <span className="value">{stats.totalClients}</span>
              <span className="trend-label positive">+12% Growth</span>
            </div>
          </div>
          <div className="d-stat-card security">
            <div className="d-stat-icon-bg"><ShieldCheck size={24} /></div>
            <div className="d-stat-info">
              <span className="label">Security Protocol</span>
              <span className="value">WPA3-ENT</span>
              <span className="trend-label positive">ENCRYPTED</span>
            </div>
          </div>
          <div className="d-stat-card firmware">
            <div className="d-stat-icon-bg"><Server size={24} /></div>
            <div className="d-stat-info">
              <span className="label">Latest Firmware</span>
              <span className="value">{stats.firmware}</span>
              <span className="trend-label">CURRENT</span>
            </div>
          </div>
        </div>

        <div className="devices-table-card">
          <div className="table-controls">
            <h3>Active Hardware Pool</h3>
            <div className="refresh-status">
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
              <span>Live Updates Active</span>
            </div>
          </div>
          <div className="d-table-container">
            <table className="d-premium-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Name & Status</th>
                  <th>Location</th>
                  <th>Load</th>
                  <th>Network Info</th>
                  <th>Firmware</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.length > 0 ? filteredDevices.map(device => (
                  <tr key={device.id} className="d-table-row">
                    <td className="id-cell">
                      <span className="mono-id">{device.id}</span>
                    </td>
                    <td>
                      <div className="device-primary-info">
                        <div className={`status-glow ${device.status}`}></div>
                        <div>
                          <div className="d-name">{device.name}</div>
                          <div className={`d-status-text ${device.status}`}>{device.status.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-loc-info">
                        <MapPin size={14} />
                        <span>{device.location}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-load-indicator">
                        <div className="load-bar">
                          <div className="load-fill" style={{ width: `${(device.clients / 60) * 100}%` }}></div>
                        </div>
                        <span className="load-val">{device.clients} Clients</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-net-info">
                        <code>{device.ip}</code>
                      </div>
                    </td>
                    <td>
                      <span className="d-firmware-tag">{device.firmware}</span>
                    </td>
                    <td>
                      <button className="d-action-btn" onClick={() => handleOpenDetails(device)}>
                        Inspect
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="d-empty-state">
                      <Search size={48} />
                      <p>No matching devices found in inventory</p>
                      <button onClick={() => setSearchTerm('')} className="reset-search">Clear Search Filter</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedDevice && (
        <div className="noc-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="noc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className={`modal-status-indicator ${selectedDevice.status}`}></div>
                <h2>Device Configuration Profile</h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="device-detail-hero">
                <div className={`device-icon-bg ${selectedDevice.status}`}>
                  <Wifi size={32} />
                </div>
                <div className="device-hero-text">
                  <h3>{selectedDevice.name}</h3>
                  <span className="device-id-badge">{selectedDevice.id}</span>
                </div>
              </div>
              
              <div className="device-detail-grid">
                <div className="detail-item">
                  <label>Hardware Model</label>
                  <span>Cisco Catalyst 9100 Series</span>
                </div>
                <div className="detail-item">
                  <label>Physical Location</label>
                  <span>{selectedDevice.location}</span>
                </div>
                <div className="detail-item">
                  <label>IPv4 Address</label>
                  <span>{selectedDevice.ip}</span>
                </div>
                <div className="detail-item">
                  <label>Firmware Build</label>
                  <span>{selectedDevice.firmware}</span>
                </div>
                <div className="detail-item">
                  <label>MAC Address</label>
                  <span>00:1A:2B:3C:4D:5E</span>
                </div>
                <div className="detail-item">
                  <label>Uptime</label>
                  <span>14 Days, 6 Hours</span>
                </div>
              </div>

              <div className="device-metrics-section">
                <h4>Operational Performance</h4>
                <div className="metrics-row">
                  <div className="metric-item">
                    <Users size={20} />
                    <div>
                      <span className="m-val">{selectedDevice.clients}</span>
                      <span className="m-label">Users</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <Activity size={20} />
                    <div>
                      <span className="m-val">98.2%</span>
                      <span className="m-label">Quality</span>
                    </div>
                  </div>
                  <div className="metric-item">
                    <ShieldCheck size={20} />
                    <div>
                      <span className="m-val">WPA3</span>
                      <span className="m-label">Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="device-management-section">
                <div className="management-header">
                  <h4>Remote Management</h4>
                  {isReadOnly && (
                    <span className="read-only-badge">
                      <ShieldCheck size={12} /> Restricted Access
                    </span>
                  )}
                </div>
                <div className="management-actions">
                  <button 
                    className="manage-btn reboot" 
                    disabled={isReadOnly || isActionLoading}
                    onClick={() => handleDeviceAction('Device Reboot')}
                  >
                    <Zap size={16} /> {isActionLoading ? 'Wait...' : 'Restart'}
                  </button>
                  <button 
                    className="manage-btn sync" 
                    disabled={isReadOnly || isActionLoading}
                    onClick={() => handleDeviceAction('Config Sync')}
                  >
                    <RefreshCw size={16} className={isActionLoading ? 'spinning' : ''} /> Sync
                  </button>
                  <button 
                    className="manage-btn settings" 
                    disabled={isReadOnly || isActionLoading}
                    onClick={() => handleDeviceAction('Advanced Setup')}
                  >
                    <Settings size={16} /> Config
                  </button>
                </div>
                {isReadOnly && (
                  <p className="management-note">Account in Read-Only mode. Hardware controls are disabled for Operators.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-primary" onClick={() => setIsModalOpen(false)}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
