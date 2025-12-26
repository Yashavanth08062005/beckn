const db = require('./src/config/database');

async function seedMissing() {
    try {
        console.log('Restoring missing trips from Bangalore...');

        await db.query(`
            INSERT INTO buses (bus_id, operator_name, bus_type, departure_city, arrival_city, 
                departure_location, arrival_location, departure_time, arrival_time, duration_minutes, 
                price, currency, seats_available, amenities, status)
            VALUES
                -- Bangalore to Mumbai
                ('KSRTC-BM-001', 'KSRTC', 'Volvo Club Class', 'Bangalore', 'Mumbai', 
                 'Kempegowda Bus Station', 'Mumbai Central',
                 NOW() + INTERVAL '1 day 18 hours', NOW() + INTERVAL '2 days 10 hours', 960, 
                 1800.00, 'INR', 35, 
                 '{"wifi": true, "charging_point": true, "water_bottle": true, "blanket": true}', 'ACTIVE'),

                ('VRL-BM-002', 'VRL Travels', 'AC Sleeper', 'Bangalore', 'Mumbai',
                 'Anand Rao Circle', 'Sion Circle',
                 NOW() + INTERVAL '1 day 20 hours', NOW() + INTERVAL '2 days 14 hours', 1080,
                 2200.00, 'INR', 28, 
                 '{"charging_point": true, "reading_light": true, "pillow": true}', 'ACTIVE'),

                -- Bangalore to Delhi (Long haul mock)
                ('SRS-BD-001', 'SRS Travels', 'Scania Multi-Axle', 'Bangalore', 'Delhi',
                 'Madiwala', 'Kashmere Gate',
                 NOW() + INTERVAL '2 days 10 hours', NOW() + INTERVAL '4 days 2 hours', 2400, 
                 3500.00, 'INR', 40,
                 '{"wifi": true, "tv": true, "charging_point": true}', 'ACTIVE')
            ON CONFLICT (bus_id) DO UPDATE SET
                departure_city = EXCLUDED.departure_city,
                arrival_city = EXCLUDED.arrival_city,
                status = 'ACTIVE';
        `);

        console.log('✅ Restored trips.');
    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        process.exit(0);
    }
}

seedMissing();
