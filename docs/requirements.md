# Requirement Specification

## Functional Requirements
The system must:
1. **Simulate GPS Bus Movement**: Track multiple simulated buses across major Bengaluru routes based on real lat/lng coordinates.
2. **Dynamic Passenger Generation**: Simulate passenger boarding and exiting at each stop, ensuring logical capacity limits.
3. **Traffic Simulation**: Dynamically alter the traffic conditions (Light, Moderate, Heavy) to realistically slow down bus speeds.
4. **Intelligent ETA**: Calculate Estimated Time of Arrival (ETA) dynamically factoring in distance and real-time traffic conditions.
5. **Crowd Classification**: Calculate passenger counts and classify crowd levels as Low (0-30%), Medium (31-70%), and High (71-100%).
6. **Smart Recommendations**: Evaluate all active routes and output the fastest bus with available seating capacity.
7. **Authority Analytics**: Track total delayed buses and route-wise average passenger loads over time.
8. **Interactive Mapping**: Provide a geographic live map tracking all buses.

## Non-Functional Requirements
1. **Performance**: Fast processing of simulated data, polling the REST API continuously without lag.
2. **Scalability**: Ability to handle new routes and buses seamlessly via database seeding.
3. **Usability**: Clean, React-based Single Page Application interface that is highly responsive.
4. **Reliability**: Accurate and mathematically consistent simulation interval engine.
5. **Cost-effectiveness**: Avoids paid APIs; utilizes open-source React Leaflet and standard Node.js architecture.
6. **Maintainability**: Clear separation of concerns (React Frontend vs Node Express Backend).
