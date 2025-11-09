const becknService = require('../services/becknService');
const logger = require('../utils/logger');

/**
 * Beckn Controller - Handles all Beckn protocol endpoints for BAP
 */
class BecknController {
    
    /**
     * Handle discovery/search requests
     */
    async search(req, res) {
        try {
            const { context, message } = req.body;
            
            // Validate Beckn request structure
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format. Missing context or message."
                    }
                });
            }

            logger.info('Received Beckn search request', {
                transaction_id: context.transaction_id,
                message_id: context.message_id,
                intent: message.intent
            });

            // Process search through Beckn service
            const result = await becknService.processSearch(context, message);

            return res.status(200).json(result);
            
        } catch (error) {
            logger.logError('Error in search controller:', error);
            return res.status(500).json({
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001", 
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn select request', {
                transaction_id: context.transaction_id,
                order: message.order
            });

            const result = await becknService.processSelect(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in select controller:', error);
            return res.status(500).json({
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn init request', {
                transaction_id: context.transaction_id,
                order: message.order
            });

            const result = await becknService.processInit(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in init controller:', error);
            return res.status(500).json({
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR", 
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn confirm request', {
                transaction_id: context.transaction_id,
                order: message.order
            });

            const result = await becknService.processConfirm(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in confirm controller:', error);
            return res.status(500).json({
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn status request', {
                transaction_id: context.transaction_id,
                order_id: message.order_id
            });

            const result = await becknService.processStatus(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in status controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Health check for BAP service
     */
    async health(req, res) {
        try {
            return res.status(200).json({
                status: "OK",
                service: "Beckn Travel Discovery BAP",
                version: "1.0.0",
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    }
}

module.exports = new BecknController();