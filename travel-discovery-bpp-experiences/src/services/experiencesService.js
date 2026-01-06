const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Experiences Service - Provides experience catalog and booking services
 */
class ExperiencesService {

    /**
     * Convert GPS coordinates to city/location
     */
    gpsToLocation(gps) {
        if (!gps) return null;
        
        const locationMap = {
            // Mumbai coordinates
            '18.9220,72.8332': 'Mumbai',
            '18.9322,72.8264': 'Mumbai',
            '18.9568,72.8320': 'Mumbai',
            '18.9633,72.9315': 'Mumbai',
            
            // Bangalore coordinates
            '12.9716,77.5946': 'Bangalore',
            '12.8456,77.6603': 'Bangalore',
            '12.9279,77.6271': 'Bangalore',
            
            // Delhi coordinates
            '28.6562,77.2410': 'Delhi',
            '28.6315,77.2167': 'Delhi',
            
            // Goa coordinates
            '15.5527,73.7603': 'Goa',
            '15.4013,74.0071': 'Goa',
            
            // Chennai coordinates
            '13.0339,80.2619': 'Chennai',
            
            // Hyderabad coordinates
            '17.3616,78.4747': 'Hyderabad'
        };
        
        return locationMap[gps] || null;
    }

    /**
     * Search for available experiences from database
     */
    async searchExperiences(location, category, travelDate) {
        try {
            console.log(`🔍 Searching experiences in ${location}, category: ${category}, date: ${travelDate}`);

            // Convert GPS to city if needed
            const searchCity = this.gpsToLocation(location) || location;
            
            console.log(`📍 Searching in city: ${searchCity}`);

            // Build query with optional filtering
            let query = `
                SELECT * FROM experiences 
                WHERE status = 'ACTIVE'
            `;
            
            const queryParams = [];
            
            // Add city filter if available
            if (searchCity) {
                queryParams.push(`%${searchCity}%`);
                query += ` AND city ILIKE $${queryParams.length}`;
            }
            
            // Add category filter if available
            if (category && category !== 'ALL') {
                queryParams.push(category.toUpperCase());
                query += ` AND category = $${queryParams.length}`;
            }
            
            query += ` ORDER BY rating DESC, total_reviews DESC, price`;
            
            console.log(`📝 Query: ${query}`, queryParams);
            
            const result = await db.query(query, queryParams);
            
            if (result.rows.length === 0) {
                console.log('⚠️  No experiences found in database');
                return this.getEmptyCatalog();
            }

            console.log(`✅ Found ${result.rows.length} experiences in database`);

            // Transform database records to Beckn format
            const experiences = result.rows.map(experience => {
                return {
                    id: `experience-${experience.id}`,
                    descriptor: {
                        name: experience.experience_name,
                        code: experience.experience_code,
                        short_desc: experience.short_desc || 'Experience service',
                        long_desc: experience.long_desc || `${experience.experience_name} experience`
                    },
                    price: {
                        currency: experience.currency || "INR",
                        value: parseFloat(experience.price).toFixed(2)
                    },
                    category_id: "EXPERIENCE",
                    fulfillment_id: `fulfillment-${experience.id}`,
                    location_id: `location-${experience.city.toLowerCase()}`,
                    time: {
                        label: "duration",
                        duration: `PT${experience.duration_hours}H`
                    },
                    matched: true,
                    tags: [
                        {
                            code: "EXPERIENCE_TYPE",
                            list: [
                                { code: "CATEGORY", value: experience.category },
                                { code: "SUBCATEGORY", value: experience.subcategory || "N/A" },
                                { code: "DIFFICULTY", value: experience.difficulty_level || "EASY" }
                            ]
                        },
                        {
                            code: "DETAILS",
                            list: [
                                { code: "DURATION", value: `${experience.duration_hours} hours` },
                                { code: "MAX_PARTICIPANTS", value: experience.max_participants.toString() },
                                { code: "MIN_PARTICIPANTS", value: experience.min_participants.toString() },
                                { code: "AGE_RESTRICTION", value: experience.age_restriction || "ALL_AGES" }
                            ]
                        },
                        {
                            code: "RATING",
                            list: [
                                { code: "AVERAGE", value: (experience.rating || 0).toString() },
                                { code: "TOTAL_REVIEWS", value: (experience.total_reviews || 0).toString() }
                            ]
                        },
                        {
                            code: "LOCATION",
                            list: [
                                { code: "CITY", value: experience.city },
                                { code: "AREA", value: experience.location || experience.city },
                                { code: "GPS", value: experience.gps_coordinates || "" }
                            ]
                        }
                    ]
                };
            });

            // Create Beckn catalog structure
            const catalog = {
                bpp: {
                    descriptor: {
                        name: "Experiences BPP Provider",
                        short_desc: "Experience booking provider",
                        long_desc: "Comprehensive experience booking services - tours, activities, and attractions"
                    },
                    providers: [
                        {
                            id: "experiences-provider-001",
                            descriptor: {
                                name: "Travel Experiences Hub",
                                short_desc: "Multiple experience aggregator",
                                long_desc: "Access to tours, activities, cultural experiences, and adventures across India"
                            },
                            categories: [
                                {
                                    id: "EXPERIENCE",
                                    descriptor: {
                                        name: "Experience Services"
                                    }
                                }
                            ],
                            fulfillments: [
                                {
                                    id: "fulfillment-001",
                                    type: "EXPERIENCE",
                                    start: {
                                        location: {
                                            gps: location,
                                            address: {
                                                locality: searchCity || "City Center",
                                                city: searchCity || "Unknown",
                                                state: "India",
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                                                end: new Date(Date.now() + 2592000000).toISOString() // 30 days from now
                                            }
                                        }
                                    }
                                }
                            ],
                            items: experiences,
                            locations: [
                                {
                                    id: `location-${(searchCity || 'unknown').toLowerCase()}`,
                                    gps: location,
                                    address: {
                                        locality: "City Center",
                                        city: searchCity || "Unknown",
                                        state: "India",
                                        country: "India"
                                    }
                                }
                            ]
                        }
                    ]
                },
                providers: [
                    {
                        id: "experiences-provider-001",
                        descriptor: {
                            name: "Travel Experiences Hub"
                        },
                        items: experiences
                    }
                ]
            };

            return catalog;

        } catch (error) {
            console.error('❌ Error in experiences service:', error);
            throw error;
        }
    }

