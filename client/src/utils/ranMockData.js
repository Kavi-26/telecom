/**
 * Generates mock data for RAN (Radio Access Network) monitoring.
 * Includes BTS locations, status, and performance metrics for the past 10 days.
 */

export const generateBTSData = () => {
  const btsNames = ['Mumbai_South_01', 'Mumbai_North_04', 'Dharavi_West_02', 'Bandra_East_09', 'Colaba_Main_03', 'Worli_Hub_07', 'Powai_Tech_05', 'Juhu_Beach_08'];

  // Base coordinates for Mumbai
  const baseLat = 19.0760;
  const baseLng = 72.8777;

  return btsNames.map((name, index) => ({
    id: `bts-${index + 1}`,
    name,
    lat: baseLat + (Math.random() - 0.5) * 0.1,
    lng: baseLng + (Math.random() - 0.5) * 0.1,
    status: Math.random() > 0.15 ? 'up' : 'down',
    vendor: index % 2 === 0 ? 'Ericsson' : 'Nokia',
    technology: index % 3 === 0 ? '5G' : '4G',
    coverage: Math.floor(Math.random() * 5) + 1, // 1-5km
  }));
};

export const generatePerformanceData = (days = 10) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate data points for each hour (to show detail) or just daily
    // For graphs, daily peaks/averages are usually enough, but let's do daily for simplicity 
    // and maybe 4-6 points per day for a smoother line.
    for (let hour = 0; hour < 24; hour += 4) {
      const timestamp = new Date(date);
      timestamp.setHours(hour, 0, 0, 0);

      data.push({
        timestamp: timestamp.toISOString(),
        time: `${timestamp.getDate()}/${timestamp.getMonth() + 1} ${hour}:00`,
        rsrp: -85 + (Math.random() - 0.5) * 20, // -75 to -95
        rsrq: -12 + (Math.random() - 0.5) * 6,   // -9 to -15
        sinr: 15 + (Math.random() - 0.5) * 10,   // 10 to 20
        utilization: 40 + Math.random() * 50,    // 40% to 90%
        activeUsers: Math.floor(200 + Math.random() * 800),
      });
    }
  }
  return data;
};

export const generateAlarms = () => {
  return [
    { id: 1, bts: 'Mumbai_South_01', severity: 'critical', type: 'Outage', time: '10 mins ago', message: 'Total cell down - Hardware Failure' },
    { id: 2, bts: 'Powai_Tech_05', severity: 'major', type: 'Congestion', time: '25 mins ago', message: 'High PRB Utilization > 95%' },
    { id: 3, bts: 'Bandra_East_09', severity: 'minor', type: 'Interference', time: '1 hour ago', message: 'High Uplink Interference detected' },
    { id: 4, bts: 'Worli_Hub_07', severity: 'major', type: 'Signal Quality', time: '2 hours ago', message: 'Low SINR reported by multiple UEs' },
  ];
};
