import { useState, useEffect } from 'react';
import { showNotif } from '../utils';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function Authority() {
  const [buses, setBuses] = useState([]);
  
  const fetchData = async () => {
    try {
      const busesRes = await fetch('http://localhost:5000/api/buses');
      const busesData = await busesRes.json();
      setBuses(busesData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const action = (type) => {
    const msgs = {
      deploy: '✅ Extra bus deployed on Route 7B – ETA 8 min to Silk Board',
      reroute: '🔀 Route 35C rerouted via Hosur Road – delay reduced by 8 min',
      notify: '📢 Alert broadcast to 2,400 passengers in affected zones',
      schedule: '📅 Peak schedule updated – 5-min headway for Routes 17A & 35C',
      contact: '📞 Driver contact initiated'
    };
    showNotif(msgs[type] || 'Action completed');
  };

  const crowdColor = (level) => {
    if (level === 'Low') return '#00e5b4';
    if (level === 'Medium') return '#ffd32a';
    return '#ff4757';
  };

  const statusBadge = (s) => {
    const map = { 'on-time': 'badge-green', 'delayed': 'badge-yellow', 'early': 'badge-blue', 'critical': 'badge-red' };
    const text = { 'on-time': 'On Time', 'delayed': 'Delayed', 'early': 'Early', 'critical': 'Critical' };
    return <span className={`badge ${map[s]}`}>{text[s]}</span>;
  };
  
  const getStatus = (bus) => {
    if (bus.traffic_condition === 'Heavy') return 'delayed';
    if (bus.traffic_condition === 'Critical') return 'critical';
    return 'on-time';
  };

  const radarData = {
    labels: ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'],
    datasets: [{
      label: 'Load %',
      data: [65, 78, 88, 92, 75, 60, 55, 70],
      borderColor: '#3b9eff',
      backgroundColor: 'rgba(59,158,255,0.15)',
      pointBackgroundColor: '#3b9eff',
      borderWidth: 2
    }]
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0, max: 100,
        grid: { color: 'rgba(99,179,255,0.1)' },
        angleLines: { color: 'rgba(99,179,255,0.1)' },
        ticks: { display: false },
        pointLabels: { color: '#8ba4c8', font: { size: 10 } }
      }
    }
  };

  return (
    <div id="section-authority" className="section active">
      <div className="section-header">
        <div className="section-title">Authority Control Centre</div>
        <div className="section-desc">Fleet management, scheduling, and operational oversight</div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>🚌 Fleet Summary</div>
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)' }}>Total Fleet</span><span style={{ fontWeight: 700 }} className="mono">72 buses</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)' }}>Active Now</span><span style={{ fontWeight: 700, color: 'var(--green)' }} className="mono">{buses.length || 48}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)' }}>In Depot</span><span style={{ fontWeight: 700, color: 'var(--accent)' }} className="mono">18</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text2)' }}>Maintenance</span><span style={{ fontWeight: 700, color: 'var(--yellow)' }} className="mono">4</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text2)' }}>Breakdown</span><span style={{ fontWeight: 700, color: 'var(--red)' }} className="mono">2</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn" style={{ background: 'rgba(255,71,87,0.1)', color: 'var(--red)', border: '1px solid rgba(255,71,87,0.25)', textAlign: 'left', padding: '8px 12px' }} onClick={() => action('deploy')}>🚌 Deploy Extra Bus – Route 7B</button>
            <button className="btn" style={{ background: 'rgba(59,158,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(59,158,255,0.25)', textAlign: 'left', padding: '8px 12px' }} onClick={() => action('reroute')}>🔀 Reroute 35C – Bypass Jam</button>
            <button className="btn" style={{ background: 'rgba(0,229,180,0.1)', color: 'var(--green)', border: '1px solid rgba(0,229,180,0.25)', textAlign: 'left', padding: '8px 12px' }} onClick={() => action('notify')}>📢 Broadcast Delay Alert</button>
            <button className="btn" style={{ background: 'rgba(245,166,35,0.1)', color: 'var(--accent4)', border: '1px solid rgba(245,166,35,0.25)', textAlign: 'left', padding: '8px 12px' }} onClick={() => action('schedule')}>📅 Adjust Peak Schedule</button>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.75rem' }}>🔧 Maintenance Queue</div>
          <div style={{ fontSize: '0.82rem' }}>
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600 }}>Bus KA-01-F-4421</div>
              <div style={{ color: 'var(--red)', fontSize: '0.72rem' }}>Engine check – Due today</div>
              <div className="progress-wrap"><div className="progress-bar"><div className="progress-fill" style={{ width: '90%', background: 'var(--red)' }}></div></div></div>
            </div>
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600 }}>Bus KA-01-F-3308</div>
              <div style={{ color: 'var(--yellow)', fontSize: '0.72rem' }}>Tyre replacement – Due in 2 days</div>
              <div className="progress-wrap"><div className="progress-bar"><div className="progress-fill" style={{ width: '70%', background: 'var(--yellow)' }}></div></div></div>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontWeight: 600 }}>Bus KA-01-F-7892</div>
              <div style={{ color: 'var(--green)', fontSize: '0.72rem' }}>Routine service – Due in 5 days</div>
              <div className="progress-wrap"><div className="progress-bar"><div className="progress-fill" style={{ width: '40%', background: 'var(--green)' }}></div></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-aside-left" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>⚠️ Incident Log</div>
          <div style={{ fontSize: '0.8rem' }}>
            <div className="alert-item critical" style={{ marginBottom: '6px' }}>
              <div>🔴</div>
              <div>
                <div><strong>Route 7B Silk Board:</strong> Major traffic jam – Bus delayed 18 min. Passenger overcrowding at 95%.</div>
                <div style={{ color: 'var(--text3)', fontSize: '0.7rem', fontFamily: 'var(--mono)', marginTop: '3px' }}>09:42 AM · Auto-escalated</div>
              </div>
            </div>
            <div className="alert-item warning">
              <div>🟡</div>
              <div>
                <div><strong>Route 35C:</strong> Driver reported brake noise. Flagged for inspection at end of shift.</div>
                <div style={{ color: 'var(--text3)', fontSize: '0.7rem', fontFamily: 'var(--mono)', marginTop: '3px' }}>08:55 AM · Driver reported</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Network Load Heatmap</div>
          </div>
          <div className="chart-wrap" style={{ height: '200px' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Live Bus Details</div>
          <button className="btn" style={{ fontSize: '0.78rem', padding: '5px 12px', border: '1px solid var(--border)', color: 'var(--text2)', background: 'transparent' }} onClick={() => { fetchData(); showNotif('↻ Bus data refreshed'); }}>↻ Refresh</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Bus ID</th><th>Route</th><th>Driver</th><th>Speed</th><th>Location</th><th>Crowd</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {buses.length > 0 ? buses.map((b) => (
              <tr key={b.id}>
                <td className="mono" style={{ fontSize: '0.72rem' }}>{b.plate_number}</td>
                <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{b.route_name}</span></td>
                <td>{b.driver || 'Ravi Kumar'}</td>
                <td className="mono">{(Math.random() * 20 + 20).toFixed(0)} km/h</td>
                <td>{b.next_stop_name}</td>
                <td><span style={{ color: crowdColor(b.crowd_level), fontWeight: 600 }}>{b.crowd_level}</span></td>
                <td>{statusBadge(getStatus(b))}</td>
                <td><button onClick={() => action('contact')} className="btn" style={{ fontSize: '0.7rem', padding: '3px 8px', border: '1px solid var(--border)', color: 'var(--text2)', background: 'transparent' }}>Contact</button></td>
              </tr>
            )) : (
              <tr><td colSpan="8" style={{textAlign:'center', color:'var(--text3)'}}>Loading bus data...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
