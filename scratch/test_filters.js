const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'c:/PCfiles/Interactive/server/.env' });

const testFilters = async () => {
  const API_BASE = 'http://localhost:5000/api';
  const secret = process.env.JWT_SECRET || 'telco_super_secret_jwt_key_2024';
  
  // Sign a test token
  const token = jwt.sign({ id: 1, role: 'admin' }, secret, { expiresIn: '1h' });
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log('Testing filters in /api/reports/kpi...');
    
    // Test 1: All domains
    const res1 = await fetch(`${API_BASE}/reports/kpi`, { headers });
    const data1 = await res1.json();
    console.log(`- All domains:`, Array.isArray(data1) ? `${data1.length} records` : data1);
    
    // Test 2: RAN domain
    const res2 = await fetch(`${API_BASE}/reports/kpi?domain=RAN`, { headers });
    const data2 = await res2.json();
    console.log(`- RAN domain:`, Array.isArray(data2) ? `${data2.length} records` : data2);
    
    // Test 3: Date range
    const from = '2020-01-01';
    const to = new Date().toISOString().split('T')[0];
    const res3 = await fetch(`${API_BASE}/reports/kpi?from=${from}&to=${to}`, { headers });
    const data3 = await res3.json();
    console.log(`- Date range (${from} to ${to}):`, Array.isArray(data3) ? `${data3.length} records` : data3);
    
  } catch (err) {
    console.error('Error during testing:', err.message);
  }
};

testFilters();
