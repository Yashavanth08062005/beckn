const experiencesService = require('../services/experiencesService');
const { v4: uuidv4 } = require('uuid');

/**
 * Experiences Controller - Handles Beckn protocol requests for experiences
 */
class ExperiencesController {

    /**
     * Health check endpoint
     */
    async health(req, res) {
        try {
            res.status(200).json({
                status: 'healthy',
                service: 'Travel Discovery Experiences BPP',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        } catch (error) {
            console.error('❌ Health check error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Service unhealthy'
            });
        }
    }

    /**
     * Handle Beckn search requests for experiences
     */
    async search(req, res) {
        try {
            console.log('🔍 Received experience search request:', JSON.stringify(req.body, null, 2));

            const { context, message } = req.body;

            // Extract search parameters
            const intent = message?.intent || {};
            const location = intent.fulfillment?.start?.location?.gps || 
                           intent.fulfillment?.end?.location?.gps ||
                           'Mumbai'; // Default location

            const category = intent.category?.id || 'ALL';
            const travelDate = intent.fulfillment?.start?.time?.timestamp || new Date().toISOString();

            console.log('📋 Search parameters:', { location, category, travelDate });

            // Search experiences
            const catalog = await experiencesService.searchExperiences(location, category, travelDate);

            // Prepare Beckn response
            const response = {
                context: {
                    ...context,
                    action: 'on_search',
                    bpp_id: process.env.BPP_ID || 'experiences-bpp.example.com',
                    bpp_uri: process.env.BPP_URI || 'http://localhost:7004',
                    timestamp: new Date().toISOString()
                },
                message: {
                    catalog: catalog
                }
            };

            console.log('✅ Sending experience search response with', 
                catalog.bpp?.providers?.[0]?.items?.length || 0, 'experiences');

            res.status(200).json(response);

        } catch (error) {
            console.error('❌ Error in experience search:', error);
            
            res.status(500).json({
                context: {
                    ...req.body.context,
                    action: 'on_search',
                    bpp_id: process.env.BPP_ID || 'experiences-bpp.example.com',
                    timestamp: new Date().toISOString()
                },
                error: {
                    type: 'INTERNAL_ERROR',
                    code: '500',
                    message: 'Internal server error during experience search'
                }
            });
        }
    }

    /**
     * Handle Beckn select requests for experiences
     */
    async select(req, res) {
        try {
            console.log('🎯 Received experience select request:', JSON.stringify(req.body, null, 2));

            const { context, message } = req.body;
            const order = message?.order;

            if (!order || !order.items || order.items.length === 0) {
                return res.status(400).json({
                    context: {
                        ...context,
                        action: 'on_select',
                        bpp_id: process.env.BPP_ID || 'experiences-bpp.example.com',
                        timestamp: new Date().toISOString()
                    },
                    error: {
                        type: 'INVALID_REQUEST',
                        code: '400',
                        message: 'No experience items selected'
                    }
                });
            }

            // Get selected experience details
            const selectedItem = order.items[0];
            const experienceId = selectedItem.id.replace('experience-', '');
            
            console.log('📋 Selected experience ID:', experienceId);

            // Get experience details from database
            const experience = await experiencesService.getExperienceById(experienceId);

            // Prepare response with selected experience details
            const response = {
                context: {
                    ...context,
                    action: 'on_select',
                    bpp_id: process.env.BPP_ID || 'experiences-bpp.example.com',
                    bpp_uri: process.env.BPP_URI || 'http://localhost:7004',
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        provider: {
                            id: "experiences-provider-001",
                            descriptor: {
                                name: experience.provider_name || "Travel Experiences Hub"
                            }
                        },
                        items: [
                            {
                                id: selectedItem.id,
                                descriptor: {
                                    name: experience.experience_name,
                                    code: experience.experience_code,
                                    short_desc: experience.short_desc,
                                    long_desc: experience.long_desc
                                },
                                price: {
                                    currency: experience.currency || "INR",
                                    value: parseFloat(experience.price).toFixed(2)
                                },
                                category_id: "EXPERIENCE",
                                fulfil