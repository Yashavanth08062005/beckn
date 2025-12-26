const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '2005',
    database: 'buses_bpp',
    port: 5432,
});

async function addBangaloreGoaBuses() {
    try {
        console.log('🔄 Adding Bangalore to Goa bus routes...');
        
        const query = `
            INSERT INTO buses (bus_id, operator_name, bus_type, departure_city, arrival_city, 
                departure_location, arrival_location, departure_time, arrival_time, duration_minutes, 
                price, currency, seats_available, amenities, status)
            VALUES
                -- Bangalore to Goa routes
                ('KSRTC-BG-001', 'KSRTC', 'Volvo AC Multi-Axle', 'Bangalore', 'Goa', 
                 'Kempegowda Bus Station', 'Panjim Bus Stand',
                 NOW() + INTERVAL '1 day 20 hours', NOW() + INTERVAL '2 days 8 hours', 720, 
                 1500.00, 'INR', 40, 
                 '{"wifi": true, "charging_point": true, "water_bottle": true, "blanket": true, "ac": true}', 'ACTIVE'),

                ('VRL-BG-002', 'VRL Travels', 'AC Sleeper', 'Bangalore', 'Goa',
                 'Anand Rao Circle', 'Mapusa Bus Stand',
                 NOW() + INTERVAL '1 day 21 hours', NOW() + INTERVAL '2 days 9 hours', 720,
                 1800.00, 'INR', 32,
                 '{"charging_point": true, "reading_light": true, "pillow": true, "ac": true}', 'ACTIVE'),

                ('KPN-BG-003', 'KPN Travels', 'Volvo Semi-Sleeper', 'Bangalore', 'Goa',
                 'Majestic Bus Station', 'Margao Bus Stand',
                 NOW() + INTERVAL '1 day 19 hours', NOW() + INTERVAL '2 days 7 hours', 720,
                 1350.00, 'INR', 45,
                 '{"wifi": true, "charging_point": true, "pushback_seats": true}', 'ACTIVE')
            ON CONFLICT (bus_id) DO NOTHING;
        `;

        const result = await pool.query(query);
        console.log('✅ Successfully added Bangalore to Goa bus routes');
        
        // Verify the data was added
        const verifyQuery = `
            SELECT bus_id, operator_name, departure_city, arrival_city, price 
            FROM buses 
            WHERE departure_city = 'Bangalore' AND arrival_city = 'Goa'
            ORDER BY price;
        `;
        
        const verifyResult = await pool.query(verifyQuery);
        console.log('📋 Bangalore to Goa routes in database:');
        verifyResult.rows.forEach(row => {
            console.log(`  - ${row.bus_id}: ${row.operator_name} - ₹${row.price}`);
        });
        
    } catch (error) {
        console.error('❌ Error adding bus routes:', error);
    } finally {
        await pool.end();
    }
}

addBangaloreGoaBuses();