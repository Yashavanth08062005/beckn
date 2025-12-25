const { Pool } = require('pg');

const config = {
    host: 'localhost',
    port: 5432,
    database: 'flights_bpp',
    user: 'postgres',
    password: '2005',
};

const pool = new Pool(config);

async function checkData() {
    try {
        console.log('Attempting to connect with config:', JSON.stringify({ ...config, password: '****' }));
        const res = await pool.query("SELECT * FROM flights WHERE departure_airport = 'BLR' AND arrival_airport = 'DEL'");
        console.log(`SUCCESS: Found ${res.rowCount} flights.`);
    } catch (err) {
        console.log('FAILURE: Could not connect.');
        console.log('Error Name:', err.name);
        console.log('Error Message:', err.message);
        console.log('Error Code:', err.code); // 28P01 is auth failed
    } finally {
        await pool.end();
    }
}

checkData();
