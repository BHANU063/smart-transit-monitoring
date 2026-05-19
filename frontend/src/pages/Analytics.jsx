import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState('today');

  // Chart Data
  const hours = ['5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM'];
  const loadToday = [15,28,55,88,95,72,60,65,70,68,75,88,92,85,62,40];
  const loadWeek = [10,20,40,70,80,60,50,55,60,65,70,80,85,75,55,30];

  const hourlyData = {
    labels: hours,
    datasets: [{
      label: 'Crowd %',
      data: timeFilter === 'today' ? loadToday : loadWeek,
      fill: true,
      borderColor: '#3b9eff',
      backgroundColor: 'rgba(59,158,255,0.1)',
      tension: 0.4,
      pointRadius: 2,
      borderWidth: 2
    }]
  };

  const hourlyOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } },
      x: { grid: { color: 'rgba(99,179,255,0.04)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } }
    }
  };

  const routes = [
    { route:'17A', name:'Airport Express', pax:8200, ontime:94, crowd:62, delays:1 },
    { route:'35C', name:'Tech Park Shuttle', pax:11400, ontime:71, crowd:87, delays:5 },
    { route:'92', name:'Circular Line', pax:6800, ontime:88, crowd:45, delays:2 },
    { route:'7B', name:'Silk Board Express', pax:13200, ontime:58, crowd:91, delays:8 },
    { route:'51', name:'EC Express', pax:9600, ontime:91, crowd:56, delays:1 },
    { route:'22', name:'Rajajinagar Loop', pax:5400, ontime:83, crowd:51, delays:3 },
  ];

  const ontimeData = {
    labels: routes.map(r => r.route),
    datasets: [{
      label: 'On-Time %',
      data: routes.map(r => r.ontime),
      backgroundColor: routes.map(r => r.ontime > 85 ? 'rgba(0,229,180,0.6)' : r.ontime > 70 ? 'rgba(255,211,42,0.6)' : 'rgba(255,71,87,0.6)'),
      borderRadius: 4
    }]
  };

  const ontimeOptions = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { min: 0, max: 100, grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } },
      y: { grid: { display: false }, ticks: { color: '#8ba4c8', font: { size: 10 } } }
    }
  };

  const crowdData = {
    labels: ['Low (<50%)', 'Medium (50-80%)', 'High (>80%)'],
    datasets: [{
      data: [29, 46, 25],
      backgroundColor: ['rgba(0,229,180,0.7)', 'rgba(255,211,42,0.7)', 'rgba(255,71,87,0.7)'],
      borderWidth: 0
    }]
  };

  const crowdOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { color: '#8ba4c8', font: { size: 11 }, padding: 12 } } }
  };

  const weeklyData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    datasets: [{
      label: 'Passengers (K)',
      data: [980, 1020, 1050, 1080, 1100, 1150, 1180, 1220],
      backgroundColor: 'rgba(59,158,255,0.6)',
      borderRadius: 4
    }]
  };

  const weeklyOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(99,179,255,0.06)' }, ticks: { color: '#8ba4c8', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#8ba4c8', font: { size: 10 } } }
    }
  };

  const crowdColor = (c) => c < 50 ? '#00e5b4' : c < 80 ? '#ffd32a' : '#ff4757';
  
  const statusBadge = (s) => {
    const map = { 'on-time': 'badge-green', 'delayed': 'badge-yellow', 'early': 'badge-blue', 'critical': 'badge-red' };
    const text = { 'on-time': 'On Time', 'delayed': 'Delayed', 'early': 'Early', 'critical': 'Critical' };
    return <span className={`badge ${map[s]}`}>{text[s]}</span>;
  };

  return (
    <div id="section-analytics" className="section active">
      <div className="section-header">
        <div className="section-title">System Analytics</div>
        <div className="section-desc">Historical performance, crowd patterns, and route efficiency metrics</div>
      </div>

      <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card blue">
          <div className="stat-label">Daily Passengers</div>
          <div className="stat-value">1.2M</div>
          <div className="stat-change up">↑ 12% vs last month</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Avg Journey Time</div>
          <div className="stat-value">28m</div>
          <div className="stat-change up">↓ 4 min improved</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Fuel Efficiency</div>
          <div className="stat-value">91%</div>
          <div className="stat-change up">↑ 2.3% this week</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Satisfaction Score</div>
          <div className="stat-value">4.2★</div>
          <div className="stat-change up">↑ 0.3 pts</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Hourly Passenger Load</div>
              <div className="card-sub">Crowd vs capacity across all routes</div>
            </div>
            <div className="time-filters">
              <button className={`time-filter ${timeFilter === 'today' ? 'active' : ''}`} onClick={() => setTimeFilter('today')}>Today</button>
              <button className={`time-filter ${timeFilter === 'week' ? 'active' : ''}`} onClick={() => setTimeFilter('week')}>Week</button>
            </div>
          </div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Line data={hourlyData} options={hourlyOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">On-Time Performance</div>
              <div className="card-sub">By route this week</div>
            </div>
          </div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Bar data={ontimeData} options={ontimeOptions} />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Crowd Distribution</div>
            <div className="card-sub" style={{ marginTop: '2px' }}>Occupancy level breakdown</div>
          </div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Doughnut data={crowdData} options={crowdOptions} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Weekly Ridership Trend</div>
          </div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Bar data={weeklyData} options={weeklyOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Route Performance Table</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Name</th>
              <th>Avg Passengers/Day</th>
              <th>On-Time %</th>
              <th>Avg Crowd</th>
              <th>Delays Today</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: 'var(--accent)' }}>{r.route}</td>
                <td style={{ fontWeight: 500 }}>{r.name}</td>
                <td className="mono">{r.pax.toLocaleString()}</td>
                <td><span style={{ color: r.ontime > 85 ? 'var(--green)' : r.ontime > 70 ? 'var(--yellow)' : 'var(--red)', fontWeight: 700 }}>{r.ontime}%</span></td>
                <td><span style={{ color: crowdColor(r.crowd), fontWeight: 600 }}>{r.crowd}%</span></td>
                <td className="mono">{r.delays}</td>
                <td>{statusBadge(r.ontime > 85 ? 'on-time' : r.ontime > 70 ? 'delayed' : 'critical')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
