# 📊 Search Data Flow - Complete Journey

## 🎯 Where Search Data Comes FROM:

### **SOURCE 1: User Input (SearchForm.jsx)**
📄 Location: `frontend-travel-discovery/src/components/SearchForm.jsx`

User fills in the search form with:
```
✈️  FLIGHT MODE:
  - From (origin) → Departure city code (DEL, BOM, BLR, etc.)
  - To (destination) → Arrival city code
  - Date → Travel date
  - Passengers → Number of passengers (1-6)

🏨 HOTEL MODE:
  - City → City code
  - Check-in → Hotel check-in date
  - Check-out → Hotel check-out date
  - Rooms → Number of rooms
  - Guests → Number of guests
```

**Example Flight Search Data:**
```javascript
{
  origin: "DEL",           // Departure city
  destination: "BOM",      // Arrival city
  travelDate: "2025-11-20", // Travel date
  transportMode: "flight",  // Flight or hotel
  passengers: 2,           // Number of passengers
  cityCode: "",            // Empty for flights
  checkInDate: "",         // Empty for flights
  checkOutDate: "",        // Empty for flights
  rooms: 1                 // Empty for flights
}
```

**Example Hotel Search Data:**
```javascript
{
  cityCode: "mumbai",          // City name
  checkInDate: "2025-11-20",   // Hotel check-in
  checkOutDate: "2025-11-23",  // Hotel check-out
  transportMode: "hotel",      // Hotel mode
  passengers: 3,               // Number of guests
  rooms: 2,                    // Number of rooms
  origin: "",                  // Empty for hotels
  destination: "",             // Empty for hotels
  travelDate: ""               // Empty for hotels
}
```

---

## 🔄 Data Flow Journey:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1️⃣  USER ENTERS SEARCH FORM                              │
│  📄 SearchForm.jsx (Line 9-18)                             │
│                                                             │
│  User fills:                                               │
│  - Origin/Destination (flights) or City (hotels)           │
│  - Date(s)                                                 │
│  - Passengers/Rooms                                        │
│  - Transport Mode (flight/hotel)                           │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  2️⃣  HANDLESUBMIT TRIGGERED (Line 41-43)                  │
│  📄 SearchForm.jsx                                         │
│                                                             │
│  Creates URL Query Parameters:                            │
│  /search?origin=DEL&destination=BOM&travelDate=2025-...   │
│           &transportMode=flight&passengers=2               │
│                                                             │
│  Navigates to: /search page                               │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  3️⃣  SEARCH RESULTS PAGE LOADS                             │
│  📄 SearchResults.jsx (Line 39-46)                        │
│                                                             │
│  useSearchParams() extracts URL params:                    │
│  {                                                         │
│    origin: "DEL",                                          │
│    destination: "BOM",                                     │
│    travelDate: "2025-11-20",                               │
│    transportMode: "flight",                                │
│    passengers: "2"                                         │
│  }                                                         │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  4️⃣  CALL API FUNCTION                                     │
│  📄 SearchResults.jsx (Line 38-41)                        │
│                                                             │
│  searchTravelOptions(searchData)                          │
│                                                             │
│  Passes searchData to API service                         │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  5️⃣  API SERVICE PROCESSES DATA                            │
│  📄 services/api.js (Line 72-92)                           │
│  📍 http://localhost:3000 (Frontend)                       │
│                                                             │
│  searchTravelOptions() {                                   │
│    ✓ Validates transport mode                             │
│    ✓ Creates Beckn context                                │
│    ✓ Builds Beckn search request:                         │
│      {                                                     │
│        context: { ... },                                  │
│        message: {                                         │
│          intent: createSearchIntent(searchData)           │
│        }                                                  │
│      }                                                     │
│    ✓ Sends POST to /beckn/search                          │
│  }                                                         │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  6️⃣  REQUEST SENT TO BAP SERVICE                           │
│  📍 http://localhost:8080/beckn/search                     │
│  📄 bap-travel-discovery/src/routes/becknRoutes.js         │
│                                                             │
│  BAP Service:                                              │
│  POST /beckn/search                                        │
│  Receives searchData in Beckn format                       │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  7️⃣  BAP PROCESSES & CALLS ONIX/BPP                        │
│  📄 bap-travel-discovery/src/controllers/becknController.js│
│  📍 http://localhost:9090 (Mock ONIX)                      │
│                                                             │
│  BAP forwards searchData to:                              │
│  Option A: Mock ONIX Adapter (port 9090)                  │
│  Option B: Individual BPP services                        │
│           - Flights BPP (searchFlights)                   │
│           - Hotels BPP (searchHotels)                     │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ┌─────────┐  ┌──────────────────┐
    │ Option  │  │ Option B: Direct │
    │ A:ONIX  │  │ BPP Services     │
    │         │  │                  │
    │ Mock    │  │ Flights Service: │
    │ ONIX    │  │ flightsService   │
    │ (9090)  │  │ .searchFlights() │
    │         │  │                  │
    │ Returns │  │ Hotels Service:  │
    │ mixed   │  │ hotelsService    │
    │ results │  │ .searchHotels()  │
    └────┬────┘  └────┬─────────────┘
         │             │
         └─────┬───────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  8️⃣  MOCK DATA RETURNED                                    │
