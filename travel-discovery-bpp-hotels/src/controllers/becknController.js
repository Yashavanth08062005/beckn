const hotelsService = require('../services/hotelsService');
const { v4: uuidv4 } = require('uuid');

/**
 * Hotels BPP Controller - Handles Beckn protocol requests for hotel services
 */
class BecknController {

    /**
     * Handle search requests - return available hotels
     */
    async search(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('🔍 Hotels BPP received search request:', {
                transaction_id: context?.transaction_id,
                bap_id: context?.bap_id
            });

            // Extract search parameters from Beckn message
            const intent = message?.intent;
            const location = intent?.fulfillment?.start?.location?.gps || "12.9716,77.5946";
            const checkInTime = intent?.fulfillment?.time?.range?.start || new Date().toISOString();
            const checkOutTime = intent?.fulfillment?.time?.range?.end || new Date(Date.now() + 86400000).toISOString();

            // Get hotel catalog
            const catalog = await hotelsService.searchHotels(location, checkInTime, checkOutTime);

            // Create Beckn-compliant response
            const response = {
                context: {
                    ...context,
                    action: "on_search",
                    bpp_id: "hotels-bpp.example.com",
                    bpp_uri: "http://localhost:7002",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    catalog: catalog
                }
            };

            console.log(`🏨 Hotels BPP returning ${catalog.providers[0].items.length} hotel options`);
            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in hotels search:', error);
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
            
            console.log('✅ Hotels BPP received select request');

            const response = {
                context: {
                    ...context,
                    action: "on_select",
                    bpp_id: "hotels-bpp.example.com",
                    bpp_uri: "http://localhost:7002", 
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
                                value: "8500.00"
                            },
                            breakup: [
                                {
                                    title: "Room Rate",
                                    price: {
                                        currency: "INR", 
                                        value: "7200.00"
                                    }
                                },
                                {
                                    title: "Taxes & Service Charges",
                                    price: {
                                        currency: "INR",
                                        value: "1300.00"
                                    }
                                }
                            ]
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in hotels select:', error);
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
            
            console.log('🚀 Hotels BPP received init request');

            const response = {
                context: {
                    ...context,
                    action: "on_init",
                    bpp_id: "hotels-bpp.example.com",
                    bpp_uri: "http://localhost:7002",
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
            console.error('Error in hotels init:', error);
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
     * Handle confirm requests
     */
    async confirm(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('💳 Hotels BPP received confirm request');

            const response = {
                context: {
                    ...context,
                    action: "on_confirm",
                    bpp_id: "hotels-bpp.example.com",
                    bpp_uri: "http://localhost:7002",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "CONFIRMED",
                        id: message.order.id || uuidv4(),
                        fulfillment: {
                            state: {
                                descriptor: {
                                    code: "CONFIRMED"
                                }
                            },
                            tracking: true
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in hotels confirm:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_confirm"
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
     * Handle status requests
     */
    async status(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('📊 Hotels BPP received status request');

            const response = {
                context: {
                    ...context,
                    action: "on_status",
                    bpp_id: "hotels-bpp.example.com",
                    bpp_uri: "http://localhost:7002",
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
            console.error('Error in hotels status:', error);
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

    // Additional endpoints for full BPP functionality
    async track(req, res) {
        try {
            return res.status(200).json({
                message: "Track functionality not implemented yet"
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async cancel(req, res) {
        try {
            return res.status(200).json({
                message: "Cancel functionality not implemented yet"
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            return res.status(200).json({
                message: "Update functionality not implemented yet" 
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new BecknController();