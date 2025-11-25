import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BAP_URL || 'http://localhost:8081';

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
  message_id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

// Helper function to map airport codes to GPS coordinates
const getGpsFromAirportCode = (code) => {
  const airportMap = {
    DEL: '28.5665,77.1031', // Delhi
    BOM: '19.0896,72.8656', // Mumbai
    BLR: '12.9716,77.5946', // Bangalore
    MAA: '12.9941,80.1709', // Chennai
    CCU: '22.6548,88.4467', // Kolkata
    HYD: '17.2403,78.4294', // Hyderabad
    GOI: '15.3808,73.8389', // Goa
    PNQ: '18.5822,73.9197', // Pune
    JAI: '26.9124,75.7873', // Jaipur
    AMD: '23.0726,72.6263', // Ahmedabad
  };
  return airportMap[code?.toUpperCase()] || '12.9716,77.5946'; // Default to Bangalore
};

// Helper function to map city names to GPS coordinates
const getCityGps = (cityCode) => {
  const cityMap = {
    mumbai: '19.0760,72.8777',
    delhi: '28.7041,77.1025',
    bangalore: '12.9716,77.5946',
    chennai: '13.0827,80.2707',
    kolkata: '22.5726,88.3639',
    hyderabad: '17.3850,78.4867',
    goa: '15.2993,74.1240',
    pune: '18.5204,73.8567',
    jaipur: '26.9124,75.7873',
    ahmedabad: '23.0225,72.5714',
  };
  return cityMap[cityCode?.toLowerCase()] || '19.0760,72.8777'; // Default to Mumbai
};

// Create Beckn context
const createBecknContext = (action) => {
  const ids = generateIds();
  return {
    domain: 'mobility',
    country: 'IND',
    city: 'std:080',
    action: action,
    core_version: '1.1.0',
    bap_id: 'travel-discovery-bap.example.com',
    bap_uri: API_BASE_URL,
    transaction_id: ids.transaction_id,
    message_id: ids.message_id,
    timestamp: new Date().toISOString(),
    ttl: 'PT30S',
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
        intent: createSearchIntent(searchData),
      },
    };

    console.log('📤 Sending Beckn request:', becknRequest);

    // Call BAP's Beckn search endpoint
    const response = await api.post('/beckn/search', becknRequest);

    console.log('📥 Received Beckn response:', response.data);

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
    catalog.providers.forEach((provider) => {
      if (provider.items) {
        provider.items.forEach((item) => {
          items.push(transformBecknItem(item, provider, searchData.transportMode));
        });
      }
    });

    console.log('✅ Transformed items:', items);
    return items;
  } catch (error) {
    console.error('❌ API Error (searchTravelOptions):', error);

    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        'Unable to connect to travel service. Please ensure BAP is running on port 8081.'
      );
    }

    if (error.message === 'Network Error' || !error.response) {
      throw new Error(
        'Unable to connect to travel service. Check that BAP is running on http://localhost:8081 and that CORS/networking allows requests from the frontend (http://localhost:3000)'
      );
    }

    if (error.response?.status === 500) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Internal server error';
      throw new Error(`Server error: ${errorMessage}`);
    }

    if (error.response?.status === 400) {
      throw new Error(
        `Invalid request: ${error.response?.data?.error?.message || 'Bad request'}`
      );
    }

    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout. The service is taking too long to respond.');
    }

    throw new Error(
      error.response?.data?.error?.message || error.message || 'Failed to search travel options'
    );
  }
};

