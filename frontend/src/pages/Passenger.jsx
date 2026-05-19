import { useState } from 'react';
import { showNotif } from '../utils';

export default function Passenger() {
  const [fromStop, setFromStop] = useState('MG Road');
  const [toStop, setToStop] = useState('Electronic City');
  const [pref, setPref] = useState('Fastest');
  const [routes, setRoutes] = useState([]);
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [nearbyBuses, setNearbyBuses] = useState(null);
  const [locating, setLocating] = useState(false);

  const swapStops = () => {
    const temp = fromStop;
    setFromStop(toStop);
    setToStop(temp);
  };

  const searchRoutes = () => {
    // Mock results based on the HTML
    const results = [
      {
        id: 1, label: 'Fastest Route', time: '34 min', buses: '1 bus (Direct)', crowd: 68, delay: 'On time', route: '17A',
        stops: [
          { name: fromStop, time: 'Now', cls: 'current' },
          { name: 'City Center', time: '+12 min', cls: '' },
          { name: 'Koramangala 4B', time: '+22 min', cls: '' },
          { name: toStop, time: '+34 min', cls: 'destination' },
        ],
        rec: pref === 'Fastest'
      },
      {
        id: 2, label: 'Least Crowded', time: '48 min', buses: '2 buses (1 change)', crowd: 34, delay: 'On time', route: '92 → 51',
        stops: [
          { name: fromStop, time: 'Now', cls: 'current' },
          { name: 'Airport Road (Change)', time: '+18 min', cls: '' },
          { name: 'Sector 4', time: '+34 min', cls: '' },
          { name: toStop, time: '+48 min', cls: 'destination' },
        ],
        rec: pref === 'Least Crowd'
      },
      {
        id: 3, label: 'Express (Fewer Stops)', time: '39 min', buses: '1 bus', crowd: 55, delay: 'Minor delay +4 min', route: '51',
        stops: [
          { name: fromStop, time: 'Now', cls: 'current' },
          { name: 'Hosur Road', time: '+20 min', cls: '' },
          { name: toStop, time: '+39 min', cls: 'destination' },
        ],
        rec: pref === 'Fewest Stops'
      }
    ];
    setRoutes(results);
    setExpandedRoute(null);
  };

  const crowdColor = (c) => {
    return c < 50 ? '#00e5b4' : c < 80 ? '#ffd32a' : '#ff4757';
  };

  const recommendedRoute = routes.find(r => r.rec);

  const locateMe = () => {
    if (!navigator.geolocation) {
      showNotif('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch('http://localhost:5000/api/buses');
        const allBuses = await res.json();
        
        // Simple distance sort (Euclidean approx for demonstration)
        const sorted = allBuses.sort((a, b) => {
          const distA = Math.pow(a.lat - latitude, 2) + Math.pow(a.lng - longitude, 2);
          const distB = Math.pow(b.lat - latitude, 2) + Math.pow(b.lng - longitude, 2);
          return distA - distB;
        });
        
        setNearbyBuses(sorted.slice(0, 3));
        setLocating(false);
        showNotif('Location found! Showing nearest buses.');
      } catch (e) {
        setLocating(false);
        showNotif('Failed to fetch nearby buses.');
      }
    }, () => {
      setLocating(false);
      showNotif('Unable to retrieve your location');
    });
  };

  return (
    <div id="section-passenger" className="section active">
      <div className="section-header">
        <div className="section-title">Journey Planner</div>
        <div className="section-desc">Find the best route with live crowd and ETA info</div>
      </div>

      <div className="search-box">
        <div className="search-row">
          <div className="form-group">
            <label className="form-label">From</label>
            <select className="form-select" value={fromStop} onChange={e => setFromStop(e.target.value)}>
              <option>MG Road</option>
              <option>City Center</option>
              <option>Silk Board</option>
              <option>Koramangala</option>
              <option>Whitefield</option>
              <option>Hebbal</option>
            </select>
          </div>
          <div style={{ paddingBottom: '8px', fontSize: '1.2rem', cursor: 'pointer', userSelect: 'none' }} onClick={swapStops}>⇄</div>
          <div className="form-group">
            <label className="form-label">To</label>
            <select className="form-select" value={toStop} onChange={e => setToStop(e.target.value)}>
              <option>Electronic City</option>
              <option>MG Road</option>
              <option>Airport Road</option>
              <option>Rajajinagar</option>
              <option>Indiranagar</option>
              <option>Yelahanka</option>
            </select>
          </div>
          <div className="form-group" style={{ maxWidth: '130px' }}>
            <label className="form-label">Preference</label>
            <select className="form-select" value={pref} onChange={e => setPref(e.target.value)}>
              <option>Fastest</option>
              <option>Least Crowd</option>
              <option>Fewest Stops</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={searchRoutes}>Find Routes</button>
        </div>
      </div>

      {recommendedRoute && (
        <div className="recommendation-banner" id="rec-banner">
          <div className="rec-emoji">🤖</div>
          <div className="rec-text">
            <strong>AI Recommendation:</strong> Take <strong>Route {recommendedRoute.route}</strong> – Best match for your "<strong>{pref}</strong>" preference. {recommendedRoute.crowd < 60 ? 'Low crowd, comfortable ride.' : 'Moderate occupancy expected.'}
          </div>
        </div>
      )}

      <div id="route-results">
        {routes.map(r => (
          <div className="route-result" key={r.id}>
            <div className="route-header" onClick={() => setExpandedRoute(expandedRoute === r.id ? null : r.id)}>
              <div>
                <div className="route-title">
                  {r.label} · <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{r.time}</span>
                  {r.rec && <span className="badge badge-green" style={{ marginLeft: '8px' }}>★ Recommended</span>}
                </div>
                <div className="route-meta">
                  <span>🚌 {r.buses}</span>
                  <span style={{ color: crowdColor(r.crowd) }}>👥 {r.crowd}% crowd</span>
                  <span>⏱ {r.delay}</span>
                  <span style={{ color: 'var(--accent)' }}>Route {r.route}</span>
                </div>
              </div>
              <div style={{ color: 'var(--text3)', fontSize: '1.2rem', transform: expandedRoute === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</div>
            </div>
            {expandedRoute === r.id && (
              <div className="route-detail">
                <div className="timeline">
                  {r.stops.map((s, i) => (
                    <div className={`timeline-stop ${s.cls}`} key={i}>
                      <div className="stop-name">{s.name}</div>
                      <div className="stop-time">{s.time}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '7px 14px' }} onClick={() => showNotif('Tracking started for this route.')}>Track this bus</button>
                  <button className="btn" style={{ fontSize: '0.8rem', padding: '7px 14px', border: '1px solid var(--border)', color: 'var(--text2)', background: 'transparent' }} onClick={() => showNotif('🔔 Alert set! You\'ll be notified 5 min before your bus arrives.')}>Set Alert</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">📍 Nearby Buses</div>
            <button className="btn" style={{ fontSize: '0.78rem', padding: '5px 12px', border: '1px solid var(--border)', color: 'var(--text2)', background: 'transparent' }} onClick={locateMe} disabled={locating}>
              {locating ? 'Locating...' : '📍 Locate Me'}
            </button>
          </div>
          <div id="nearby-stops">
            {nearbyBuses ? (
              nearbyBuses.map((bus, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Route {bus.route_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>Heading to {bus.next_stop_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--mono)' }}>{bus.eta_minutes} min</div>
                    <div style={{ fontSize: '0.7rem', color: crowdColor(bus.crowd_level) }}>{bus.crowd_level} Crowd</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>
                Click "Locate Me" to find buses near your current location.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>🔔 Set Trip Alert</div>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Route</label>
            <select className="form-select" style={{ marginBottom: '8px' }}>
              <option>Route 17A – Airport Express</option>
              <option>Route 35C – Tech Park</option>
              <option>Route 7B – Silk Board</option>
              <option>Route 92 – Circular</option>
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Alert me when bus is</label>
            <select className="form-select">
              <option>5 minutes away</option>
              <option>10 minutes away</option>
              <option>3 minutes away</option>
              <option>Leaves previous stop</option>
            </select>
          </div>
          <button className="btn btn-green" style={{ width: '100%' }} onClick={() => showNotif('🔔 Alert set! You\'ll be notified 5 min before your bus arrives.')}>Set Alert 🔔</button>
        </div>
      </div>
    </div>
  );
}
