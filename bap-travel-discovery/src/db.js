// src/db.js
require('dotenv').config(); // safe even if already called in app.js
const { Pool } = require('pg');

if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  console.warn('Warning: DATABASE_URL or DB_PASSWORD not set - check your .env');
}

// Use DATABASE_URL if present, else separate components
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || ''), // ensure string
      database: process.env.DB_NAME || 'myproject'
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // do not exit in dev; but you may choose to exit in production
});

module.exports = pool;
