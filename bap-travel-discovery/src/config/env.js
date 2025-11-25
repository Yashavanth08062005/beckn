require('dotenv').config();

const envConfig = {
    PORT: process.env.PORT || 8081,

    // ===========================
    //        DATABASE CONFIG
    // ===========================
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'myproject',
    DATABASE_URL: process.env.DATABASE_URL || null,

    // ===========================
    //        ONIX / BAP CONFIG
    // ===========================
    ONIX_URL: process.env.ONIX_URL || 'http://127.0.0.1:9090',
    ONIX_API_KEY: process.env.ONIX_API_KEY || '',
    
    BAP_ID: process.env.BAP_ID || 'travel-discovery-bap.example.com',
    BAP_URI: process.env.BAP_URI || 'http://127.0.0.1:8081',
    BAP_PUBLIC_KEY: process.env.BAP_PUBLIC_KEY || '',
    BAP_PRIVATE_KEY: process.env.BAP_PRIVATE_KEY || '',
    
    // ===========================
    //   BPP CONFIG (Mock URLs)
    // ===========================
    FLIGHTS_BPP_URL: process.env.FLIGHTS_BPP_URL || 'http://127.0.0.1:7001',
    FLIGHTS_INTL_BPP_URL: process.env.FLIGHTS_INTL_BPP_URL || 'http://127.0.0.1:7005',
    HOTELS_BPP_URL: process.env.HOTELS_BPP_URL || 'http://127.0.0.1:7003',
    BUSES_BPP_URL: process.env.BUSES_BPP_URL || 'http://127.0.0.1:7006',

    // ===========================
    //   Extra APIs
    // ===========================
    AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
    AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET,
    REDBUS_API_KEY: process.env.REDBUS_API_KEY,
};

module.exports = envConfig;
