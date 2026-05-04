-- ============================================================
-- Telco Network Monitor — Full MySQL Schema + Seed Data
-- ============================================================
CREATE DATABASE IF NOT EXISTS telco_monitor;
USE telco_monitor;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','noc_manager','ran_engineer','core_engineer','ip_engineer','analyst','operator') NOT NULL DEFAULT 'operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME
);

-- BTS STATIONS (RAN)
CREATE TABLE IF NOT EXISTS bts_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lat DECIMAL(10,6) NOT NULL,
  lng DECIMAL(10,6) NOT NULL,
  status ENUM('up','down','degraded') DEFAULT 'up',
  rsrp DECIMAL(6,2),
  rsrq DECIMAL(6,2),
  sinr DECIMAL(6,2),
  capacity_utilization DECIMAL(5,2),
  technology ENUM('4G','5G','3G') DEFAULT '4G',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CORE ELEMENTS
CREATE TABLE IF NOT EXISTS core_elements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('HLR','EPC','MME','SGW','PGW','HSS','GATEWAY','IMS') NOT NULL,
  status ENUM('active','idle','down') DEFAULT 'active',
  latency DECIMAL(8,2),
  success_rate DECIMAL(5,2),
  throughput DECIMAL(10,2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TRANSPORT LINKS (IP TRANSPORT)
CREATE TABLE IF NOT EXISTS transport_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  node_a VARCHAR(100) NOT NULL,
  node_b VARCHAR(100) NOT NULL,
  node_a_lat DECIMAL(10,6),
  node_a_lng DECIMAL(10,6),
  node_b_lat DECIMAL(10,6),
  node_b_lng DECIMAL(10,6),
  bandwidth_total DECIMAL(10,2),
  bandwidth_used DECIMAL(10,2),
  status ENUM('up','down','degraded') DEFAULT 'up',
  link_type ENUM('backbone','access','metro') DEFAULT 'backbone',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ALARMS
CREATE TABLE IF NOT EXISTS alarms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain ENUM('RAN','CORE','IP') NOT NULL,
  priority ENUM('critical','major','minor') NOT NULL,
  description TEXT NOT NULL,
  element_name VARCHAR(100),
  status ENUM('active','acknowledged','resolved') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL
);

