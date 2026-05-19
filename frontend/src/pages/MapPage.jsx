import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

export default function MapPage() {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);

  const fetchData = async () => {
    try {
      const [busesRes, stopsRes] = await Promise.all([
        fetch('http://localhost:5000/api/buses'),
        fetch('http://localhost:5000/api/stops')
      ]);
      setBuses(await busesRes.json());
      setStops(await stopsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>Live Geographical Tracker</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Real-time tracking of all active Bengaluru routes.
      </p>

      <div className="glass-panel" style={{ flexGrow: 1, padding: '0.5rem', minHeight: '600px' }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Draw Stops */}
          {stops.map(stop => (
            <Marker 
              key={`stop-${stop.id}`} 
              position={[stop.lat, stop.lng]}
              icon={L.divIcon({
                className: 'custom-stop-icon',
                html: '<div style="background: white; border: 2px solid #3b82f6; width: 10px; height: 10px; border-radius: 50%;"></div>',
                iconSize: [14, 14]
              })}
            >
              <Popup><b>{stop.name}</b><br/>Bus Stop</Popup>
            </Marker>
          ))}

          {/* Draw Buses */}
          {buses.map(bus => {
            let color = '#10b981';
            if (bus.crowd_level === 'Medium') color = '#f59e0b';
            if (bus.crowd_level === 'High') color = '#ef4444';

            return (
              <Marker 
                key={`bus-${bus.id}`} 
                position={[bus.lat, bus.lng]}
                icon={L.divIcon({
                  className: 'custom-bus-icon',
                  html: `<div style="background: ${color}; border: 2px solid white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 0 5px rgba(0,0,0,0.5);">🚌</div>`,
                  iconSize: [28, 28],
                  iconAnchor: [14, 14]
                })}
              >
                <Popup>
                  <b>{bus.route_name}</b><br/>
                  Next Stop: {bus.next_stop_name}<br/>
                  ETA: {bus.eta_minutes} min<br/>
                  Traffic: {bus.traffic_condition}<br/>
                  <Link to={`/bus/${bus.id}`} style={{ marginTop: '5px', display: 'inline-block', color: '#3b82f6' }}>View Details</Link>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
