const pool = require('../config/db');

// GET /api/reports/kpi?domain=&element_id=&from=&to=
const getKpiHistory = async (req, res) => {
  try {
    const { domain, element_id, from, to } = req.query;
    let query = 'SELECT kh.*, COALESCE(b.name, c.name, t.node_a) as element_name FROM kpi_history kh LEFT JOIN bts_stations b ON kh.element_id = b.id AND kh.domain = "RAN" LEFT JOIN core_elements c ON kh.element_id = c.id AND kh.domain = "CORE" LEFT JOIN transport_links t ON kh.element_id = t.id AND kh.domain = "IP" WHERE 1=1';
    const params = [];
    if (domain) { query += ' AND kh.domain = ?'; params.push(domain); }
    if (element_id) { query += ' AND kh.element_id = ?'; params.push(element_id); }
    if (from) { query += ' AND kh.recorded_at >= ?'; params.push(from); }
    if (to) { query += ' AND kh.recorded_at <= ?'; params.push(to); }
    query += ' ORDER BY kh.recorded_at ASC LIMIT 500';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reports/network-health
const getNetworkHealth = async (req, res) => {
  try {
    const [btsSummary] = await pool.query(
      "SELECT COUNT(*) as total, SUM(status='up') as up, SUM(status='down') as down, SUM(status='degraded') as degraded FROM bts_stations"
    );
    const [coreSummary] = await pool.query(
      "SELECT COUNT(*) as total, SUM(status='active') as active, SUM(status='down') as down FROM core_elements"
    );
    const [transportSummary] = await pool.query(
      "SELECT COUNT(*) as total, SUM(status='up') as up, SUM(status='down') as down FROM transport_links"
    );
    const [alarmCounts] = await pool.query(
      "SELECT SUM(priority='critical' AND status='active') as critical, SUM(priority='major' AND status='active') as major, SUM(priority='minor' AND status='active') as minor FROM alarms"
    );

    const ranHealth = btsSummary[0].total > 0 ? (btsSummary[0].up / btsSummary[0].total) * 100 : 100;
    const coreHealth = coreSummary[0].total > 0 ? (coreSummary[0].active / coreSummary[0].total) * 100 : 100;
    const ipHealth = transportSummary[0].total > 0 ? (transportSummary[0].up / transportSummary[0].total) * 100 : 100;
    const overallHealth = (ranHealth + coreHealth + ipHealth) / 3;

    res.json({
      overall: Math.round(overallHealth),
      ran: { ...btsSummary[0], health: Math.round(ranHealth) },
      core: { ...coreSummary[0], health: Math.round(coreHealth) },
      ip: { ...transportSummary[0], health: Math.round(ipHealth) },
      alarms: alarmCounts[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getKpiHistory, getNetworkHealth };
