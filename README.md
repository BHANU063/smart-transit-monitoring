# SmartTransit: Smart Transit Monitoring System for Bengaluru Bus Routes

## Project Abstract
SmartTransit is an intelligent public transit monitoring system designed for the busy routes of Bengaluru. The system tracks active buses, calculates Estimated Time of Arrival (ETA), and dynamically logs crowd and traffic conditions. Built as a college major project, it demonstrates full-stack capabilities with a React+Vite frontend and a Node+Express backend.

## Problem Statement
Bengaluru public transport systems suffer from unpredictable bus timings, overcrowding, and lack of real-time passenger information. Without unified real-time analytics, commuters struggle to plan their journeys efficiently, often boarding severely overcrowded buses.

## Features
- **Real-Time GPS Simulation**: Tracks buses across 4 major Bengaluru routes.
- **Intelligent ETA**: ETA adapts based on simulated traffic conditions (Light, Moderate, Heavy).
- **Crowd Estimation**: Automatically classifies bus crowd levels based on passenger capacity limits.
- **Smart Recommendations**: Evaluates lowest ETA and comfortable crowd levels to recommend the best bus to a user.
- **Live Interactive Map**: Visualizes the bus locations and stops using Leaflet Maps.
- **Authority Analytics**: Tracks total delays and route-wise passenger load trends.

## Tech Stack
- **Frontend**: React, Vite, React Router, React-Leaflet, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite.
- **Simulation**: Custom Node.js Interval Engine.

## System Architecture
The backend serves as an independent REST API layer that queries a local SQLite database and runs an asynchronous simulation loop. The frontend is a Single Page Application (SPA) built in React that fetches data from the backend every 3 seconds to maintain a "real-time" dashboard and map interface.

## How to Run

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
   *(This will automatically install both frontend and backend dependencies)*

2. **Start the application**:
   \`\`\`bash
   npm start
   \`\`\`
   *(This uses concurrently to start both the Node server and the Vite dev server)*

3. **Open Application**:
   Navigate to \`http://localhost:5173\` in your browser.

## Screenshots
*(Add screenshots here before submission)*
- Dashboard View
- Live Map View
- Analytics Page

## Future Enhancements
- Integrate actual GPS hardware for real-world bus fleets.
- Utilize machine learning models for predictive ETA based on historical weather and traffic data.
- Mobile application for daily commuters.
