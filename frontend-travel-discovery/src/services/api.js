import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BAP_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Helper function to generate transaction and message IDs
const generateIds = () => ({
  transaction_id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  message_id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
});

// Helper function to map airport codes to GPS coordinates
const getGpsFromAirportCode = (code) => {
  const airportMap = {
    'DEL': '28.5665,77.1031', // Delhi
    'BOM': '19.0896,72.8656', // Mumbai
    'BLR': '12.9716,77.5946', // Bangalore
    'MAA': '12.9941,80.1709', // Chennai
    'CCU': '22.6548,88.4467', // Kolkata
    'HYD': '17.2403,78.4294', // Hyderabad
    'GOI': '15.3808,73.8389', // Goa
    'PNQ': '18.5822,73.9197', // Pune
    'JAI': '26.9124,75.7873', // Jaipur
    'AMD': '23.0726,72.6263', // Ahmedabad
  };
  return airportMap[code?.toUpperCase()] || "12.9716,77.5946"; // Default to Bangalore
};

// Helper function to map city names to GPS coordinates
const getCityGps = (cityCode) => {
  const cityMap = {
    'mumbai': '19.0760,72.8777',
    'delhi': '28.7041,77.1025', 
    'bangalore': '12.9716,77.5946',
    'chennai': '13.0827,80.2707',
    'kolkata': '22.5726,88.3639',
    'hyderabad': '17.3850,78.4867',
    'goa': '15.2993,74.1240',
    'pune': '18.5204,73.8567',
    'jaipur': '26.9124,75.7873',
    'ahmedabad': '23.0225,72.5714'
  };
  return cityMap[cityCode?.toLowerCase()] || "19.0760,72.8777"; // Default to Mumbai
};

// Create Beckn context
const createBecknContext = (action) => {
  const ids = generateIds();
  return {
    domain: "mobility",
    country: "IND",
    city: "std:080",
    action: action,
    core_version: "1.1.0",
    bap_id: "travel-discovery-bap.example.com", 
    bap_uri: API_BASE_URL,
    transaction_id: ids.transaction_id,
    message_id: ids.message_id,
    timestamp: new Date().toISOString(),
    ttl: "PT30S"
  };
};

// Main search function for travel options
export const searchTravelOptions = async (searchData) => {
  try {
    console.log('🔍 Searching with data:', searchData);
    
    // Validate search data
    if (!searchData.transportMode) {
      throw new Error('Transport mode is required for search');
    }

    // Create Beckn search request
    const becknRequest = {
      context: createBecknContext('search'),
      message: {
        intent: createSearchIntent(searchData)
      }
    };

    console.log('📤 Sending Beckn request:', becknRequest);

    // Call BAP's Beckn search endpoint
    const response = await api.post('/beckn/search', becknRequest);
    
    console.log('📥 Received Beckn response:', response.data);

    // Check if response has the expected structure
    if (!response.data) {
      throw new Error('Empty response from server');
    }

    // Extract items from Beckn catalog response
    const catalog = response.data?.message?.catalog;
    if (!catalog || !catalog.providers) {
      console.warn('⚠️ No providers found in catalog');
      return [];
    }

    // Transform Beckn items to frontend format
    const items = [];
    catalog.providers.forEach(provider => {
      if (provider.items) {
        provider.items.forEach(item => {
          items.push(transformBecknItem(item, provider, searchData.transportMode));
        });
      }
    });

    console.log('✅ Transformed items:', items);
    return items;

  } catch (error) {
    console.error('❌ API Error (searchTravelOptions):', error);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to travel service. Please ensure BAP is running on port 8080.');
    }

    // axios throws a generic "Network Error" (no response) for CORS failures,
    // DNS failures, or when the backend is not reachable. Surface a clearer
    // troubleshooting message for those cases.
    if (error.message === 'Network Error' || !error.response) {
      throw new Error('Unable to connect to travel service. Check that BAP is running on http://localhost:8080 and that CORS/networking allows requests from the frontend (http://localhost:3000).');
    }

    if (error.response?.status === 500) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          'Internal server error';
      throw new Error(`Server error: ${errorMessage}`);
    }

    if (error.response?.status === 400) {
      throw new Error(`Invalid request: ${error.response?.data?.error?.message || 'Bad request'}`);
    }

    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout. The service is taking too long to respond.');
    }

    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to search travel options');
  }
};

