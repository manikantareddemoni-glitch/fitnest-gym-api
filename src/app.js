// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// Express Application Configuration: mounts middleware, routes, and error handlers.

const express = require('express');
const lockersRouter = require('./routes/lockers');
const membersRouter = require('./routes/members');
const allotmentsRouter = require('./routes/allotments');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware: parse incoming JSON bodies
app.use(express.json());

// Request logging middleware (helpful for debugging and viva demonstrations)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Root API Health & Info Endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to FitNest Gym Locker Room Management REST API',
        group: 'YG-CSE2E-G01',
        theme: 'Theme 1 - Locker Rooms',
        endpoints: {
            lockers: '/lockers',
            members: '/members',
            allotments: '/allotments',
            allotment_details: '/allotments/details'
        }
    });
});

// Mount Resource Routers
app.use('/lockers', lockersRouter);
app.use('/members', membersRouter);
app.use('/allotments', allotmentsRouter);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;

