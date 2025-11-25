const axios = require('axios');
const logger = require('../utils/logger');
const env = require('../config/env');
const { v4: uuidv4 } = require('uuid');

/**
 * Beckn Service - Handles communication with ONIX adapter
 * Transforms BAP requests into proper Beckn messages and sends to ONIX
 */
class BecknService {
    
    constructor() {
        this.onixBaseUrl = env.ONIX_URL || 'http://127.0.0.1:5000';
        this.bapId = env.BAP_ID || 'travel-discovery-bap.example.com';
        this.bapUri = env.BAP_URI || 'http://127.0.0.1:8081';
        this.flightsBppUrl = env.FLIGHTS_BPP_URL || 'http://127.0.0.1:7001';
        this.flightsIntlBppUrl = env.FLIGHTS_INTL_BPP_URL || 'http://127.0.0.1:7005';
        this.hotelsBppUrl = env.HOTELS_BPP_URL || 'http://127.0.0.1:7003';
        this.busesBppUrl = env.BUSES_BPP_URL || 'http://127.0.0.1:7006';
    }

    /**
     * Create Beckn context object
     */
    createContext(action, transactionId = null, messageId = null) {
        return {
            domain: "mobility",
            country: "IND",
            city: "std:080", // Bangalore city code
            action: action,
            core_version: "1.1.0",
            bap_id: this.bapId,
            bap_uri: this.bapUri,
            transaction_id: transactionId || uuidv4(),
            message_id: messageId || uuidv4(),
            timestamp: new Date().toISOString(),
            key: env.BAP_PUBLIC_KEY || "",
            ttl: "PT30S"
        };
    }

    /**
     * Process search request - send to ONIX and aggregate responses
     */
    async processSearch(context, message) {
        try {
            logger.info('Processing Beckn search request');

            // Create Beckn-compliant search request
            const becknRequest = {
                context: this.createContext('search', context.transaction_id, context.message_id),
                message: {
                    intent: {
                        fulfillment: {
                            start: {
                                location: {
                                    gps: message.intent?.fulfillment?.start?.location?.gps || "12.9716,77.5946"
                                }
                            },
                            end: {
                                location: {
                                    gps: message.intent?.fulfillment?.end?.location?.gps || "19.0760,72.8777"
                                }
                            },
                            time: {
                                range: {
                                    start: message.intent?.fulfillment?.time?.range?.start || new Date().toISOString(),
                                    end: message.intent?.fulfillment?.time?.range?.end || new Date(Date.now() + 86400000).toISOString()
                                }
                            }
                        },
                        category: {
                            id: message.intent?.category?.id || "MOBILITY"
                        },
                        item: {
                            descriptor: {
                                name: message.intent?.item?.descriptor?.name || "Travel Service"
                            }
                        }
                    }
                }
            };

            // Route request to ONIX adapter (mock or real)
            // The ONIX adapter handles Beckn protocol messages; we also query BPPs directly
            const onixResponse = await this.sendToONIX('/search', becknRequest);

            // Aggregate providers from ONIX and BPPs
            const aggregated = {
                context: onixResponse.data.context || this.createContext('on_search', context.transaction_id, context.message_id),
                message: { catalog: { descriptor: onixResponse.data?.message?.catalog?.descriptor || {}, providers: [] } }
            };

            // Add providers from ONIX if present
            const onixProviders = onixResponse.data?.message?.catalog?.providers || [];
            aggregated.message.catalog.providers.push(...onixProviders);

            // Determine category and query relevant BPPs
            const categoryId = (message.intent?.category?.id || '').toString().toUpperCase();

            if (categoryId === 'FLIGHT') {
                // Query primary flights BPP
                try {
                    const flightsRes = await this.sendToBPP(this.flightsBppUrl, '/search', becknRequest);
                    const flightsProviders = flightsRes.data?.message?.catalog?.providers || [];
                    aggregated.message.catalog.providers.push(...flightsProviders);
                } catch (err) {
                    logger.error('Error fetching from primary flights BPP', { error: err.message });
                }

                // Query international flights BPP
                try {
                    const intlRes = await this.sendToBPP(this.flightsIntlBppUrl, '/search', becknRequest);
                    const intlProviders = intlRes.data?.message?.catalog?.providers || [];
                    aggregated.message.catalog.providers.push(...intlProviders);
                } catch (err) {
                    logger.error('Error fetching from international flights BPP', { error: err.message });
                }
            } else if (categoryId === 'BUS') {
                // Query buses BPP
                try {
                    const busesRes = await this.sendToBPP(this.busesBppUrl, '/search', becknRequest);
                    const busesProviders = busesRes.data?.message?.catalog?.providers || [];
                    aggregated.message.catalog.providers.push(...busesProviders);
                } catch (err) {
                    logger.error('Error fetching from buses BPP', { error: err.message });
                }
            }

            return aggregated;

        } catch (error) {
            logger.error('Error processing search:', error);
            throw new Error('Failed to process search request');
        }
    }

