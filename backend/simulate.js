let interval = null;

function startSimulation(db) {
    if (interval) return;
    console.log("Simulation Engine Started.");

    interval = setInterval(() => {
        db.all(`SELECT * FROM buses WHERE status = 'Active'`, [], (err, buses) => {
            if (err || !buses) return;

            buses.forEach(bus => {
                db.get(`SELECT lat, lng FROM stops WHERE id = ?`, [bus.next_stop_id], (err, stop) => {
                    if (err || !stop) return;

                    const latDiff = stop.lat - bus.lat;
                    const lngDiff = stop.lng - bus.lng;
                    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                    // Dynamic traffic simulation
                    const roll = Math.random();
                    let traffic = bus.traffic_condition;
                    if (roll < 0.1) traffic = 'Heavy';
                    else if (roll < 0.3) traffic = 'Moderate';
                    else if (roll < 0.5) traffic = 'Light';

                    let speed = 0.005; // Base speed
                    if (traffic === 'Moderate') speed = 0.003;
                    if (traffic === 'Heavy') speed = 0.001;

                    let newLat = bus.lat;
                    let newLng = bus.lng;
                    let nextStopId = bus.next_stop_id;
                    let passCount = bus.passenger_count;
                    let eta = bus.eta_minutes;

                    if (distance > 0.001) {
                        newLat += latDiff > 0 ? Math.min(speed, latDiff) : Math.max(-speed, latDiff);
                        newLng += lngDiff > 0 ? Math.min(speed, lngDiff) : Math.max(-speed, lngDiff);
                        
                        const etaMult = traffic === 'Heavy' ? 3 : (traffic === 'Moderate' ? 1.5 : 1);
                        eta = Math.max(1, Math.floor(distance * 1000 * etaMult));
                        
                        // Log location
                        db.run(`INSERT INTO bus_locations (bus_id, lat, lng) VALUES (?, ?, ?)`, [bus.id, newLat, newLng]);

                    } else {
                        // Reached stop
                        const exited = Math.floor(Math.random() * Math.min(10, passCount));
                        const spaceLeft = bus.capacity - (passCount - exited);
                        const boarded = Math.floor(Math.random() * Math.min(15, spaceLeft));
                        
                        passCount = passCount - exited + boarded;

                        // Log passenger event
                        if (boarded > 0 || exited > 0) {
                            db.run(`INSERT INTO passenger_events (bus_id, stop_id, boarded, exited) VALUES (?, ?, ?, ?)`, 
                                    [bus.id, nextStopId, boarded, exited]);
                        }

                        // Log actual ETA arrival
                        db.run(`INSERT INTO eta_logs (bus_id, stop_id, predicted_eta, actual_arrival) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, 
                                [bus.id, nextStopId, bus.eta_minutes]);

                        // Find next stop
                        db.get(`
                            SELECT stop_id FROM route_stops 
                            WHERE route_id = ? AND stop_order > (
                                SELECT stop_order FROM route_stops WHERE route_id = ? AND stop_id = ?
                            ) ORDER BY stop_order ASC LIMIT 1
                        `, [bus.route_id, bus.route_id, nextStopId], (err, nextRS) => {
                            
                            if (nextRS) {
                                nextStopId = nextRS.stop_id;
                            } else {
                                // Loop back to start
                                db.get(`SELECT stop_id FROM route_stops WHERE route_id = ? ORDER BY stop_order ASC LIMIT 1`, [bus.route_id], (err, firstRS) => {
                                    if (firstRS) nextStopId = firstRS.stop_id;
                                    updateBus(db, bus.id, newLat, newLng, passCount, nextStopId, eta, bus.capacity, traffic);
                                });
                                return;
                            }
                            updateBus(db, bus.id, newLat, newLng, passCount, nextStopId, eta, bus.capacity, traffic);
                        });
                        return;
                    }

                    updateBus(db, bus.id, newLat, newLng, passCount, nextStopId, eta, bus.capacity, traffic);
                });
            });
        });
    }, 4000);
}

function updateBus(db, id, lat, lng, passCount, nextStopId, eta, capacity, traffic) {
    const crowdLevel = passCount / capacity > 0.7 ? 'High' : (passCount / capacity > 0.3 ? 'Medium' : 'Low');
    db.run(`
        UPDATE buses 
        SET lat = ?, lng = ?, passenger_count = ?, crowd_level = ?, traffic_condition = ?, next_stop_id = ?, eta_minutes = ?
        WHERE id = ?
    `, [lat, lng, passCount, crowdLevel, traffic, nextStopId, eta, id]);
}

function stopSimulation() {
    if (interval) {
        clearInterval(interval);
        interval = null;
        console.log("Simulation Engine Stopped.");
    }
}

module.exports = { startSimulation, stopSimulation };
