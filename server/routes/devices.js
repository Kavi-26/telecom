const express = require('express');
const router = express.Router();

// Mock data for Wifi Access Points
const wifiAPs = [
  { id: 'AP-JKT-001', name: 'AP Jakarta HQ 01', location: 'Jakarta', status: 'online', clients: 42, ip: '192.168.10.1', firmware: 'v2.4.1' },
  { id: 'AP-JKT-002', name: 'AP Jakarta HQ 02', location: 'Jakarta', status: 'online', clients: 28, ip: '192.168.10.2', firmware: 'v2.4.1' },
  { id: 'AP-BDG-001', name: 'AP Bandung Branch', location: 'Bandung', status: 'online', clients: 15, ip: '192.168.20.1', firmware: 'v2.3.9' },
  { id: 'AP-SBY-001', name: 'AP Surabaya Office', location: 'Surabaya', status: 'offline', clients: 0, ip: '192.168.30.1', firmware: 'v2.4.0' },
  { id: 'AP-MKS-001', name: 'AP Makassar Hub', location: 'Makassar', status: 'online', clients: 12, ip: '192.168.40.1', firmware: 'v2.4.1' },
  { id: 'AP-MDN-001', name: 'AP Medan Office', location: 'Medan', status: 'online', clients: 8, ip: '192.168.50.1', firmware: 'v2.4.1' },
];

router.get('/', (req, res) => {
  res.json(wifiAPs);
});

module.exports = router;
