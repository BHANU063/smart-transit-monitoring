const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
    db.serialize(() => {
        // 1. routes table
        db.run(`CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT NOT NULL
        )`);

        // 2. stops table
        db.run(`CREATE TABLE IF NOT EXISTS stops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL
        )`);

        // route_stops (helper table to link routes and stops in order)
        db.run(`CREATE TABLE IF NOT EXISTS route_stops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_id INTEGER,
            stop_id INTEGER,
            stop_order INTEGER,
            FOREIGN KEY(route_id) REFERENCES routes(id),
            FOREIGN KEY(stop_id) REFERENCES stops(id)
        )`);

        // 3. buses table
        db.run(`CREATE TABLE IF NOT EXISTS buses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_id INTEGER,
            lat REAL,
            lng REAL,
            capacity INTEGER DEFAULT 50,
            passenger_count INTEGER DEFAULT 0,
            crowd_level TEXT DEFAULT 'Low',
            traffic_condition TEXT DEFAULT 'Light',
            next_stop_id INTEGER,
            eta_minutes INTEGER,
            status TEXT DEFAULT 'Active',
            FOREIGN KEY(route_id) REFERENCES routes(id),
            FOREIGN KEY(next_stop_id) REFERENCES stops(id)
        )`);

        // 4. bus_locations (history)
        db.run(`CREATE TABLE IF NOT EXISTS bus_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_id INTEGER,
            lat REAL,
            lng REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 5. passenger_events
        db.run(`CREATE TABLE IF NOT EXISTS passenger_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_id INTEGER,
            stop_id INTEGER,
            boarded INTEGER,
            exited INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 6. eta_logs
        db.run(`CREATE TABLE IF NOT EXISTS eta_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_id INTEGER,
            stop_id INTEGER,
            predicted_eta INTEGER,
            actual_arrival DATETIME,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 7. system_events
        db.run(`CREATE TABLE IF NOT EXISTS system_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 8. analytics (for CO2 and global metrics)
        db.run(`CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_passengers INTEGER DEFAULT 0,
            co2_saved_kg REAL DEFAULT 0.0
        )`);

        console.log("Tables created successfully.");

        // Clean existing data for clean seed
        db.run('DELETE FROM route_stops');
        db.run('DELETE FROM buses');
        db.run('DELETE FROM stops');
        db.run('DELETE FROM routes');
        db.run('DELETE FROM bus_locations');
        db.run('DELETE FROM passenger_events');
        db.run('DELETE FROM eta_logs');
        db.run('DELETE FROM system_events');
        db.run('DELETE FROM analytics');

        // ==== SEED DATA: Bengaluru Routes ====
        const routes = [
            { id: 1, name: '335E (Majestic ⇄ Whitefield)', color: '#ef4444' }, 
            { id: 2, name: '500D (Hebbal ⇄ Silk Board)', color: '#3b82f6' }, 
            { id: 3, name: '500HS (Hebbal ⇄ Sarjapur)', color: '#10b981' }, 
            { id: 4, name: '201 (Banashankari ⇄ CV Raman Nagar)', color: '#f59e0b' } 
        ];
        
        routes.forEach(r => db.run(`INSERT INTO routes (id, name, color) VALUES (?, ?, ?)`, [r.id, r.name, r.color]));

        // Stops Data (Approx coordinates)
        const stopsData = [
            // Route 1 Stops (335E: Majestic to Whitefield)
            { id: 1, name: 'Majestic', lat: 12.9771, lng: 77.5728 },
            { id: 2, name: 'Corporation Circle', lat: 12.9654, lng: 77.5858 },
            { id: 3, name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
            { id: 4, name: 'Marathahalli Bridge', lat: 12.9569, lng: 77.7011 },
            { id: 5, name: 'Whitefield TTMC', lat: 12.9698, lng: 77.7499 },

            // Route 2 Stops (500D: Hebbal to Silk Board via ORR)
            { id: 6, name: 'Hebbal', lat: 13.0354, lng: 77.5988 },
            { id: 7, name: 'Manyata Tech Park', lat: 13.0450, lng: 77.6206 },
            { id: 8, name: 'KR Puram Railway Station', lat: 13.0084, lng: 77.7027 },
            { id: 9, name: 'Bellandur Gate', lat: 12.9304, lng: 77.6784 },
            { id: 10, name: 'Silk Board Junction', lat: 12.9176, lng: 77.6238 },

            // Route 3 Stops (500HS: Hebbal to Sarjapur)
            { id: 11, name: 'Hebbal', lat: 13.0354, lng: 77.5988 },
            { id: 12, name: 'Kalyan Nagar', lat: 13.0221, lng: 77.6403 },
            { id: 13, name: 'Tin Factory', lat: 12.9941, lng: 77.6662 },
            { id: 14, name: 'Agara Lake', lat: 12.9238, lng: 77.6409 },
            { id: 15, name: 'Sarjapur Signal', lat: 12.9244, lng: 77.6373 },

            // Route 4 Stops (201: Banashankari to CV Raman Nagar)
            { id: 16, name: 'Banashankari TTMC', lat: 12.9152, lng: 77.5736 },
            { id: 17, name: 'Jayanagar 4th Block', lat: 12.9299, lng: 77.5826 },
            { id: 18, name: 'Dairy Circle', lat: 12.9365, lng: 77.5950 },
            { id: 19, name: 'Domlur', lat: 12.9625, lng: 77.6382 },
            { id: 20, name: 'CV Raman Nagar', lat: 12.9863, lng: 77.6648 }
        ];

        stopsData.forEach(s => db.run(`INSERT INTO stops (id, name, lat, lng) VALUES (?, ?, ?, ?)`, [s.id, s.name, s.lat, s.lng]));

        // Assign Stops to Routes
        const routeStopsMapping = [
            { route: 1, stops: [1, 2, 3, 4, 5] },
            { route: 2, stops: [6, 7, 8, 9, 10] },
            { route: 3, stops: [11, 12, 13, 14, 15] },
            { route: 4, stops: [16, 17, 18, 19, 20] }
        ];

        routeStopsMapping.forEach(mapping => {
            mapping.stops.forEach((stopId, index) => {
                db.run(`INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES (?, ?, ?)`, [mapping.route, stopId, index + 1]);
            });
        });

        // Add Initial Buses
        const initialBuses = [
            { id: 1, route_id: 1, lat: 12.9771, lng: 77.5728, passenger_count: 10, next_stop_id: 2, traffic: 'Light', eta: 5 },
            { id: 2, route_id: 1, lat: 12.9569, lng: 77.7011, passenger_count: 40, next_stop_id: 5, traffic: 'Moderate', eta: 10 },
            { id: 3, route_id: 2, lat: 13.0354, lng: 77.5988, passenger_count: 5, next_stop_id: 7, traffic: 'Light', eta: 3 },
            { id: 4, route_id: 3, lat: 13.0221, lng: 77.6403, passenger_count: 48, next_stop_id: 13, traffic: 'Heavy', eta: 25 },
            { id: 5, route_id: 4, lat: 12.9365, lng: 77.5950, passenger_count: 25, next_stop_id: 19, traffic: 'Moderate', eta: 12 }
        ];

        initialBuses.forEach(b => {
            db.run(`INSERT INTO buses (id, route_id, lat, lng, passenger_count, crowd_level, traffic_condition, next_stop_id, eta_minutes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [b.id, b.route_id, b.lat, b.lng, b.passenger_count, b.passenger_count > 35 ? 'High' : (b.passenger_count > 15 ? 'Medium' : 'Low'), b.traffic, b.next_stop_id, b.eta]);
        });

        // Initialize Analytics
        db.run(`INSERT INTO analytics (id, total_passengers, co2_saved_kg) VALUES (1, 1250, 250.0)`);
        
        // Initial Event
        db.run(`INSERT INTO system_events (message, type) VALUES ('System initialized. Simulation engine starting.', 'info')`);

        console.log("Seeding complete: Bengaluru Routes loaded.");
    });
};

initDb();
module.exports = db;
