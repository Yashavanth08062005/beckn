-- ============================================
-- EXPERIENCE DATABASE SETUP FOR BPP
-- Tourism, Activities, Tours, and Attractions
-- Compatible with Beckn Provider Platform (BPP)
-- ============================================

-- INSTRUCTIONS:
-- 1. Create database: CREATE DATABASE experience_bpp;
-- 2. Connect to database: \c experience_bpp;
-- 3. Run this entire script in pgAdmin or psql
-- 4. Update .env file in travel-discovery-bpp-experiences with:
--    DB_NAME=experience_bpp
--    DB_PASSWORD=2005 (or your PostgreSQL password)

-- Connect to experience_bpp database
-- \c experience_bpp;

-- ============================================
-- EXPERIENCES TABLE (Main catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS experiences (
    id SERIAL PRIMARY KEY,
    experience_code VARCHAR(20) UNIQUE NOT NULL,
    experience_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'TOUR', 'ACTIVITY', 'ATTRACTION', 'ADVENTURE', 'CULTURAL', 'FOOD'
    subcategory VARCHAR(50), -- 'CITY_TOUR', 'MUSEUM', 'TEMPLE', 'TREKKING', 'WATER_SPORTS', etc.
    city VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    gps_coordinates VARCHAR(50),
    duration_hours DECIMAL(4, 2), -- Duration in hours (e.g., 2.5 hours)
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    max_participants INTEGER DEFAULT 20,
    min_participants INTEGER DEFAULT 1,
    age_restriction VARCHAR(50), -- 'ALL_AGES', '18+', '12+', etc.
    difficulty_level VARCHAR(20), -- 'EASY', 'MODERATE', 'DIFFICULT', 'EXTREME'
    short_desc TEXT,
    long_desc TEXT,
    inclusions JSONB, -- What's included in the experience
    exclusions JSONB, -- What's not included
    requirements JSONB, -- What participants need to bring/know
    languages JSONB, -- Available guide languages
    operating_days JSONB, -- Days of operation
    operating_hours JSONB, -- Time slots available
    seasonal_availability JSONB, -- Seasonal restrictions
    cancellation_policy TEXT,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    provider_name VARCHAR(200),
    provider_contact JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EXPERIENCE BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS experience_bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(100) UNIQUE NOT NULL,
    experience_id INTEGER REFERENCES experiences(id),
    platform_booking_id VARCHAR(100),
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    number_of_participants INTEGER NOT NULL,
    participant_details JSONB, -- Array of participant info
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20), -- e.g., '09:00-12:00'
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

-- ============================================
-- EXPERIENCE REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS experience_reviews (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER REFERENCES experiences(id),
    booking_id VARCHAR(100) REFERENCES experience_bookings(booking_id),
    reviewer_name VARCHAR(255),
    reviewer_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- ============================================
-- INSERT SAMPLE EXPERIENCES DATA
-- ============================================

-- Mumbai Experiences
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

    ('MUM-ADV-001', 'Elephanta Caves Adventure', 'ATTRACTION', 'HISTORICAL', 'Mumbai', 'Elephanta Island', '18.9633,72.9315',
     6.0, 2500.00, 20, 4, 'ALL_AGES', 'MODERATE',
     'UNESCO World Heritage site exploration', 'Full day trip to the ancient Elephanta Caves with ferry ride, guided tour, and cultural insights.',
     '["Ferry tickets", "Cave entry fees", "Professional guide", "Lunch", "Transportation"]',
     '["Personal expenses", "Photography fees inside caves"]',
     '["Comfortable walking shoes", "Sun protection", "Camera"]',
     '["English", "Hindi", "Gujarati"]',
     '["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["09:00-15:00"]',
     'Island Adventures Mumbai', '{"phone": "+91-9876543212", "email": "explore@islandadventures.com"}'),

-- Bangalore Experiences
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

    ('BLR-BREW-001', 'Bangalore Brewery Hopping', 'FOOD', 'BREWERY', 'Bangalore', 'Koramangala', '12.9279,77.6271',
     5.0, 2200.00, 10, 4, '21+', 'EASY',
     'Craft beer tasting experience', 'Visit 3 premium microbreweries in Bangalore with guided tastings and brewery tours.',
     '["Transportation", "Beer tastings", "Brewery tours", "Snacks", "Designated driver"]',
     '["Full meals", "Additional drinks", "Personal expenses"]',
     '["Valid age proof", "Responsible drinking"]',
     '["English", "Hindi"]',
     '["Friday", "Saturday", "Sunday"]',
     '["16:00-21:00"]',
     'Bangalore Brew Tours', '{"phone": "+91-9876543214", "email": "cheers@blrbrewtours.com"}'),

-- Delhi Experiences
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

    ('DEL-FOOD-001', 'Delhi Food Trail', 'FOOD', 'MULTI_CUISINE', 'Delhi', 'Connaught Place', '28.6315,77.2167',
     5.0, 2000.00, 15, 3, 'ALL_AGES', 'EASY',
     'Culinary journey through Delhi', 'Taste diverse cuisines from street food to fine dining across different areas of Delhi.',
     '["Food guide", "All food tastings", "Transportation", "Bottled water"]',
     '["Alcoholic beverages", "Additional food orders", "Shopping"]',
     '["Appetite for variety", "Comfortable clothes"]',
     '["English", "Hindi", "Punjabi"]',
     '["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["11:00-16:00", "18:00-23:00"]',
     'Delhi Food Trails', '{"phone": "+91-9876543216", "email": "taste@delhifoodtrails.com"}'),

-- Goa Experiences
    ('GOA-BEACH-001', 'Goa Beach Hopping Adventure', 'ADVENTURE', 'WATER_SPORTS', 'Goa', 'North Goa', '15.5527,73.7603',
     8.0, 3500.00, 12, 2, '16+', 'MODERATE',
     'Ultimate beach adventure', 'Visit 4 beautiful beaches with water sports, beach activities, and sunset viewing.',
     '["Transportation", "Water sports equipment", "Professional instructor", "Lunch", "Safety gear"]',
     '["Alcoholic beverages", "Personal expenses", "Additional activities"]',
     '["Swimming ability", "Swimwear", "Sunscreen", "Change of clothes"]',
     '["English", "Hindi", "Konkani"]',
     '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["08:00-16:00"]',
     'Goa Adventure Sports', '{"phone": "+91-9876543217", "email": "adventure@goabeach.com"}'),

    ('GOA-SPICE-001', 'Goa Spice Plantation Tour', 'TOUR', 'PLANTATION', 'Goa', 'Ponda', '15.4013,74.0071',
     4.0, 1600.00, 25, 5, 'ALL_AGES', 'EASY',
     'Organic spice farm experience', 'Learn about spice cultivation, enjoy traditional Goan lunch, and take home fresh spices.',
     '["Plantation tour", "Spice guide", "Traditional lunch", "Spice samples", "Transportation"]',
     '["Additional spice purchases", "Beverages", "Personal expenses"]',
     '["Comfortable walking shoes", "Hat", "Camera"]',
     '["English", "Hindi", "Konkani", "Portuguese"]',
     '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]',
     '["09:00-13:00", "14:00-18:00"]',
     'Goa Spice Tours', '{"phone": "+91-9876543218", "email": "spices@goatours.com"}'),

-- Chennai Experiences
    ('CHE-TEMP-001', 'Chennai Temple Trail', 'CULTURAL', 'RELIGIOUS', 'Chennai', 'Mylapore', '13.0339,80.2619',
     5.0, 1300.00, 18, 3, 'ALL_AGES', 'EASY',
     'Ancient temples of Chennai', 'Visit historic temples including Kapaleeshwarar Temple, San Thome Cathedral, and learn about South Indian architecture.',
     '["Temple guide", "Entry fees", "Transportation", "Cultural insights", "Prasadam"]',
     '["Personal offerings", "Photography fees", "Meals"]',
     '["Modest clothing", "Respectful behavior", "Comfortable footwear"]',
     '["English", "Tamil", "Hindi"]',
     '["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["06:00-11:00", "16:00-21:00"]',
     'Chennai Cultural Tours', '{"phone": "+91-9876543219", "email": "culture@chennaitemples.com"}'),

-- Hyderabad Experiences
    ('HYD-NIZAM-001', 'Hyderabad Nizami Heritage Tour', 'TOUR', 'HERITAGE', 'Hyderabad', 'Charminar', '17.3616,78.4747',
     6.0, 1800.00, 16, 4, 'ALL_AGES', 'MODERATE',
     'Royal Nizami legacy', 'Explore the grandeur of Nizami architecture, visit Charminar, Golconda Fort, and taste authentic Hyderabadi cuisine.',
     '["Heritage guide", "Monument entries", "Traditional lunch", "Transportation", "Cultural performance"]',
     '["Personal shopping", "Additional meals", "Photography fees"]',
     '["Comfortable walking shoes", "Sun protection", "Camera"]',
     '["English", "Hindi", "Telugu", "Urdu"]',
     '["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
     '["09:00-15:00"]',
     'Hyderabad Heritage Tours', '{"phone": "+91-9876543220", "email": "nizami@hydheritage.com"}');

-- ============================================
-- INSERT SAMPLE BOOKINGS DATA
-- ============================================
INSERT INTO experience_bookings (
    booking_id, experience_id, participant_name, participant_email, participant_phone,
    number_of_participants, booking_date, time_slot, total_amount, booking_status,
    participant_details
) VALUES
    ('EXP-BK-001', 1, 'Rajesh Kumar', 'rajesh@example.com', '+91-9876543221',
     2, '2024-02-15', '09:00-12:00', 2400.00, 'CONFIRMED',
     '[{"name": "Rajesh Kumar", "age": 35}, {"name": "Priya Kumar", "age": 32}]'),
    
    ('EXP-BK-002', 2, 'Amit Sharma', 'amit@example.com', '+91-9876543222',
     4, '2024-02-16', '18:00-22:00', 7200.00, 'CONFIRMED',
     '[{"name": "Amit Sharma", "age": 28}, {"name": "Neha Sharma", "age": 26}, {"name": "Rohit Gupta", "age": 30}, {"name": "Kavya Gupta", "age": 27}]');

-- ============================================
-- INSERT SAMPLE REVIEWS DATA
-- ============================================
INSERT INTO experience_reviews (
    experience_id, booking_id, reviewer_name, reviewer_email, rating, review_text, is_verified
) VALUES
    (1, 'EXP-BK-001', 'Rajesh Kumar', 'rajesh@example.com', 5,
     'Excellent heritage walk! Our guide was very knowledgeable and showed us hidden gems of Mumbai. Highly recommended!', true),
    
    (2, 'EXP-BK-002', 'Amit Sharma', 'amit@example.com', 4,
     'Great food tour with authentic local flavors. The guide knew all the best spots. Only wish it was a bit longer!', true);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_experiences_city ON experiences(city);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_price ON experiences(price);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_booking_id ON experience_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_experience_id ON experience_bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_date ON experience_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_experience_reviews_experience_id ON experience_reviews(experience_id);

-- ============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_experience_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE experiences 
    SET 
        rating = (
            SELECT ROUND(AVG(rating::numeric), 1) 
            FROM experience_reviews 
            WHERE experience_id = NEW.experience_id AND status = 'ACTIVE'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM experience_reviews 
            WHERE experience_id = NEW.experience_id AND status = 'ACTIVE'
        )
    WHERE id = NEW.experience_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update ratings when reviews are added
DROP TRIGGER IF EXISTS update_experience_rating_trigger ON experience_reviews;
CREATE TRIGGER update_experience_rating_trigger
    AFTER INSERT OR UPDATE ON experience_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_experience_rating();

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
CREATE TRIGGER update_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_experience_bookings_updated_at ON experience_bookings;
CREATE TRIGGER update_experience_bookings_updated_at
    BEFORE UPDATE ON experience_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE VIEWS FOR EASY QUERYING
-- ============================================
CREATE OR REPLACE VIEW active_experiences AS
SELECT 
    e.*,
    COALESCE(e.rating, 0) as avg_rating,
    COALESCE(e.total_reviews, 0) as review_count
FROM experiences e
WHERE e.status = 'ACTIVE'
ORDER BY e.city, e.category, e.price;

CREATE OR REPLACE VIEW experiences_by_city AS
SELECT 
    city,
    category,
    COUNT(*) as experience_count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM experiences 
WHERE status = 'ACTIVE'
GROUP BY city, category
ORDER BY city, category;

CREATE OR REPLACE VIEW popular_experiences AS
SELECT 
    e.*,
    e.rating,
    e.total_reviews,
    COUNT(eb.id) as total_bookings
FROM experiences e
LEFT JOIN experience_bookings eb ON e.id = eb.experience_id
WHERE e.status = 'ACTIVE'
GROUP BY e.id
HAVING e.rating >= 4.0 OR COUNT(eb.id) >= 5
ORDER BY e.rating DESC, COUNT(eb.id) DESC;

CREATE OR REPLACE VIEW booking_summary AS
SELECT 
    eb.booking_id,
    e.experience_name,
    e.city,
    e.category,
    eb.participant_name,
    eb.participant_email,
    eb.number_of_participants,
    eb.booking_date,
    eb.time_slot,
    eb.total_amount,
    eb.booking_status,
    eb.created_at
FROM experience_bookings eb
JOIN experiences e ON eb.experience_id = e.id
ORDER BY eb.created_at DESC;

-- ============================================
-- SAMPLE SEARCH FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION search_experiences(
    p_city VARCHAR DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    experience_code VARCHAR,
    experience_name VARCHAR,
    category VARCHAR,
    city VARCHAR,
    duration_hours DECIMAL,
    price DECIMAL,
    rating DECIMAL,
    total_reviews INTEGER,
    short_desc TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.experience_code,
        e.experience_name,
        e.category,
        e.city,
        e.duration_hours,
        e.price,
        COALESCE(e.rating, 0.0) as rating,
        COALESCE(e.total_reviews, 0) as total_reviews,
        e.short_desc
    FROM experiences e
    WHERE e.status = 'ACTIVE'
        AND (p_city IS NULL OR e.city ILIKE '%' || p_city || '%')
        AND (p_category IS NULL OR e.category = p_category)
        AND (p_max_price IS NULL OR e.price <= p_max_price)
        AND (p_min_rating IS NULL OR COALESCE(e.rating, 0) >= p_min_rating)
    ORDER BY e.rating DESC, e.total_reviews DESC, e.price;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES (Uncomment to run)
-- ============================================
-- SELECT 'Experience database setup completed successfully!' as status;
-- SELECT COUNT(*) as total_experiences FROM experiences;
-- SELECT city, COUNT(*) as experience_count FROM experiences GROUP BY city ORDER BY city;
-- SELECT category, COUNT(*) as category_count FROM experiences GROUP BY category ORDER BY category;
-- SELECT * FROM experiences_by_city;

-- ============================================
-- SAMPLE SEARCH QUERIES
-- ============================================
-- Search experiences in Mumbai
-- SELECT * FROM search_experiences('Mumbai', NULL, NULL, NULL);

-- Search food experiences under 2000 INR
-- SELECT * FROM search_experiences(NULL, 'FOOD', 2000, NULL);

-- Search highly rated experiences (4+ rating)
-- SELECT * FROM search_experiences(NULL, NULL, NULL, 4.0);

-- ============================================
-- END OF EXPERIENCE DATABASE SETUP
-- ============================================