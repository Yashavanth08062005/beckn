const { Pool } = require('pg');

const config = {
    host: 'localhost',
    port: 5432,
    database: 'travel_discovery',
    user: 'postgres',
    password: '2005',
};

const pool = new Pool(config);

async function checkData() {
    try {
        console.log('Attempting to connect to travel_discovery...');
        const res = await pool.query("SELECT NOW()");
        console.log(`SUCCESS: Connected to travel_discovery.`);
    } catch (err) {
        console.log('FAILURE: Could not connect.');
        console.log('Error Code:', err.code);
        console.log('Error Message:', err.message);
    } finally {
        await pool.end();
    }
}

checkData();
