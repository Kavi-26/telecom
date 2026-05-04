const pool = require('../config/db');

// GET /api/core/elements
const getCoreElements = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM core_elements ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/core/summary
const getCoreSummary = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as total FROM core_elements');
    const [active] = await pool.query("SELECT COUNT(*) as cnt FROM core_elements WHERE status='active'");
    const [idle] = await pool.query("SELECT COUNT(*) as cnt FROM core_elements WHERE status='idle'");
    const [down] = await pool.query("SELECT COUNT(*) as cnt FROM core_elements WHERE status='down'");
    const [avgKpi] = await pool.query(
      'SELECT AVG(latency) as avg_latency, AVG(success_rate) as avg_success_rate, AVG(throughput) as avg_throughput FROM core_elements WHERE status != "down"'
    );
    res.json({
      total: total[0].total,
      active: active[0].cnt,
      idle: idle[0].cnt,
      down: down[0].cnt,
      avgKpi: avgKpi[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/core/elements/:id
const getCoreElementById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM core_elements WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Element not found' });
    const [history] = await pool.query(
      'SELECT metric_name, value, recorded_at FROM kpi_history WHERE element_id = ? AND domain = "CORE" ORDER BY recorded_at ASC',
      [req.params.id]
    );
    res.json({ element: rows[0], history });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCoreElements, getCoreSummary, getCoreElementById };