    /**
     * Process select request
     */
    async processSelect(context, message) {
        try {
            logger.info('Processing Beckn select request');

            const becknRequest = {
                context: this.createContext('select', context.transaction_id, context.message_id),
                message: {
                    order: message.order
                }
            };

            const onixResponse = await this.sendToONIX('/select', becknRequest);
            return onixResponse.data;

        } catch (error) {
            logger.error('Error processing select:', error);
            throw new Error('Failed to process select request');
        }
    }

    /**
     * Process init request
     */
    async processInit(context, message) {
        try {
            logger.info('Processing Beckn init request');

            const becknRequest = {
                context: this.createContext('init', context.transaction_id, context.message_id),
                message: {
                    order: message.order
                }
            };

            const onixResponse = await this.sendToONIX('/init', becknRequest);
            return onixResponse.data;

        } catch (error) {
            logger.error('Error processing init:', error);
            throw new Error('Failed to process init request');
        }
    }

    /**
     * Process confirm request
     */
    async processConfirm(context, message) {
        try {
            logger.info('Processing Beckn confirm request');

            const becknRequest = {
                context: this.createContext('confirm', context.transaction_id, context.message_id),
                message: {
                    order: message.order
                }
            };

            const onixResponse = await this.sendToONIX('/confirm', becknRequest);
            return onixResponse.data;

        } catch (error) {
            logger.error('Error processing confirm:', error);
            throw new Error('Failed to process confirm request');
        }
    }

    /**
     * Process status request
     */
    async processStatus(context, message) {
        try {
            logger.info('Processing Beckn status request');

            const becknRequest = {
                context: this.createContext('status', context.transaction_id, context.message_id),
                message: {
                    order_id: message.order_id
                }
            };

            const onixResponse = await this.sendToONIX('/status', becknRequest);
            return onixResponse.data;

        } catch (error) {
            logger.error('Error processing status:', error);
            throw new Error('Failed to process status request');
        }
    }

    /**
     * Send request to ONIX adapter
     */
    async sendToONIX(endpoint, becknRequest) {
        try {
            const url = `${this.onixBaseUrl}${endpoint}`;
            
            logger.info(`Sending request to ONIX: ${url}`, {
                transaction_id: becknRequest.context.transaction_id,
                message_id: becknRequest.context.message_id
            });

            const response = await axios.post(url, becknRequest, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.ONIX_API_KEY || ''}`,
                },
                timeout: 30000 // 30 second timeout
            });

            logger.info(`Received response from ONIX: ${response.status}`);
            return response;

        } catch (error) {
            logger.error('Error communicating with ONIX:', {
                message: error.message,
                code: error.code,
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data
            });

            if (error.code === 'ECONNREFUSED') {
                const message = `Cannot connect to ONIX adapter at ${this.onixBaseUrl}. Make sure ONIX is running and accessible.`;
                logger.error(message);
                throw new Error(message);
            }
            
            if (error.response?.status === 404) {
                throw new Error(`ONIX endpoint not found: ${error.config?.url}`);
            }

            if (error.response?.data?.error?.message) {
                throw new Error(error.response.data.error.message);
            }
            
            throw new Error(`Failed to communicate with ONIX adapter: ${error.message}`);
        }
    }

    /**
     * Send request to a specific BPP (flights/hotels)
     */
    async sendToBPP(baseUrl, endpoint, becknRequest) {
        try {
            const url = `${baseUrl}${endpoint}`;
            logger.info(`Sending request to BPP: ${url}`, {
                transaction_id: becknRequest.context.transaction_id,
                message_id: becknRequest.context.message_id
            });

            const response = await axios.post(url, becknRequest, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000
            });

            logger.info(`Received response from BPP: ${response.status}`);
            return response;

        } catch (error) {
            logger.error('Error communicating with BPP:', {
                message: error.message,
                code: error.code,
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data
            });

            if (error.code === 'ECONNREFUSED') {
                const message = `Cannot connect to BPP at ${baseUrl}. Make sure the service is running and accessible.`;
                logger.error(message);
                throw new Error(message);
            }

            if (error.response?.data?.error?.message) {
                throw new Error(error.response.data.error.message);
            }

            throw new Error(`Failed to communicate with BPP at ${baseUrl}: ${error.message}`);
        }
    }
}

module.exports = new BecknService();