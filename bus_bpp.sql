-- ============================================
-- BUSES BPP DATABASE SETUP
-- ============================================

-- 1. Create Database (if running manually, otherwise skip if already in correct DB)
-- CREATE DATABASE buses_bpp;
-- \c buses_bpp;

-- 2. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id SERIAL PRIMARY KEY,
    bus_id VARCHAR(50) UNIQUE NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    bus_type VARCHAR(50), -- e.g., 'Volvo AC Multi-Axle', 'Non-AC Sleeper'
    departure_city VARCHAR(100) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    departure_location VARCHAR(200), -- specific boarding point
    arrival_location VARCHAR(200),   -- specific dropping point
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    seats_available INTEGER DEFAULT 40,
    amenities JSONB, -- e.g., {"wifi": true, "blanket": true}
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bus Bookings Table
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

-- ============================================
-- INSERT SAMPLE BUS DATA
-- ============================================

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
     '{"wifi": true, "tv": true, "charging_point": true}', 'ACTIVE'),

    -- Mumbai to Goa
    ('KAD-MG-001', 'Kadamba Transport', 'Volvo AC', 'Mumbai', 'Goa',
     'Borivali', 'Panjim',
     NOW() + INTERVAL '1 day 22 hours', NOW() + INTERVAL '2 days 10 hours', 720,
     1200.00, 'INR', 45,
     '{"ac": true, "pushback_seats": true}', 'ACTIVE');

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_buses_route ON buses(departure_city, arrival_city);
CREATE INDEX idx_buses_date ON buses(departure_time);
CREATE INDEX idx_buses_status ON buses(status);

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT * FROM buses;
