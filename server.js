const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "fitnest_gym_secret_jwt_key_2026";

const { db, initializeDatabase } = require("./db");

const lockerRoutes = require("./routes/lockerRoutes");
const memberRoutes = require("./routes/memberRoutes");
const allotmentRoutes = require("./routes/allotmentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied: Missing authentication token" });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = userPayload;
        next();
    });
}

function authorizeRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ error: `Forbidden: Requires '${requiredRole}' role` });
        }
        next();
    };
}

app.use("/auth", authRoutes);
app.use("/lockers", lockerRoutes);
app.use("/members", memberRoutes);
app.use("/allotments", allotmentRoutes);

app.get("/api/profile", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Protected user profile accessed successfully",
        user: req.user
    });
});

app.get("/api/admin/system-status", authenticateToken, authorizeRole("admin"), (req, res) => {
    res.status(200).json({
        message: "Admin system status accessed successfully",
        serverStatus: "Operational",
        database: "SQLite3 (better-sqlite3)",
        authenticatedAdmin: req.user.username,
        timestamp: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to FitNest Gym Locker Room Management REST API",
        group: "YG-CSE2E-G01",
        theme: "Theme 1 - Locker Rooms",
        syllabus_modules: {
            module_1: "Node.js and Express.js Fundamentals",
            module_2: "SQLite and Relational Database Operations",
            module_3: "RESTful API Development and Validation",
            module_4: "Authentication and User Management (JWT + bcrypt)",
            module_5: "Middleware, Authorization (RBAC) and Error Handling"
        },
        endpoints: {
            auth: {
                register: "POST /auth/register",
                login: "POST /auth/login",
                users: "GET /auth/users"
            },
            lockers: {
                list_all: "GET /lockers",
                filter_by_floor: "GET /lockers?floor=2",
                get_one: "GET /lockers/:id",
                create: "POST /lockers",
                update: "PUT /lockers/:id",
                soft_delete: "DELETE /lockers/:id",
                restore: "POST /lockers/:id/restore"
            },
            members: {
                list_all: "GET /members",
                get_one: "GET /members/:id",
                create: "POST /members",
                update: "PUT /members/:id",
                delete: "DELETE /members/:id"
            },
            allotments: {
                create: "POST /allotments",
                join_details: "GET /allotments/details",
                status_flow: "PATCH /allotments/:id/status"
            },
            protected_routes: {
                profile: "GET /api/profile (Requires JWT Bearer Token)",
                admin_status: "GET /api/admin/system-status (Requires Admin JWT Token)"
            }
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` });
});

app.use((err, req, res, next) => {
    console.error("⚠️ [Global Error Handler]:", err.message);

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON payload" });
    }

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🏋️  FitNest Gym API Server running at http://localhost:${PORT}`);
        console.log(`👥 Group ID: YG-CSE2E-G01 | Theme 1: Locker Rooms`);
        console.log(`📘 Syllabus Modules 1 - 5 Active & Ready!`);
        console.log(`====================================================`);
    });
}

module.exports = app;
