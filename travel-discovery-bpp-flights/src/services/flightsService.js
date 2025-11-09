const { v4: uuidv4 } = require('uuid');

/**
 * Flights Service - Provides flight catalog and booking services
 */
class FlightsService {

    /**
     * Search for available flights
     */
    async searchFlights(startLocation, endLocation, travelTime) {
        try {
            console.log(`🔍 Searching flights from ${startLocation} to ${endLocation} on ${travelTime}`);

            // Mock flight data - in production, this would call real flight APIs
            const flights = [
                {
                    id: "flight-001",
                    descriptor: {
                        name: "Air India Express",
                        code: "IX-1234",
                        short_desc: "Non-stop flight",
                        long_desc: "Comfortable economy class with meals included"
                    },
                    price: {
                        currency: "INR",
                        value: "5500.00"
                    },
                    category_id: "FLIGHT",
                    fulfillment_id: "fulfillment-001",
                    location_id: "airport-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AIRCRAFT_TYPE",
                            list: [
                                { code: "MODEL", value: "Boeing 737" }
                            ]
                        },
                        {
                            code: "AMENITIES", 
                            list: [
                                { code: "MEALS", value: "Included" },
                                { code: "BAGGAGE", value: "20kg" },
                                { code: "WIFI", value: "Available" }
                            ]
                        }
                    ]
                },
                {
                    id: "flight-002", 
                    descriptor: {
                        name: "IndiGo",
                        code: "6E-5678",
                        short_desc: "Budget airline",
                        long_desc: "Affordable travel with reliable service"
                    },
                    price: {
                        currency: "INR",
                        value: "4200.00"
                    },
                    category_id: "FLIGHT",
                    fulfillment_id: "fulfillment-002",
                    location_id: "airport-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 7200000).toISOString() // 2 hours from now
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AIRCRAFT_TYPE",
                            list: [
                                { code: "MODEL", value: "Airbus A320" }
                            ]
                        },
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "MEALS", value: "Chargeable" },
                                { code: "BAGGAGE", value: "15kg" },
                                { code: "WIFI", value: "Not Available" }
                            ]
                        }
                    ]
                },
                {
                    id: "flight-003",
                    descriptor: {
                        name: "Vistara",
                        code: "UK-9012",
                        short_desc: "Premium service",
                        long_desc: "Full-service airline with premium amenities"
                    },
                    price: {
                        currency: "INR", 
                        value: "7800.00"
                    },
                    category_id: "FLIGHT",
                    fulfillment_id: "fulfillment-003",
                    location_id: "airport-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 10800000).toISOString() // 3 hours from now
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AIRCRAFT_TYPE",
                            list: [
                                { code: "MODEL", value: "Airbus A321" }
                            ]
                        },
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "MEALS", value: "Premium" },
                                { code: "BAGGAGE", value: "30kg" },
                                { code: "WIFI", value: "Complimentary" },
                                { code: "SEAT", value: "Extra legroom" }
                            ]
                        }
                    ]
                }
            ];

            // Create Beckn catalog structure
            const catalog = {
                bpp: {
                    descriptor: {
                        name: "Flights BPP Provider",
                        short_desc: "Flight booking provider",
                        long_desc: "Comprehensive flight booking services across India"
                    },
                    providers: [
                        {
                            id: "flights-provider-001",
                            descriptor: {
                                name: "Indian Airlines Hub",
                                short_desc: "Multiple airline aggregator",
                                long_desc: "Access to major Indian airlines including Air India, IndiGo, Vistara, and more"
                            },
                            categories: [
                                {
                                    id: "FLIGHT",
                                    descriptor: {
                                        name: "Flight Services"
                                    }
                                }
                            ],
                            fulfillments: [
                                {
                                    id: "fulfillment-001",
                                    type: "DELIVERY",
                                    start: {
                                        location: {
                                            gps: startLocation,
                                            address: {
                                                locality: "Kempegowda International Airport",
                                                city: "Bangalore", 
                                                state: "Karnataka",
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: new Date(Date.now() + 3600000).toISOString(),
                                                end: new Date(Date.now() + 5400000).toISOString()
                                            }
                                        }
                                    },
                                    end: {
                                        location: {
                                            gps: endLocation,
                                            address: {
                                                locality: "Chhatrapati Shivaji International Airport",
                                                city: "Mumbai",
                                                state: "Maharashtra", 
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: new Date(Date.now() + 7200000).toISOString(),
                                                end: new Date(Date.now() + 9000000).toISOString()
                                            }
                                        }
                                    }
                                }
                            ],
                            items: flights,
                            locations: [
                                {
                                    id: "airport-blr",
                                    gps: startLocation,
                                    address: {
                                        locality: "Kempegowda International Airport",
                                        city: "Bangalore",
                                        state: "Karnataka",
                                        country: "India"
                                    }
                                }
                            ]
                        }
                    ]
                },
                providers: [
                    {
                        id: "flights-provider-001",
                        descriptor: {
                            name: "Indian Airlines Hub"
                        },
                        items: flights
                    }
                ]
            };

            return catalog;

        } catch (error) {
            console.error('Error in flights service:', error);
            throw error;
        }
    }
}

module.exports = new FlightsService();