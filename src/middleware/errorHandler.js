// Owner: Member 1 - Server and Routes (RAVELLA LOKESH, 252U1R1217)
// Global error handling middleware for uncaught exceptions, bad JSON, and 404 routes.

/**
 * 404 Not Found handler for undefined API routes
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl} - Route not found` });
}

/**
 * Global Error Handler: Catches JSON parsing errors and server internal errors
 */
function globalErrorHandler(err, req, res, next) {
    console.error('⚠️ [Server Error]:', err.message);

    // Express JSON body-parser error (e.g., malformed JSON in request body)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Malformed JSON payload' });
    }

    // Default internal server error response
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
}

module.exports = {
    notFoundHandler,
    globalErrorHandler
};

