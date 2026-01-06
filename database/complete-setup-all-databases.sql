-- ============================================
-- COMPLETE DATABASE SETUP FOR BECKN TRAVEL PLATFORM
-- This script sets up ALL databases needed for the platform
-- ============================================

-- STEP 1: CREATE ALL DATABASES
-- Run these commands first in PostgreSQL (as superuser):

-- CREATE DATABASE travel_discovery;     -- Main BAP database
-- CREATE DATABASE flights_bpp;          -- Flights BPP database  
-- CREATE DATABASE experience_bpp;       -- Experiences BPP database
-- CREATE DATABASE hotels_bpp;           -- Hotels BPP database (if separate)

-- ============================================
-- MAIN DATABASE: travel_discovery (BAP)
-- ============================================

-- \c travel_discovery;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main bookings table (BAP level)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    booking_type VARCHAR(20) NOT NULL, -- 'FLIGHT', 'HOTEL', 'EXPERIENCE'
    item_id VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    passenger_name VARCHAR(255),
    passenger_email VARCHAR(255),
    passenger_phone VARCHAR(20),
    booking_details JSONB,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    booking_status VARCHAR(50) DEFAULT 'CONFIRMED',
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    beckn_transaction_id VARCHAR(100),
    beckn_message_id VARCHAR(100),
    bpp_booking_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BPP booking mappings (tracks which BPP handled which booking)
