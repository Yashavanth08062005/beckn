const { Pool } = require('pg');
require('dotenv').config({ path: './src/config/.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function fixBusBooking() {
    try {
        const query = `
            UPDATE bookings
            SET 
                origin = 'Bangalore',
                destination = 'Mysore',
                departure_time = '2025-12-28 08:00:00',
                arrival_time = '2025-12-28 12:00:00',
                item_name = 'KSRTC Airavat',
                item_code = 'KA-01-F-1234'
            WHERE id = 7 AND booking_type = 'bus';
        `;

        console.log('Fixing booking ID 7...');
        const result = await pool.query(query);

        console.log(`Updated ${result.rowCount} row(s).`);

        await pool.end();
    } catch (error) {
        console.error('Error updating booking:', error);
        await pool.end();
    }
}

fixBusBooking();
