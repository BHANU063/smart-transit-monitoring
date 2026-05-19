let interval = null;
let currentWeather = 'Sunny';
const WEATHER_STATES = ['Sunny', 'Cloudy', 'Light Rain', 'Thunderstorm'];

function startSimulation(db) {
    if (interval) return;
    console.log("Simulation Engine Started with Weather & Events.");

    db.run(`INSERT INTO system_events (message, type) VALUES ('Simulation Engine Online.', 'success')`);

    // Weather Engine Loop (every 20 seconds)
    setInterval(() => {
        const roll = Math.random();
        let newWeather = currentWeather;
        if (roll < 0.2) newWeather = 'Thunderstorm';
        else if (roll < 0.4) newWeather = 'Light Rain';
        else if (roll < 0.7) newWeather = 'Cloudy';
        else newWeather = 'Sunny';

        if (newWeather !== currentWeather) {
            currentWeather = newWeather;
            let type = newWeather === 'Thunderstorm' ? 'error' : (newWeather === 'Sunny' ? 'success' : 'warning');
            db.run(`INSERT INTO system_events (message, type) VALUES ('Weather changed to ${newWeather}.', '${type}')`);
        }
    }, 20000);

    interval = setInterval(() => {
        db.all(`SELECT * FROM buses WHERE status = 'Active'`, [], (err, buses) => {
            if (err || !buses) return;

            buses.forEach(bus => {
                db.get(`SELECT lat, lng, name as stop_name FROM stops WHERE id = ?`, [bus.next_stop_id], (err, stop) => {
                    if (err || !stop) return;

                    const latDiff = stop.lat - bus.lat;
                    const lngDiff = stop.lng - bus.lng;
                    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                    // Dynamic traffic simulation influenced by weather
                    const roll = Math.random();
                    let traffic = bus.traffic_condition;
                    
                    let heavyChance = 0.1;
                    if (currentWeather === 'Thunderstorm') heavyChance = 0.6;
                    else if (currentWeather === 'Light Rain') heavyChance = 0.3;

                    if (roll < heavyChance) {
                        traffic = 'Heavy';
                        // Log traffic incident randomly if it just turned heavy
                        if (bus.traffic_condition !== 'Heavy' && Math.random() < 0.5) {
                            db.run(`INSERT INTO system_events (message, type) VALUES ('Bus #${bus.id} is stuck in Heavy Traffic near ${stop.stop_name}.', 'error')`);
                        }
                    }
                    else if (roll < heavyChance + 0.3) traffic = 'Moderate';
                    else traffic = 'Light';

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
                        
                        // Log location history
                        db.run(`INSERT INTO bus_locations (bus_id, lat, lng) VALUES (?, ?, ?)`, [bus.id, newLat, newLng]);

                    } else {
                        // Reached stop
                        const exited = Math.floor(Math.random() * Math.min(10, passCount));
                        const spaceLeft = bus.capacity - (passCount - exited);
                        
                        // Weather bias: people don't want to walk in rain
                        const weatherBias = (currentWeather === 'Thunderstorm' || currentWeather === 'Light Rain') ? 5 : 0;
                        const boarded = Math.floor(Math.random() * Math.min(15 + weatherBias, spaceLeft));
                        
                        passCount = passCount - exited + boarded;

                        // Calculate CO2 Saved & Total Passengers
                        if (boarded > 0) {
                            const co2Saved = boarded * 0.2; // 0.2kg saved per passenger
                            db.run(`UPDATE analytics SET total_passengers = total_passengers + ?, co2_saved_kg = co2_saved_kg + ? WHERE id = 1`, [boarded, co2Saved]);
                        }

                        // Occasionally log arrival events
                        if (Math.random() < 0.3) {
                            db.run(`INSERT INTO system_events (message, type) VALUES ('Bus #${bus.id} arrived at ${stop.stop_name}. ${boarded} boarded.', 'info')`);
                        }

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

function getCurrentWeather() {
    return currentWeather;
}

module.exports = { startSimulation, stopSimulation, getCurrentWeather };
