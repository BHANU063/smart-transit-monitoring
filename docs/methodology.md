# Methodology & Architecture

The SmartTransit system was built using a structured full-stack methodology focused on decoupling the backend data generation from the frontend visualization.

## 1. Backend Engine (Node.js + Express)
- **Database**: SQLite is used due to its lightweight nature. Six relational tables normalize the data (`routes`, `stops`, `route_stops`, `buses`, `bus_locations`, `passenger_events`).
- **REST APIs**: Express exposes decoupled REST endpoints (`/api/buses`, `/api/live`, `/api/analytics`) ensuring JSON data transmission.
- **Simulation Loop**: An asynchronous `setInterval` loop acts as the engine. Every 3 seconds, it:
  1. Calculates spherical distance to the next GPS coordinate.
  2. Modifies speed dynamically via random traffic conditions (Light/Moderate/Heavy).
  3. Uses pseudo-random event generation to simulate passenger boarding upon reaching a stop.
  4. Recalculates crowd levels and ETA thresholds before committing to SQLite.

## 2. Frontend Application (React + Vite)
- **Component Architecture**: The UI is divided into reusable React components mapped via React Router (Dashboard, Map, Analytics, BusDetails).
- **State Management**: Uses React Hooks (`useState`, `useEffect`) to poll the REST API continuously, maintaining local state arrays for real-time visualization.
- **Geographic UI**: Integrates `react-leaflet` to map latitude/longitude data points into visual map markers, dynamically styling them based on crowd JSON properties.
- **Algorithms**: Implements client-side filtering algorithms to generate "Smart Recommendations", parsing ETA and crowd level thresholds locally to save server computation.
