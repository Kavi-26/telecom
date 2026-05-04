/**
 * Generates mock data for CORE network monitoring.
 * Includes CORE element status and performance metrics for the past 10 days.
 */

export const generateCoreElements = () => {
  const elements = [
    { id: 'hlr-01', name: 'HLR-Primary-01', type: 'HLR', status: 'active', vendor: 'Ericsson' },
    { id: 'hlr-02', name: 'HLR-Secondary-02', type: 'HLR', status: 'idle', vendor: 'Ericsson' },
    { id: 'epc-01', name: 'EPC-North-01', type: 'EPC', status: 'active', vendor: 'Nokia' },
    { id: 'epc-02', name: 'EPC-South-02', type: 'EPC', status: 'active', vendor: 'Nokia' },
    { id: 'gw-01', name: 'Gateway-Main-01', type: 'Gateway', status: 'active', vendor: 'Huawei' },
    { id: 'gw-02', name: 'Gateway-Backup-02', type: 'Gateway', status: 'down', vendor: 'Huawei' },
    { id: 'mme-01', name: 'MME-Cluster-A', type: 'MME', status: 'active', vendor: 'Cisco' },
    { id: 'sgw-01', name: 'SGW-Node-X', type: 'SGW', status: 'active', vendor: 'Ericsson' },
    { id: 'pgw-01', name: 'PGW-Node-Y', type: 'PGW', status: 'active', vendor: 'Ericsson' },
    { id: 'hss-01', name: 'HSS-Global-01', type: 'HSS', status: 'active', vendor: 'Nokia' },
  ];
  return elements;
};

export const generateCorePerformance = (days = 10) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    for (let hour = 0; hour < 24; hour += 4) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      const isAnomaly = Math.random() > 0.85; // 15% chance of an anomaly
      
      data.push({
        timestamp: timestamp.toISOString(),
        time: `${timestamp.getDate()}/${timestamp.getMonth() + 1} ${hour}:00`,
        latency: (isAnomaly ? 15 : 2) + Math.random() * 8, 
        successRate: (isAnomaly ? 92 : 98) + Math.random() * 2, 
        attachSuccessRate: (isAnomaly ? 94 : 97) + Math.random() * 3, 
        detachSuccessRate: 98 + Math.random() * 2, 
        throughput: 400 + Math.random() * 600, 
        load: (isAnomaly ? 85 : 30) + Math.random() * 50, 
      });


    }
  }
  return data;
};

export const generateCoreAlarms = () => {
  return [
    { id: 1, element: 'Gateway-Backup-02', severity: 'critical', type: 'Outage', time: '5 mins ago', message: 'S5/S8 interface down' },
    { id: 2, element: 'MME-Cluster-A', severity: 'major', type: 'Performance', time: '18 mins ago', message: 'Attach success rate dropped below 95%' },
    { id: 3, element: 'EPC-South-02', severity: 'minor', type: 'Warning', time: '1 hour ago', message: 'CPU utilization at 85%' },
    { id: 4, element: 'HSS-Global-01', severity: 'major', type: 'Congestion', time: '3 hours ago', message: 'High diameter signaling load' },
  ];
};
