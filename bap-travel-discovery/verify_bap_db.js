require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function verifyDatabase() {
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();
        console.log('✅ Connected successfully!');

        // Check if bookings table exists
        const res = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'bookings'
            );
        `);

        if (res.rows[0].exists) {
            console.log('✅ "bookings" table exists.');

            // Check count
            const countRes = await client.query('SELECT COUNT(*) FROM bookings');
            console.log(`📊 Number of bookings in database: ${countRes.rows[0].count}`);
        } else {
            console.error('❌ "bookings" table DOES NOT exist!');
        }

        client.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    } finally {
        await pool.end();
    }
}

verifyDatabase();
