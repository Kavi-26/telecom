const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function updateSupervisor() {
  const email = 'nocsup@telco.com';
  const password = 'Password123';
  const role = 'noc_supervisor';

  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('Updating NOC Supervisor user...');
    await pool.query(
      'UPDATE users SET password_hash = ?, role = ? WHERE email = ?',
      [hash, role, email]
    );
    console.log('User updated successfully with password: Password123');
  } catch (err) {
    console.error('Error updating supervisor:', err);
  } finally {
    process.exit();
  }
}

updateSupervisor();
