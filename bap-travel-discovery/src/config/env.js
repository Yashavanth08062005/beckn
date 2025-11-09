require('dotenv').config();

const envConfig = {
    PORT: process.env.PORT || 8080,
    
    // Beckn ONIX Configuration
    ONIX_URL: process.env.ONIX_URL || 'http://localhost:5000',
    ONIX_API_KEY: process.env.ONIX_API_KEY || '',
    
    // BAP Configuration
    BAP_ID: process.env.BAP_ID || 'travel-discovery-bap.example.com',
    BAP_URI: process.env.BAP_URI || 'http://localhost:8080',
    BAP_PUBLIC_KEY: process.env.BAP_PUBLIC_KEY || '',
    BAP_PRIVATE_KEY: process.env.BAP_PRIVATE_KEY || '',
    
    // Legacy Amadeus Configuration (for backward compatibility)
    AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
    AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET,
    
    // Other Providers
    REDBUS_API_KEY: process.env.REDBUS_API_KEY,
};

module.exports = envConfig;