import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBuses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/buses');
      const data = await res.json();
      setBuses(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="main-content">Loading data...</div>;

  const totalBuses = buses.length;
  const delayedBuses = buses.filter(b => b.traffic_condition === 'Heavy').length;
  
  // Smart Recommendation
  let bestBus = null;
  buses.forEach(b => {
    if (b.crowd_level !== 'High') {
      if (!bestBus || b.eta_minutes < bestBus.eta_minutes) {
        bestBus = b;
      }
    }
  });

  return (
    <div className="main-content">
      <h2>Live Dashboard</h2>
      
      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="glass-panel stat-card">
          <h3>Total Active Buses</h3>
          <p className="stat-value">{totalBuses}</p>
        </div>
        <div className="glass-panel stat-card">
          <h3>Delayed Buses</h3>
          <p className="stat-value" style={{color: delayedBuses > 0 ? '#ef4444' : '#10b981'}}>{delayedBuses}</p>
        </div>
        <div className="glass-panel stat-card" style={{gridColumn: 'span 2'}}>
          <h3>Smart Recommendation</h3>
          <div style={{ marginTop: '0.5rem', color: '#8b5cf6', fontWeight: 600 }}>
            {bestBus ? 
              \`Take \${bestBus.route_name}. Arriving at \${bestBus.next_stop_name} in \${bestBus.eta_minutes} min (Crowd: \${bestBus.crowd_level})\` : 
              'All nearby buses are currently crowded. Consider waiting.'}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1.5rem' }}>Live Tracking</h3>
      <div className="bus-list">
        {buses.map(bus => (
          <div key={bus.id} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold', color: bus.route_color }}>{bus.route_name}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={\`badge bg-\${bus.traffic_condition}\`}>{bus.traffic_condition} Traffic</span>
                <span className={\`badge bg-\${bus.crowd_level}\`}>{bus.crowd_level} Crowd</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Next Stop:</span>
              <span>{bus.next_stop_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Passengers:</span>
              <span>{bus.passenger_count} / {bus.capacity}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
              <span>ETA:</span>
              <span style={{ color: '#3b82f6' }}>{bus.eta_minutes} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
