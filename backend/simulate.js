let interval = null;

function startSimulation(db) {
    if (interval) return;
    console.log("Simulation started.");
    // Will be fully implemented in Step 4
}

function stopSimulation() {
    if (interval) {
        clearInterval(interval);
        interval = null;
        console.log("Simulation stopped.");
    }
}

module.exports = { startSimulation, stopSimulation };
