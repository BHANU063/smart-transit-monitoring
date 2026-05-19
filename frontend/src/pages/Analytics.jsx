import { useEffect, useState } from 'react';

export default function Analytics() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="main-content">Loading analytics...</div>;

  return (
    <div className="main-content">
      <h2>Authority Analytics Dashboard</h2>
      
      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3>Total Delayed Buses</h3>
          <p className="stat-value" style={{ color: '#ef4444' }}>{data.delayedBuses}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due to Heavy Traffic</p>
        </div>
      </div>

      <h3 style={{ margin: '2rem 0 1rem' }}>Route-wise Crowd Levels & Load Trends</h3>
      <div className="bus-list">
        {data.routeStats.map(stat => (
          <div key={stat.name} className="glass-panel">
            <h4 style={{ color: '#3b82f6', marginBottom: '1rem' }}>{stat.name}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Buses:</span>
              <span style={{ fontWeight: 'bold' }}>{stat.bus_count}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Passenger Load:</span>
              <span style={{ fontWeight: 'bold' }}>{Math.round(stat.avg_passengers || 0)} per bus</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
