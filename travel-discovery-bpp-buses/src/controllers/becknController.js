const busesService = require('../services/busService');
const { v4: uuidv4 } = require('uuid');

/**
 * Buses BPP Controller - Handles Beckn protocol requests for bus services
 */
class BecknController {

    async search(req, res) {
        try {
            const { context, message } = req.body;
            console.log('🔍 Buses BPP received search request:', {
                transaction_id: context?.transaction_id,
                bap_id: context?.bap_id
            });

            const intent = message?.intent;
            const startLocation = intent?.fulfillment?.start?.location?.gps || "12.9716,77.5946";
            const endLocation = intent?.fulfillment?.end?.location?.gps || "19.0760,72.8777";
            const travelTime = intent?.fulfillment?.time?.range?.start || new Date().toISOString();

            const catalog = await busesService.searchBuses(startLocation, endLocation, travelTime);

            const response = {
                context: {
                    ...context,
                    action: "on_search",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7006",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    catalog: catalog
                }
            };

            console.log(`🚌  Buses BPP returning ${catalog.providers[0].items.length} bus options`);
            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in buses search:', error);
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

    async select(req, res) {
        try {
            const { context, message } = req.body;
            console.log('✅ Buses BPP received select request');

            const response = {
                context: {
                    ...context,
                    action: "on_select",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7006",
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
                                value: "750.00"
                            },
                            breakup: [
                                {
                                    title: "Base Fare",
                                    price: {
                                        currency: "INR",
                                        value: "600.00"
                                    }
                                },
                                {
                                    title: "Taxes & Fees",
                                    price: {
                                        currency: "INR",
                                        value: "150.00"
                                    }
                                }
                            ]
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in buses select:', error);
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

    async init(req, res) {
        try {
            const { context, message } = req.body;
            console.log('🚀 Buses BPP received init request');

            const response = {
                context: {
                    ...context,
                    action: "on_init",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7006",
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
            console.error('Error in buses init:', error);
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

    async confirm(req, res) {
        try {
            const { context, message } = req.body;
            console.log('💳 Buses BPP received confirm request');

            const response = {
                context: {
                    ...context,
                    action: "on_confirm",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7006",
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
            console.error('Error in buses confirm:', error);
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

    async status(req, res) {
        try {
            const { context, message } = req.body;
            console.log('📊 Buses BPP received status request');

            const response = {
                context: {
                    ...context,
                    action: "on_status",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:7005",
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
            console.error('Error in buses status:', error);
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
