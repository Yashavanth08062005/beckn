-- Beckn Protocol Layer 2 Database Setup
-- Registry and Network Management Tables

-- Create database for Layer 2 services
-- CREATE DATABASE beckn_registry;

-- Connect to the database
-- \c beckn_registry;

-- ============================================
-- NETWORK PARTICIPANTS REGISTRY
-- ============================================
CREATE TABLE IF NOT EXISTS network_participants (
    id SERIAL PRIMARY KEY,
    participant_id VARCHAR(255) UNIQUE NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_type VARCHAR(50) NOT NULL, -- BAP, BPP, BG (Beckn Gateway)
    domain VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Network details
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    public_url VARCHAR(500),
    
    -- Status and metadata
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    version VARCHAR(20) DEFAULT '1.1.0',
    
    -- Geographic coverage
    coverage_areas JSONB,
    supported_locations JSONB,
    
    -- Capabilities
    supported_actions JSONB, -- ["search", "select", "init", "confirm", etc.]
    
    -- Security
    public_key TEXT,
    certificate_fingerprint VARCHAR(255),
    
    -- Timestamps
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NETWORK ROUTING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS routing_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Routing criteria
    criteria JSONB, -- Additional routing criteria
    priority INTEGER DEFAULT 100,
    
    -- Target participants
    target_participants JSONB, -- Array of participant IDs
    
    -- Load balancing
    load_balance_algorithm VARCHAR(50) DEFAULT 'round_robin',
    
    -- Status
    enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MESSAGE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS message_logs (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    
    -- Message details
    action VARCHAR(50) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    
    -- Participants
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    
    -- Message content
    message_body JSONB,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'SENT', -- SENT, DELIVERED, ACKNOWLEDGED, FAILED
    error_message TEXT,
    
    -- Performance metrics
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    response_time_ms INTEGER,
    
    -- Network routing
    route_path JSONB, -- Array of hops the message took
    
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES network_participants(participant_id),
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES network_participants(participant_id)
);

-- ============================================
-- HEALTH MONITORING
-- ============================================
CREATE TABLE IF NOT EXISTS health_checks (
    id SERIAL PRIMARY KEY,
    participant_id VARCHAR(255) NOT NULL,
    
    -- Health status
    status VARCHAR(50) NOT NULL, -- HEALTHY, UNHEALTHY, DEGRADED
    response_time_ms INTEGER,
    
    -- Health details
    health_data JSONB, -- Detailed health information
    error_message TEXT,
    
    -- Timestamps
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_participant FOREIGN KEY (participant_id) REFERENCES network_participants(participant_id)
);

-- ============================================
-- NETWORK METRICS
-- ============================================
CREATE TABLE IF NOT EXISTS network_metrics (
    id SERIAL PRIMARY KEY,
    participant_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    metric_unit VARCHAR(50),
    
    -- Metric metadata
    tags JSONB, -- Additional metric tags
    
    -- Timestamps
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_metrics_participant FOREIGN KEY (participant_id) REFERENCES network_participants(participant_id)
);

-- ============================================
-- CERTIFICATES MANAGEMENT
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    participant_id VARCHAR(255) NOT NULL,
    
    -- Certificate details
    certificate_type VARCHAR(50) NOT NULL, -- TLS, SIGNING, ENCRYPTION
    certificate_pem TEXT NOT NULL,
    private_key_pem TEXT, -- Only for owned certificates
    
    -- Certificate metadata
    subject VARCHAR(500),
    issuer VARCHAR(500),
    serial_number VARCHAR(100),
    fingerprint VARCHAR(255) UNIQUE,
    
    -- Validity
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, REVOKED, EXPIRED
    revoked_at TIMESTAMP,
    revocation_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_cert_participant FOREIGN KEY (participant_id) REFERENCES network_participants(participant_id)
);

