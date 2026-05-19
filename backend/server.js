const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { startSimulation, stopSimulation } = require('./simulate');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// ==========================================
// REST APIs
// ==========================================

// GET /api/buses - All buses with current details
app.get('/api/buses', (req, res) => {
    db.all(`
        SELECT b.*, r.name as route_name, r.color as route_color, s.name as next_stop_name 
        FROM buses b 
        JOIN routes r ON b.route_id = r.id 
        JOIN stops s ON b.next_stop_id = s.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/routes - All routes with their assigned stops
app.get('/api/routes', (req, res) => {
    db.all(`SELECT * FROM routes`, [], (err, routes) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.all(`
            SELECT rs.route_id, s.*, rs.stop_order 
            FROM route_stops rs 
            JOIN stops s ON rs.stop_id = s.id 
            ORDER BY rs.route_id, rs.stop_order
        `, [], (err, stops) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Map stops to their routes
            const routesWithStops = routes.map(r => ({
                ...r,
                stops: stops.filter(s => s.route_id === r.id)
            }));
            res.json(routesWithStops);
        });
    });
});

// GET /api/stops - All stops
app.get('/api/stops', (req, res) => {
    db.all(`SELECT * FROM stops`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/live - Live bus locations
app.get('/api/live', (req, res) => {
    db.all(`SELECT id, lat, lng, crowd_level, traffic_condition FROM buses WHERE status = 'Active'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /api/analytics - Analytics data (Route-wise crowd, delay count, etc)
app.get('/api/analytics', (req, res) => {
    // A simplified analytics object combining multiple queries
    db.all(`
        SELECT r.name, COUNT(b.id) as bus_count, AVG(b.passenger_count) as avg_passengers 
        FROM routes r 
        LEFT JOIN buses b ON r.id = b.route_id 
        GROUP BY r.id
    `, [], (err, routeStats) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get(`SELECT COUNT(*) as delayed_buses FROM buses WHERE traffic_condition = 'Heavy'`, [], (err, delayedCount) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                routeStats,
                delayedBuses: delayedCount.delayed_buses
            });
        });
    });
});

// POST /api/simulate/start
app.post('/api/simulate/start', (req, res) => {
    startSimulation(db);
    res.json({ message: 'Simulation started' });
});

// POST /api/simulate/stop
app.post('/api/simulate/stop', (req, res) => {
    stopSimulation();
    res.json({ message: 'Simulation stopped' });
});

// Start Server
app.listen(PORT, () => {
    console.log(\`Backend Server running on port \${PORT}\`);
});