    /**
     * Get empty catalog when no experiences found
     */
    getEmptyCatalog() {
        return {
            bpp: {
                descriptor: {
                    name: "Experiences BPP Provider",
                    short_desc: "Experience booking provider",
                    long_desc: "Comprehensive experience booking services across India"
                },
                providers: []
            },
            providers: []
        };
    }

    /**
     * Create BPP booking in database
     */
    async createBppBooking(bookingData) {
        try {
            console.log('💾 Creating Experience BPP booking:', {
                bppBookingId: bookingData.bppBookingId,
                platformBookingId: bookingData.platformBookingId
            });

            const query = `
                INSERT INTO experience_bookings (
                    booking_id, experience_id, platform_booking_id, participant_name,
                    participant_email, participant_phone, number_of_participants,
                    booking_date, time_slot, total_amount, booking_status,
                    participant_details, beckn_transaction_id, beckn_message_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `;

            const values = [
                bookingData.bppBookingId,
                bookingData.experienceId,
                bookingData.platformBookingId,
                bookingData.participantName,
                bookingData.participantEmail,
                bookingData.participantPhone,
                bookingData.numberOfParticipants,
                bookingData.bookingDate,
                bookingData.timeSlot,
                bookingData.totalAmount,
                bookingData.bookingStatus || 'CONFIRMED',
                JSON.stringify(bookingData.participantDetails || []),
                bookingData.becknTransactionId,
                bookingData.becknMessageId
            ];

            const result = await db.query(query, values);
            
            console.log('✅ Experience BPP booking created successfully:', {
                id: result.rows[0].id,
                bppBookingId: result.rows[0].booking_id
            });

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error creating Experience BPP booking:', error);
            throw new Error(`Failed to create Experience BPP booking: ${error.message}`);
        }
    }

