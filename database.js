const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
    db.serialize(() => {
        // Create Routes Table
        db.run(`CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT NOT NULL
        )`);

        // Create Stops Table
        db.run(`CREATE TABLE IF NOT EXISTS stops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL
        )`);

        // Create RouteStops Table
        db.run(`CREATE TABLE IF NOT EXISTS route_stops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_id INTEGER,
            stop_id INTEGER,
            stop_order INTEGER,
            FOREIGN KEY(route_id) REFERENCES routes(id),
            FOREIGN KEY(stop_id) REFERENCES stops(id)
        )`);

        // Create Buses Table with traffic_condition
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
            FOREIGN KEY(route_id) REFERENCES routes(id),
            FOREIGN KEY(next_stop_id) REFERENCES stops(id)
        )`);

        // Create Analytics Table
        db.run(`CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_passengers INTEGER DEFAULT 0,
            co2_saved_kg REAL DEFAULT 0.0
        )`);

        console.log("Tables created successfully.");

        // Clear existing data for seeding
        db.run('DELETE FROM route_stops');
        db.run('DELETE FROM buses');
        db.run('DELETE FROM stops');
        db.run('DELETE FROM routes');
        db.run('DELETE FROM analytics');

        // Seed Data
        console.log("Seeding initial data...");

        db.run(`INSERT INTO routes (id, name, color) VALUES (1, 'Route 1 - Downtown Express', '#ef4444')`);
        db.run(`INSERT INTO routes (id, name, color) VALUES (2, 'Route 2 - University Loop', '#3b82f6')`);

        const stopsData = [
            { id: 1, name: 'Central Station', lat: 12.9716, lng: 77.5946 },
            { id: 2, name: 'Tech Park', lat: 12.9780, lng: 77.6000 },
            { id: 3, name: 'City Mall', lat: 12.9850, lng: 77.6100 },
            { id: 4, name: 'University Campus', lat: 12.9900, lng: 77.6200 },
            { id: 5, name: 'Hospital', lat: 12.9950, lng: 77.6300 },
            { id: 6, name: 'Residential Complex', lat: 13.0000, lng: 77.6400 }
        ];

        stopsData.forEach(stop => {
            db.run(`INSERT INTO stops (id, name, lat, lng) VALUES (?, ?, ?, ?)`, [stop.id, stop.name, stop.lat, stop.lng]);
        });

        const route1Stops = [1, 2, 3, 5];
        route1Stops.forEach((stopId, index) => {
            db.run(`INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES (1, ?, ?)`, [stopId, index + 1]);
        });

        const route2Stops = [4, 2, 3, 6];
        route2Stops.forEach((stopId, index) => {
            db.run(`INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES (2, ?, ?)`, [stopId, index + 1]);
        });

        db.run(`INSERT INTO buses (id, route_id, lat, lng, passenger_count, crowd_level, traffic_condition, next_stop_id, eta_minutes) 
                VALUES (1, 1, 12.9716, 77.5946, 15, 'Low', 'Light', 2, 5)`);
        
        db.run(`INSERT INTO buses (id, route_id, lat, lng, passenger_count, crowd_level, traffic_condition, next_stop_id, eta_minutes) 
                VALUES (2, 2, 12.9900, 77.6200, 45, 'High', 'Moderate', 2, 12)`);

        db.run(`INSERT INTO analytics (id, total_passengers, co2_saved_kg) VALUES (1, 1450, 435.5)`); // Base starting point

        console.log("Seeding complete.");
    });
};

initDb();