-- ============================================
-- NETWORK EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS network_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- PARTICIPANT_JOINED, PARTICIPANT_LEFT, ROUTE_UPDATED, etc.
    participant_id VARCHAR(255),
    
    -- Event details
    event_data JSONB,
    description TEXT,
    
    -- Severity
    severity VARCHAR(20) DEFAULT 'INFO', -- DEBUG, INFO, WARN, ERROR, CRITICAL
    
    -- Timestamps
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_event_participant FOREIGN KEY (participant_id) REFERENCES network_participants(participant_id)
);

-- ============================================
-- RATE LIMITING
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    participant_id VARCHAR(255) NOT NULL,
    
    -- Rate limit configuration
    requests_per_minute INTEGER DEFAULT 1000,
    burst_size INTEGER DEFAULT 100,
    
    -- Current usage
    current_requests INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    blocked_until TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rate_limit_participant FOREIGN KEY (participant_id) REFERENCES network_participants(participant_id)
);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Register BAP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'travel-discovery-bap.beckn.org',
    'Travel Discovery BAP',
    'BAP',
    'mobility,hospitality,tourism',
    'localhost',
    8081,
    'http://localhost:8081',
    'https://bap.travel-discovery.beckn.org',
    '["search", "select", "init", "confirm", "status", "cancel", "update"]',
    '{"countries": ["IN"], "cities": ["Mumbai", "Delhi", "Bangalore", "Chennai"]}'
);

-- Register Domestic Flights BPP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain, category, subcategory,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'flights-domestic-bpp.beckn.org',
    'Domestic Flights Provider',
    'BPP',
    'mobility',
    'flights',
    'domestic',
    'localhost',
    7001,
    'http://localhost:7001',
    'https://flights-domestic.beckn.org',
    '["search", "select", "init", "confirm", "status", "cancel"]',
    '{"countries": ["IN"], "airports": ["BLR", "BOM", "DEL", "HYD", "MAA"]}'
);

-- Register International Flights BPP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain, category, subcategory,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'flights-international-bpp.beckn.org',
    'International Flights Provider',
    'BPP',
    'mobility',
    'flights',
    'international',
    'localhost',
    7005,
    'http://localhost:7005',
    'https://flights-intl.beckn.org',
    '["search", "select", "init", "confirm", "status", "cancel"]',
    '{"countries": ["GLOBAL"], "airports": ["SIN", "DXB", "LHR", "JFK", "BKK"]}'
);

-- Register Hotels BPP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain, category,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'hotels-bpp.beckn.org',
    'Hotels Provider',
    'BPP',
    'hospitality',
    'accommodation',
    'localhost',
    7003,
    'http://localhost:7003',
    'https://hotels.beckn.org',
    '["search", "select", "init", "confirm", "status", "cancel", "update"]',
    '{"countries": ["IN"], "cities": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Goa"]}'
);

-- Register Buses BPP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain, category, subcategory,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'buses-bpp.beckn.org',
    'Bus Services Provider',
    'BPP',
    'mobility',
    'public_transport',
    'buses',
    'localhost',
    7002,
    'http://localhost:7002',
    'https://buses.beckn.org',
    '["search", "select", "init", "confirm", "status", "track"]',
    '{"countries": ["IN"], "routes": ["BLR-MYS", "BOM-PNQ", "DEL-AGR"]}'
);

-- Register Trains BPP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain, category, subcategory,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'trains-bpp.beckn.org',
    'Railway Services Provider',
    'BPP',
    'mobility',
    'public_transport',
    'trains',
    'localhost',
    7004,
    'http://localhost:7004',
    'https://trains.beckn.org',
    '["search", "select", "init", "confirm", "status", "track"]',
    '{"countries": ["IN"], "stations": ["SBC", "CSMT", "NDLS", "HYB", "MAS"]}'
);