// Create intent based on search data
const createSearchIntent = (searchData) => {
  const intent = {
    category: {
      id: searchData.transportMode === 'flight' ? 'MOBILITY' : 'HOSPITALITY'
    }
  };

  if (searchData.transportMode === 'flight') {
    intent.fulfillment = {
      start: {
        location: {
          gps: getGpsFromAirportCode(searchData.origin)
        }
      },
      end: {
        location: {
          gps: getGpsFromAirportCode(searchData.destination)
        }
      },
      time: {
        range: {
          start: new Date(searchData.travelDate + 'T00:00:00').toISOString(),
          end: new Date(searchData.travelDate + 'T23:59:59').toISOString()
        }
      }
    };
  } else if (searchData.transportMode === 'hotel') {
    intent.fulfillment = {
      start: {
        location: {
          gps: getCityGps(searchData.cityCode)
        }
      },
      time: {
        range: {
          start: new Date(searchData.checkInDate + 'T14:00:00').toISOString(), // Check-in time
          end: new Date(searchData.checkOutDate + 'T11:00:00').toISOString()  // Check-out time
        }
      }
    };
  }

  return intent;
};

// Transform Beckn item to frontend format
const transformBecknItem = (item, provider, transportMode) => {
  const baseItem = {
    id: item.id,
    provider: provider.descriptor?.name || 'Provider',
    providerId: provider.id,
    price: parseFloat(item.price?.value || 0),
    currency: item.price?.currency || 'INR',
    travelMode: transportMode,
  };

  if (transportMode === 'flight') {
    return {
      ...baseItem,
      details: {
        airline: item.descriptor?.name,
        flightNumber: item.descriptor?.code,
        airlineCode: provider.descriptor?.code || provider.id,
        aircraft: getTagValue(item.tags, 'AIRCRAFT_TYPE', 'MODEL'),
        duration: '2h 30m', // Default - would be calculated from timings
        departureTime: item.time?.timestamp || new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), // Add 2.5 hours
        amenities: extractAmenities(item.tags),
        baggage: getTagValue(item.tags, 'AMENITIES', 'BAGGAGE') || '20kg',
        description: item.descriptor?.long_desc || item.descriptor?.short_desc,
      },
      timings: {
        departure: item.time?.timestamp || new Date().toISOString(),
        arrival: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString()
      }
    };
  } else if (transportMode === 'hotel') {
    return {
      ...baseItem,
      details: {
        name: item.descriptor?.name,
        hotelId: item.id,
        type: getTagValue(item.tags, 'ROOM_TYPE', 'TYPE') || 'Standard Room',
        size: getTagValue(item.tags, 'ROOM_TYPE', 'SIZE'),
        bedType: getTagValue(item.tags, 'ROOM_TYPE', 'BED'),
        amenities: extractAmenities(item.tags),
        policies: extractPolicies(item.tags),
        rating: 4.2, // Mock rating
        images: item.descriptor?.images || [],
        description: item.descriptor?.long_desc || item.descriptor?.short_desc
      },
      // For hotels, use the time field as check-in/check-out placeholders
      checkIn: item.time?.timestamp,
      checkOut: item.time?.timestamp
    };
  }

  return baseItem;
};

// Helper function to extract tag values
const getTagValue = (tags, tagCode, listCode) => {
  if (!tags) return null;
  const tag = tags.find(t => t.code === tagCode);
  if (!tag || !tag.list) return null;
  const listItem = tag.list.find(l => l.code === listCode);
  return listItem?.value;
};

// Extract amenities from tags
const extractAmenities = (tags) => {
  if (!tags) return [];
  const amenitiesTag = tags.find(t => t.code === 'AMENITIES');
  return amenitiesTag?.list?.map(item => ({
    name: item.code.toLowerCase().replace('_', ' '),
    value: item.value
  })) || [];
};

// Extract policies from tags  
const extractPolicies = (tags) => {
  if (!tags) return {};
  const policiesTag = tags.find(t => t.code === 'POLICIES');
  const policies = {};
  policiesTag?.list?.forEach(item => {
    policies[item.code.toLowerCase()] = item.value;
  });
  return policies;
};

// Legacy functions for backward compatibility
export const searchFlights = async (searchData) => {
  return searchTravelOptions({ ...searchData, transportMode: 'flight' });
};

export const searchHotels = async (searchData) => {
  return searchTravelOptions({ ...searchData, transportMode: 'hotel' });
};

export default api;
