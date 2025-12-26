require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function listTables() {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        console.log('📂 Tables in database:', res.rows.map(r => r.table_name));
        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listTables();