-- Register Experiences BPP
INSERT INTO network_participants (
    participant_id, participant_name, participant_type, domain, category,
    host, port, base_url, public_url,
    supported_actions, coverage_areas
) VALUES (
    'experiences-bpp.beckn.org',
    'Tourism Experiences Provider',
    'BPP',
    'tourism',
    'experiences',
    'localhost',
    7006,
    'http://localhost:7006',
    'https://experiences.beckn.org',
    '["search", "select", "init", "confirm", "status"]',
    '{"countries": ["IN"], "destinations": ["Goa", "Kerala", "Rajasthan", "Himachal Pradesh"]}'
);

-- Create routing rules
INSERT INTO routing_rules (rule_name, domain, category, subcategory, target_participants, priority) VALUES
('Domestic Flights Routing', 'mobility', 'flights', 'domestic', '["flights-domestic-bpp.beckn.org"]', 100),
('International Flights Routing', 'mobility', 'flights', 'international', '["flights-international-bpp.beckn.org"]', 100),
('Hotels Routing', 'hospitality', 'accommodation', NULL, '["hotels-bpp.beckn.org"]', 100),
('Buses Routing', 'mobility', 'public_transport', 'buses', '["buses-bpp.beckn.org"]', 100),
('Trains Routing', 'mobility', 'public_transport', 'trains', '["trains-bpp.beckn.org"]', 100),
('Experiences Routing', 'tourism', 'experiences', NULL, '["experiences-bpp.beckn.org"]', 100);

-- Create rate limits for participants
INSERT INTO rate_limits (participant_id, requests_per_minute, burst_size) 
SELECT participant_id, 1000, 100 FROM network_participants;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_participants_type ON network_participants(participant_type);
CREATE INDEX idx_participants_domain ON network_participants(domain);
CREATE INDEX idx_participants_status ON network_participants(status);
CREATE INDEX idx_message_logs_transaction ON message_logs(transaction_id);
CREATE INDEX idx_message_logs_action ON message_logs(action);
CREATE INDEX idx_message_logs_status ON message_logs(status);
CREATE INDEX idx_message_logs_sent_at ON message_logs(sent_at);
CREATE INDEX idx_health_checks_participant ON health_checks(participant_id);
CREATE INDEX idx_health_checks_status ON health_checks(status);
CREATE INDEX idx_network_metrics_participant ON network_metrics(participant_id);
CREATE INDEX idx_network_metrics_name ON network_metrics(metric_name);
CREATE INDEX idx_network_events_type ON network_events(event_type);
CREATE INDEX idx_network_events_occurred_at ON network_events(occurred_at);

-- ============================================
-- CREATE VIEWS FOR MONITORING
-- ============================================
CREATE OR REPLACE VIEW active_participants AS
SELECT 
    participant_id,
    participant_name,
    participant_type,
    domain,
    category,
    subcategory,
    base_url,
    status,
    last_seen
FROM network_participants 
WHERE status = 'ACTIVE'
ORDER BY participant_type, domain, participant_name;

CREATE OR REPLACE VIEW participant_health_summary AS
SELECT 
    np.participant_id,
    np.participant_name,
    np.participant_type,
    hc.status as health_status,
    hc.response_time_ms,
    hc.checked_at as last_health_check
FROM network_participants np
LEFT JOIN LATERAL (
    SELECT status, response_time_ms, checked_at
    FROM health_checks 
    WHERE participant_id = np.participant_id 
    ORDER BY checked_at DESC 
    LIMIT 1
) hc ON true
WHERE np.status = 'ACTIVE';

CREATE OR REPLACE VIEW message_statistics AS
SELECT 
    DATE_TRUNC('hour', sent_at) as hour,
    action,
    domain,
    COUNT(*) as message_count,
    AVG(response_time_ms) as avg_response_time,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_count
FROM message_logs 
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', sent_at), action, domain
ORDER BY hour DESC;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT COUNT(*) as total_participants FROM network_participants;
-- SELECT participant_type, COUNT(*) FROM network_participants GROUP BY participant_type;
-- SELECT * FROM active_participants;
-- SELECT * FROM participant_health_summary;