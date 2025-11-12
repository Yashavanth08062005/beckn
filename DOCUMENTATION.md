# 📚 Beckn Travel Discovery - Complete Documentation

**Last Updated**: 2025-11-12  
**Status**: ✅ All Services Operational

---

## 📑 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Search Data Flow](#search-data-flow)
4. [API Endpoints](#api-endpoints)
5. [Project Structure](#project-structure)
6. [Setup & Installation](#setup--installation)
7. [Running Services](#running-services)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Development Guide](#development-guide)

---

## Quick Start

### Prerequisites
- Node.js 22+ (or 20.19+)
- npm 10+
- macOS/Linux

### Start All Services (Automatic)
```bash
cd /Users/sushant/Documents/hackthon\ Chikmangluru/beckn/beckn-travel-discovery
./START.sh
```

### Start Services Manually (3 Terminals)

**Terminal 1 - Mock ONIX (Port 9090)**
```bash
cd bap-travel-discovery
node mock-onix-adapter.js
```

**Terminal 2 - BAP Service (Port 8080)**
```bash
cd bap-travel-discovery
npm run dev
```

**Terminal 3 - Frontend (Port 3000)**
```bash
cd frontend-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **BAP API**: http://localhost:8080/health
- **Mock ONIX**: http://localhost:9090/health

---

## Architecture

### System Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │◄──►│   Travel BAP    │◄──►│  Flights BPP    │
│   (Port 3000)   │    │   (Port 8080)   │    │  (Port 7001)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                            ▼
                       ┌──────────────┐
                       │ Mock ONIX    │
                       │ (Port 9090)  │
                       └──────────────┘
                            ▼
                       ┌──────────────┐
                       │  Hotels BPP  │
                       │ (Port 7003)  │
                       └──────────────┘
```

### Components
- **Frontend**: React + Vite (Port 3000)
- **BAP**: Beckn Adapter Platform - aggregates searches (Port 8080)
- **Mock ONIX**: Development mock adapter (Port 9090)
- **Flights BPP**: Beckn Provider Platform for flights (Port 7001)
- **Hotels BPP**: Beckn Provider Platform for hotels (Port 7003)

---

## Search Data Flow

### Complete Journey

```
1. User enters search in frontend form
2. Form data → URL query parameters
3. SearchResults page extracts params
4. Calls API: POST /beckn/search
5. Frontend transforms to Beckn format
6. BAP receives at port 8080
7. BAP routes to Flights or Hotels BPP based on transportMode:
   - transportMode="flight" → MOBILITY category → Flights BPP
   - transportMode="hotel" → HOSPITALITY category → Hotels BPP
8. BPP returns mock data from hardcoded arrays:
   - Flights from: travel-discovery-bpp-flights/src/services/flightsService.js
   - Hotels from: travel-discovery-bpp-hotels/src/services/hotelsService.js
9. Data comes back to frontend
10. Frontend transforms and displays in TravelCard / HotelCard
```

### Data Sources

**Flight Mock Data**
- **Location**: `travel-discovery-bpp-flights/src/services/flightsService.js` (Lines 15-90)
- **Contains**: 3 flights (Air India Express, IndiGo, Vistara)
- **Prices**: ₹4,200 - ₹7,800

**Hotel Mock Data**
- **Location**: `travel-discovery-bpp-hotels/src/services/hotelsService.js` (Lines 15-130)
- **Contains**: 4 hotels (Taj Palace, ITC, Royal Plaza, Marriott)
- **Prices**: ₹4,200 - ₹15,000

**Alternative ONIX Mock**
- **Location**: `bap-travel-discovery/mock-onix-adapter.js` (Lines 131-280)
- **Contains**: Mixed flights + hotels
- **Fallback for**: Aggregated searches

### Search Parameters

| Field | Type | Example | Used For |
|-------|------|---------|----------|
| `origin` | string | `"DEL"` | Flight departure city code |
| `destination` | string | `"BOM"` | Flight arrival city code |
| `travelDate` | string | `"2025-11-20"` | Flight date |
| `transportMode` | string | `"flight"` or `"hotel"` | Search type selector |
| `passengers` | number | `1-6` | Number of passengers (flights) |
| `cityCode` | string | `"mumbai"` | Hotel city name |
| `checkInDate` | string | `"2025-11-20"` | Hotel check-in date |
| `checkOutDate` | string | `"2025-11-23"` | Hotel check-out date |
| `rooms` | number | `1-3` | Number of rooms (hotels) |

---

## API Endpoints

### Frontend → BAP Communication

**Endpoint**: `POST http://localhost:8080/beckn/search`

**Request Format** (Beckn Protocol):
```javascript
{
  context: {
    domain: "mobility",
    country: "IND",
    city: "std:080",
    action: "search",
    core_version: "1.1.0",
    bap_id: "travel-discovery-bap.example.com",
    bap_uri: "http://localhost:8080",
    transaction_id: "txn-xxx",
    message_id: "msg-xxx",
    timestamp: "2025-11-12T10:00:00Z",
    ttl: "PT30S"
  },
  message: {
    intent: {
      category: { id: "MOBILITY" }, // or "HOSPITALITY"
      fulfillment: {
        start: { location: { gps: "28.5665,77.1031" } },
        end: { location: { gps: "19.0896,72.8656" } },
        time: { 
          range: { 
            start: "2025-11-20T00:00:00Z",
            end: "2025-11-20T23:59:59Z"
          }
        }
      }
    }
  }
}
```

**Response Format**:
```javascript
{
  context: { ... },
  message: {
    catalog: {
      providers: [
        {
          id: "provider-001",
          descriptor: { name: "Airline Name" },
          items: [
            {
              id: "flight-001",
              descriptor: { name: "Flight Name", code: "AI-101" },
              price: { currency: "INR", value: "8500" },
              tags: [ ... ]
            }
          ]
        }
      ]
    }
  }
}
```

### Health Check Endpoints

```bash
# Mock ONIX Health
curl http://localhost:9090/health

# BAP Health
curl http://localhost:8080/health

# Flights BPP Health
curl http://localhost:7001/health

# Hotels BPP Health
curl http://localhost:7003/health
```

### Beckn Protocol Endpoints (BAP)

- `POST /beckn/search` - Search for flights/hotels
- `POST /beckn/select` - Select an option
- `POST /beckn/init` - Initialize booking
- `POST /beckn/confirm` - Confirm booking
- `POST /beckn/status` - Check booking status
- `GET /health` - Service health check

---

## Project Structure

```
beckn-travel-discovery/
├── bap-travel-discovery/
│   ├── src/
│   │   ├── app.js (Main BAP server, Port 8080)
│   │   ├── controllers/
│   │   │   └── becknController.js (Beckn request handlers)
│   │   ├── services/
│   │   │   └── becknService.js (Routing to BPPs, ONIX communication)
│   │   ├── routes/
│   │   │   └── becknRoutes.js (Route definitions)
│   │   └── config/
│   │       └── env.js (Environment configuration)
│   ├── mock-onix-adapter.js (Mock ONIX, Port 9090, generateMockProviders)
│   └── package.json
│
├── travel-discovery-bpp-flights/
│   ├── src/
│   │   ├── app.js (Flights BPP server, Port 7001)
│   │   ├── services/
│   │   │   └── flightsService.js (Mock flight data, Lines 15-90)
│   │   ├── controllers/
│   │   │   └── becknController.js (Search handler)
│   │   └── routes/
│   │       └── becknRoutes.js
│   └── package.json
│
├── travel-discovery-bpp-hotels/
│   ├── src/
│   │   ├── app.js (Hotels BPP server, Port 7003)
│   │   ├── services/
│   │   │   └── hotelsService.js (Mock hotel data, Lines 15-130)
│   │   ├── controllers/
│   │   │   └── becknController.js (Search handler)
│   │   └── routes/
│   │       └── becknRoutes.js
│   └── package.json
│
├── frontend-travel-discovery/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx (Search form)
│   │   │   └── SearchResults.jsx (Results display, URL param extraction)
│   │   ├── components/
│   │   │   ├── TravelCard.jsx (Flight card display)
│   │   │   ├── HotelCard.jsx (Hotel card display)
│   │   │   └── SearchForm.jsx (Form input)
│   │   ├── services/
│   │   │   └── api.js (Beckn transformation, API calls, transformBecknItem)
│   │   └── App.jsx (React router setup)
│   ├── vite.config.js (Dev server config, Port 3000)
│   ├── .env (VITE_BAP_URL=http://localhost:8080)
│   └── package.json
│
├── DOCUMENTATION.md (This file - consolidated documentation)
├── my.md (User's personal notes)
├── docker-compose.yml
├── START.sh (Start all services script)
└── package.json (Root package config)
```

---

## Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/WebMuseHub1/beckn-travel-discovery.git
cd beckn-travel-discovery
```

### 2. Install Dependencies

**BAP Service**
```bash
cd bap-travel-discovery
npm install
```

**Flights BPP**
```bash
cd travel-discovery-bpp-flights
npm install
```

**Hotels BPP**
```bash
cd travel-discovery-bpp-hotels
npm install
```

**Frontend**
```bash
cd frontend-travel-discovery
npm install
```

### 3. Environment Setup

**Frontend .env**
```bash
cd frontend-travel-discovery
echo "VITE_BAP_URL=http://localhost:8080" > .env
```

**BAP .env** (optional, defaults provided)
```bash
cd bap-travel-discovery
echo "PORT=8080" > .env
echo "ONIX_URL=http://localhost:9090" >> .env
echo "FLIGHTS_BPP_URL=http://localhost:7001" >> .env
echo "HOTELS_BPP_URL=http://localhost:7003" >> .env
```

---

## Running Services

### Option 1: Automatic Script
```bash
./START.sh
```

### Option 2: Manual (3 Terminals Recommended)

**Terminal 1 - Mock ONIX (Port 9090)**
```bash
cd /Users/sushant/Documents/hackthon\ Chikmangluru/beckn/beckn-travel-discovery/bap-travel-discovery
node mock-onix-adapter.js
```
Expected output:
```
🚀 Mock ONIX Adapter running on http://localhost:9090
✓ Ready to handle search requests
```

**Terminal 2 - BAP Service (Port 8080)**
```bash
cd /Users/sushant/Documents/hackthon\ Chikmangluru/beckn/beckn-travel-discovery/bap-travel-discovery
npm run dev
```
Expected output:
```
🚀 Beckn Travel Discovery BAP is running on http://localhost:8080
```

**Terminal 3 - Frontend (Port 3000)**
```bash
cd /Users/sushant/Documents/hackthon\ Chikmangluru/beckn/beckn-travel-discovery/frontend-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
npm run dev
```
Expected output:
```
VITE v7.2.2 ready in 95 ms
➜ Local: http://localhost:3000/
```

### Stop Services
```bash
# Kill by process name
pkill -f "mock-onix-adapter"
pkill -f "npm run dev"
pkill -f "npm start"

# Or manually: Ctrl+C in each terminal
```

---

## Testing

### Browser Test (Recommended)
1. Open http://localhost:3000
2. Fill search form:
   - **Flight**: Origin: "DEL", Destination: "BOM", Date: any date, Passengers: 1
   - **Hotel**: City: "Mumbai", Check-in: any date, Check-out: 3 days later, Rooms: 1
3. Click **Search**
4. Verify results display with:
   - Airline/Hotel names
   - Prices in ₹
   - Amenities and details

### Terminal Test

**Check Mock ONIX**
```bash
curl http://localhost:9090/health
```
Expected: `{"status":"OK","service":"Mock ONIX Adapter"...}`

**Check BAP**
```bash
curl http://localhost:8080/health
```
Expected: `{"status":"OK","message":"Beckn Travel Discovery BAP is running"...}`

**Full Search Request**
```bash
curl -X POST http://localhost:8080/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "mobility",
      "country": "IND",
      "action": "search",
      "core_version": "1.1.0",
      "bap_id": "travel-discovery-bap.example.com",
      "bap_uri": "http://localhost:8080",
      "transaction_id": "test-001",
      "message_id": "test-msg-001",
      "timestamp": "2025-11-12T10:00:00Z"
    },
    "message": {
      "intent": {
        "category": { "id": "MOBILITY" },
        "fulfillment": {
          "start": { "location": { "gps": "28.5665,77.1031" } },
          "end": { "location": { "gps": "19.0896,72.8656" } }
        }
      }
    }
  }'
```

### Available Mock Data

**Flights** (from flightsService.js):
1. Air India Express (IX-1234) - ₹5,500 - Boeing 737
2. IndiGo (6E-5678) - ₹4,200 - Airbus A320
3. Vistara (UK-9012) - ₹7,800 - Airbus A321

**Hotels** (from hotelsService.js):
1. The Taj Palace - ₹12,500 - Luxury 5-star
2. ITC Grand Central - ₹8,500 - Premium business
3. Hotel Royal Plaza - ₹4,200 - Budget-friendly
4. Marriott Executive Apartments - ₹15,000 - Extended stay

---

## Troubleshooting

### Issue: "Error Loading Results - Network Error"

**Cause**: BAP service not running or not reachable

**Solution**:
```bash
# Check if BAP is running
curl http://localhost:8080/health

# If not running, start it:
cd bap-travel-discovery
npm run dev

# Check if frontend has correct BAP URL
cat frontend-travel-discovery/.env
# Should show: VITE_BAP_URL=http://localhost:8080
```

### Issue: Port Already in Use

**Solution**:
```bash
# Find process using port
lsof -i :9090   # Mock ONIX
lsof -i :8080   # BAP
lsof -i :3000   # Frontend
lsof -i :7001   # Flights BPP
lsof -i :7003   # Hotels BPP

# Kill process
kill -9 <PID>

# Or change port in code and restart
```

### Issue: Node.js Version Error

**Solution**:
```bash
# Check current version
node --version

# Switch to Node 22 using nvm
source ~/.nvm/nvm.sh
nvm use 22

# Or install Node 22
nvm install 22
```

### Issue: No Search Results

**Possible Causes**:
1. Mock data not loaded → Check flightsService.js, hotelsService.js
2. BAP routing not working → Check becknService.js for BPP routing logic
3. Frontend transform failing → Check api.js transformBecknItem function
4. CORS issues → Confirm `app.use(cors())` in all services

**Debug**:
```bash
# Check browser console (F12) for error messages
# Check terminal output for request logs
# Add console.log statements in api.js, becknController.js

# Test direct BPP endpoints
curl http://localhost:7001/health  # Flights BPP
curl http://localhost:7003/health  # Hotels BPP
```

### Issue: Frontend Shows "Airline" or "Hotel" Instead of Names

**Cause**: Data not nested under `details` object

**Solution**:
- Check `api.js` function `transformBecknItem()` 
- Verify flight data returns: `option.details.airline`, `option.details.name`
- Verify hotel data returns: `option.details.name`
- Restart frontend: `npm run dev`

---

## Development Guide

### Adding New Mock Data

**To add a new flight:**
1. Edit `travel-discovery-bpp-flights/src/services/flightsService.js`
2. Modify the `flights` array (Lines 15-90)
3. Add new flight object with required fields:
   - `id`, `descriptor` (name, code), `price`, `tags`, `time`
4. Restart flights BPP: `npm run dev`

**To add a new hotel:**
1. Edit `travel-discovery-bpp-hotels/src/services/hotelsService.js`
2. Modify the `hotels` array (Lines 15-130)
3. Add new hotel object with required fields
4. Restart hotels BPP: `npm run dev`

### Modifying Frontend UI

**To change search form fields:**
1. Edit `frontend-travel-discovery/src/components/SearchForm.jsx`
2. Add input field, update state, pass in handleSubmit
3. Update `SearchResults.jsx` to extract new param

**To change card display:**
1. Edit `frontend-travel-discovery/src/components/TravelCard.jsx` (flights)
2. Edit `frontend-travel-discovery/src/components/HotelCard.jsx` (hotels)
3. Modify JSX to display new fields from `option.details`

### Adding Real API Integration

**To replace mock data with real API:**
1. Modify `flightsService.js` searchFlights() to call real API
2. Modify `hotelsService.js` searchHotels() to call real API
3. Map real API response to Beckn catalog format
4. Test end-to-end flow

### Debugging Tips

**Enable Request Logging**:
```javascript
// In becknService.js sendToBPP function
console.log('📨 Request to BPP:', url);
console.log('📋 Payload:', JSON.stringify(becknRequest, null, 2));

// In api.js searchTravelOptions
console.log('✅ Transformed items:', items);
```

**Check Network Requests**:
```bash
# In browser DevTools → Network tab
# Check /beckn/search request
# View request/response in JSON format
```

**Test Individual Services**:
```bash
# Test Flights BPP directly
curl http://localhost:7001/search -X POST ...

# Test Hotels BPP directly
curl http://localhost:7003/search -X POST ...

# Test BAP with different categories
# POST with category.id = "MOBILITY" → should call Flights BPP
# POST with category.id = "HOSPITALITY" → should call Hotels BPP
```

---

## Important Files Reference

| File | Purpose | Key Function |
|------|---------|--------------|
| `bap-travel-discovery/src/services/becknService.js` | Routes searches to correct BPP | `processSearch()`, `sendToBPP()` |
| `travel-discovery-bpp-flights/src/services/flightsService.js` | Mock flight data | `searchFlights()` - Lines 15-90 |
| `travel-discovery-bpp-hotels/src/services/hotelsService.js` | Mock hotel data | `searchHotels()` - Lines 15-130 |
| `frontend-travel-discovery/src/services/api.js` | Beckn transformation | `transformBecknItem()` |
| `frontend-travel-discovery/src/pages/SearchResults.jsx` | Results display & param extraction | `useSearchParams()` |
| `bap-travel-discovery/mock-onix-adapter.js` | ONIX mock (fallback) | `generateMockProviders()` - Lines 131-280 |

---

## Version Information

- **Node.js**: v22.21.1 (required: 20.19+)
- **npm**: 10.9.4 (required: 10+)
- **Vite**: 7.2.2
- **React**: 18.3+
- **Express**: 4.17.1
- **Beckn Protocol**: 1.1.0

---

## License

This project uses the open-source [Beckn-ONIX](https://github.com/Beckn-One/beckn-onix) framework.  
Licensed under MIT License.  
See [Beckn Protocol](https://developers.becknprotocol.io/) for more information.

---

## Support & Issues

**Common Issues**: See [Troubleshooting](#troubleshooting) section above

**For detailed logs**:
```bash
# View BAP logs
npm run dev > bap.log 2>&1 &

# View Frontend logs
npm run dev > frontend.log 2>&1 &

# Tail logs
tail -f bap.log
tail -f frontend.log
```

---

**Project Status**: ✅ **All Services Operational**  
**Last Tested**: 2025-11-12  
**Ready for**: Development, Testing, Demo
