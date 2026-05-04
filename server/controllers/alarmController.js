const pool = require('../config/db');

// GET /api/alarms?domain=&priority=&status=
const getAlarms = async (req, res) => {
  try {
    const { domain, priority, status } = req.query;
    let query = 'SELECT * FROM alarms WHERE 1=1';
    const params = [];
    if (domain) { query += ' AND domain = ?'; params.push(domain); }
    if (priority) { query += ' AND priority = ?'; params.push(priority); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY FIELD(priority,"critical","major","minor"), created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/alarms/summary
const getAlarmSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT priority, COUNT(*) as count FROM alarms WHERE status = 'active' GROUP BY priority"
    );
    const summary = { critical: 0, major: 0, minor: 0 };
    rows.forEach((r) => { summary[r.priority] = r.count; });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/alarms/:id/acknowledge
const acknowledgeAlarm = async (req, res) => {
  try {
    await pool.query("UPDATE alarms SET status='acknowledged' WHERE id=?", [req.params.id]);
    res.json({ message: 'Alarm acknowledged' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/alarms/:id/resolve
const resolveAlarm = async (req, res) => {
  try {
    await pool.query(
      "UPDATE alarms SET status='resolved', resolved_at=NOW() WHERE id=?",
      [req.params.id]
    );
    res.json({ message: 'Alarm resolved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/alarms/:id/notify
const notifyAlarm = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alarms WHERE id=?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Alarm not found' });
    
    const alarm = rows[0];
    // In a real app, this would use nodemailer or an external API
    console.log(`[EMAIL] Sending notification to NOC team for ${alarm.priority} alarm: ${alarm.description}`);
    
    res.json({ message: 'Notification sent via email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAlarms, getAlarmSummary, acknowledgeAlarm, resolveAlarm, notifyAlarm };
