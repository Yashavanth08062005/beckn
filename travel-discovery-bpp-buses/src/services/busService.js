const { v4: uuidv4 } = require('uuid');

/**
 * Buses Service - Provides bus catalog and booking services
 */
class BusesService {

    async searchBuses(startLocation, endLocation, travelTime) {
        try {
            console.log(` Searching buses from ${startLocation} to ${endLocation} on ${travelTime}`);

            const buses = [
                {
                    id: "bus-001",
                    descriptor: {
                        name: "SRS Travels",
                        code: "SRS-BLR-MUM-0800",
                        short_desc: "Premium Sleeper - Bangalore to Mumbai",
                        long_desc: "Comfortable luxury sleeper bus with reclining seats, charging points, and onboard snacks"
                    },
                    price: {
                        currency: "INR",
                        value: "850.00"
                    },
                    category_id: "BUS",
                    fulfillment_id: "fulfillment-001",
                    location_id: "station-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 28800000).toISOString() // 8 AM tomorrow
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "SEAT_TYPE", value: "2x2 Sleeper" },
                                { code: "AC", value: "Yes" },
                                { code: "WIFI", value: "Available" },
                                { code: "CHARGING", value: "USB & Power outlets" },
                                { code: "SNACKS", value: "Included" }
                            ]
                        },
                        {
                            code: "JOURNEY_INFO",
                            list: [
                                { code: "DURATION", value: "12 hours" },
                                { code: "STOPS", value: "2 stops" }
                            ]
                        }
                    ]
                },
                {
                    id: "bus-002",
                    descriptor: {
                        name: "VRL Logistics",
                        code: "VRL-BLR-MUM-1400",
                        short_desc: "Semi-Sleeper AC - Budget Friendly",
                        long_desc: "Budget-friendly semi-sleeper AC bus with basic amenities and regular stops"
                    },
                    price: {
                        currency: "INR",
                        value: "650.00"
                    },
                    category_id: "BUS",
                    fulfillment_id: "fulfillment-002",
                    location_id: "station-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 50400000).toISOString() // 2 PM tomorrow
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "SEAT_TYPE", value: "2+1 Semi-Sleeper" },
                                { code: "AC", value: "Yes" },
                                { code: "CHARGING", value: "Limited outlets" },
                                { code: "WATER", value: "Complimentary" }
                            ]
                        },
                        {
                            code: "JOURNEY_INFO",
                            list: [
                                { code: "DURATION", value: "13 hours" },
                                { code: "STOPS", value: "3-4 stops" }
                            ]
                        }
                    ]
                },
                {
                    id: "bus-003",
                    descriptor: {
                        name: "Ashok Leyland Express",
                        code: "ALE-BLR-MUM-1800",
                        short_desc: "Standard AC Seater - Economy",
                        long_desc: "Standard AC seater bus with basic facilities, good for budget travelers"
                    },
                    price: {
                        currency: "INR",
                        value: "550.00"
                    },
                    category_id: "BUS",
                    fulfillment_id: "fulfillment-003",
                    location_id: "station-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 64800000).toISOString() // 6 PM tomorrow
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "SEAT_TYPE", value: "2x2 Seater" },
                                { code: "AC", value: "Yes" },
                                { code: "WATER", value: "Available" }
                            ]
                        },
                        {
                            code: "JOURNEY_INFO",
                            list: [
                                { code: "DURATION", value: "14 hours" },
                                { code: "STOPS", value: "4-5 stops" }
                            ]
                        }
                    ]
                },
                {
                    id: "bus-004",
                    descriptor: {
                        name: "Kallada Travels",
                        code: "KAL-BLR-MUM-2200",
                        short_desc: "Ultra-Premium Luxury Sleeper",
                        long_desc: "Ultra-premium luxury sleeper with individual reading lights, blankets, and gourmet meals"
                    },
                    price: {
                        currency: "INR",
                        value: "1200.00"
                    },
                    category_id: "BUS",
                    fulfillment_id: "fulfillment-004",
                    location_id: "station-blr",
                    time: {
                        label: "departure",
                        timestamp: new Date(Date.now() + 79200000).toISOString() // 10 PM tomorrow
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "SEAT_TYPE", value: "2x1 Luxury Sleeper" },
                                { code: "AC", value: "Yes" },
                                { code: "WIFI", value: "Premium" },
                                { code: "CHARGING", value: "Individual outlets" },
                                { code: "MEALS", value: "Gourmet included" },
                                { code: "BLANKET", value: "Provided" },
                                { code: "READING_LIGHT", value: "Individual" }
                            ]
                        },
                        {
                            code: "JOURNEY_INFO",
                            list: [
                                { code: "DURATION", value: "12 hours" },
                                { code: "STOPS", value: "1-2 stops (express)" }
                            ]
                        }
                    ]
                }
            ];

            const catalog = {
                bpp: {
                    descriptor: {
                        name: "Buses BPP Provider",
                        short_desc: "Bus ticket provider",
                        long_desc: "Reliable intercity and interstate bus services"
                    },
                    providers: [
                        {
                            id: "buses-provider-001",
                            descriptor: {
                                name: "CityBus Hub",
                                short_desc: "Bus aggregator",
                                long_desc: "Aggregator for major bus operators"
                            },
                            categories: [
                                {
                                    id: "BUS",
                                    descriptor: { name: "Bus Services" }
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
                                                locality: "Majestic Bus Station",
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
                                                locality: "Bandra Bus Depot",
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
                            items: buses,
                            locations: [
                                {
                                    id: "station-blr",
                                    gps: startLocation,
                                    address: {
                                        locality: "Majestic Bus Station",
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
                        id: "buses-provider-001",
                        descriptor: { name: "CityBus Hub" },
                        items: buses
                    }
                ]
            };

            return catalog;

        } catch (error) {
            console.error('Error in buses service:', error);
            throw error;
        }
    }
}

module.exports = new BusesService();
