// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// HTTP Server Entry Point: listens on configured PORT.

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏋️  FitNest Gym API Server is running!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`👥 Group ID: YG-CSE2E-G01 | Theme 1: Locker Rooms`);
    console.log(`====================================================`);
});

