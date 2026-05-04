import { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, Download, FileText, 
  Table as TableIcon, Filter, Search, 
  ArrowRight, X, Maximize2, Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import api from '../api/axios';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import Navbar from '../components/common/Navbar';
import './Reports.css';

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    domain: '',
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedElement, setSelectedElement] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      console.log('Fetching with filters:', filters);
      const res = await api.get('/reports/kpi', { params: filters });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []); // Only once on mount

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchHistory();
  };

  const handleExportXLSX = () => {
    exportToExcel(data, `Telco_KPI_Report_${filters.from}_to_${filters.to}`);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Domain', dataKey: 'domain' },
      { header: 'Element', dataKey: 'element_name' },
      { header: 'Metric', dataKey: 'metric_name' },
      { header: 'Value', dataKey: 'value' },
      { header: 'Timestamp', dataKey: 'timestamp' }
    ];

    const exportData = data.map(item => ({
      ...item,
      timestamp: new Date(item.recorded_at).toLocaleString()
    }));

    exportToPDF(exportData, columns, 'Network Performance Report', `Telco_Report_${filters.from}`);
  };

  const drillDown = (item) => {
    setSelectedElement(item);
  };

  // Group data by metric for the chart
  const getChartData = () => {
    const groups = {};
    data.forEach(item => {
      const time = new Date(item.recorded_at).toLocaleDateString();
      if (!groups[time]) groups[time] = { time };
      groups[time][item.metric_name] = item.value;
    });
    return Object.values(groups);
  };

  return (
    <div className="reports-container">
      <Navbar 
        title="Performance Analytics" 
        subtitle="Analyze historical network KPIs and generate technical reports" 
        onRefresh={fetchHistory}
      />

      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ '--accent-color': 'var(--brand-primary)' }}>
          <div className="stat-header">
            <div className="stat-label">Total Records</div>
            <div className="stat-trend up">Live Data</div>
          </div>
          <div className="stat-value">{data.length}</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(0,212,255,0.1)' }}><FileText size={20} /></div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--status-up)' }}>
          <div className="stat-header">
            <div className="stat-label">Avg Network Health</div>
            <div className="stat-trend up">+0.2%</div>
          </div>
          <div className="stat-value">99.4%</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(16,185,129,0.1)' }}><Activity size={20} /></div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--brand-secondary)' }}>
          <div className="stat-header">
            <div className="stat-label">Unique Elements</div>
            <div className="stat-trend">7 Days</div>
          </div>
          <div className="stat-value">{new Set(data.map(d => d.element_name)).size}</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(124,58,237,0.1)' }}><Search size={20} /></div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--status-degraded)' }}>
          <div className="stat-header">
            <div className="stat-label">Total Data Volume</div>
            <div className="stat-trend down">-1.2%</div>
          </div>
          <div className="stat-value">412 GB</div>
          <div className="stat-icon" style={{ '--icon-bg': 'rgba(245,158,11,0.1)' }}><BarChart3 size={20} /></div>
        </div>
      </div>

      <div className="report-controls">
        <div className="control-item">
          <label>Network Domain</label>
          <select 
            className="glass-select"
            value={filters.domain}
            onChange={e => handleFilterChange('domain', e.target.value)}
          >
            <option value="">All Domains</option>
            <option value="RAN">Radio Access (RAN)</option>
            <option value="CORE">Core Network</option>
            <option value="IP">IP Transport</option>
          </select>
        </div>
        <div className="control-item">
          <label>Start Date</label>
          <input 
            type="date" 
            className="glass-select"
            value={filters.from}
            onChange={e => handleFilterChange('from', e.target.value)}
          />
        </div>
        <div className="control-item">
          <label>End Date</label>
          <input 
            type="date" 
            className="glass-select"
            value={filters.to}
            onChange={e => handleFilterChange('to', e.target.value)}
          />
        </div>
        <div className="report-actions">
          <button className="refresh-btn" onClick={handleSearch}>
            <Search size={16} /> Update
          </button>
          <button className="export-btn excel" onClick={handleExportXLSX}>
            <Download size={16} /> Excel
          </button>
          <button className="export-btn pdf" onClick={handleExportPDF}>
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><Activity size={18} /> Performance Trends</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="rsrp" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="success_rate" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="table-panel">
          <div className="table-header">
            <h3><TableIcon size={18} /> Detailed KPI Logs</h3>
            <span className="domain-chip">{data.length} Records</span>
          </div>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Element</th>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.element_name}</strong></td>
                    <td><span className="metric-pill">{item.metric_name}</span></td>
                    <td>{item.value}</td>
                    <td style={{ color: '#94a3b8' }}>{new Date(item.recorded_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="noc-icon-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          drillDown(item);
                        }}
                        title="View Details"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No data found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="drilldown-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setSelectedElement(null)}>
              <X size={18} />
            </button>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                Drill-down: {selectedElement.element_name}
              </h2>
              <p style={{ color: '#94a3b8' }}>{selectedElement.domain} Infrastructure Element Details</p>
            </div>
            
            <div className="stat-group">
              <div className="mini-stat">
                <label>Last Recorded Value</label>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00d4ff' }}>
                  {selectedElement.value}
                </div>
              </div>
              <div className="mini-stat">
                <label>Metric Type</label>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedElement.metric_name}</div>
              </div>
              <div className="mini-stat">
                <label>Status</label>
                <div style={{ color: '#10b981', fontWeight: 600 }}>OPERATIONAL</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
              <h4 style={{ marginBottom: '1rem' }}>Element Technical Specs</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Network ID</span>
                  <span>EL-{selectedElement.element_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Domain</span>
                  <span>{selectedElement.domain}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Region</span>
                  <span>Southeast Asia - ID</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#94a3b8' }}>Last Updated</span>
                  <span>{new Date(selectedElement.recorded_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="refresh-btn" onClick={() => setSelectedElement(null)}>
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
