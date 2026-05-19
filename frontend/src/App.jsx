import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Passenger from './pages/Passenger';
import Analytics from './pages/Analytics';
import Authority from './pages/Authority';
import Recommendations from './pages/Recommendations';
import './index.css';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BrowserRouter>
      <nav>
        <div className="nav-brand">
          <div className="dot"></div>
          SmartTransit
        </div>
        <div className="nav-tabs">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-tab active" : "nav-tab"}>Dashboard</NavLink>
          <NavLink to="/passenger" className={({isActive}) => isActive ? "nav-tab active" : "nav-tab"}>Journey Planner</NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-tab active" : "nav-tab"}>Analytics</NavLink>
          <NavLink to="/authority" className={({isActive}) => isActive ? "nav-tab active" : "nav-tab"}>Authority View</NavLink>
          <NavLink to="/recommendations" className={({isActive}) => isActive ? "nav-tab active" : "nav-tab"}>AI Insights</NavLink>
        </div>
        <div className="nav-status">
          <div className="live-badge">
            <div className="live-dot"></div>
            LIVE
          </div>
          <span>{time}</span>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/passenger" element={<Passenger />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/authority" element={<Authority />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </main>
      
      {/* Global Notification Toast Container */}
      <div className="notif-toast" id="global-notif"></div>
    </BrowserRouter>
  );
}

export default App;
