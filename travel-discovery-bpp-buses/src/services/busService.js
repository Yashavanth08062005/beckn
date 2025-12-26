const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Bus Service - Provides bus catalog and booking services
 */
class BusService {

    /**
     * Map GPS coordinates or airport codes to city names
     */
    getCityFromGps(gps) {
        if (!gps) return null;

        const cityMap = {
            // GPS coordinates
            '12.9716,77.5946': 'Bangalore',  // BLR
            '19.0896,72.8656': 'Mumbai',     // BOM
            '28.5665,77.1031': 'Delhi',      // DEL
            '12.9941,80.1709': 'Chennai',    // MAA
            '22.6548,88.4467': 'Kolkata',    // CCU
            '17.2403,78.4294': 'Hyderabad',  // HYD
            '15.3808,73.8389': 'Goa',        // GOI
            '18.5822,73.9197': 'Pune',       // PNQ
            '26.9124,75.7873': 'Jaipur',     // JAI
            '23.0726,72.6263': 'Ahmedabad',  // AMD

            // Alternative GPS (e.g. from api.js defaults or other services)
            '19.0760,72.8777': 'Mumbai',
            '28.7041,77.1025': 'Delhi',

            // IATA Codes
            'BLR': 'Bangalore',
            'BOM': 'Mumbai',
            'DEL': 'Delhi',
            'MAA': 'Chennai',
            'CCU': 'Kolkata',
            'HYD': 'Hyderabad',
            'GOI': 'Goa',
            'PNQ': 'Pune',
            'JAI': 'Jaipur',
            'AMD': 'Ahmedabad',

            // City Names
            'BANGALORE': 'Bangalore',
            'MUMBAI': 'Mumbai',
            'DELHI': 'Delhi',
            'CHENNAI': 'Chennai',
            'KOLKATA': 'Kolkata',
            'HYDERABAD': 'Hyderabad',
            'GOA': 'Goa',
            'PUNE': 'Pune',
            'JAIPUR': 'Jaipur',
            'AHMEDABAD': 'Ahmedabad'
        };

        // Normalize input: remove spaces, convert to upper case
        const normalizedInput = String(gps).replace(/\s/g, '').toUpperCase();

        return cityMap[normalizedInput] || cityMap[String(gps).toUpperCase()] || null;
    }

    /**
     * Search for available buses from database
     */
    async searchBuses(startLocation, endLocation, travelTime) {
        try {
            const fs = require('fs');
            fs.appendFileSync('bus_debug.log', `\n--- Search Request ---\nGPS: ${startLocation} -> ${endLocation}\nTime: ${travelTime}\n`);

            console.log(`🔍 Searching buses from ${startLocation} to ${endLocation} on ${travelTime}`);

            // Convert GPS coordinates to city names
            const departureCity = this.getCityFromGps(startLocation);
            const arrivalCity = this.getCityFromGps(endLocation);

            fs.appendFileSync('bus_debug.log', `Mapped: ${departureCity} -> ${arrivalCity}\n`);

            console.log(`🏙️ Mapped cities: ${departureCity} → ${arrivalCity}`);

            if (!departureCity || !arrivalCity) {
                console.log('⚠️ Could not map GPS coordinates to cities');
                fs.appendFileSync('bus_debug.log', '⚠️ Mapping failed\n');
                return this.getEmptyCatalog();
            }

            // Query buses for the specific route
            // Relaxed query: Show ALL active buses for this route regardless of date (for debugging/availability)
            let query = `
                SELECT * FROM buses 
                WHERE status = 'ACTIVE'
                AND departure_city = $1 
                AND arrival_city = $2
                -- AND departure_time >= $3  <-- Commented out to ensure data visibility
            `;

            // const queryParams = [departureCity, arrivalCity, travelTime];
            const queryParams = [departureCity, arrivalCity];

            query += ` ORDER BY price`;

            console.log(`📝 Query: ${query}`, queryParams);

            const result = await db.query(query, queryParams);

            if (result.rows.length === 0) {
                console.log(`⚠️ No buses found for route ${departureCity} → ${arrivalCity}`);
                return this.getEmptyCatalog();
            }

            console.log(`✅ Found ${result.rows.length} buses for route ${departureCity} → ${arrivalCity}`);

            // Transform database records to Beckn format
            const buses = result.rows.map(bus => {
                const departureTime = new Date(bus.departure_time);
                const arrivalTime = new Date(bus.arrival_time);

                return {
                    id: `bus-${bus.id}`,
                    descriptor: {
                        name: bus.operator_name,
                        code: bus.bus_id,
                        short_desc: bus.bus_type || 'Bus service',
                        long_desc: `${bus.operator_name} ${bus.bus_type} service from ${bus.departure_city} to ${bus.arrival_city}`
                    },
                    price: {
                        currency: bus.currency || "INR",
                        value: parseFloat(bus.price).toFixed(2)
                    },
                    category_id: "BUS",
                    fulfillment_id: `fulfillment-${bus.id}`,
                    location_id: `loc-${bus.departure_city.toLowerCase().replace(/\s/g, '')}`,
                    time: {
                        label: "departure",
                        timestamp: departureTime.toISOString()
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "AC", value: bus.bus_type?.includes('AC') ? "Yes" : "No" },
                                { code: "SEATS", value: `${bus.seats_available} seats left` }
                            ]
                        },
                        {
                            code: "ROUTE",
                            list: [
                                { code: "FROM", value: `${bus.departure_city} (${bus.departure_location || bus.departure_city})` },
                                { code: "TO", value: `${bus.arrival_city} (${bus.arrival_location || bus.arrival_city})` },
                                { code: "DURATION", value: `${Math.floor((bus.duration_minutes || 0) / 60)}h ${(bus.duration_minutes || 0) % 60}m` }
                            ]
                        },
                        {
                            code: "SCHEDULE",
                            list: [
                                { code: "DEPARTURE_TIME", value: departureTime.toISOString() },
                                { code: "ARRIVAL_TIME", value: arrivalTime.toISOString() }
                            ]
                        }
                    ]
                };
            });

            // Create Beckn catalog structure
            const catalog = {
                bpp: {
                    descriptor: {
                        name: "Bus BPP Provider",
                        short_desc: "Bus booking provider",
                        long_desc: "Intercity bus booking services"
                    },
                    providers: [
                        {
                            id: "bus-provider-001",
                            descriptor: {
                                name: "Intercity Bus Aggregator",
                                short_desc: "Multiple bus operators",
                                long_desc: "Access to KSRTC, VRL, and private operators"
                            },
                            categories: [
                                {
                                    id: "BUS",
                                    descriptor: {
                                        name: "Bus Services"
                                    }
                                }
                            ],
                            items: buses
                        }
                    ]
                },
                providers: [
                    {
                        id: "bus-provider-001",
                        descriptor: {
                            name: "Intercity Bus Aggregator"
                        },
                        items: buses
                    }
                ]
            };

            return catalog;

        } catch (error) {
            console.error('❌ Error in bus service:', error);
            // Log to file
            const fs = require('fs');
            fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n${error.stack}\n`);
            throw error;
        }
    }

    getEmptyCatalog() {
        return {
            bpp: {
                descriptor: {
                    name: "Bus BPP Provider",
                },
                providers: []
            },
            providers: []
        };
    }

    async createBppBooking(bookingData) {
        // ... (Similar structure to flight, mapping to bus_bookings table)
        // For brevity/mvp, we'll log it.
        console.log('Mock creating bus booking', bookingData);
        // Return dummy success
        return { id: 123, status: 'CONFIRMED' };
    }
}

module.exports = new BusService();