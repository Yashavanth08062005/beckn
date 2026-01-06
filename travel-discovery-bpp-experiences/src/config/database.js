const { Pool } = require('pg');

// PostgreSQL connection configuration for experiences BPP
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'experience_bpp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Experiences BPP connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error in Experiences BPP:', err);
});

module.exports = pool;