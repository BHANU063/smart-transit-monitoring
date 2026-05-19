import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BusDetails() {
  const { id } = useParams();
  const [bus, setBus] = useState(null);

  const fetchBus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/buses');
      const data = await res.json();
      const found = data.find(b => b.id.toString() === id);
      setBus(found);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBus();
    const interval = setInterval(fetchBus, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (!bus) return <div className="main-content">Loading bus details...</div>;

  return (
    <div className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
        <h2>Bus #{bus.id} Details</h2>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <h3 style={{ color: bus.route_color, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          {bus.route_name}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{bus.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Next Stop:</span>
            <span>{bus.next_stop_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Estimated Time of Arrival:</span>
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{bus.eta_minutes} mins</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Passenger Load:</span>
            <span>{bus.passenger_count} / {bus.capacity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Crowd Level:</span>
            <span className={`badge bg-${bus.crowd_level}`}>{bus.crowd_level}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Traffic Condition:</span>
            <span className={`badge bg-${bus.traffic_condition}`}>{bus.traffic_condition}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              className={`bg-${bus.crowd_level}`} 
              style={{ width: `${(bus.passenger_count / bus.capacity) * 100}%`, height: '100%', transition: 'width 0.5s ease' }}
            ></div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Capacity Filled
          </p>
        </div>
      </div>
    </div>
  );
}
