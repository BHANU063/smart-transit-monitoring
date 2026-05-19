import { useState } from 'react';

export default function Admin() {
  const [message, setMessage] = useState('');

  const handleSimulate = async (action) => {
    try {
      const res = await fetch(\`http://localhost:5000/api/simulate/\${action}\`, { method: 'POST' });
      const data = await res.json();
      setMessage(data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error connecting to backend');
    }
  };

  return (
    <div className="main-content">
      <h2>System Administration</h2>
      
      {message && (
        <div style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          {message}
        </div>
      )}

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <div className="glass-panel stat-card">
          <h3>Simulation Engine Control</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
            Start or stop the background GPS and passenger simulation engine.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => handleSimulate('start')}
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Start Engine
            </button>
            <button 
              onClick={() => handleSimulate('stop')}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Stop Engine
            </button>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <h3>Fleet Management</h3>
          <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
            Add, Edit, or Remove active buses and routes.
          </p>
          <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'not-allowed', opacity: 0.7 }}>
            Manage Fleet (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
