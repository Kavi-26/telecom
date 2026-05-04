const pool = require('../config/db');

// GET /api/transport/links
const getTransportLinks = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM transport_links ORDER BY node_a');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/transport/summary
const getTransportSummary = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as total FROM transport_links');
    const [up] = await pool.query("SELECT COUNT(*) as cnt FROM transport_links WHERE status='up'");
    const [down] = await pool.query("SELECT COUNT(*) as cnt FROM transport_links WHERE status='down'");
    const [degraded] = await pool.query("SELECT COUNT(*) as cnt FROM transport_links WHERE status='degraded'");
    const [bandwidth] = await pool.query(
      'SELECT SUM(bandwidth_total) as total_bw, SUM(bandwidth_used) as used_bw FROM transport_links WHERE status != "down"'
    );
    res.json({
      total: total[0].total,
      up: up[0].cnt,
      down: down[0].cnt,
      degraded: degraded[0].cnt,
      bandwidth: bandwidth[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTransportLinks, getTransportSummary };
