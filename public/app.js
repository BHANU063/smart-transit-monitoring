document.addEventListener('DOMContentLoaded', () => {
    const busesContainer = document.getElementById('buses-container');
    const activeBusesCount = document.getElementById('active-buses-count');
    const recommendationContent = document.getElementById('recommendation-content');

    let previousBusData = [];

    // Fetch bus data from the backend
    async function fetchBuses() {
        try {
            const response = await fetch('/api/buses');
            if (!response.ok) throw new Error('Network response was not ok');
            const buses = await response.json();
            
            updateDashboard(buses);
        } catch (error) {
            console.error('Error fetching bus data:', error);
            // Optionally show error state in UI
        }
    }

    function updateDashboard(buses) {
        // Update active buses count
        activeBusesCount.innerText = buses.length;

        // Smart Recommendation Logic
        // Find bus with lowest ETA and Low/Medium crowd
        let bestBus = null;
        for (const bus of buses) {
            if (bus.crowd_level === 'High') continue;
            if (!bestBus || bus.eta_minutes < bestBus.eta_minutes) {
                bestBus = bus;
            }
        }

        if (bestBus) {
            recommendationContent.innerHTML = `
                Take <strong>${bestBus.route_name}</strong>. 
                Arriving at <strong>${bestBus.next_stop_name}</strong> in <span style="color: #10b981;">${bestBus.eta_minutes} min</span>. 
                Crowd: ${bestBus.crowd_level}.
            `;
        } else if (buses.length > 0) {
            recommendationContent.innerHTML = "All approaching buses are currently crowded. Consider waiting.";
        } else {
            recommendationContent.innerHTML = "No active buses found.";
        }

        // Render bus cards
        busesContainer.innerHTML = '';
        buses.forEach(bus => {
            const capacityPercentage = (bus.passenger_count / bus.capacity) * 100;
            
            const card = document.createElement('div');
            card.className = 'glass-panel bus-card';
            
            // Format color based on hex string or fallback
            const routeColor = bus.route_color || '#3b82f6';

            card.innerHTML = `
                <div class="bus-header">
                    <span class="bus-route-tag" style="background-color: ${routeColor}33; color: ${routeColor}; border: 1px solid ${routeColor};">
                        ${bus.route_name}
                    </span>
                    <span class="crowd-badge crowd-${bus.crowd_level}">${bus.crowd_level}</span>
                </div>
                
                <div class="bus-details">
                    <div class="detail-row">
                        <span class="detail-label">Next Stop</span>
                        <span class="detail-value">${bus.next_stop_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">ETA</span>
                        <span class="detail-value eta-highlight">${bus.eta_minutes} min</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Passengers</span>
                        <span class="detail-value">${bus.passenger_count} / ${bus.capacity}</span>
                    </div>
                    
                    <div class="capacity-bar-bg">
                        <div class="capacity-bar-fill fill-${bus.crowd_level}" style="width: ${capacityPercentage}%"></div>
                    </div>
                </div>
            `;
            busesContainer.appendChild(card);
        });

        previousBusData = buses;
    }

    // Initial fetch
    fetchBuses();

    // Poll every 3 seconds
    setInterval(fetchBuses, 3000);
});
