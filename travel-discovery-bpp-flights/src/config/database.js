const { Pool } = require('pg');

// PostgreSQL connection configuration (use environment variables when available)
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'flights_bpp',
    user: process.env.DB_USER || 'postgres',
    // prefer environment, fall back to 123 for local dev
    password: '2005', // Forced for debugging
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

console.log('--- DB DEBUG ---');
console.log('Host:', pool.options.host);
console.log('User:', pool.options.user);
console.log('Database:', pool.options.database);
console.log('Password:', pool.options.password);
console.log('----------------');

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

module.exports = pool;
