const { Pool } = require('pg');
require('dotenv').config({ path: './src/config/.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function checkLatestBookings() {
    try {
        const query = `
            SELECT id, booking_reference, booking_type, origin, destination, departure_time, created_at
            FROM bookings
            WHERE booking_type = 'bus'
            ORDER BY created_at DESC
            LIMIT 5;
        `;

        console.log('Fetching latest 5 BUS bookings...');
        const result = await pool.query(query);

        console.log(JSON.stringify(result.rows, null, 2));

        await pool.end();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        await pool.end();
    }
}

checkLatestBookings();