CREATE TABLE IF NOT EXISTS bpp_booking_mappings (
    id SERIAL PRIMARY KEY,
    platform_booking_id VARCHAR(100) NOT NULL,
    bpp_booking_id VARCHAR(100) NOT NULL,
    bpp_type VARCHAR(50) NOT NULL, -- 'FLIGHTS', 'EXPERIENCES', 'HOTELS'
    bpp_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for main database
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_bpp_mappings_platform_booking ON bpp_booking_mappings(platform_booking_id);

-- ============================================
-- FLIGHTS BPP DATABASE: flights_bpp
-- ============================================

-- \c flights_bpp;

-- Flights catalog
CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    flight_code VARCHAR(20) UNIQUE NOT NULL,
    airline_name VARCHAR(100) NOT NULL,
    aircraft_model VARCHAR(50),
    departure_airport VARCHAR(10) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    departure_city VARCHAR(100),
    arrival_city VARCHAR(100),
    departure_time TIME,
    arrival_time TIME,
    duration_minutes INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    flight_type VARCHAR(20) DEFAULT 'DOMESTIC',
    short_desc TEXT,
    long_desc TEXT,
    meals_included BOOLEAN DEFAULT false,
    baggage_kg INTEGER DEFAULT 15,
    wifi_available BOOLEAN DEFAULT false,
    seat_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flight bookings (BPP level)
CREATE TABLE IF NOT EXISTS bpp_bookings (
    id SERIAL PRIMARY KEY,
    bpp_booking_id VARCHAR(100) UNIQUE NOT NULL,
    platform_booking_id VARCHAR(100),
    flight_id INTEGER REFERENCES flights(id),
    passenger_name VARCHAR(255),
    passenger_email VARCHAR(255),
    passenger_phone VARCHAR(20),
    booking_status VARCHAR(50) DEFAULT 'CONFIRMED',
    beckn_transaction_id VARCHAR(100),
    beckn_message_id VARCHAR(100),
    cancellation_status VARCHAR(50),
    cancellation_reason TEXT,
    cancellation_time TIMESTAMP,
    cancellation_charges DECIMAL(10, 2) DEFAULT 0,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_status VARCHAR(50),
    refund_id VARCHAR(100),
    refund_initiated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample flights data
INSERT INTO flights (flight_code, airline_name, aircraft_model, departure_airport, arrival_airport, 
    departure_city, arrival_city, departure_time, arrival_time, duration_minutes, price, 
    flight_type, short_desc, long_desc, meals_included, baggage_kg, wifi_available, seat_type)
VALUES
    ('AI-1234', 'Air India', 'Boeing 737', 'BLR', 'BOM', 'Bangalore', 'Mumbai', 
     '10:00:00', '12:00:00', 120, 5500.00, 'DOMESTIC',
     'Non-stop flight', 'Comfortable economy class with meals included', 
     true, 20, true, 'Economy'),
    
    ('6E-5678', 'IndiGo', 'Airbus A320', 'BLR', 'BOM', 'Bangalore', 'Mumbai',
     '14:30:00', '16:30:00', 120, 4200.00, 'DOMESTIC',
     'Budget airline', 'Affordable travel with reliable service',
     false, 15, false, 'Economy'),
    
    ('UK-9012', 'Vistara', 'Airbus A321', 'BLR', 'BOM', 'Bangalore', 'Mumbai',
     '18:00:00', '20:00:00', 120, 7800.00, 'DOMESTIC',
     'Premium service', 'Full-service airline with premium amenities',
     true, 30, true, 'Premium Economy'),
    
    ('SG-2345', 'SpiceJet', 'Boeing 737', 'DEL', 'BLR', 'Delhi', 'Bangalore',
     '06:00:00', '08:30:00', 150, 4800.00, 'DOMESTIC',
     'Early morning flight', 'Budget-friendly option with good service',
     false, 15, false, 'Economy'),
    
    ('AI-7890', 'Air India', 'Boeing 787', 'HYD', 'BOM', 'Hyderabad', 'Mumbai',
     '12:00:00', '13:30:00', 90, 6200.00, 'DOMESTIC',
     'Quick connection', 'Short duration flight with premium service',
     true, 25, true, 'Business');

-- Create indexes for flights database
CREATE INDEX IF NOT EXISTS idx_flights_departure_airport ON flights(departure_airport);
CREATE INDEX IF NOT EXISTS idx_flights_arrival_airport ON flights(arrival_airport);
CREATE INDEX IF NOT EXISTS idx_flights_type ON flights(flight_type);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_bpp_bookings_bpp_booking_id ON bpp_bookings(bpp_booking_id);

-- ============================================
-- EXPERIENCES BPP DATABASE: experience_bpp
-- ============================================

-- \c experience_bpp;

-- Experiences catalog
CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    experience_code VARCHAR(20) UNIQUE NOT NULL,
    experience_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'TOUR', 'ACTIVITY', 'ATTRACTION', 'ADVENTURE', 'CULTURAL', 'FOOD'
    subcategory VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    gps_coordinates VARCHAR(50),
    duration_hours DECIMAL(4, 2),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    max_participants INTEGER DEFAULT 20,
    min_participants INTEGER DEFAULT 1,
    age_restriction VARCHAR(50),
    difficulty_level VARCHAR(20),
    short_desc TEXT,
    long_desc TEXT,
    inclusions JSONB,
    exclusions JSONB,
    requirements JSONB,
    languages JSONB,
    operating_days JSONB,
    operating_hours JSONB,
    seasonal_availability JSONB,
    cancellation_policy TEXT,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    provider_name VARCHAR(200),
    provider_contact JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experience bookings (BPP level)
CREATE TABLE IF NOT EXISTS experience_bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(100) UNIQUE NOT NULL,
    experience_id INTEGER REFERENCES experiences(id),
    platform_booking_id VARCHAR(100),
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    number_of_participants INTEGER NOT NULL,
    participant_details JSONB,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    booking_status VARCHAR(50) DEFAULT 'CONFIRMED',
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    special_requests TEXT,
    beckn_transaction_id VARCHAR(100),
    beckn_message_id VARCHAR(100),
    cancellation_status VARCHAR(50),
    cancellation_reason TEXT,
    cancellation_time TIMESTAMP,
    cancellation_charges DECIMAL(10, 2) DEFAULT 0,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_status VARCHAR(50),
    refund_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample experiences data
INSERT INTO experiences (
    experience_code, experience_name, category, subcategory, city, location, gps_coordinates,
    duration_hours, price, max_participants, min_participants, age_restriction, difficulty_level,
    short_desc, long_desc, inclusions, exclusions, requirements, languages, operating_days,
    operating_hours, provider_name, provider_contact
) VALUES
    ('MUM-CITY-001', 'Mumbai City Heritage Walk', 'TOUR', 'CITY_TOUR', 'Mumbai', 'Fort District', '18.9322,72.8264',
     3.0, 1200.00, 15, 2, 'ALL_AGES', 'EASY',
     'Explore Mumbai''s colonial heritage', 'Discover the rich history of Mumbai through its iconic buildings, markets, and hidden gems in the Fort district.',
     '["Professional guide", "Bottled water", "Heritage site entries", "Photography assistance"]',
     '["Personal expenses", "Food and beverages", "Transportation to meeting point"]',
     '["Comfortable walking shoes", "Sun hat", "Camera"]',
     '["English", "Hindi", "Marathi"]',
     '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]',
     '["09:00-12:00", "15:00-18:00"]',
     'Mumbai Heritage Tours', '{"phone": "+91-9876543210", "email": "info@mumbaiheritage.com"}'),

    ('MUM-FOOD-001', 'Mumbai Street Food Tour', 'FOOD', 'STREET_FOOD', 'Mumbai', 'Mohammed Ali Road', '18.9568,72.8320',
     4.0, 1800.00, 12, 3, '12+', 'EASY',
     'Authentic Mumbai street food experience', 'Taste the best of Mumbai''s street food culture with a local foodie guide visiting 8-10 authentic food stalls.',
     '["Food guide", "All food tastings", "Bottled water", "Digestive tablets"]',
     '["Transportation", "Additional food purchases", "Alcoholic beverages"]',
     '["Empty stomach", "Adventurous palate", "Comfortable clothes"]',
     '["English", "Hindi"]',
     '["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["18:00-22:00"]',
     'Mumbai Food Walks', '{"phone": "+91-9876543211", "email": "taste@mumbaifoodwalks.com"}'),

    ('BLR-TECH-001', 'Bangalore Tech City Tour', 'TOUR', 'CITY_TOUR', 'Bangalore', 'Electronic City', '12.8456,77.6603',
     4.0, 1500.00, 18, 3, 'ALL_AGES', 'EASY',
     'Silicon Valley of India tour', 'Explore Bangalore''s transformation into India''s tech capital with visits to major IT parks and innovation centers.',
     '["AC transportation", "Tech guide", "Campus visits", "Refreshments"]',
     '["Personal expenses", "Meals", "Shopping"]',
     '["Valid ID proof", "Business casual attire"]',
     '["English", "Hindi", "Kannada"]',
     '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]',
     '["10:00-14:00", "14:30-18:30"]',
     'Bangalore Tech Tours', '{"phone": "+91-9876543213", "email": "info@blrtechtours.com"}'),

    ('DEL-HIST-001', 'Old Delhi Heritage Walk', 'TOUR', 'HERITAGE', 'Delhi', 'Chandni Chowk', '28.6562,77.2410',
     4.0, 1000.00, 20, 2, 'ALL_AGES', 'MODERATE',
     'Explore Mughal Delhi', 'Walk through the narrow lanes of Old Delhi, visit Red Fort, Jama Masjid, and experience the bustling bazaars.',
     '["Heritage guide", "Monument entries", "Rickshaw ride", "Traditional snacks"]',
     '["Personal shopping", "Full meals", "Transportation to starting point"]',
     '["Comfortable walking shoes", "Modest clothing for religious sites"]',
     '["English", "Hindi", "Urdu"]',
     '["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["09:00-13:00", "15:00-19:00"]',
     'Delhi Heritage Walks', '{"phone": "+91-9876543215", "email": "heritage@delhiwalks.com"}'),

    ('GOA-BEACH-001', 'Goa Beach Hopping Adventure', 'ADVENTURE', 'WATER_SPORTS', 'Goa', 'North Goa', '15.5527,73.7603',
     8.0, 3500.00, 12, 2, '16+', 'MODERATE',
     'Ultimate beach adventure', 'Visit 4 beautiful beaches with water sports, beach activities, and sunset viewing.',
     '["Transportation", "Water sports equipment", "Professional instructor", "Lunch", "Safety gear"]',
     '["Alcoholic beverages", "Personal expenses", "Additional activities"]',
     '["Swimming ability", "Swimwear", "Sunscreen", "Change of clothes"]',
     '["English", "Hindi", "Konkani"]',
     '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["08:00-16:00"]',
     'Goa Adventure Sports', '{"phone": "+91-9876543217", "email": "adventure@goabeach.com"}');

-- Create indexes for experiences database
CREATE INDEX IF NOT EXISTS idx_experiences_city ON experiences(city);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_booking_id ON experience_bookings(booking_id);

-- ============================================
-- HOTELS BPP DATABASE: hotels_bpp (Optional - if separate)
-- ============================================

-- \c hotels_bpp;

-- Hotels catalog
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    hotel_code VARCHAR(20) UNIQUE NOT NULL,
    hotel_name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    gps_coordinates VARCHAR(50),
    star_rating DECIMAL(2, 1),
    price_per_night DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    room_type VARCHAR(100),
    short_desc TEXT,
    long_desc TEXT,
    amenities JSONB,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    total_rooms INTEGER DEFAULT 50,
    available_rooms INTEGER DEFAULT 50,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample hotels data
INSERT INTO hotels (hotel_code, hotel_name, city, location, gps_coordinates, star_rating,
    price_per_night, room_type, short_desc, long_desc, amenities)
VALUES
    ('TAJ-BOM-001', 'Taj Mahal Palace', 'Mumbai', 'Colaba', '18.9220,72.8332', 5.0,
     15000.00, 'Deluxe Room',
     'Iconic luxury hotel', 'Historic 5-star hotel with stunning views of Gateway of India',
     '{"wifi": true, "pool": true, "gym": true, "spa": true, "restaurant": true, "parking": true}'),
    
    ('ITC-BLR-001', 'ITC Gardenia', 'Bangalore', 'Residency Road', '12.9716,77.5946', 5.0,
     18000.00, 'Luxury Suite',
     'Premium luxury', 'Award-winning luxury hotel in the heart of Bangalore',
     '{"wifi": true, "pool": true, "gym": true, "spa": true, "restaurant": true, "parking": true, "butler": true}'),
    
    ('OBEROI-DEL-001', 'The Oberoi', 'Delhi', 'Dr Zakir Hussain Marg', '28.5921,77.2460', 5.0,
     20000.00, 'Deluxe Room',
     'Luxury heritage', 'Iconic luxury hotel with impeccable service',
     '{"wifi": true, "pool": true, "gym": true, "spa": true, "restaurant": true, "parking": true, "concierge": true}');

-- Create indexes for hotels database
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all databases are set up correctly
-- SELECT 'All databases setup completed!' as status;

-- Verify data counts
-- SELECT 'Flights' as table_name, COUNT(*) as record_count FROM flights
-- UNION ALL
-- SELECT 'Experiences', COUNT(*) FROM experiences
-- UNION ALL  
-- SELECT 'Hotels', COUNT(*) FROM hotels;

-- ============================================
-- ENVIRONMENT CONFIGURATION NOTES
-- ============================================

/*
Update your .env files in each BPP service:

1. bap-travel-discovery/.env:
   DB_NAME=travel_discovery
   DB_PASSWORD=2005
   EXPERIENCES_BPP_URL=http://localhost:7004

2. travel-discovery-bpp-flights/.env:
   DB_NAME=flights_bpp
   DB_PASSWORD=2005

3. travel-discovery-bpp-experiences/.env:
   DB_NAME=experience_bpp
   DB_PASSWORD=2005
   PORT=7004

4. travel-discovery-bpp-hotels/.env:
   DB_NAME=hotels_bpp (or travel_discovery if shared)
   DB_PASSWORD=2005
*/

-- ============================================
-- END OF COMPLETE SETUP
-- ============================================