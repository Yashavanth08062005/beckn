const internationalService = require('../services/internationalFlightsService');
const { v4: uuidv4 } = require('uuid');

class BecknController {
  async search(req, res) {
    try {
      const { context, message } = req.body;
      console.log('🔍 Intl Flights BPP received search request', { transaction_id: context?.transaction_id });

      const intent = message?.intent;
      const startLocation = intent?.fulfillment?.start?.location?.gps || '12.9716,77.5946';
      const endLocation = intent?.fulfillment?.end?.location?.gps || '19.0760,72.8777';
      const travelTime = intent?.fulfillment?.time?.range?.start || new Date().toISOString();

      const catalog = await internationalService.searchInternationalFlights(startLocation, endLocation, travelTime);

      const response = {
        context: {
          ...context,
          action: 'on_search',
          bpp_id: 'intl-flights-bpp.example.com',
          bpp_uri: 'http://localhost:7005',
          message_id: uuidv4(),
          timestamp: new Date().toISOString()
        },
        message: {
          catalog: catalog
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in intl flights search:', error);
      return res.status(500).json({
        context: { ...req.body.context, action: 'on_search' },
        error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' }
      });
    }
  }

  async select(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_select', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { ...message.order, state: 'SELECTED' } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_select' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }

  async init(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_init', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { ...message.order, state: 'INITIALIZED', id: uuidv4() } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_init' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }

  async confirm(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_confirm', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { ...message.order, state: 'CONFIRMED', id: message.order.id || uuidv4() } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_confirm' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }

  async status(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_status', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { id: message.order_id, state: 'CONFIRMED' } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_status' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }
}

module.exports = new BecknController();
