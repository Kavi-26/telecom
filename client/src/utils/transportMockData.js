/**
 * Generates mock data for IP Transport network monitoring.
 * Includes nodes, links, and bandwidth telemetry.
 */

export const generateTransportNodes = () => {
  return [
    { id: 'node-jkt-01', name: 'Core-Router-JKT', lat: -6.2088, lng: 106.8456, type: 'backbone' },
    { id: 'node-bdg-01', name: 'Core-Router-BDG', lat: -6.9175, lng: 107.6191, type: 'backbone' },
    { id: 'node-sby-01', name: 'Core-Router-SBY', lat: -7.2575, lng: 112.7521, type: 'backbone' },
    { id: 'node-mdn-01', name: 'Metro-Router-MDN', lat: 3.5952, lng: 98.6722, type: 'metro' },
    { id: 'node-mks-01', name: 'Metro-Router-MKS', lat: -5.1477, lng: 119.4327, type: 'metro' },
    { id: 'node-plb-01', name: 'Access-Router-PLB', lat: -2.9761, lng: 104.7458, type: 'access' },
  ];
};

export const generateTransportLinks = () => {
  const nodes = generateTransportNodes();
  return [
    { id: 'link-1', from: nodes[0], to: nodes[1], status: 'up', bandwidth: 100, utilization: 65, type: 'backbone' },
    { id: 'link-2', from: nodes[0], to: nodes[2], status: 'up', bandwidth: 100, utilization: 42, type: 'backbone' },
    { id: 'link-3', from: nodes[1], to: nodes[2], status: 'degraded', bandwidth: 40, utilization: 88, type: 'backbone' },
    { id: 'link-4', from: nodes[0], to: nodes[3], status: 'up', bandwidth: 40, utilization: 25, type: 'metro' },
    { id: 'link-5', from: nodes[2], to: nodes[4], status: 'up', bandwidth: 20, utilization: 55, type: 'metro' },
    { id: 'link-6', from: nodes[0], to: nodes[5], status: 'up', bandwidth: 10, utilization: 12, type: 'access' },
    { id: 'link-7', from: nodes[1], to: nodes[5], status: 'down', bandwidth: 10, utilization: 0, type: 'access' },
  ];
};

export const generateTransportPerformance = (days = 10) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    for (let hour = 0; hour < 24; hour += 4) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);
      
      data.push({
        timestamp: timestamp.toISOString(),
        time: `${timestamp.getDate()}/${timestamp.getMonth() + 1} ${hour}:00`,
        traffic: 200 + Math.random() * 300, // 200-500 Gbps
        latency: 15 + Math.random() * 20, // 15-35 ms
        packetLoss: Math.random() * 0.5, // 0-0.5%
      });
    }
  }
  return data;
};

export const generateTransportAlarms = () => {
  return [
    { id: 1, link: 'Core-BDG → Access-PLB', severity: 'critical', type: 'Link Failure', time: '2 mins ago', message: 'Fiber cut detected on segment BDG-PLB-04' },
    { id: 2, link: 'Core-BDG → Core-SBY', severity: 'major', type: 'High Utilization', time: '12 mins ago', message: 'Link utilization exceeded 85% threshold (currently 88%)' },
    { id: 3, link: 'Core-JKT → Core-SBY', severity: 'minor', type: 'Latency Spike', time: '45 mins ago', message: 'Jitter increased beyond 15ms limit' },
  ];
};
