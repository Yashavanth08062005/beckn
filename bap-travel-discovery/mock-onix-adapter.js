/**
 * Mock ONIX Adapter Service
 * This is a development mock that simulates ONIX adapter responses
 * Use this for testing when ONIX is not available
 *
 * For production, connect to real ONIX adapter at http://localhost:8081
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.MOCK_ONIX_PORT || 9090;

// Middleware - Order matters!
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  if (req.method !== 'GET') {
    console.log(`   Body:`, JSON.stringify(req.body).substring(0, 200) + '...');
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Mock ONIX Adapter',
    version: '1.0.0 (MOCK)',
    timestamp: new Date().toISOString(),
    note: 'This is a mock adapter for development. For production, use real ONIX at http://localhost:8081'
  });
});

// Mock search endpoint
app.post('/search', (req, res) => {
  try {
    console.log(`✅ Search endpoint called`);
    const { context, message } = req.body;

    if (!context || !message) {
      console.log(`⚠️  Missing context or message in search request`);
      return res.status(400).json({
        error: {
          type: 'CORE-ERROR',
          code: '20001',
          message: 'Invalid request format'
        }
      });
    }

    // Determine category to route to correct providers
    const category = (message.intent?.category?.id || '').toString().toUpperCase();
    console.log(`📋 Search category: ${category}`);

    // Generate mock response with sample data based on category
    const mockResponse = {
      context: {
        ...context,
        action: 'on_search'
      },
      message: {
        catalog: {
          descriptor: {
            name: 'Travel Providers',
            short_desc: 'Available travel providers'
          },
          providers: generateMockProviders(category)
        }
      }
    };

    console.log(
      `✅ Returning mock search response with ${mockResponse.message.catalog.providers.length} providers`
    );
    res.json(mockResponse);
  } catch (error) {
    console.error('❌ Error processing search:', error);
    res.status(500).json({
      error: {
        type: 'CORE-ERROR',
        code: '20000',
        message: error.message || 'Internal server error'
      }
    });
  }
});

// Mock select endpoint
app.post('/select', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_select' },
    message: { order: message.order }
  });
});

// Mock init endpoint
app.post('/init', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_init' },
    message: { order: message.order }
  });
});

// Mock confirm endpoint
app.post('/confirm', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_confirm' },
    message: { order_id: message.order.id }
  });
});

// Mock status endpoint
app.post('/status', (req, res) => {
  const { context, message } = req.body;
  res.json({
    context: { ...context, action: 'on_status' },
    message: {
      order: {
        id: message.order_id,
        status: 'CONFIRMED'
      }
    }
  });
});

// ---------- Generate mock providers based on category ----------
function generateMockProviders(category = 'MOBILITY') {
  const cat = (category || 'MOBILITY').toString().toUpperCase();
  console.log('🧪 generateMockProviders for category:', cat);

  // ---------- BUS MOCK DATA ----------
  if (cat === 'BUS') {
    console.log('🚌 BUS category detected - returning mock BUS providers');

    return [
      {
        id: 'bus_provider_1',
        descriptor: {
          name: 'VRL Travels',
          code: 'VRL',
          short_desc: 'Premium AC Sleeper Buses'
        },
        items: [
          {
            id: 'bus_1',
            descriptor: {
              name: 'VRL DEL → BLR Sleeper',
              code: 'VRL-DEL-BLR-01',
              short_desc: 'AC Sleeper • Non-stop',
              long_desc: 'Overnight AC sleeper bus from Delhi to Bangalore'
            },
            price: {
              currency: 'INR',
              value: '2200'
            },
            time: {
              // departure time
              timestamp: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
            },
            tags: [
              {
                code: 'BUS_TYPE',
                list: [
                  { code: 'AC', value: 'Yes' },
                  { code: 'SEATING', value: 'Sleeper' }
                ]
              },
              {
                code: 'AMENITIES',
                list: [
                  { code: 'WIFI', value: 'Available' },
                  { code: 'WATER', value: 'Complimentary water bottle' },
                  { code: 'BLANKET', value: 'Blanket provided' }
                ]
              }
            ]
          },
          {
            id: 'bus_2',
            descriptor: {
              name: 'VRL DEL → BLR Semi-Sleeper',
              code: 'VRL-DEL-BLR-02',
              short_desc: 'AC Semi-Sleeper',
              long_desc: 'Comfortable semi-sleeper bus with AC'
            },
            price: {
              currency: 'INR',
              value: '1800'
            },
            time: {
              timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
            },
            tags: [
              {
                code: 'BUS_TYPE',
                list: [
                  { code: 'AC', value: 'Yes' },
                  { code: 'SEATING', value: 'Semi-Sleeper' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'bus_provider_2',
        descriptor: {
          name: 'SRS Travels',
          code: 'SRS',
          short_desc: 'Budget & Premium buses'
        },
        items: [
          {
            id: 'bus_3',
            descriptor: {
              name: 'SRS DEL → BLR Non-AC Seater',
              code: 'SRS-DEL-BLR-01',
              short_desc: 'Non-AC Seater',
              long_desc: 'Budget non-AC seater bus from Delhi to Bangalore'
            },
            price: {
              currency: 'INR',
              value: '1200'
            },
            time: {
              timestamp: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
            },
            tags: [
              {
                code: 'BUS_TYPE',
                list: [
                  { code: 'AC', value: 'No' },
                  { code: 'SEATING', value: 'Seater' }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // ---------- HOTEL MOCK DATA ----------
  if (cat === 'HOTEL' || cat === 'STAY') {
    console.log('🏨 HOTEL/STAY category detected - returning mock HOTEL providers');

    return [
      {
        id: 'hotel_provider_1',
        descriptor: {
          name: 'The Grand Delhi',
          code: 'TGDEL',
          short_desc: '5-Star Luxury Hotel'
        },
        items: [
          {
            id: 'hotel_room_1',
            descriptor: {
              name: 'Deluxe King Room',
              code: 'DLX-KING',
              short_desc: 'City view • Breakfast included',
              long_desc:
                'Spacious deluxe king room with city view, free Wi-Fi and breakfast.'
            },
            price: {
              currency: 'INR',
              value: '6500'
            },
            time: {
              // treat as check-in time
              timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            tags: [
              {
                code: 'ROOM_DETAILS',
                list: [
                  { code: 'GUESTS', value: '2' },
                  { code: 'BEDS', value: '1 King Bed' }
                ]
              },
              {
                code: 'AMENITIES',
                list: [
                  { code: 'WIFI', value: 'Free Wi-Fi' },
                  { code: 'BREAKFAST', value: 'Included' },
                  { code: 'POOL', value: 'Access included' }
                ]
              }
            ]
          },
          {
            id: 'hotel_room_2',
            descriptor: {
              name: 'Standard Twin Room',
              code: 'STD-TWIN',
              short_desc: 'Twin beds • No breakfast',
              long_desc: 'Standard room with twin beds, suitable for friends or colleagues.'
            },
            price: {
              currency: 'INR',
              value: '4200'
            },
            time: {
              timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          }
        ]
      },
      {
        id: 'hotel_provider_2',
        descriptor: {
          name: 'Budget Inn Bangalore',
          code: 'BIBLR',
          short_desc: 'Budget hotel near city center'
        },
        items: [
          {
            id: 'hotel_room_3',
            descriptor: {
              name: 'Economy Room',
              code: 'ECO',
              short_desc: 'Compact room • Free Wi-Fi',
              long_desc: 'Clean and compact economy room ideal for budget travelers.'
            },
            price: {
              currency: 'INR',
              value: '1800'
            },
            time: {
              timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          }
        ]
      }
    ];
  }

  // ---------- DOMESTIC FLIGHT MOCK DATA ----------
  if (cat === 'FLIGHT_DOMESTIC' || cat === 'DOMESTIC') {
    console.log('✈️ DOMESTIC FLIGHT category detected - returning 5 domestic flights');

    return [
      {
        id: 'domestic_ai',
        descriptor: {
          name: 'Air India',
          code: 'AI',
          short_desc: 'Full-service carrier'
        },
        items: [
          {
            id: 'dom_ai_1',
            descriptor: {
              name: 'Delhi → Mumbai • AI-101',
              code: 'AI101',
              short_desc: 'Economy • Meal included',
              long_desc: 'Non-stop domestic flight from Delhi to Mumbai'
            },
            price: { currency: 'INR', value: '7200' },
            time: { timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'domestic_6e',
        descriptor: {
          name: 'IndiGo',
          code: '6E',
          short_desc: 'Low-cost carrier'
        },
        items: [
          {
            id: 'dom_6e_1',
            descriptor: {
              name: 'Bengaluru → Delhi • 6E-201',
              code: '6E201',
              short_desc: 'Economy • No free meal',
              long_desc: 'Non-stop domestic flight from Bengaluru to Delhi'
            },
            price: { currency: 'INR', value: '5400' },
            time: { timestamp: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'domestic_uk',
        descriptor: {
          name: 'Vistara',
          code: 'UK',
          short_desc: 'Premium domestic carrier'
        },
        items: [
          {
            id: 'dom_uk_1',
            descriptor: {
              name: 'Mumbai → Goa • UK-801',
              code: 'UK801',
              short_desc: 'Economy • Snack included',
              long_desc: 'Short domestic hop from Mumbai to Goa'
            },
            price: { currency: 'INR', value: '3800' },
            time: { timestamp: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'domestic_sg',
        descriptor: {
          name: 'SpiceJet',
          code: 'SG',
          short_desc: 'Low-cost carrier'
        },
        items: [
          {
            id: 'dom_sg_1',
            descriptor: {
              name: 'Chennai → Mumbai • SG-303',
              code: 'SG303',
              short_desc: 'Economy',
              long_desc: 'Domestic flight from Chennai to Mumbai'
            },
            price: { currency: 'INR', value: '4100' },
            time: { timestamp: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'domestic_g8',
        descriptor: {
          name: 'Go First',
          code: 'G8',
          short_desc: 'Domestic carrier'
        },
        items: [
          {
            id: 'dom_g8_1',
            descriptor: {
              name: 'Hyderabad → Bengaluru • G8-121',
              code: 'G8121',
              short_desc: 'Economy',
              long_desc: 'Short domestic flight from Hyderabad to Bengaluru'
            },
            price: { currency: 'INR', value: '3200' },
            time: { timestamp: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString() }
          }
        ]
      }
    ];
  }

  // ---------- INTERNATIONAL FLIGHT MOCK DATA ----------
  if (cat === 'FLIGHT_INTERNATIONAL' || cat === 'INTERNATIONAL') {
    console.log('🌍 INTERNATIONAL FLIGHT category detected - returning 5 international flights');

    return [
      {
        id: 'intl_ek',
        descriptor: {
          name: 'Emirates',
          code: 'EK',
          short_desc: 'Full-service international carrier'
        },
        items: [
          {
            id: 'intl_ek_1',
            descriptor: {
              name: 'Delhi → Dubai • EK-511',
              code: 'EK511',
              short_desc: 'Economy • Meal included',
              long_desc: 'International flight from Delhi to Dubai'
            },
            price: { currency: 'INR', value: '18500' },
            time: { timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'intl_qr',
        descriptor: {
          name: 'Qatar Airways',
          code: 'QR',
          short_desc: '5-Star international airline'
        },
        items: [
          {
            id: 'intl_qr_1',
            descriptor: {
              name: 'Mumbai → Doha • QR-557',
              code: 'QR557',
              short_desc: 'Economy • 1 stop',
              long_desc: 'International flight from Mumbai to Doha'
            },
            price: { currency: 'INR', value: '16200' },
            time: { timestamp: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'intl_sq',
        descriptor: {
          name: 'Singapore Airlines',
          code: 'SQ',
          short_desc: 'Premium international carrier'
        },
        items: [
          {
            id: 'intl_sq_1',
            descriptor: {
              name: 'Bengaluru → Singapore • SQ-511',
              code: 'SQ511',
              short_desc: 'Economy',
              long_desc: 'Direct international flight from Bengaluru to Singapore'
            },
            price: { currency: 'INR', value: '24500' },
            time: { timestamp: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'intl_lh',
        descriptor: {
          name: 'Lufthansa',
          code: 'LH',
          short_desc: 'European carrier'
        },
        items: [
          {
            id: 'intl_lh_1',
            descriptor: {
              name: 'Delhi → Frankfurt • LH-761',
              code: 'LH761',
              short_desc: 'Economy • Non-stop',
              long_desc: 'Long-haul flight from Delhi to Frankfurt'
            },
            price: { currency: 'INR', value: '48500' },
            time: { timestamp: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString() }
          }
        ]
      },
      {
        id: 'intl_ba',
        descriptor: {
          name: 'British Airways',
          code: 'BA',
          short_desc: 'UK flag carrier'
        },
        items: [
          {
            id: 'intl_ba_1',
            descriptor: {
              name: 'Mumbai → London • BA-198',
              code: 'BA198',
              short_desc: 'Economy • Meal included',
              long_desc: 'Non-stop international flight from Mumbai to London'
            },
            price: { currency: 'INR', value: '51500' },
            time: { timestamp: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString() }
          }
        ]
      }
    ];
  }

  // ---------- FLIGHT / DEFAULT MOCK DATA ----------
  console.log('✈️ MOBILITY/FLIGHT category detected - returning default mock FLIGHT providers');

  return [
    {
      id: 'provider_1',
      descriptor: {
        name: 'Air India',
        code: 'AI',
        short_desc: 'National Carrier'
      },
      items: [
        {
          id: 'flight_1',
          descriptor: {
            name: 'AI-101',
            code: 'AI101',
            short_desc: 'Delhi to Mumbai',
            long_desc: 'Flight from Delhi to Mumbai with meals included'
          },
          price: {
            currency: 'INR',
            value: '8500'
          },
          time: {
            timestamp: new Date(Date.now() + 3600000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [{ code: 'MODEL', value: 'Boeing 777' }]
            },
            {
              code: 'AMENITIES',
              list: [
                { code: 'MEALS', value: 'Complimentary meals' },
                { code: 'BAGGAGE', value: '20kg' },
                { code: 'WIFI', value: 'Available' }
              ]
            }
          ]
        },
        {
          id: 'flight_2',
          descriptor: {
            name: 'AI-102',
            code: 'AI102',
            short_desc: 'Delhi to Mumbai (Evening)',
            long_desc: 'Evening flight from Delhi to Mumbai'
          },
          price: {
            currency: 'INR',
            value: '7500'
          },
          time: {
            timestamp: new Date(Date.now() + 14400000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [{ code: 'MODEL', value: 'Airbus A320' }]
            }
          ]
        }
      ]
    },
    {
      id: 'provider_2',
      descriptor: {
        name: 'IndiGo',
        code: '6E',
        short_desc: 'Low Cost Carrier'
      },
      items: [
        {
          id: 'flight_3',
          descriptor: {
            name: '6E-201',
            code: '6E201',
            short_desc: 'Delhi to Mumbai',
            long_desc: 'Budget flight from Delhi to Mumbai'
          },
          price: {
            currency: 'INR',
            value: '5500'
          },
          time: {
            timestamp: new Date(Date.now() + 5400000).toISOString()
          },
          tags: [
            {
              code: 'AIRCRAFT_TYPE',
              list: [{ code: 'MODEL', value: 'Airbus A320neo' }]
            },
            {
              code: 'AMENITIES',
              list: [{ code: 'BAGGAGE', value: '15kg included' }]
            }
          ]
        }
      ]
    }
  ];
}

// Catch-all route for undefined endpoints 
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path} - Route not found`);
  res.status(404).json({
    error: {
      type: 'CORE-ERROR',
      code: '40001',
      message: `Route ${req.method} ${req.path} not found`,
      availableEndpoints: {
        GET: ['/health'],
        POST: ['/search', '/select', '/init', '/confirm', '/status']
      }
    }
  });
});

// Global error handler 
app.use((err, req, res, next) => {
  console.error(`❌ Error:`, err.message);
  res.status(500).json({
    error: {
      type: 'CORE-ERROR',
      code: '50000',
      message: err.message || 'Internal server error'
    }
  });
});

// Start server 
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Mock ONIX Adapter running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}`);

  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/search`);
  console.log(`   POST http://localhost:${PORT}/select`);
  console.log(`   POST http://localhost:${PORT}/init`);
  console.log(`   POST http://localhost:${PORT}/confirm`);
  console.log(`   POST http://localhost:${PORT}/status`);

  console.log(`\n⚠️  This is a MOCK adapter for development/testing`);
  console.log(`   For production, use real ONIX at http://localhost:8081\n`);
  console.log(`✓ Ready to handle search requests\n`);
});

module.exports = app;
