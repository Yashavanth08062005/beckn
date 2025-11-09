const express = require('express');
const router = express.Router();
const becknController = require('../controllers/becknController');

/**
 * Beckn Protocol Routes for BAP (Beckn Application Platform)
 * These routes handle the standard Beckn discovery and transaction flow
 */

// Discovery Phase
router.post('/search', becknController.search);

// Transaction Phase  
router.post('/select', becknController.select);
router.post('/init', becknController.init);
router.post('/confirm', becknController.confirm);

// Post-Transaction Phase
router.post('/status', becknController.status);

// Health Check
router.get('/health', becknController.health);

module.exports = router;