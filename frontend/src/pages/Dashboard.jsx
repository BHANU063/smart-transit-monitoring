import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard() {
  const initialBuses = [
    { id: 1, route_name: '17A', lat: 12.9716, lng: 77.5946, crowd_level: 'Low', next_stop_name: 'MG Road', eta_minutes: 2, traffic_condition: 'Normal' },
    { id: 2, route_name: '35C', lat: 12.9352, lng: 77.6245, crowd_level: 'Medium', next_stop_name: 'Koramangala', eta_minutes: 5, traffic_condition: 'Heavy' },
    { id: 3, route_name: '92', lat: 12.9172, lng: 77.6228, crowd_level: 'High', next_stop_name: 'Silk Board', eta_minutes: 8, traffic_condition: 'Critical' },
    { id: 4, route_name: '7B', lat: 12.9784, lng: 77.6408, crowd_level: 'Low', next_stop_name: 'Indiranagar', eta_minutes: 3, traffic_condition: 'Normal' },
    { id: 5, route_name: '51', lat: 12.9250, lng: 77.5938, crowd_level: 'Medium', next_stop_name: 'Jayanagar', eta_minutes: 6, traffic_condition: 'Heavy' },
    { id: 6, route_name: '22', lat: 12.9915, lng: 77.5533, crowd_level: 'High', next_stop_name: 'Rajajinagar', eta_minutes: 10, traffic_condition: 'Critical' }
  ];

  const initialStops = [
    { id: 1, name: 'MG Road', lat: 12.9716, lng: 77.5946 },
    { id: 2, name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
    { id: 3, name: 'Silk Board', lat: 12.9172, lng: 77.6228 },
    { id: 4, name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
    { id: 5, name: 'Jayanagar', lat: 12.9250, lng: 77.5938 },
    { id: 6, name: 'Rajajinagar', lat: 12.9915, lng: 77.5533 }
  ];

  const [buses, setBuses] = useState(initialBuses);
  const [stops, setStops] = useState(initialStops);
  const [stats, setStats] = useState({
    busesCount: 6,
    delayedCount: 2,
    criticalCount: 2,
    avgCrowd: 68
  });

  // Simulate live tracking in the frontend
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses => prevBuses.map(bus => ({
        ...bus,
        lat: bus.lat + (Math.random() - 0.5) * 0.003, // Random movement
        lng: bus.lng + (Math.random() - 0.5) * 0.003
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const crowdColor = (level) => {
    if (level === 'Low') return 'var(--green)';
    if (level === 'Medium') return 'var(--yellow)';
    return 'var(--red)';
  };
  
  const crowdPercent = (level) => {
    if (level === 'Low') return 30;
    if (level === 'Medium') return 65;
    return 95;
  };

  const getStatus = (bus) => {
    if (bus.traffic_condition === 'Heavy') return 'delayed';
    if (bus.traffic_condition === 'Critical') return 'critical';
    return 'on-time';
  };

  const statusBadge = (s) => {
    const map = { 'on-time': 'badge-green', 'delayed': 'badge-yellow', 'early': 'badge-blue', 'critical': 'badge-red' };
    const text = { 'on-time': 'On Time', 'delayed': 'Delayed', 'early': 'Early', 'critical': 'Critical' };
    return <span className={`badge ${map[s]}`}>{text[s]}</span>;
  };

  return (
    <div id="section-dashboard" className="section active">
      <div className="hero">
        <div className="hero-tag">⚡ Real-Time Monitoring Active</div>
        <h1>Urban Transit<br/><span>Intelligence Hub</span></h1>
        <p>Live bus tracking, crowd estimation, and ETA predictions powering smarter commutes across the city.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-label">Active Buses</div>
          <div className="stat-value">{stats.busesCount || 48}</div>
          <div className="stat-change up">↑ 6 vs yesterday</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">On-Time Rate</div>
          <div className="stat-value">84%</div>
          <div className="stat-change up">↑ 3% this week</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Avg Crowd Level</div>
          <div className="stat-value">{stats.avgCrowd}%</div>
          <div className="stat-change down">↓ 8% from peak</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Alerts Today</div>
          <div className="stat-value">7</div>
          <div className="stat-change down">↓ 2 from yesterday</div>
        </div>
      </div>

      <div className="grid-aside">
        {/* MAP PANEL */}
        <div>
          <div className="map-container">
            <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {stops.map(stop => (
                <Marker 
                  key={`stop-${stop.id}`} 
                  position={[stop.lat, stop.lng]}
                  icon={L.divIcon({
                    className: 'custom-stop',
                    html: '<div style="width:12px;height:12px;border-radius:50%;background:var(--surface3);border:2px solid var(--accent);"></div>',
                    iconSize: [12, 12]
                  })}
                >
                  <Popup><b style={{color: 'var(--text)'}}>{stop.name}</b></Popup>
                </Marker>
              ))}
              {buses.map(bus => {
                const color = crowdColor(bus.crowd_level);
                return (
                  <Marker 
                    key={`bus-${bus.id}`} 
                    position={[bus.lat, bus.lng]}
                    icon={L.divIcon({
                      className: 'custom-bus',
                      html: `<div style="background:rgba(0,0,0,0.5);border:2px solid ${color};color:${color};width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">${bus.route_name || 'B'}</div>`,
                      iconSize: [32, 32]
                    })}
                  >
                    <Popup>
                      <div style={{color: 'var(--text)'}}>
                        <div style={{fontWeight:700, color: color, marginBottom: 4}}>Route {bus.route_name}</div>
                        <div>Crowd: {bus.crowd_level}</div>
                        <div>Next stop: {bus.next_stop_name} ({bus.eta_minutes} min)</div>
                        <div>Traffic: {bus.traffic_condition}</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            <div className="map-legend">
              <div className="legend-item"><div className="legend-dot" style={{background:'var(--green)'}}></div> <span style={{color:'var(--text2)'}}>On time</span></div>
              <div className="legend-item"><div className="legend-dot" style={{background:'var(--yellow)'}}></div> <span style={{color:'var(--text2)'}}>Minor delay</span></div>
              <div className="legend-item"><div className="legend-dot" style={{background:'var(--red)'}}></div> <span style={{color:'var(--text2)'}}>Major delay</span></div>
            </div>
            <div className="map-info">
              <div className="map-info-title">📍 Network Status</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',fontSize:'0.75rem'}}>
                <div><div style={{color:'var(--text3)'}}>On Time</div><div style={{color:'var(--green)',fontWeight:700}}>{stats.busesCount - stats.delayedCount}</div></div>
                <div><div style={{color:'var(--text3)'}}>Delayed</div><div style={{color:'var(--yellow)',fontWeight:700}}>{stats.delayedCount}</div></div>
                <div><div style={{color:'var(--text3)'}}>Critical</div><div style={{color:'var(--red)',fontWeight:700}}>{stats.criticalCount}</div></div>
                <div><div style={{color:'var(--text3)'}}>Routes</div><div style={{color:'var(--accent)',fontWeight:700}}>24</div></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div><div className="card-title">🚨 Live Alerts</div></div>
              <span className="badge badge-red">3 Critical</span>
            </div>
            <div id="alerts-container">
              <div className="alert-item critical">
                <div className="alert-icon">🔴</div>
                <div>
                  <div className="alert-text"><strong>Route 7B</strong> – Silk Board Junction severely congested. 18-min delay expected. Crowding at 95%.</div>
                  <div className="alert-time">2 min ago</div>
                </div>
              </div>
              <div className="alert-item warning">
                <div className="alert-icon">🟡</div>
                <div>
                  <div className="alert-text"><strong>Route 35C</strong> – Overcrowding detected at City Center stop. Next bus in 4 min.</div>
                  <div className="alert-time">5 min ago</div>
                </div>
              </div>
              <div className="alert-item info">
                <div className="alert-icon">🔵</div>
                <div>
                  <div className="alert-text"><strong>Route 92</strong> – Running 2 min early. Passengers advised to be at stop on time.</div>
                  <div className="alert-time">8 min ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div>
          <div className="card" style={{marginBottom:'1.5rem'}}>
            <div className="card-header">
              <div>
                <div className="card-title">Active Fleet</div>
                <div className="card-sub">Real-time positions</div>
              </div>
              <span className="badge badge-green">{stats.busesCount} running</span>
            </div>
            <div>
              {buses.slice(0, 6).map((b, i) => {
                const c = crowdPercent(b.crowd_level);
                const cColor = crowdColor(b.crowd_level);
                return (
                  <div className="bus-row" key={i}>
                    <div className="bus-num" style={{background:`rgba(${c>80?'255,71,87':c>50?'255,211,42':'0,229,180'},0.12)`,color:cColor,border:`1px solid ${cColor}40`}}>
                      {b.route_name || 'B'}
                    </div>
                    <div className="bus-info">
                      <div className="bus-route">Route {b.route_name}</div>
                      <div className="bus-eta">ETA {b.eta_minutes} min · {b.next_stop_name}</div>
                    </div>
                    <div className="crowd-bar-wrap">
                      <div className="crowd-label">{c}% full</div>
                      <div className="crowd-bar"><div className="crowd-fill" style={{width:`${c}%`,background:cColor}}></div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">🧑‍🤝‍🧑 Network Crowd Level</div>
              <span className="badge badge-yellow">PEAK HOUR</span>
            </div>
            <div style={{marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'6px'}}>
                <span style={{fontSize:'0.78rem',color:'var(--text2)'}}>Average occupancy</span>
                <span style={{fontSize:'1.4rem',fontWeight:700,fontFamily:'var(--mono)',color:'var(--accent4)'}}>{stats.avgCrowd}%</span>
              </div>
              <div className="crowd-segments">
                {[20,45,68,89,55,34,72,91,48,62].map((l, i) => (
                  <div key={i} className="crowd-seg" style={{background: l < 50 ? 'var(--green)' : l < 80 ? 'var(--yellow)' : 'var(--red)'}}></div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'var(--text3)'}}>
                <span>Empty</span><span>Full</span>
              </div>
            </div>
            <div style={{fontSize:'0.8rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{color:'var(--text2)'}}>🟢 Low (&lt;50%)</span><span style={{color:'var(--green)',fontWeight:600}}>{buses.filter(b=>b.crowd_level==='Low').length} buses</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{color:'var(--text2)'}}>🟡 Medium (50-80%)</span><span style={{color:'var(--yellow)',fontWeight:600}}>{buses.filter(b=>b.crowd_level==='Medium').length} buses</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0'}}>
                <span style={{color:'var(--text2)'}}>🔴 High (&gt;80%)</span><span style={{color:'var(--red)',fontWeight:600}}>{buses.filter(b=>b.crowd_level==='High').length} buses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
