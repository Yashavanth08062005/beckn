const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const becknRoutes = require('./routes/becknRoutes');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

const app = express();
const PORT = env.PORT || 8081; // Changed to 8081 for BAP

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Beckn Travel Discovery BAP is running',
        service: 'BAP',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Beckn Protocol Routes (Primary)
app.use('/beckn', becknRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Beckn Travel Discovery BAP is running on http://localhost:${PORT}`);
    console.log(`📋 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🔄 Beckn endpoints available at: http://localhost:${PORT}/beckn/*`);
});

module.exports = app;