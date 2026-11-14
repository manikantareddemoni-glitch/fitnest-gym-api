// ==============================================================================
// FITNEST GYM – LOCKER ROOM MANAGEMENT REST API
// Course: Backend Development Fundamentals (Year II Term II)
// Group ID: YG-CSE2E-G01 | Theme 1: Locker Rooms
// Syllabus Architecture: Comprehensive Coverage of Modules 1 to 5
// ==============================================================================

// ==============================================================================
// MODULE 1: NODE.JS AND EXPRESS.JS FUNDAMENTALS
// - Development Environment Setup & NPM package imports
// - Express framework initialization
// - HTTP Server setup, port binding & HTTP request/response handling
// ==============================================================================
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT secret key used for token signing and verification (Module 4)
const JWT_SECRET = process.env.JWT_SECRET || "fitnest_gym_secret_jwt_key_2026";

// ==============================================================================
// MODULE 2: SQLITE AND RELATIONAL DATABASE OPERATIONS
// - SQLite connection via better-sqlite3 with enforced foreign keys
// - Relational schema initialization (members, lockers, allotments, users)
// - Database query helpers with parameterized SQL queries preventing SQL injection
// ==============================================================================
const { db, initializeDatabase } = require("./db");

// ==============================================================================
// MODULE 3: RESTFUL API DEVELOPMENT AND MODULAR ROUTING
// - Modular router architecture (routing files separated by resource domain)
// - Resource endpoints adhering to standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
// ==============================================================================
const lockerRoutes = require("./routes/lockerRoutes");
const memberRoutes = require("./routes/memberRoutes");
const allotmentRoutes = require("./routes/allotmentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================================================================
// MODULE 5: MIDDLEWARE, AUTHORIZATION AND ERROR HANDLING (PART 1: BUILT-IN & CUSTOM)
// - Built-in middleware: express.json() for JSON body parsing
// - Custom logging middleware: tracks incoming HTTP requests, methods, URLs, latency
// - Middleware execution flow: sequentially executes before passing to route handlers
// ==============================================================================

// Built-in middleware to parse incoming application/json request bodies
app.use(express.json());

// Custom Logging Middleware (Demonstrates middleware execution flow & latency tracking)
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
    });
    next(); // Pass control to the next middleware/route handler in the stack
});

// ==============================================================================
// MODULE 4 & 5: AUTHENTICATION, AUTHORIZATION & SECURITY ENFORCEMENT
// - Authentication Strategy: Bearer JWT Token verification
// - Role-Based Access Control (RBAC): restricts endpoints to 'admin' or 'staff'
// - Protected routes: secured against unauthorized access (HTTP 401 & 403)
// ==============================================================================

/**
 * Authentication Middleware:
 * Extracts Bearer token from the 'Authorization' header and validates it using jsonwebtoken.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(401).json({ error: "Access denied: Missing authentication token" });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = userPayload; // Attach authenticated user payload to request object
        next();
    });
}

/**
 * Authorization Middleware (Role-Based Access Control - RBAC):
 * Ensures that the authenticated user possesses the required privilege level.
 */
function authorizeRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ error: `Forbidden: Requires '${requiredRole}' role` });
        }
        next();
    };
}

// ==============================================================================
// REGISTER ROUTE MODULES (MODULE 1 & 3: MODULAR ROUTING & REST PRINCIPLES)
// ==============================================================================
app.use("/auth", authRoutes);              // Module 4: User Registration & Login
app.use("/lockers", lockerRoutes);        // Module 3: Locker CRUD & Floor Query Search
app.use("/members", memberRoutes);        // Module 3: Gym Member CRUD
app.use("/allotments", allotmentRoutes);  // Module 2 & 3: Relational Allotments & Status Flow

// ==============================================================================
// PROTECTED ROUTES (MODULE 4 & 5: DEMONSTRATING AUTHENTICATION & RBAC IN ACTION)
// ==============================================================================

// Protected Route 1: Any authenticated user (staff or admin) can view their profile
app.get("/api/profile", authenticateToken, (req, res) => {
    res.status(200).json({
        message: "Protected user profile accessed successfully",
        user: req.user
    });
});

// Protected Route 2: Restricted strictly to 'admin' role via RBAC
app.get("/api/admin/system-status", authenticateToken, authorizeRole("admin"), (req, res) => {
    res.status(200).json({
        message: "Admin system status accessed successfully",
        serverStatus: "Operational",
        database: "SQLite3 (better-sqlite3)",
        authenticatedAdmin: req.user.username,
        timestamp: new Date().toISOString()
    });
});

// ==============================================================================
// ROOT API HEALTH & DOCUMENTATION ENDPOINT (MODULE 1: HTTP REQUEST & RESPONSE)
// ==============================================================================
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

// ==============================================================================
// MODULE 5: ERROR HANDLING & LOGGING (CENTRALIZED ERROR ARCHITECTURE)
// - 404 Not Found Handler for unmatched routes
// - Global 500 / 400 Error Handler capturing syntax errors and uncaught exceptions
// ==============================================================================

// 404 Route Not Found Handler
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` });
});

// Global Error Handler Middleware (4 arguments identify it as Express error handler)
app.use((err, req, res, next) => {
    console.error("⚠️ [Global Error Handler]:", err.message);

    // Express JSON parsing error (e.g., malformed JSON payload in request body)
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Malformed JSON payload" });
    }

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ error: message });
});

// ==============================================================================
// HTTP SERVER LISTENER (MODULE 1: HTTP SERVER SETUP)
// ==============================================================================
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