    /**
     * Get BPP booking by ID
     */
    async getBppBooking(bppBookingId) {
        try {
            const query = `
                SELECT eb.*, e.experience_name, e.experience_code, e.city, e.category, e.provider_name
                FROM experience_bookings eb
                LEFT JOIN experiences e ON eb.experience_id = e.id
                WHERE eb.booking_id = $1
            `;

            const result = await db.query(query, [bppBookingId]);
            
            if (result.rows.length === 0) {
                throw new Error(`Experience BPP booking not found: ${bppBookingId}`);
            }

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error getting Experience BPP booking:', error);
            throw error;
        }
    }
    
    /**
     * Update booking for cancellation
     */
    async updateBookingForCancellation(updateData) {
        try {
            console.log('💾 Updating experience booking for cancellation:', {
                bppBookingId: updateData.bppBookingId,
                cancellationReason: updateData.cancellationReason
            });

            const query = `
                UPDATE experience_bookings 
                SET 
                    booking_status = 'CANCELLED',
                    cancellation_status = 'CANCELLED',
                    cancellation_reason = $2,
                    cancellation_time = $3,
                    cancellation_charges = $4,
                    refund_amount = $5,
                    refund_status = 'PROCESSING',
                    refund_id = $6,
                    updated_at = $7
                WHERE booking_id = $1
                RETURNING *
            `;

            const refundId = `EXP-REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            const values = [
                updateData.bppBookingId,
                updateData.cancellationReason,
                new Date().toISOString(),
                updateData.cancellationCharges || 0,
                updateData.refundAmount,
                refundId,
                new Date().toISOString()
            ];

            const result = await db.query(query, values);
            
            if (result.rows.length === 0) {
                throw new Error(`Experience BPP booking not found for cancellation: ${updateData.bppBookingId}`);
            }

            console.log('✅ Experience BPP booking updated for cancellation:', {
                bppBookingId: result.rows[0].booking_id,
                refundId: result.rows[0].refund_id
            });

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error updating Experience BPP booking for cancellation:', error);
            throw new Error(`Failed to update Experience BPP booking for cancellation: ${error.message}`);
        }
    }
    
    /**
     * Get booking status
     */
    async getBookingStatus(bppBookingId) {
        try {
            const booking = await this.getBppBooking(bppBookingId);
            
            return {
                id: booking.booking_id,
                platformBookingId: booking.platform_booking_id,
                status: booking.booking_status,
                cancellationStatus: booking.cancellation_status,
                refundStatus: booking.refund_status,
                refundAmount: parseFloat(booking.refund_amount || 0),
                cancellationReason: booking.cancellation_reason,
                bookingDetails: {
                    participantName: booking.participant_name,
                    participantEmail: booking.participant_email,
                    numberOfParticipants: booking.number_of_participants,
                    bookingDate: booking.booking_date,
                    timeSlot: booking.time_slot,
                    experienceInfo: {
                        experienceName: booking.experience_name,
                        experienceCode: booking.experience_code,
                        city: booking.city,
                        category: booking.category,
                        providerName: booking.provider_name
                    }
                }
            };
        } catch (error) {
            console.error('❌ Error getting experience booking status:', error);
            throw error;
        }
    }

    /**
     * Get experience details by ID
     */
    async getExperienceById(experienceId) {
        try {
            const query = `
                SELECT * FROM experiences 
                WHERE id = $1 AND status = 'ACTIVE'
            `;

            const result = await db.query(query, [experienceId]);
            
            if (result.rows.length === 0) {
                throw new Error(`Experience not found: ${experienceId}`);
            }

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error getting experience details:', error);
            throw error;
        }
    }
}

module.exports = new ExperiencesService();