// src/middleware/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Ensure we always have a usable error message
    const message = err.message || 'Internal Server Error';

    // Log full details to console for debugging
    console.error('❌ Server Error Occurred');
    console.error('➡️ Path:', req.path);
    console.error('➡️ Method:', req.method);
    console.error('➡️ Message:', message);
    console.error('➡️ Stack:', err.stack || 'No stack available');

    // Save detailed error log using logger
    logger.error('Unhandled server error', {
        message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
        status: err.status || err.statusCode || 500
    });

    // Determine status code safely
    const statusCode = err.status || err.statusCode || 500;

    // Build API response
    const errorResponse = {
        success: false,
        error: {
            message,
            statusCode,
        }
    };

    // Expose stack only in development mode
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = err.stack;
        errorResponse.error.details = err.details || null;
    }

    // Send standardized JSON response
    res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
