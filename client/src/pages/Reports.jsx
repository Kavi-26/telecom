import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileText, 
  Table as TableIcon, 
  Filter, 
  Search, 
  ArrowRight, 
  X, 
  Maximize2, 
  Activity,
  TrendingUp,
  Globe,
  Database,
  Cpu,
  ChevronRight,
  Printer
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area,
  Bar,
  ComposedChart
} from 'recharts';
import api from '../api/axios';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import Navbar from '../components/common/Navbar';
import Loading from '../components/common/Loading';
import './Reports.css';

// Mock data generation for reports if API fails
const generateReportData = (days = 30) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      timestamp: dateStr,
      ran_health: 85 + Math.random() * 12,
      core_health: 90 + Math.random() * 8,
      ip_health: 92 + Math.random() * 6,
      traffic: 400 + Math.random() * 200,
      latency: 15 + Math.random() * 10,
      active_users: 1500 + Math.floor(Math.random() * 500)
    });
  }
  return data;
};

const domainMetrics = [
  { id: 'ran', name: 'Radio Access Network', icon: <Globe size={18} />, color: '#7c3aed' },
  { id: 'core', name: 'Core Infrastructure', icon: <Database size={18} />, color: '#06b6d4' },
  { id: 'ip', name: 'IP Transport', icon: <TrendingUp size={18} />, color: '#10b981' }
];

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setReportData(generateReportData(30));
        setLoading(false);
      }, 800);
    };
    fetchData();
  }, []);

  const handleExport = (type) => {
    const columns = [
      { header: 'Date', dataKey: 'timestamp' },
      { header: 'RAN Health (%)', dataKey: 'ran_health' },
      { header: 'CORE Health (%)', dataKey: 'core_health' },
      { header: 'IP Health (%)', dataKey: 'ip_health' },
      { header: 'Traffic (Tbps)', dataKey: 'traffic' },
      { header: 'Latency (ms)', dataKey: 'latency' }
    ];
    
    const formattedData = reportData.map(d => ({
      ...d,
      ran_health: d.ran_health.toFixed(1),
      core_health: d.core_health.toFixed(1),
      ip_health: d.ip_health.toFixed(1),
      traffic: (d.traffic / 100).toFixed(2),
      latency: d.latency.toFixed(1)
    }));

    if (type === 'excel') {
      exportToExcel(formattedData, `Network_Performance_Report_${dateRange.from}_to_${dateRange.to}`);
    } else {
      exportToPDF(formattedData, columns, 'Historical Network Performance Report', `Network_Report_${dateRange.from}`);
    }
  };

  const filteredData = useMemo(() => {
    return reportData.filter(d => {
      const date = new Date(d.timestamp);
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      return date >= from && date <= to;
    });
  }, [reportData, dateRange]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return [
      { label: 'Avg Health', value: '0%', sub: 'No Data', icon: <Activity size={20} />, color: '#64748b' },
      { label: 'Peak Traffic', value: '0 Tbps', sub: 'No Data', icon: <TrendingUp size={20} />, color: '#64748b' },
      { label: 'Avg Latency', value: '0 ms', sub: 'No Data', icon: <Cpu size={20} />, color: '#64748b' },
      { label: 'Total Incidents', value: '0', sub: 'No Data', icon: <FileText size={20} />, color: '#64748b' },
    ];

    const avgHealth = filteredData.reduce((acc, d) => {
      if (selectedDomain === 'ran') return acc + d.ran_health;
      if (selectedDomain === 'core') return acc + d.core_health;
      if (selectedDomain === 'ip') return acc + d.ip_health;
      return acc + (d.ran_health + d.core_health + d.ip_health) / 3;
    }, 0) / filteredData.length;

    const peakTraffic = Math.max(...filteredData.map(d => d.traffic));
    const avgLatency = filteredData.reduce((acc, d) => acc + d.latency, 0) / filteredData.length;

    return [
      { label: 'Avg Health', value: `${avgHealth.toFixed(1)}%`, sub: 'Within SLA', icon: <Activity size={20} />, color: '#10b981' },
      { label: 'Peak Traffic', value: `${(peakTraffic / 100).toFixed(1)} Tbps`, sub: 'Last Period', icon: <TrendingUp size={20} />, color: '#7c3aed' },
      { label: 'Avg Latency', value: `${avgLatency.toFixed(1)} ms`, sub: 'Target: <25ms', icon: <Cpu size={20} />, color: '#06b6d4' },
      { label: 'Report Records', value: filteredData.length, sub: 'Days analyzed', icon: <FileText size={20} />, color: '#f59e0b' },
    ];
  }, [filteredData, selectedDomain]);

  if (loading) return <Loading message="Generating Historical Analysis..." />;

  return (
    <div className="reports-page">
      <Navbar 
        title="Historical Performance Reports" 
        subtitle="Analyze long-term network trends and export compliance documentation" 
      />

      <div className="page-content">
        {/* Filter Bar */}
        <div className="reports-filter-card">
          <div className="filter-group">
            <div className="filter-item">
              <label><Globe size={14} /> Domain</label>
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
                <option value="all">All Domains</option>
                <option value="ran">RAN (Radio)</option>
                <option value="core">CORE Network</option>
                <option value="ip">IP Transport</option>
              </select>
            </div>
            <div className="filter-item">
              <label><Calendar size={14} /> From</label>
              <input type="date" value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
            </div>
            <div className="filter-item">
              <label><Calendar size={14} /> To</label>
              <input type="date" value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
            </div>
          </div>
          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={() => handleExport('excel')}><Download size={16} /> Excel</button>
            <button className="btn btn-primary" onClick={() => handleExport('pdf')}><Printer size={16} /> PDF Report</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card-modern" style={{ '--accent': stat.color }}>
              <div className="stat-icon-box">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-sub">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="reports-grid">
          <div className="card chart-panel">
            <div className="panel-header">
              <div className="title-group">
                <h3>Domain Health Trends</h3>
                <p>Comparative analysis of network stability across domains</p>
              </div>
              <div className="chart-legend-custom">
                <span className="l-item ran">RAN</span>
                <span className="l-item core">CORE</span>
                <span className="l-item ip">IP</span>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="ranGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ipGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--text-muted)', fontSize: 10}}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--text-muted)', fontSize: 10}}
                    domain={[70, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend />
                  {(selectedDomain === 'all' || selectedDomain === 'ran') && (
                    <Area type="monotone" name="RAN Health" dataKey="ran_health" stroke="#7c3aed" strokeWidth={2} fill="url(#ranGrad)" />
                  )}
                  {(selectedDomain === 'all' || selectedDomain === 'core') && (
                    <Area type="monotone" name="CORE Health" dataKey="core_health" stroke="#06b6d4" strokeWidth={2} fill="url(#coreGrad)" />
                  )}
                  {(selectedDomain === 'all' || selectedDomain === 'ip') && (
                    <Area type="monotone" name="IP Health" dataKey="ip_health" stroke="#10b981" strokeWidth={2} fill="url(#ipGrad)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card chart-panel">
            <div className="panel-header">
              <div className="title-group">
                <h3>Traffic & Latency Correlation</h3>
                <p>Correlation between data volume and system response time</p>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--text-muted)', fontSize: 10}}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#a78bfa', fontSize: 10}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#f59e0b', fontSize: 10}} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" name="Traffic Load (Tbps)" dataKey="traffic" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
                  <Line yAxisId="right" name="Latency (ms)" type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="card table-card-reports">
          <div className="panel-header">
            <h3>Detailed Performance Logs</h3>
            <div className="search-box-modern">
              <Search size={16} />
              <input type="text" placeholder="Search logs..." />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Observation Date</th>
                  <th>RAN Health</th>
                  <th>CORE Health</th>
                  <th>IP Transport</th>
                  <th>Traffic Load</th>
                  <th>Avg Latency</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} onClick={() => setSelectedDetails(row)}>
                    <td className="date-cell">{new Date(row.timestamp).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ opacity: (selectedDomain === 'all' || selectedDomain === 'ran') ? 1 : 0.3 }}>
                      <div className="mini-progress-group">
                        <div className="m-p-bar"><div className="m-p-fill" style={{ width: `${row.ran_health}%`, background: '#7c3aed' }}></div></div>
                        <span>{row.ran_health.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ opacity: (selectedDomain === 'all' || selectedDomain === 'core') ? 1 : 0.3 }}>
                      <div className="mini-progress-group">
                        <div className="m-p-bar"><div className="m-p-fill" style={{ width: `${row.core_health}%`, background: '#06b6d4' }}></div></div>
                        <span>{row.core_health.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ opacity: (selectedDomain === 'all' || selectedDomain === 'ip') ? 1 : 0.3 }}>
                      <div className="mini-progress-group">
                        <div className="m-p-bar"><div className="m-p-fill" style={{ width: `${row.ip_health}%`, background: '#10b981' }}></div></div>
                        <span>{row.ip_health.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>{(row.traffic / 100).toFixed(2)} Tbps</td>
                    <td><span className={`l-badge ${row.latency > 22 ? 'high' : 'low'}`}>{row.latency.toFixed(1)} ms</span></td>
                    <td><button className="action-circle-btn"><ChevronRight size={16} /></button></td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No performance records found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drill-down Modal */}
      {selectedDetails && (
        <div className="modal-overlay-reports" onClick={() => setSelectedDetails(null)}>
          <div className="report-drilldown-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="title-box">
                <h2>Analysis: {new Date(selectedDetails.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}</h2>
                <p>Granular performance breakdown for selected observation period</p>
              </div>
              <button className="close-btn-circle" onClick={() => setSelectedDetails(null)}><X size={20} /></button>
            </div>

            <div className="modal-body-reports">
              <div className="drilldown-grid">
                {domainMetrics.map(domain => (
                  <div key={domain.id} className="domain-drill-card" style={{ '--color': domain.color }}>
                    <div className="d-header">
                      {domain.icon}
                      <h4>{domain.name}</h4>
                    </div>
                    <div className="d-value-large">{(selectedDetails[`${domain.id}_health`] || 0).toFixed(2)}%</div>
                    <p>Sub-domain stability index</p>
                    <div className="d-chart-mini">
                      {/* Simple visual sparkline placeholder */}
                      <div className="sparkline">
                        {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                          <div key={i} className="s-bar" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="deep-analysis-section">
                <h3><Maximize2 size={18} /> Technical Insights</h3>
                <div className="insights-grid">
                  <div className="insight-item">
                    <span className="i-label">Congestion Probability</span>
                    <span className="i-value">{selectedDetails.traffic > 500 ? 'High' : 'Low'}</span>
                  </div>
                  <div className="insight-item">
                    <span className="i-label">Predicted Stability</span>
                    <span className="i-value text-success">Stable</span>
                  </div>
                  <div className="insight-item">
                    <span className="i-label">Active Connections</span>
                    <span className="i-value">{selectedDetails.active_users}</span>
                  </div>
                  <div className="insight-item">
                    <span className="i-label">QoS Fulfillment</span>
                    <span className="i-value">99.2%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-reports">
              <button className="btn btn-secondary" onClick={() => setSelectedDetails(null)}>Close Analysis</button>
              <button className="btn btn-primary" onClick={() => handleExport('pdf')}>Export Detailed PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
