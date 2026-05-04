const pool = require('../config/db');

// GET /api/ran/bts
const getBtsStations = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bts_stations ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/ran/bts/:id
const getBtsById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bts_stations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'BTS not found' });
    const [history] = await pool.query(
      'SELECT metric_name, value, recorded_at FROM kpi_history WHERE element_id = ? AND domain = "RAN" ORDER BY recorded_at ASC',
      [req.params.id]
    );
    res.json({ bts: rows[0], history });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/ran/summary
const getRanSummary = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as total FROM bts_stations');
    const [upCount] = await pool.query("SELECT COUNT(*) as cnt FROM bts_stations WHERE status='up'");
    const [downCount] = await pool.query("SELECT COUNT(*) as cnt FROM bts_stations WHERE status='down'");
    const [degraded] = await pool.query("SELECT COUNT(*) as cnt FROM bts_stations WHERE status='degraded'");
    const [avgKpi] = await pool.query('SELECT AVG(rsrp) as avg_rsrp, AVG(rsrq) as avg_rsrq, AVG(sinr) as avg_sinr, AVG(capacity_utilization) as avg_capacity FROM bts_stations WHERE status != "down"');
    res.json({
      total: total[0].total,
      up: upCount[0].cnt,
      down: downCount[0].cnt,
      degraded: degraded[0].cnt,
      avgKpi: avgKpi[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBtsStations, getBtsById, getRanSummary };