// ---------------- createSearchIntent (UPDATED) ----------------
const createSearchIntent = (searchData) => {
  // Decide category id based on transportMode AND flightType
  let categoryId = 'MOBILITY';
  const mode = (searchData.transportMode || '').toLowerCase();

  if (mode === 'flight') {
    // flightType / tripType: 'domestic' | 'international' | 'intl' | 'dom'
    const flightType = (searchData.flightType || searchData.tripType || '').toLowerCase();

    if (flightType === 'international' || flightType === 'intl') {
      categoryId = 'FLIGHT_INTERNATIONAL';
    } else if (flightType === 'domestic' || flightType === 'dom') {
      categoryId = 'FLIGHT_DOMESTIC';
    } else {
      // fallback – old behaviour
      categoryId = 'FLIGHT';
    }
  } else if (mode === 'hotel') {
    categoryId = 'HOTEL';
  } else if (mode === 'bus') {
    categoryId = 'BUS';
  } else if (mode === 'train') {
    categoryId = 'TRAIN';
  }

  console.log('📦 Using category id for search:', categoryId);

  const intent = {
    category: {
      id: categoryId,
    },
  };

  // Helper to choose GPS mapping for origin/destination:
  // prefer airport codes for flights, otherwise city gps
  const mapToGps = (val) => {
    if (!val) return getCityGps(val);
    if (typeof val === 'string' && val.trim().length === 3) return getGpsFromAirportCode(val);
    return getCityGps(val);
  };

  if (mode === 'flight') {
    const travelDate = searchData.travelDate || new Date().toISOString().split('T')[0];
    intent.fulfillment = {
      start: {
        location: {
          gps: getGpsFromAirportCode(searchData.origin),
        },
      },
      end: {
        location: {
          gps: getGpsFromAirportCode(searchData.destination),
        },
      },
      time: {
        range: {
          start: new Date(travelDate + 'T00:00:00').toISOString(),
          end: new Date(travelDate + 'T23:59:59').toISOString(),
        },
      },
    };
  } else if (mode === 'hotel') {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const checkInDate = searchData.checkInDate || today.toISOString().split('T')[0];
    const checkOutDate = searchData.checkOutDate || dayAfter.toISOString().split('T')[0];

    intent.fulfillment = {
      start: {
        location: {
          gps: getCityGps(searchData.cityCode),
        },
      },
      time: {
        range: {
          start: new Date(checkInDate + 'T14:00:00').toISOString(), // Check-in time
          end: new Date(checkOutDate + 'T11:00:00').toISOString(), // Check-out time
        },
      },
    };
  } else if (mode === 'bus' || mode === 'train') {
    const travelDate = searchData.travelDate || new Date().toISOString().split('T')[0];
    intent.fulfillment = {
      start: {
        location: {
          gps: mapToGps(searchData.origin),
        },
      },
      end: {
        location: {
          gps: mapToGps(searchData.destination),
        },
      },
      time: {
        range: {
          start: new Date(travelDate + 'T00:00:00').toISOString(),
          end: new Date(travelDate + 'T23:59:59').toISOString(),
        },
      },
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
    // Determine whether this item is international.
    const providerId = (provider.id || '').toLowerCase();
    const itemId = (item.id || '').toLowerCase();
    const currency = (item.price?.currency || 'INR').toUpperCase();
    const isInternational =
      providerId.includes('intl') || itemId.includes('intl') || currency !== 'INR';

    const prefix = isInternational ? '02-' : '01-';
    const rawFlightCode = item.descriptor?.code || item.id || '';
    const flightNumberPrefixed = `${prefix}${rawFlightCode}`;

    return {
      ...baseItem,
      details: {
        airline: item.descriptor?.name || provider.descriptor?.name || 'Airline',
        flightNumber: flightNumberPrefixed,
        airlineCode: provider.descriptor?.code || provider.id,
        aircraft: getTagValue(item.tags, 'AIRCRAFT_TYPE', 'MODEL') || 'N/A',
        duration: getTagValue(item.tags, 'DURATION', 'VALUE') || '2h 30m',
        departureTime: item.time?.timestamp || new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
        amenities: extractAmenities(item.tags),
        baggage: getTagValue(item.tags, 'AMENITIES', 'BAGGAGE') || '20kg',
        description: item.descriptor?.long_desc || item.descriptor?.short_desc,
        originCity: item.descriptor?.short_desc || undefined,
        destinationCity: item.descriptor?.long_desc || undefined,
        numberOfBookableSeats: getTagValue(item.tags, 'SEATS', 'AVAILABLE') || undefined,
      },
      timings: {
        departure: item.time?.timestamp || new Date().toISOString(),
        arrival: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
      },
    };
  } else if (transportMode === 'hotel') {
    const roomType = getTagValue(item.tags, 'ROOM_TYPE', 'TYPE') || 'Standard Room';
    const bedType = getTagValue(item.tags, 'ROOM_TYPE', 'BED') || 'Double Bed';
    const roomSize = getTagValue(item.tags, 'ROOM_TYPE', 'SIZE') || '30 sqm';
    const amenitiesList = extractAmenitiesList(item.tags);
    const policies = extractPoliciesObject(item.tags);

    return {
      ...baseItem,
      details: {
        name: item.descriptor?.name || provider.descriptor?.name || 'Hotel',
        hotelId: item.id,
        roomType: roomType,
        bedType: bedType,
        beds: 1,
        adults: 2,
        rooms: 1,
        nights: 1,
        cityCode: 'Mumbai',
        cityName: 'Mumbai',
        street: provider.descriptor?.short_desc || 'Luxury Hotel',
        address: {
          street: provider.descriptor?.short_desc || 'Hotel Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '400001',
        },
        rating: 4.5,
        amenities: amenitiesList,
        checkInTime: '14:00',
        checkOutTime: '11:00',
        cancellationPolicy:
          policies.cancellation || 'Free till 48 hours before check-in',
        paymentPolicy: policies.payment || 'Pay at hotel',
        phone: '+91-XXXXXXXX00',
        email: 'info@hotel.com',
        roomDescription:
          item.descriptor?.long_desc ||
          item.descriptor?.short_desc ||
          'Comfortable and spacious room with modern amenities',
        images: item.descriptor?.images || [],
        description: item.descriptor?.long_desc || item.descriptor?.short_desc,
        chainCode: provider.descriptor?.code || 'CHAIN',
      },
      pricePerNight: parseFloat(item.price?.value || 0),
      checkIn: item.time?.timestamp || new Date().toISOString(),
      checkOut: item.time?.timestamp || new Date(Date.now() + 86400000).toISOString(),
    };
  } else if (transportMode === 'bus' || transportMode === 'train') {
    const isTrain = transportMode === 'train';

    // Extract amenities from AMENITIES tag
    const amenitiesTag = item.tags?.find((t) => t.code === 'AMENITIES');
    const amenitiesList = amenitiesTag?.list || [];

    // Extract journey info from JOURNEY_INFO tag
    const journeyTag = item.tags?.find((t) => t.code === 'JOURNEY_INFO');
    const journeyInfo = journeyTag?.list || [];

    const duration =
      journeyInfo.find((j) => j.code === 'DURATION')?.value || '12h';
    const stops =
      journeyInfo.find((j) => j.code === 'STOPS')?.value || '2 stops';

    const operatorName =
      item.descriptor?.name ||
      provider.descriptor?.name ||
      (isTrain ? 'Train Operator' : 'Bus Operator');

    const codeFallback = isTrain ? 'TRAIN-000' : 'BUS-000';

    return {
      ...baseItem,
      details: {
        // We reuse airline / flightNumber fields so existing TravelCard works
        airline: operatorName,
        flightNumber: item.descriptor?.code || item.id || codeFallback,
        airlineCode: provider.descriptor?.code || provider.id,
        duration: duration,
        departureTime: item.time?.timestamp || new Date().toISOString(),
        arrivalTime: calculateBusArrivalTime(item.time?.timestamp, duration),
        amenities: amenitiesList.map((a) => ({
          name: formatAmenityName(a.code),
          value: a.value,
        })),
        baggage: '20kg included',
        description: item.descriptor?.long_desc || item.descriptor?.short_desc,
        stops: stops,
        seatType:
          amenitiesList.find((a) => a.code === 'SEAT_TYPE')?.value ||
          (isTrain ? 'Sleeper Class' : 'Standard Seater'),
        busOperator: !isTrain ? operatorName : undefined,
        trainName: isTrain ? operatorName : undefined,
        trainNumber: isTrain ? (item.descriptor?.code || item.id || 'TR-000') : undefined,
        modeLabel: isTrain ? 'Train' : 'Bus',
      },
      timings: {
        departure: item.time?.timestamp || new Date().toISOString(),
        arrival: calculateBusArrivalTime(item.time?.timestamp, duration),
      },
    };
  }

  return baseItem;
};

// Helper function to extract tag values
const getTagValue = (tags, tagCode, listCode) => {
  if (!tags) return null;
  const tag = tags.find((t) => t.code === tagCode);
  if (!tag || !tag.list) return null;
  const listItem = tag.list.find((l) => l.code === listCode);
  return listItem?.value;
};

// Extract amenities list from tags
const extractAmenitiesList = (tags) => {
  if (!tags) return [];
  const amenitiesTag = tags.find((t) => t.code === 'AMENITIES');
  if (!amenitiesTag || !amenitiesTag.list) return [];

  return amenitiesTag.list.map((item) => {
    const name = item.code
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return name + (item.value ? ` (${item.value})` : '');
  });
};

// Extract policies object from tags
const extractPoliciesObject = (tags) => {
  if (!tags) return {};
  const policiesTag = tags.find((t) => t.code === 'POLICIES');
  const policies = {};

  policiesTag?.list?.forEach((item) => {
    const key = item.code.toLowerCase();
    policies[key] = item.value;
  });

  return policies;
};

// Extract amenities from tags
const extractAmenities = (tags) => {
  if (!tags) return [];
  const amenitiesTag = tags.find((t) => t.code === 'AMENITIES');
  return (
    amenitiesTag?.list?.map((item) => ({
      name: item.code.toLowerCase().replace('_', ' '),
      value: item.value,
    })) || []
  );
};

// Extract policies from tags
const extractPolicies = (tags) => {
  if (!tags) return {};
  const policiesTag = tags.find((t) => t.code === 'POLICIES');
  const policies = {};
  policiesTag?.list?.forEach((item) => {
    policies[item.code.toLowerCase()] = item.value;
  });
  return policies;
};

// Legacy convenience functions
export const searchFlights = async (searchData) => {
  return searchTravelOptions({ ...searchData, transportMode: 'flight' });
};

export const searchHotels = async (searchData) => {
  return searchTravelOptions({ ...searchData, transportMode: 'hotel' });
};

export const searchBuses = async (searchData) => {
  return searchTravelOptions({ ...searchData, transportMode: 'bus' });
};

export const searchTrains = async (searchData) => {
  return searchTravelOptions({ ...searchData, transportMode: 'train' });
};

// Helper function to calculate bus/train arrival time based on duration string
const calculateBusArrivalTime = (departureTime, durationStr) => {
  if (!departureTime)
    return new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

  const match = durationStr?.match(/(\d+)\s*hours?/i);
  const hours = match ? parseInt(match[1]) : 12;

  const departure = new Date(departureTime);
  const arrival = new Date(departure.getTime() + hours * 60 * 60 * 1000);
  return arrival.toISOString();
};

// Helper function to format amenity names
const formatAmenityName = (code) => {
  return code
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default api;