-- KPI HISTORY
CREATE TABLE IF NOT EXISTS kpi_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  element_id INT NOT NULL,
  domain ENUM('RAN','CORE','IP') NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  value DECIMAL(12,4),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Users (passwords are bcrypt of "password")
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'kavisproject@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('noc_manager', 'noc@telco.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'noc_manager'),
('ran_eng', '26kaviyarasu2002@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ran_engineer'),
('core_eng', 'core@telco.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'core_engineer'),
('ip_eng', 'ip@telco.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ip_engineer'),
('analyst', 'analyst@telco.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'analyst'),
('operator', 'operator@telco.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'operator')
ON DUPLICATE KEY UPDATE email=VALUES(email), password_hash=VALUES(password_hash);

-- BTS Stations
INSERT INTO bts_stations (name, lat, lng, status, rsrp, rsrq, sinr, capacity_utilization, technology) VALUES
('BTS-JKT-001', -6.2088, 106.8456, 'up', -75.5, -10.2, 18.3, 65.4, '5G'),
('BTS-JKT-002', -6.1944, 106.8229, 'up', -82.1, -12.5, 14.7, 78.2, '4G'),
('BTS-JKT-003', -6.2297, 106.8890, 'degraded', -95.3, -15.8, 8.2, 91.5, '4G'),
('BTS-BDG-001', -6.9175, 107.6191, 'up', -70.2, -9.1, 22.1, 45.3, '5G'),
('BTS-BDG-002', -6.9344, 107.6030, 'down', -110.0, -20.0, 2.0, 0.0, '4G'),
('BTS-SBY-001', -7.2575, 112.7521, 'up', -72.8, -9.8, 20.5, 55.7, '5G'),
('BTS-SBY-002', -7.2756, 112.7423, 'up', -80.4, -11.3, 16.8, 67.9, '4G'),
('BTS-MDN-001', 3.5952, 98.6722, 'up', -74.1, -10.5, 19.2, 58.4, '4G'),
('BTS-MKS-001', -5.1477, 119.4327, 'degraded', -92.7, -14.2, 9.8, 85.6, '4G'),
('BTS-PLB-001', -2.9761, 104.7458, 'up', -77.3, -10.9, 17.4, 62.1, '4G');

-- CORE Elements
INSERT INTO core_elements (name, type, status, latency, success_rate, throughput) VALUES
('HLR-01', 'HLR', 'active', 2.3, 99.8, 1500.0),
('HLR-02', 'HLR', 'active', 2.1, 99.9, 1420.5),
('EPC-01', 'EPC', 'active', 5.2, 99.5, 8500.0),
('EPC-02', 'EPC', 'idle', 6.1, 98.2, 4200.0),
('MME-01', 'MME', 'active', 3.4, 99.7, 3200.0),
('SGW-01', 'SGW', 'active', 4.1, 99.6, 5600.0),
('PGW-01', 'PGW', 'active', 4.8, 99.4, 7200.0),
('HSS-01', 'HSS', 'active', 1.9, 99.9, 2100.0),
('GW-INET-01', 'GATEWAY', 'active', 8.5, 98.9, 12000.0),
('GW-INET-02', 'GATEWAY', 'down', 0.0, 0.0, 0.0),
('IMS-01', 'IMS', 'active', 3.2, 99.6, 1800.0);

-- Transport Links
INSERT INTO transport_links (node_a, node_b, node_a_lat, node_a_lng, node_b_lat, node_b_lng, bandwidth_total, bandwidth_used, status, link_type) VALUES
('Core-JKT', 'Core-BDG', -6.2088, 106.8456, -6.9175, 107.6191, 10000, 6500, 'up', 'backbone'),
('Core-JKT', 'Core-SBY', -6.2088, 106.8456, -7.2575, 112.7521, 10000, 7200, 'up', 'backbone'),
('Core-BDG', 'Core-SBY', -6.9175, 107.6191, -7.2575, 112.7521, 5000, 4800, 'degraded', 'backbone'),
('Core-JKT', 'Core-MDN', -6.2088, 106.8456, 3.5952, 98.6722, 10000, 5100, 'up', 'backbone'),
('Core-SBY', 'Core-MKS', -7.2575, 112.7521, -5.1477, 119.4327, 5000, 2300, 'up', 'metro'),
('Core-JKT', 'Core-PLB', -6.2088, 106.8456, -2.9761, 104.7458, 5000, 1200, 'up', 'access'),
('Core-BDG', 'Core-PLB', -6.9175, 107.6191, -2.9761, 104.7458, 2500, 0, 'down', 'access'),
('Core-MDN', 'Core-JKT', 3.5952, 98.6722, -6.2088, 106.8456, 5000, 3400, 'up', 'backbone');

-- Alarms
INSERT INTO alarms (domain, priority, description, element_name, status) VALUES
('RAN', 'critical', 'BTS-BDG-002 is completely down. All calls dropped.', 'BTS-BDG-002', 'active'),
('RAN', 'major', 'BTS-JKT-003 capacity utilization exceeded 90% threshold.', 'BTS-JKT-003', 'active'),
('RAN', 'major', 'BTS-MKS-001 signal quality degraded below acceptable threshold.', 'BTS-MKS-001', 'active'),
('CORE', 'critical', 'GW-INET-02 gateway is down. Internet traffic impacted.', 'GW-INET-02', 'active'),
('CORE', 'minor', 'EPC-02 success rate dropped to 98.2%, monitor closely.', 'EPC-02', 'acknowledged'),
('IP', 'critical', 'Link Core-BDG to Core-PLB is completely down.', 'Core-BDG → Core-PLB', 'active'),
('IP', 'major', 'Link Core-BDG → Core-SBY utilization at 96%. Approaching saturation.', 'Core-BDG → Core-SBY', 'active'),
('RAN', 'minor', 'BTS-JKT-002 SINR dropped to 14.7 dB during peak hours.', 'BTS-JKT-002', 'acknowledged'),
('CORE', 'minor', 'HLR-01 latency slightly elevated at 2.3ms.', 'HLR-01', 'resolved'),
('IP', 'minor', 'Core-SBY → Core-MKS bandwidth at 46% - normal levels.', 'Core-SBY → Core-MKS', 'resolved');

-- KPI History (last 24 hours simulation)
INSERT INTO kpi_history (element_id, domain, metric_name, value, recorded_at) VALUES
(1, 'RAN', 'rsrp', -73.2, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(1, 'RAN', 'rsrp', -74.1, DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(1, 'RAN', 'rsrp', -75.5, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'RAN', 'sinr', 19.5, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(1, 'RAN', 'sinr', 18.8, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 'RAN', 'sinr', 18.3, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 'CORE', 'latency', 4.8, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(3, 'CORE', 'latency', 5.0, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(3, 'CORE', 'latency', 5.2, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 'CORE', 'success_rate', 99.8, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(3, 'CORE', 'success_rate', 99.6, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(3, 'CORE', 'success_rate', 99.5, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'IP', 'bandwidth_used', 5800, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(1, 'IP', 'bandwidth_used', 6200, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 'IP', 'bandwidth_used', 6500, DATE_SUB(NOW(), INTERVAL 1 HOUR));
