const { Pool } = require('pg');

const config = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '2005',
};

async function setupBusDB() {
    const rootPool = new Pool({ ...config, database: 'postgres' });

    // 1. Create Database
    try {
        console.log('Creating buses_bpp database...');
        await rootPool.query('CREATE DATABASE buses_bpp');
        console.log('Database created.');
    } catch (err) {
        if (err.code === '42P04') console.log('Database buses_bpp already exists.');
        else console.error('Error creating database:', err.message);
    } finally {
        await rootPool.end();
    }

    // 2. Create Tables & Seed Data
    const busPool = new Pool({ ...config, database: 'buses_bpp' });
    try {
        console.log('Setting up schema...');
        await busPool.query(`
            CREATE TABLE IF NOT EXISTS buses (
                id SERIAL PRIMARY KEY,
                bus_id VARCHAR(50) UNIQUE NOT NULL,
                operator_name VARCHAR(100) NOT NULL,
                bus_type VARCHAR(50), -- AC, Non-AC, Sleeper
                departure_city VARCHAR(100) NOT NULL,
                arrival_city VARCHAR(100) NOT NULL,
                departure_location VARCHAR(200),
                arrival_location VARCHAR(200),
                departure_time TIMESTAMP NOT NULL,
                arrival_time TIMESTAMP NOT NULL,
                duration_minutes INTEGER,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'INR',
                seats_available INTEGER DEFAULT 40,
                amenities JSONB,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS bus_bookings (
                id SERIAL PRIMARY KEY,
                booking_id VARCHAR(50) UNIQUE NOT NULL,
                bus_id INTEGER REFERENCES buses(id),
                passenger_name VARCHAR(200) NOT NULL,
                passenger_email VARCHAR(100),
                passenger_phone VARCHAR(20),
                seat_number VARCHAR(10),
                status VARCHAR(20) DEFAULT 'CONFIRMED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Seeding data...');
        // Add a bus that matches the user's likely search (BLR -> DEL) for 'today' or 'tomorrow' logic
        // We'll add generic daily buses for simplicity

        await busPool.query(`
            INSERT INTO buses (bus_id, operator_name, bus_type, departure_city, arrival_city, departure_time, arrival_time, price, amenities)
            VALUES 
            ('KSRTC-001', 'KSRTC', 'Volvo Multi-Axle AC', 'Bangalore', 'Delhi', 
             NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', 3500.00, 
             '{"wifi": true, "charging_point": true, "blanket": true}'),

            ('VRL-002', 'VRL Travels', 'Non-AC Sleeper', 'Bangalore', 'Delhi', 
             NOW() + INTERVAL '1 day' + INTERVAL '2 hours', NOW() + INTERVAL '3 days' + INTERVAL '4 hours', 2800.00, 
             '{"charging_point": true, "reading_light": true}'),

            ('KAD-MG-001', 'Kadamba Transport', 'Volvo AC', 'Mumbai', 'Goa',
             NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 12 hours', 1200.00,
             '{"ac": true, "pushback_seats": true}')
            ON CONFLICT (bus_id) DO NOTHING;
        `);
        console.log('Bus DB Setup Complete!');

    } catch (err) {
        console.error('Error setting up tables:', err);
    } finally {
        await busPool.end();
    }
}

setupBusDB();
