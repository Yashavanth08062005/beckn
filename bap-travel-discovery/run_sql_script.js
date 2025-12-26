const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

async function runSqlScript() {
    try {
        console.log('🔌 Connecting to database...');
        const client = await pool.connect();

        const sqlPath = path.join(__dirname, '../create-booking-history-table.sql');
        console.log(`📖 Reading SQL file: ${sqlPath}`);

        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing SQL script...');
        await client.query(sql);

        console.log('✅ SQL script executed successfully!');
        client.release();
    } catch (err) {
        console.error('❌ Error executing SQL script:', err);
    } finally {
        await pool.end();
    }
}

runSqlScript();
