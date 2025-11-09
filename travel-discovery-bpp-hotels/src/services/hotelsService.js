const { v4: uuidv4 } = require('uuid');

/**
 * Hotels Service - Provides hotel catalog and booking services
 */
class HotelsService {

    /**
     * Search for available hotels
     */
    async searchHotels(location, checkInTime, checkOutTime) {
        try {
            console.log(`🔍 Searching hotels near ${location} from ${checkInTime} to ${checkOutTime}`);

            // Mock hotel data - in production, this would call real hotel APIs
            const hotels = [
                {
                    id: "hotel-001",
                    descriptor: {
                        name: "The Taj Palace",
                        code: "TAJ-001",
                        short_desc: "Luxury 5-star hotel",
                        long_desc: "Experience luxury and comfort at The Taj Palace with world-class amenities",
                        images: [
                            {
                                url: "https://example.com/taj-palace.jpg",
                                size_type: "md"
                            }
                        ]
                    },
                    price: {
                        currency: "INR",
                        value: "12500.00"
                    },
                    category_id: "HOTEL",
                    fulfillment_id: "fulfillment-hotel-001",
                    location_id: "location-mumbai-001",
                    time: {
                        label: "check_in",
                        timestamp: checkInTime
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "WIFI", value: "Complimentary" },
                                { code: "PARKING", value: "Valet" },
                                { code: "POOL", value: "Available" },
                                { code: "SPA", value: "Full Service" },
                                { code: "GYM", value: "24/7" }
                            ]
                        },
                        {
                            code: "ROOM_TYPE",
                            list: [
                                { code: "TYPE", value: "Deluxe Room" },
                                { code: "SIZE", value: "45 sqm" },
                                { code: "BED", value: "King Size" }
                            ]
                        },
                        {
                            code: "POLICIES",
                            list: [
                                { code: "CANCELLATION", value: "Free cancellation up to 24 hours" },
                                { code: "CHECK_IN", value: "3:00 PM" },
                                { code: "CHECK_OUT", value: "12:00 PM" }
                            ]
                        }
                    ]
                },
                {
                    id: "hotel-002",
                    descriptor: {
                        name: "ITC Grand Central",
                        code: "ITC-002",
                        short_desc: "Premium business hotel",
                        long_desc: "Modern business hotel with excellent conference facilities and fine dining",
                        images: [
                            {
                                url: "https://example.com/itc-grand.jpg",
                                size_type: "md"
                            }
                        ]
                    },
                    price: {
                        currency: "INR",
                        value: "8500.00"
                    },
                    category_id: "HOTEL",
                    fulfillment_id: "fulfillment-hotel-002",
                    location_id: "location-mumbai-002",
                    time: {
                        label: "check_in",
                        timestamp: checkInTime
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "WIFI", value: "High-speed" },
                                { code: "PARKING", value: "Self-service" },
                                { code: "BUSINESS_CENTER", value: "24/7" },
                                { code: "RESTAURANT", value: "Multi-cuisine" },
                                { code: "CONCIERGE", value: "Available" }
                            ]
                        },
                        {
                            code: "ROOM_TYPE",
                            list: [
                                { code: "TYPE", value: "Executive Room" },
                                { code: "SIZE", value: "38 sqm" },
                                { code: "BED", value: "Queen Size" }
                            ]
                        },
                        {
                            code: "POLICIES",
                            list: [
                                { code: "CANCELLATION", value: "Free cancellation up to 48 hours" },
                                { code: "CHECK_IN", value: "2:00 PM" },
                                { code: "CHECK_OUT", value: "11:00 AM" }
                            ]
                        }
                    ]
                },
                {
                    id: "hotel-003",
                    descriptor: {
                        name: "Hotel Royal Plaza",
                        code: "RPL-003",
                        short_desc: "Budget-friendly hotel",
                        long_desc: "Comfortable stay at affordable prices with essential amenities",
                        images: [
                            {
                                url: "https://example.com/royal-plaza.jpg",
                                size_type: "md"
                            }
                        ]
                    },
                    price: {
                        currency: "INR",
                        value: "4200.00"
                    },
                    category_id: "HOTEL",
                    fulfillment_id: "fulfillment-hotel-003",
                    location_id: "location-mumbai-003",
                    time: {
                        label: "check_in",
                        timestamp: checkInTime
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "WIFI", value: "Complimentary" },
                                { code: "PARKING", value: "Available" },
                                { code: "RESTAURANT", value: "In-house" },
                                { code: "AC", value: "Available" }
                            ]
                        },
                        {
                            code: "ROOM_TYPE",
                            list: [
                                { code: "TYPE", value: "Standard Room" },
                                { code: "SIZE", value: "25 sqm" },
                                { code: "BED", value: "Double Bed" }
                            ]
                        },
                        {
                            code: "POLICIES",
                            list: [
                                { code: "CANCELLATION", value: "Free cancellation up to 12 hours" },
                                { code: "CHECK_IN", value: "1:00 PM" },
                                { code: "CHECK_OUT", value: "11:00 AM" }
                            ]
                        }
                    ]
                },
                {
                    id: "hotel-004",
                    descriptor: {
                        name: "Marriott Executive Apartments",
                        code: "MAR-004",
                        short_desc: "Extended stay apartments",
                        long_desc: "Spacious serviced apartments perfect for extended business and leisure stays",
                        images: [
                            {
                                url: "https://example.com/marriott-exec.jpg",
                                size_type: "md"
                            }
                        ]
                    },
                    price: {
                        currency: "INR",
                        value: "15000.00"
                    },
                    category_id: "HOTEL",
                    fulfillment_id: "fulfillment-hotel-004",
                    location_id: "location-mumbai-004",
                    time: {
                        label: "check_in",
                        timestamp: checkInTime
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "WIFI", value: "High-speed" },
                                { code: "KITCHENETTE", value: "Fully equipped" },
                                { code: "LAUNDRY", value: "In-room" },
                                { code: "POOL", value: "Infinity pool" },
                                { code: "GYM", value: "State-of-the-art" }
                            ]
                        },
                        {
                            code: "ROOM_TYPE",
                            list: [
                                { code: "TYPE", value: "One Bedroom Apartment" },
                                { code: "SIZE", value: "65 sqm" },
                                { code: "BED", value: "King Size" }
                            ]
                        },
                        {
                            code: "POLICIES",
                            list: [
                                { code: "CANCELLATION", value: "Free cancellation up to 72 hours" },
                                { code: "CHECK_IN", value: "3:00 PM" },
                                { code: "CHECK_OUT", value: "12:00 PM" }
                            ]
                        }
                    ]
                }
            ];

            // Create Beckn catalog structure
            const catalog = {
                bpp: {
                    descriptor: {
                        name: "Hotels BPP Provider",
                        short_desc: "Hotel booking provider",
                        long_desc: "Comprehensive hotel booking services across major Indian cities"
                    },
                    providers: [
                        {
                            id: "hotels-provider-001",
                            descriptor: {
                                name: "Indian Hotels Network",
                                short_desc: "Multi-brand hotel aggregator",
                                long_desc: "Access to premium hotels including Taj, ITC, Marriott and budget-friendly options"
                            },
                            categories: [
                                {
                                    id: "HOTEL",
                                    descriptor: {
                                        name: "Hotel Accommodation"
                                    }
                                }
                            ],
                            fulfillments: [
                                {
                                    id: "fulfillment-hotel-001",
                                    type: "DELIVERY",
                                    start: {
                                        location: {
                                            gps: location,
                                            address: {
                                                locality: "South Mumbai",
                                                city: "Mumbai",
                                                state: "Maharashtra",
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: checkInTime,
                                                end: new Date(new Date(checkInTime).getTime() + 2 * 60 * 60 * 1000).toISOString()
                                            }
                                        }
                                    },
                                    end: {
                                        location: {
                                            gps: location,
                                            address: {
                                                locality: "South Mumbai",
                                                city: "Mumbai",
                                                state: "Maharashtra",
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: checkOutTime,
                                                end: new Date(new Date(checkOutTime).getTime() + 2 * 60 * 60 * 1000).toISOString()
                                            }
                                        }
                                    }
                                }
                            ],
                            items: hotels,
                            locations: [
                                {
                                    id: "location-mumbai-001",
                                    gps: location,
                                    address: {
                                        locality: "Colaba",
                                        city: "Mumbai",
                                        state: "Maharashtra",
                                        country: "India"
                                    }
                                },
                                {
                                    id: "location-mumbai-002",
                                    gps: location,
                                    address: {
                                        locality: "Bandra East",
                                        city: "Mumbai",
                                        state: "Maharashtra",
                                        country: "India"
                                    }
                                },
                                {
                                    id: "location-mumbai-003",
                                    gps: location,
                                    address: {
                                        locality: "Andheri West",
                                        city: "Mumbai",
                                        state: "Maharashtra",
                                        country: "India"
                                    }
                                },
                                {
                                    id: "location-mumbai-004",
                                    gps: location,
                                    address: {
                                        locality: "Powai",
                                        city: "Mumbai",
                                        state: "Maharashtra",
                                        country: "India"
                                    }
                                }
                            ]
                        }
                    ]
                },
                providers: [
                    {
                        id: "hotels-provider-001",
                        descriptor: {
                            name: "Indian Hotels Network"
                        },
                        items: hotels
                    }
                ]
            };

            return catalog;

        } catch (error) {
            console.error('Error in hotels service:', error);
            throw error;
        }
    }
}

module.exports = new HotelsService();