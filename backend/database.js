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

        console.log("Tables created successfully.");

        // Clean existing data for clean seed
        db.run('DELETE FROM route_stops');
        db.run('DELETE FROM buses');
        db.run('DELETE FROM stops');
        db.run('DELETE FROM routes');
        db.run('DELETE FROM bus_locations');
        db.run('DELETE FROM passenger_events');
        db.run('DELETE FROM eta_logs');

        // ==== SEED DATA: Bengaluru Routes ====
        const routes = [
            { id: 1, name: 'Majestic to Whitefield', color: '#ef4444' }, // Red
            { id: 2, name: 'Silk Board to KR Puram', color: '#3b82f6' }, // Blue
            { id: 3, name: 'Hebbal to Electronic City', color: '#10b981' }, // Green
            { id: 4, name: 'Banashankari to Manyata', color: '#f59e0b' } // Yellow
        ];
        
        routes.forEach(r => db.run(`INSERT INTO routes (id, name, color) VALUES (?, ?, ?)`, [r.id, r.name, r.color]));

        // Stops Data (Approx coordinates)
        const stopsData = [
            // Route 1 Stops
            { id: 1, name: 'Majestic', lat: 12.9771, lng: 77.5728 },
            { id: 2, name: 'Corporation Circle', lat: 12.9654, lng: 77.5858 },
            { id: 3, name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
            { id: 4, name: 'Marathahalli', lat: 12.9569, lng: 77.7011 },
            { id: 5, name: 'Whitefield', lat: 12.9698, lng: 77.7499 },

            // Route 2 Stops
            { id: 6, name: 'Silk Board', lat: 12.9176, lng: 77.6238 },
            { id: 7, name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
            { id: 8, name: 'Bellandur', lat: 12.9304, lng: 77.6784 },
            { id: 9, name: 'Mahadevapura', lat: 12.9880, lng: 77.6895 },
            { id: 10, name: 'KR Puram', lat: 13.0084, lng: 77.7027 },

            // Route 3 Stops
            { id: 11, name: 'Hebbal', lat: 13.0354, lng: 77.5988 },
            { id: 12, name: 'Mekhri Circle', lat: 13.0133, lng: 77.5805 },
            { id: 13, name: 'Shantinagar', lat: 12.9566, lng: 77.5960 },
            { id: 14, name: 'Bommanahalli', lat: 12.9030, lng: 77.6242 },
            { id: 15, name: 'Electronic City', lat: 12.8399, lng: 77.6770 },

            // Route 4 Stops
            { id: 16, name: 'Banashankari', lat: 12.9152, lng: 77.5736 },
            { id: 17, name: 'Jayanagar', lat: 12.9299, lng: 77.5826 },
            { id: 18, name: 'MG Road', lat: 12.9719, lng: 77.6011 },
            { id: 19, name: 'Frazer Town', lat: 12.9972, lng: 77.6141 },
            { id: 20, name: 'Manyata Tech Park', lat: 13.0450, lng: 77.6206 }
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
            { id: 3, route_id: 2, lat: 12.9176, lng: 77.6238, passenger_count: 5, next_stop_id: 7, traffic: 'Light', eta: 3 },
            { id: 4, route_id: 3, lat: 13.0133, lng: 77.5805, passenger_count: 48, next_stop_id: 13, traffic: 'Heavy', eta: 25 },
            { id: 5, route_id: 4, lat: 12.9719, lng: 77.6011, passenger_count: 25, next_stop_id: 19, traffic: 'Moderate', eta: 12 }
        ];

        initialBuses.forEach(b => {
            db.run(`INSERT INTO buses (id, route_id, lat, lng, passenger_count, crowd_level, traffic_condition, next_stop_id, eta_minutes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [b.id, b.route_id, b.lat, b.lng, b.passenger_count, b.passenger_count > 35 ? 'High' : (b.passenger_count > 15 ? 'Medium' : 'Low'), b.traffic, b.next_stop_id, b.eta]);
        });

        console.log("Seeding complete: Bengaluru Routes loaded.");
    });
};

initDb();
module.exports = db;
