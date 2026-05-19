import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import BusDetails from './pages/BusDetails';
// Placeholders for other pages
const Analytics = () => <div className="main-content"><h2>Analytics</h2><p>Coming soon...</p></div>;
const Admin = () => <div className="main-content"><h2>Admin</h2><p>Coming soon...</p></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <h2>SmartTransit</h2>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Dashboard</NavLink>
          <NavLink to="/map" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Live Map</NavLink>
          <NavLink to="/analytics" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Analytics</NavLink>
          <NavLink to="/admin" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Admin</NavLink>
        </aside>
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/bus/:id" element={<BusDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
