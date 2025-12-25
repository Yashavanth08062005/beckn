const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const becknRoutes = require('./routes/becknRoutes');
const env = require('./config/env');
console.log('📝 app.js starting...');

const app = express();
const PORT = env.PORT || 7003;
console.log('📝 Creating express app on port:', PORT);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
        console.log('📝 Health endpoint called');
    res.json({ 
        status: 'OK', 
        message: 'Hotels BPP is running',
        service: 'BPP-HOTELS',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Beckn Protocol Routes
console.log('📝 Setting up routes');
app.use('/', becknRoutes);
// 404 handler
app.use((req, res) => {
    console.log('404 - Not Found:', req.method, req.path);
    res.status(404).json({ error: 'Not found' });
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Express Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
        error: {
            type: "CORE-ERROR",
            code: "20000",
            message: err.message || "Internal server error"
        }
    });
});

// Start the server
console.log('📝 Calling app.listen()...');
app.listen(PORT, () => {
    console.log(`🏨 Hotels BPP is running on port ${PORT}`);
    console.log(`📋 Health: GET http://127.0.0.1:${PORT}/health`);
    console.log(`📋 Search: POST http://127.0.0.1:${PORT}/search`);
console.log('📝 app.listen() called, waiting for callback...');
});

// Global error handlers
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
});

module.exports = app;