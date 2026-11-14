// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// Theme 1: FitNest Gym - Locker Room Management REST API (Group ID: YG-CSE2E-G01)

const express = require("express");
const { db, initializeDatabase } = require("./db");

// Import route modules
const lockerRoutes = require("./routes/lockerRoutes");
const memberRoutes = require("./routes/memberRoutes");
const allotmentRoutes = require("./routes/allotmentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Register route modules
app.use("/lockers", lockerRoutes);
app.use("/members", memberRoutes);
app.use("/allotments", allotmentRoutes);

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to FitNest Gym Locker Room Management REST API",
        group: "YG-CSE2E-G01",
        theme: "Theme 1 - Locker Rooms",
        endpoints: {
            lockers: "/lockers",
            members: "/members",
            allotments: "/allotments",
            allotment_details: "/allotments/details"
        }
    });
});

// 404 Route Not Found handler
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("⚠️ [Server Error]:", err.message);
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON payload" });
    }
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal Server Error" });
});

// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🏋️  FitNest Gym API Server running at http://localhost:${PORT}`);
        console.log(`👥 Group ID: YG-CSE2E-G01 | Theme 1: Locker Rooms`);
        console.log(`====================================================`);
    });
}

module.exports = app;
