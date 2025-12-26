const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '2005',
    database: 'buses_bpp',
    port: 5432,
});

async function checkBusTimes() {
    try {
        console.log('🔍 Checking bus times in database...');
        
        const query = `
            SELECT 
                bus_id, 
                operator_name, 
                departure_city, 
                arrival_city,
                departure_time,
                arrival_time,
                price,
                departure_location,
                arrival_location
            FROM buses 
            WHERE departure_city = 'Bangalore' AND arrival_city = 'Goa'
            ORDER BY price;
        `;
        
        const result = await pool.query(query);
        
        console.log('📋 Bangalore to Goa buses in database:');
        result.rows.forEach(row => {
            console.log(`\n🚌 ${row.bus_id} - ${row.operator_name}`);
            console.log(`   Route: ${row.departure_location} → ${row.arrival_location}`);
            console.log(`   Departure: ${row.departure_time}`);
            console.log(`   Arrival: ${row.arrival_time}`);
            console.log(`   Price: ₹${row.price}`);
        });
        
    } catch (error) {
        console.error('❌ Error checking bus times:', error);
    } finally {
        await pool.end();
    }
}

checkBusTimes();