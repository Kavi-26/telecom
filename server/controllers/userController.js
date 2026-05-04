const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hash, role || 'operator']
    );
    res.status(201).json({ id: result.insertId, username, email, role: role || 'operator' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;
  try {
    let query = 'UPDATE users SET username = ?, email = ?, role = ?';
    let params = [username, email, role];
    
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += ', password_hash = ?';
      params.push(hash);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await pool.query(query, params);
    res.json({ id, username, email, role });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
