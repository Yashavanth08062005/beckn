// src/app.js
require('dotenv').config(); // MUST be first so other modules see env vars

const express = require('express');
const cors = require('cors');

const becknRoutes = require('./routes/becknRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes'); // mounting bookings route
const errorHandler = require('./middleware/errorHandler');

const env = require('./config/env');
const pool = require('./db'); // ensure db is initialized after dotenv

const app = express();
const PORT = env.PORT || 8081;

/**
 * Development CORS policy:
 * - Allow localhost:3000 and localhost:3001 by default
 * - Add more origins to ALLOWED_ORIGINS if needed
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    // If there's no origin (e.g. curl, server-to-server), allow it
    if (!origin) {
      return callback(null, true);
    }
    // allow if origin is in the allowed list
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // otherwise block and log for easier debugging
    console.warn(`Blocked CORS request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));

// Body parsing (built-in)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Beckn Travel Discovery BAP is running',
    service: 'BAP',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: "connected",
      time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/beckn', becknRoutes);
app.use('/api/payments', paymentRoutes);

// Mount bookings route (creates/returns booking rows)
app.use('/api/bookings', bookingsRoutes);

// Error handling (last)
app.use(errorHandler);

// Start server - bind 0.0.0.0 (useful for Docker/WSL)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Beckn Travel Discovery BAP is running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🟢 DB test: http://localhost:${PORT}/test-db`);
});

module.exports = app;
