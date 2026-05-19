const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// API Endpoints
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

app.get('/api/routes', (req, res) => {
    db.all(`SELECT * FROM routes`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/stops', (req, res) => {
    db.all(`SELECT * FROM stops`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/analytics', (req, res) => {
    db.get(`SELECT * FROM analytics WHERE id = 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || { total_passengers: 0, co2_saved_kg: 0 });
    });
});

// Simulation Engine
const SIMULATION_INTERVAL = 3000; // Run every 3 seconds

function updateBusSimulation() {
    db.all(`SELECT * FROM buses`, [], (err, buses) => {
        if (err) {
            console.error("Simulation error fetching buses:", err.message);
            return;
        }

        buses.forEach(bus => {
            // Find the current target stop
            db.get(`SELECT s.lat, s.lng FROM stops s WHERE s.id = ?`, [bus.next_stop_id], (err, stop) => {
                if (err || !stop) return;

                // Move bus towards stop
                const latDiff = stop.lat - bus.lat;
                const lngDiff = stop.lng - bus.lng;
                const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                // Dynamic Traffic Logic
                const trafficRoll = Math.random();
                let trafficCondition = bus.traffic_condition;
                if (trafficRoll < 0.1) trafficCondition = 'Heavy';
                else if (trafficRoll < 0.3) trafficCondition = 'Moderate';
                else trafficCondition = 'Light';

                // Speed factor based on traffic
                let speedFactor = 0.1;
                if (trafficCondition === 'Moderate') speedFactor = 0.05;
                if (trafficCondition === 'Heavy') speedFactor = 0.02;

                let newLat = bus.lat;
                let newLng = bus.lng;
                let nextStopId = bus.next_stop_id;
                let passengerCount = bus.passenger_count;
                let eta = bus.eta_minutes;

                if (distance > 0.001) {
                    newLat += latDiff * speedFactor;
                    newLng += lngDiff * speedFactor;
                    
                    // ETA longer if traffic is heavy
                    const etaMultiplier = trafficCondition === 'Heavy' ? 3 : (trafficCondition === 'Moderate' ? 1.5 : 1);
                    eta = Math.max(1, Math.floor(distance * 100 * etaMultiplier));
                } else {
                    // Reached stop!
                    const boarding = Math.floor(Math.random() * 10);
                    const alighting = Math.floor(Math.random() * Math.min(10, passengerCount));
                    passengerCount = Math.max(0, Math.min(bus.capacity, passengerCount + boarding - alighting));

                    // Update Analytics if passengers boarded
                    if (boarding > 0) {
                        const co2SavedPerPassenger = 0.2; // approx 0.2kg CO2 saved per trip vs car
                        const totalCo2Saved = boarding * co2SavedPerPassenger;
                        db.run(`UPDATE analytics SET total_passengers = total_passengers + ?, co2_saved_kg = co2_saved_kg + ? WHERE id = 1`, [boarding, totalCo2Saved]);
                    }

                    // Find next stop in route
                    db.get(`
                        SELECT stop_id FROM route_stops 
                        WHERE route_id = ? AND stop_order > (
                            SELECT stop_order FROM route_stops WHERE route_id = ? AND stop_id = ?
                        ) ORDER BY stop_order ASC LIMIT 1
                    `, [bus.route_id, bus.route_id, bus.next_stop_id], (err, nextRouteStop) => {
                        
                        if (nextRouteStop) {
                            nextStopId = nextRouteStop.stop_id;
                        } else {
                            // Reached end of route, loop back to start
                            db.get(`SELECT stop_id FROM route_stops WHERE route_id = ? ORDER BY stop_order ASC LIMIT 1`, [bus.route_id], (err, firstStop) => {
                                if (firstStop) nextStopId = firstStop.stop_id;
                                updateBusRecord(bus.id, newLat, newLng, passengerCount, nextStopId, eta, bus.capacity, trafficCondition);
                            });
                            return;
                        }
                        updateBusRecord(bus.id, newLat, newLng, passengerCount, nextStopId, eta, bus.capacity, trafficCondition);
                    });
                    return; // Wait for async query
                }
                
                updateBusRecord(bus.id, newLat, newLng, passengerCount, nextStopId, eta, bus.capacity, trafficCondition);
            });
        });
    });
}

function updateBusRecord(busId, lat, lng, passengerCount, nextStopId, eta, capacity, trafficCondition) {
    let crowdLevel = 'Low';
    const fillPercentage = passengerCount / capacity;
    if (fillPercentage > 0.8) crowdLevel = 'High';
    else if (fillPercentage > 0.4) crowdLevel = 'Medium';

    db.run(`
        UPDATE buses 
        SET lat = ?, lng = ?, passenger_count = ?, crowd_level = ?, traffic_condition = ?, next_stop_id = ?, eta_minutes = ? 
        WHERE id = ?
    `, [lat, lng, passengerCount, crowdLevel, trafficCondition, nextStopId, eta, busId]);
}

// Start Simulation
setInterval(updateBusSimulation, SIMULATION_INTERVAL);
console.log("Simulation engine started with traffic and analytics modeling.");

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