│  📄 Flight Data Source:                                    │
│     travel-discovery-bpp-flights/src/services/flightsService.js
│                                                             │
│  📄 Hotel Data Source:                                     │
│     travel-discovery-bpp-hotels/src/services/hotelsService.js
│                                                             │
│  Returns Beckn Catalog:                                    │
│  {                                                         │
│    message: {                                              │
│      catalog: {                                            │
│        providers: [                                        │
│          {                                                 │
│            id: "provider-001",                             │
│            items: [flight/hotel objects]                   │
│          }                                                 │
│        ]                                                   │
│      }                                                     │
│    }                                                       │
│  }                                                         │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  9️⃣  RESPONSE BACK TO FRONTEND                             │
│  📄 SearchResults.jsx (Line 95-105)                       │
│  📍 http://localhost:3000                                  │
│                                                             │
│  Frontend receives catalog                                │
│  Transforms items to display format                       │
│  Sets results state                                       │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔟 RESULTS DISPLAYED                                      │
│  📄 TravelCard.jsx (for flights)                           │
│  📄 HotelCard.jsx (for hotels)                             │
│                                                             │
│  User sees:                                                │
│  - Airline names, prices, timings                          │
│  - Hotel names, room types, amenities                      │
│  - Filter options (price, departure time, etc.)           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 Search Data Locations - File References

### **1. Frontend - User Input**
- **File**: `frontend-travel-discovery/src/components/SearchForm.jsx`
- **Lines**: 9-18 (state initialization), 41-43 (handleSubmit)
- **What**: Collects user input from form fields

### **2. Frontend - URL Query Params**
- **File**: `frontend-travel-discovery/src/pages/SearchResults.jsx`
- **Lines**: 10, 26-36 (useSearchParams, extracting params)
- **What**: Extracts search criteria from URL

### **3. Frontend - API Call**
- **File**: `frontend-travel-discovery/src/services/api.js`
- **Lines**: 72-92 (searchTravelOptions function)
- **What**: Transforms data to Beckn format and sends to BAP

### **4. Backend - BAP Receives Request**
- **File**: `bap-travel-discovery/src/controllers/becknController.js`
- **What**: Receives searchData and forwards to ONIX/BPP

### **5. Mock ONIX - Returns Data**
- **File**: `bap-travel-discovery/mock-onix-adapter.js`
- **Lines**: 42-78 (generateMockProviders function)
- **What**: Mock search endpoint returns hardcoded flight/hotel data

### **6. BPP Services - Mock Data**
- **Flights**: `travel-discovery-bpp-flights/src/services/flightsService.js` (Lines 15-90)
- **Hotels**: `travel-discovery-bpp-hotels/src/services/hotelsService.js` (Lines 15-130)
- **What**: Returns mock flight/hotel catalog based on search params

---

## 🔑 Key Data Fields in Search

| Field | Used For | Example |
|-------|----------|---------|
| `origin` | Flight departure city | `"DEL"`, `"BOM"` |
| `destination` | Flight arrival city | `"BOM"`, `"BLR"` |
| `travelDate` | Flight date | `"2025-11-20"` |
| `cityCode` | Hotel location | `"mumbai"`, `"delhi"` |
| `checkInDate` | Hotel check-in | `"2025-11-20"` |
| `checkOutDate` | Hotel check-out | `"2025-11-23"` |
| `transportMode` | Search type | `"flight"` or `"hotel"` |
| `passengers` | Flight passengers / Hotel guests | `1`, `2`, `3` |
| `rooms` | Hotel rooms | `1`, `2`, `3` |

---

## 💾 Where Mock Data is Stored

### **Option 1: ONIX Adapter Mock (Centralized)**
📄 `bap-travel-discovery/mock-onix-adapter.js`
- Function: `generateMockProviders()` (Line 131-280)
- Returns: Array of providers with flights & hotels mixed
- **Best for**: Testing entire Beckn flow

### **Option 2: Individual BPP Services**
📄 Flights: `travel-discovery-bpp-flights/src/services/flightsService.js`
- Method: `searchFlights()` (Line 15-90)
- Returns: Flight catalog only

📄 Hotels: `travel-discovery-bpp-hotels/src/services/hotelsService.js`
- Method: `searchHotels()` (Line 15-130)
- Returns: Hotel catalog only

**Best for**: Testing individual services independently

---

## 🎬 How to Trace a Search Request

1. **Step 1**: User enters search in `SearchForm.jsx` and clicks "Search"
2. **Step 2**: URL updates with query params: `/search?origin=DEL&destination=BOM...`
3. **Step 3**: `SearchResults.jsx` loads and extracts params via `useSearchParams()`
4. **Step 4**: Calls `searchTravelOptions(searchData)` from `services/api.js`
5. **Step 5**: API sends POST to `http://localhost:8080/beckn/search`
6. **Step 6**: BAP routes to controller, which calls ONIX or BPP
7. **Step 7**: Mock data is returned from:
   - `mock-onix-adapter.js` OR
   - `flightsService.js` + `hotelsService.js`
8. **Step 8**: Response comes back to frontend
9. **Step 9**: Results are transformed and displayed in cards

---

## 🛠️ To Modify Search Data or Mock Responses

### **Add new search field:**
1. Edit `SearchForm.jsx` - add input field
2. Edit `SearchResults.jsx` - extract from URL params
3. Edit `api.js` - pass to API request
4. Edit mock data files - use the new field if needed

### **Change mock flight data:**
Edit `travel-discovery-bpp-flights/src/services/flightsService.js` lines 15-90
or `mock-onix-adapter.js` lines 140-190

### **Change mock hotel data:**
Edit `travel-discovery-bpp-hotels/src/services/hotelsService.js` lines 15-130
or `mock-onix-adapter.js` lines 200-280

---

## 📞 Search Data Endpoints

```bash
# Check where search goes:
Frontend (http://localhost:3000)
  ↓ POST /beckn/search
BAP (http://localhost:8080/beckn/search)
  ↓ Calls ONIX or BPP
ONIX Adapter (http://localhost:9090/search)
  or
Flights BPP (Port varies)
  or
Hotels BPP (Port varies)
  ↓ Returns mock data
Back to Frontend (http://localhost:3000)
  → Display results
```
