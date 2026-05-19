import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Recommendations() {
  const futureHours = ['Now', '30m', '1h', '1.5h', '2h'];
  
  const predData = {
    labels: futureHours,
    datasets: [
      { 
        label: 'Predicted', 
        data: [62, 75, 88, 82, 70], 
        borderColor: '#3b9eff', 
        borderDash: [5, 3], 
        tension: 0.4, 
        pointRadius: 4, 
        borderWidth: 2, 
        fill: false 
      },
      { 
        label: 'Actual', 
        data: [62, null, null, null, null], 
        borderColor: '#00e5b4', 
        tension: 0.4, 
        pointRadius: 4, 
        borderWidth: 2, 
        fill: false 
      }
    ]
  };

  const predOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: '#8ba4c8', font: { size: 11 } } } },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#8ba4c8', font: { size: 10 } } }
    }
  };

  const routeNames = ['17A', '35C', '92', '7B', '51', '22'];
  const efficiencyData = {
    labels: routeNames,
    datasets: [{
      label: 'Efficiency',
      data: [88, 72, 91, 61, 89, 84],
      backgroundColor: 'rgba(0,229,180,0.6)',
      borderRadius: 4
    }]
  };

  const efficiencyOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#8ba4c8', font: { size: 10 } } }
    }
  };

  const hours = ['5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM'];
  const demandData = {
    labels: hours,
    datasets: [
      { 
        label: 'Tomorrow (forecast)', 
        data: [12, 22, 58, 92, 98, 75, 65, 68, 72, 70, 80, 90, 95, 88, 65, 42],
        fill: true, 
        borderColor: '#a55eea', 
        backgroundColor: 'rgba(165,94,234,0.1)', 
        tension: 0.4, 
        pointRadius: 0, 
        borderWidth: 2 
      },
      { 
        label: 'Today', 
        data: [15, 28, 55, 88, 95, 72, 60, 65, 70, 68, 75, 88, 92, 85, 62, 40],
        fill: false, 
        borderColor: '#3b9eff', 
        tension: 0.4, 
        pointRadius: 0, 
        borderWidth: 1.5 
      }
    ]
  };

  const demandOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#8ba4c8', font: { size: 11 } } } },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#8ba4c8', font: { size: 10 }, maxTicksLimit: 8 } }
    }
  };

  const aiRecs = [
    { icon:'🚌', title:'Deploy extra bus on Route 7B', desc:'Crowd at 95% and delay of 18 min. Additional bus from depot recommended immediately. Estimated relief: −30% crowd in 25 min.', priority:5 },
    { icon:'🔀', title:'Reroute Route 35C via Hosur Road', desc:'Current path via BTM has 22-min congestion window. Alternate route saves 8 min. Impact: 340 passengers on next 3 trips.', priority:4 },
    { icon:'📅', title:'Increase peak frequency on Routes 17A & 35C', desc:'Pattern analysis shows 30% ridership spike weekdays 8–10 AM. Recommend 5-min headway reduction. ROI positive in 2 weeks.', priority:4 },
    { icon:'⛽', title:'Optimize idle time at City Center depot', desc:'4 buses idle for >45 min during peak. Stagger departure times to reduce fuel waste. Estimated savings: ₹1,800/day.', priority:3 },
    { icon:'📱', title:'Push crowd alert to 2,400 waiting passengers', desc:'Route 7B stop has 200+ waiting. Alternate options (Route 92 in 3 min) should be broadcast via app.', priority:5 },
    { icon:'🔧', title:'Schedule Bus KA01F4421 for urgent inspection', desc:'Vibration telemetry anomaly detected over last 4 trips. Risk score: HIGH. Remove from service after current trip.', priority:5 },
    { icon:'🌦️', title:'Rain-adjusted schedule for evening peak', desc:'Weather forecast shows heavy rain 5–8 PM. Historical data shows 18% delay increase. Pre-position 3 reserve buses.', priority:3 },
    { icon:'📊', title:'Route 22 underutilised – frequency review needed', desc:'Average 41% occupancy on Route 22. Consider merging with Route 26 or reducing frequency. Saves 2 bus-hours/day.', priority:2 },
  ];

  return (
    <div id="section-recommendations" className="section active">
      <div className="section-header">
        <div className="section-title">AI Insights & Recommendations</div>
        <div className="section-desc">ML-powered predictions and smart dispatch suggestions</div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>🔮 Crowd Prediction – Next 2 Hours</div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Line data={predData} options={predOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>📊 Route Efficiency Score</div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Bar data={efficiencyData} options={efficiencyOptions} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">🤖 AI-Generated Action Items</div>
          <span className="badge badge-blue">8 insights</span>
        </div>
        <div id="ai-recs">
          {aiRecs.map((r, i) => (
            <div className="rec-card" key={i}>
              <div className="rec-icon" style={{ background: 'rgba(59,158,255,0.08)', border: '1px solid var(--border)' }}>{r.icon}</div>
              <div className="rec-content">
                <div className="rec-title">{r.title}</div>
                <div className="rec-desc">{r.desc}</div>
                <div className="priority-bar">
                  <span className="priority-label">Priority</span>
                  <div className="priority-dots">
                    {[1, 2, 3, 4, 5].map(p => (
                      <div key={p} className={`priority-dot ${p <= r.priority ? 'active' : ''}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>📈 Demand Forecast – Tomorrow</div>
          <div className="chart-wrap" style={{ height: '200px' }}>
            <Line data={demandData} options={demandOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>🎯 Model Accuracy</div>
          <div style={{ fontSize: '0.82rem' }}>
            {[
              { label: 'ETA Prediction', val: 92, color: 'var(--green)' },
              { label: 'Crowd Estimation', val: 87, color: 'var(--accent)' },
              { label: 'Delay Forecast', val: 85, color: 'var(--accent4)' },
              { label: 'Demand Prediction', val: 78, color: 'var(--purple)' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ color: 'var(--text2)' }}>{m.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="progress-bar" style={{ width: '100px' }}>
                    <div className="progress-fill" style={{ width: `${m.val}%`, background: m.color }}></div>
                  </div>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.val}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '10px', background: 'rgba(0,229,180,0.06)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', border: '1px solid rgba(0,229,180,0.12)' }}>
            <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: '4px' }}>📡 Data Sources</div>
            <div style={{ color: 'var(--text2)' }}>GPS telemetry · IR passenger counters · Historical GTFS · Traffic API · Weather API · Event calendar</div>
          </div>
        </div>
      </div>
    </div>
  );
}
