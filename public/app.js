document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const busesContainer = document.getElementById('buses-container');
    const activeBusesCount = document.getElementById('active-buses-count');
    const recommendationContent = document.getElementById('recommendation-content');
    
    // Analytics DOM Elements
    const totalPassengersEl = document.getElementById('total-passengers');
    const co2SavedEl = document.getElementById('co2-saved');
    const avgCrowdEl = document.getElementById('avg-crowd');
    
    // Navigation & Views
    const navDashboard = document.getElementById('nav-dashboard');
    const navMap = document.getElementById('nav-map');
    const navAnalytics = document.getElementById('nav-analytics');
    const viewDashboard = document.getElementById('dashboard-view');
    const viewMap = document.getElementById('map-view');
    const viewAnalytics = document.getElementById('analytics-view');
    
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Leaflet Map instance
    let map = null;
    let busMarkers = {}; // Keep track of bus markers by ID
    let mapInitialized = false;

    // ----- UI Interactions -----

    // Theme Switcher
    let isDarkMode = true;
    themeToggleBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            document.body.classList.remove('light-theme');
            themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
        } else {
            document.body.classList.add('light-theme');
            themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
        }
    });

    // View Switcher Utility
    function switchView(activeNav, activeView) {
        [navDashboard, navMap, navAnalytics].forEach(nav => nav.classList.remove('active'));
        [viewDashboard, viewMap, viewAnalytics].forEach(view => view.style.display = 'none');
        
        activeNav.classList.add('active');
        activeView.style.display = 'block';
    }

    navDashboard.addEventListener('click', () => switchView(navDashboard, viewDashboard));
    navAnalytics.addEventListener('click', () => switchView(navAnalytics, viewAnalytics));

    navMap.addEventListener('click', () => {
        switchView(navMap, viewMap);
        // Leaflet needs to know the container size changed
        if (!mapInitialized) {
            initMap();
        } else {
            map.invalidateSize();
        }
    });

    // ----- Map Initialization -----
    async function initMap() {
        // Center around Bangalore (seed data coordinates)
        map = L.map('map').setView([12.9850, 77.6100], 13);
        
        // Use a modern, clean map tile layer (CartoDB Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        mapInitialized = true;

        // Fetch stops to draw them on the map
        try {
            const res = await fetch('/api/stops');
            const stops = await res.json();
            stops.forEach(stop => {
                const stopIcon = L.divIcon({
                    className: 'stop-marker-icon',
                    iconSize: [12, 12]
                });
                L.marker([stop.lat, stop.lng], { icon: stopIcon })
                 .addTo(map)
                 .bindPopup(`<b>${stop.name}</b><br>Bus Stop`);
            });
        } catch (e) {
            console.error("Error loading stops for map", e);
        }
    }

    // ----- Core Data Fetching -----

    async function fetchData() {
        try {
            const [busesRes, analyticsRes] = await Promise.all([
                fetch('/api/buses'),
                fetch('/api/analytics')
            ]);

            if (busesRes.ok) {
                const buses = await busesRes.json();
                updateDashboard(buses);
                if (mapInitialized) updateMapMarkers(buses);
            }

            if (analyticsRes.ok) {
                const analytics = await analyticsRes.json();
                updateAnalytics(analytics);
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function updateAnalytics(analytics) {
        totalPassengersEl.innerText = analytics.total_passengers.toLocaleString();
        co2SavedEl.innerText = analytics.co2_saved_kg.toFixed(1);
    }

    function updateMapMarkers(buses) {
        buses.forEach(bus => {
            // Determine color based on crowd level
            let color = '#10b981'; // Low
            if (bus.crowd_level === 'Medium') color = '#f59e0b';
            if (bus.crowd_level === 'High') color = '#ef4444';

            // Custom dynamic icon
            const busIcon = L.divIcon({
                className: 'custom-bus-marker',
                html: `<div class="bus-marker-icon" style="background-color: ${color}; width: 30px; height: 30px;">🚌</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const popupContent = `
                <b>${bus.route_name}</b><br>
                Next Stop: ${bus.next_stop_name}<br>
                Passengers: ${bus.passenger_count}/${bus.capacity}<br>
                Crowd: <b>${bus.crowd_level}</b><br>
                Traffic: <b>${bus.traffic_condition || 'Light'}</b>
            `;

            if (busMarkers[bus.id]) {
                // Update existing marker position
                busMarkers[bus.id].setLatLng([bus.lat, bus.lng]);
                busMarkers[bus.id].setIcon(busIcon);
                busMarkers[bus.id].getPopup().setContent(popupContent);
            } else {
                // Create new marker
                const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
                    .addTo(map)
                    .bindPopup(popupContent);
                busMarkers[bus.id] = marker;
            }
        });
    }

    function updateDashboard(buses) {
        // Update active buses count
        activeBusesCount.innerText = buses.length;

        // Calculate Average Fleet Crowd
        let highCount = 0; let medCount = 0;
        buses.forEach(b => {
            if (b.crowd_level === 'High') highCount++;
            else if (b.crowd_level === 'Medium') medCount++;
        });
        
        if (highCount > buses.length / 2) avgCrowdEl.innerText = 'High';
        else if (medCount + highCount > buses.length / 2) avgCrowdEl.innerText = 'Medium';
        else avgCrowdEl.innerText = 'Low';
        
        // Update avg crowd color
        avgCrowdEl.style.color = avgCrowdEl.innerText === 'High' ? '#ef4444' : (avgCrowdEl.innerText === 'Medium' ? '#f59e0b' : '#10b981');

        // Smart Recommendation Logic
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
            const routeColor = bus.route_color || '#3b82f6';

            // Ensure traffic condition exists for older seeds
            const traffic = bus.traffic_condition || 'Light';

            card.innerHTML = `
                <div class="bus-header" style="gap: 10px; display: flex; flex-wrap: wrap;">
                    <span class="bus-route-tag" style="background-color: ${routeColor}33; color: ${routeColor}; border: 1px solid ${routeColor}; flex-grow: 1;">
                        ${bus.route_name}
                    </span>
                    <div style="display: flex; gap: 5px;">
                        <span class="traffic-badge traffic-${traffic}" title="Traffic Condition">${traffic}</span>
                        <span class="crowd-badge crowd-${bus.crowd_level}" title="Crowd Level">${bus.crowd_level}</span>
                    </div>
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
    }

    // Initial fetch
    fetchData();

    // Poll every 3 seconds
    setInterval(fetchData, 3000);
});
