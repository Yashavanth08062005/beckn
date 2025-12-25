const { Pool } = require('pg');

const config = {
    host: 'localhost',
    port: 5432,
    database: 'flights_bpp',
    user: 'postgres',
    password: '2005',
};

const pool = new Pool(config);

async function addFlight() {
    try {
        console.log('Adding flight BLR -> DEL...');
        const sql = `
            INSERT INTO flights (flight_code, airline_name, aircraft_model, departure_airport, arrival_airport, 
                departure_city, arrival_city, departure_time, arrival_time, duration_minutes, price, 
                flight_type, short_desc, long_desc, meals_included, baggage_kg, wifi_available, seat_type)
            VALUES
                ('DEMO-001', 'Demo Air', 'Boeing 737', 'BLR', 'DEL', 'Bangalore', 'Delhi', 
                 '10:00:00', '12:30:00', 150, 6500.00, 'DOMESTIC',
                 'Demo Flight', 'Added by Antigravity for testing', 
                 true, 20, true, 'Economy')
            ON CONFLICT (flight_code) DO NOTHING;
        `;
        await pool.query(sql);
        console.log('Flight added successfully.');

        const res = await pool.query("SELECT * FROM flights WHERE departure_airport = 'BLR' AND arrival_airport = 'DEL'");
        console.log(`Verification: Found ${res.rowCount} flights for BLR -> DEL.`);

    } catch (err) {
        console.error('Error adding flight:', err.message);
    } finally {
        await pool.end();
    }
}

addFlight();
