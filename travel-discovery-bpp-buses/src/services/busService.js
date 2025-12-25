const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Bus Service - Provides bus catalog and booking services
 */
class BusService {

    /**
     * Search for available buses from database
     */
    async searchBuses(startLocation, endLocation, travelTime) {
        try {
            console.log(`🔍 Searching buses from ${startLocation} to ${endLocation} on ${travelTime}`);

            // For buses, we can try to match city names roughly from the location GPS or address
            // For simplicity in this demo, we'll assume the search is for "Bangalore" to "Delhi" 
            // if coordinates match roughly, or just return all active buses for the route.

            // In a real app, we'd do geospatial query or map GPS to cities.
            // As a fallback/demo, we'll return all buses for simplicity if no specific route logic is in place yet.

            let query = `
                SELECT * FROM buses 
                WHERE status = 'ACTIVE'
            `;

            const queryParams = [];

            // Simple filtering logic could go here
            // e.g. query += ` AND departure_city = $1` ...

            query += ` ORDER BY price`;

            console.log(`📝 Query: ${query}`, queryParams);

            const result = await db.query(query, queryParams);

            if (result.rows.length === 0) {
                console.log('⚠️  No buses found in database');
                return this.getEmptyCatalog();
            }

            console.log(`✅ Found ${result.rows.length} buses in database`);

            // Transform database records to Beckn format
            const buses = result.rows.map(bus => {
                const departureTime = new Date(bus.departure_time);

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
                                { code: "FROM", value: bus.departure_city },
                                { code: "TO", value: bus.arrival_city },
                                { code: "DURATION", value: `${bus.duration_minutes || 0} mins` } // fallback if NULL
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
