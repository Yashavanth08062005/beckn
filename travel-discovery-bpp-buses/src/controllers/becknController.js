const busService = require('../services/busService');
const { v4: uuidv4 } = require('uuid');

/**
 * Bus BPP Controller - Handles Beckn protocol requests for bus services
 */
class BecknController {

    /**
     * Handle search requests - return available buses
     */
    async search(req, res) {
        try {
            const { context, message } = req.body;

            console.log('🔍 Buses BPP received search request:', {
                transaction_id: context?.transaction_id,
                bap_id: context?.bap_id
            });

            // Extract search parameters from Beckn message
            const intent = message?.intent;
            const startLocation = intent?.fulfillment?.start?.location?.gps || "12.9716,77.5946";
            const endLocation = intent?.fulfillment?.end?.location?.gps || "19.0760,72.8777";
            const travelTime = intent?.fulfillment?.time?.range?.start || new Date().toISOString();

            // Get bus catalog
            const catalog = await busService.searchBuses(startLocation, endLocation, travelTime);

            // Create Beckn-compliant response
            const response = {
                context: {
                    ...context,
                    action: "on_search",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7007",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    catalog: catalog
                }
            };

            console.log(`🚌 Buses BPP returning ${catalog.providers[0].items.length} bus options`);
            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in bus search:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_search"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle select requests
     */
    async select(req, res) {
        try {
            const { context, message } = req.body;

            console.log('✅ Buses BPP received select request');

            const response = {
                context: {
                    ...context,
                    action: "on_select",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7007",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "SELECTED",
                        quote: {
                            price: {
                                currency: "INR",
                                value: "600.00"
                            },
                            breakup: [
                                {
                                    title: "Bus Fare",
                                    price: {
                                        currency: "INR",
                                        value: "500.00"
                                    }
                                },
                                {
                                    title: "Service Tax",
                                    price: {
                                        currency: "INR",
                                        value: "100.00"
                                    }
                                }
                            ]
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in bus select:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_select"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle init requests
     */
    async init(req, res) {
        try {
            const { context, message } = req.body;

            console.log('🚀 Buses BPP received init request');

            const response = {
                context: {
                    ...context,
                    action: "on_init",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7007",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "INITIALIZED",
                        id: uuidv4(),
                        payment: {
                            type: "PRE-FULFILLMENT",
                            collected_by: "BPP"
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in bus init:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_init"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle confirm requests - Save booking to BPP database
     */
    async confirm(req, res) {
        try {
            const { context, message } = req.body;

            console.log('💳 Buses BPP received confirm request');

            // Logic to create booking would go here (similar to flights)
            const bppBookingId = `BUS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

            const response = {
                context: {
                    ...context,
                    action: "on_confirm",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7007",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "CONFIRMED",
                        id: message.order.id || uuidv4(),
                        bpp_booking_id: bppBookingId,
                        fulfillment: {
                            state: {
                                descriptor: {
                                    code: "CONFIRMED"
                                }
                            },
                            tracking: true,
                            id: bppBookingId
                        },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in bus confirm:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_confirm"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    /**
     * Handle status requests
     */
    async status(req, res) {
        try {
            const { context, message } = req.body;

            console.log('📊 Buses BPP received status request');

            const response = {
                context: {
                    ...context,
                    action: "on_status",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7007",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: message.order_id,
                        state: "CONFIRMED",
                        fulfillment: {
                            state: {
                                descriptor: {
                                    code: "CONFIRMED"
                                }
                            }
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in bus status:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_status"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    // Additional endpoints
    async track(req, res) { return res.status(200).json({ message: "Track not implemented" }); }
    async cancel(req, res) { return res.status(200).json({ message: "Cancel not implemented" }); }
    async update(req, res) { return res.status(200).json({ message: "Update not implemented" }); }
}

module.exports = new BecknController();