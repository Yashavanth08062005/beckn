require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function verifyWhereDataIs() {
    try {
        const client = await pool.connect();

        console.log('🔍 Checking "bookings" table (Original Table)...');
        const bookingsRes = await client.query('SELECT * FROM bookings');
        console.log(`✅ Found ${bookingsRes.rowCount} record(s) in "bookings" table.`);
        if (bookingsRes.rowCount > 0) {
            console.log('Sample record:', {
                id: bookingsRes.rows[0].id,
                reference: bookingsRes.rows[0].booking_reference,
                type: bookingsRes.rows[0].booking_type
            });
        }

        console.log('\n🔍 Checking "flight_bookings" table (New Separate Table)...');
        try {
            const flightRes = await client.query('SELECT * FROM flight_bookings');
            console.log(`❌ Found ${flightRes.rowCount} record(s) in "flight_bookings" table.`);
        } catch (e) {
            console.log('⚠️ Table "flight_bookings" might not exist or has error:', e.message);
        }

        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await pool.end();
    }
}

verifyWhereDataIs();
