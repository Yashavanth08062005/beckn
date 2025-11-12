# 🔄 Data Flow: Frontend → BAP → Mock ONIX

## 📋 How the System Works

When you search on the frontend, here's what happens:

```
┌─────────────────────────────────────────────────────────┐
│  User enters search in browser (http://localhost:3000)  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │  Frontend (React + Vite)    │
         │  - Validates input          │
         │  - Creates Beckn request    │
         │  - Calls /beckn/search API  │
         └──────────────┬──────────────┘
                        │
              API call to /beckn/search
              (via Vite proxy on port 3000)
                        │
                        ▼
         ┌─────────────────────────────┐
         │  BAP Service (Port 8080)    │
         │  - Receives search request  │
         │  - Validates Beckn protocol │
         │  - Calls Mock ONIX          │
         └──────────────┬──────────────┘
                        │
            HTTP POST to http://localhost:9090/search
                        │
                        ▼
         ┌─────────────────────────────┐
         │  Mock ONIX (Port 9090)      │
         │  - Returns mock data        │
         │  - Air India flights        │
         │  - IndiGo flights           │
         │  - Taj Hotels               │
         │  - Mock pricing & details   │
         └──────────────┬──────────────┘
                        │
          Returns mock search results
                        │
                        ▼
         ┌─────────────────────────────┐
         │  BAP Service (Port 8080)    │
         │  - Processes response       │
         │  - Transforms data          │
         │  - Sends to frontend        │
         └──────────────┬──────────────┘
                        │
        Returns JSON response to frontend
                        │
                        ▼
         ┌─────────────────────────────┐
         │  Frontend (React)           │
         │  - Receives results         │
         │  - Displays flight cards    │
         │  - Shows hotel options      │
         │  - Enables filtering        │
         └─────────────────────────────┘
                        │
                        ▼
              Browser displays results
```

---

## 🎯 Answer to Your Question

### Q: "Is it using mock data or fetching from API?"

**Answer: Both!**

✅ **It IS fetching from API** (your code makes HTTP requests)  
✅ **It IS using mock data** (the API returns mock data)

Here's how:

### 1. Frontend Makes Real API Calls ✅
```javascript
// frontend-travel-discovery/src/services/api.js
const response = await api.post('/beckn/search', becknRequest);
// This makes a REAL HTTP POST request to http://localhost:8080/beckn/search
```

### 2. BAP Makes Real API Calls to ONIX ✅
```javascript
// bap-travel-discovery/src/services/becknService.js
const onixResponse = await axios.post(url, becknRequest, {
    // This makes a REAL HTTP POST request to http://localhost:9090/search
});
```

### 3. Mock ONIX Returns Mock Data ✅
```javascript
// bap-travel-discovery/mock-onix-adapter.js
// Returns realistic but fake data:
{
  catalog: {
    providers: [
      { name: "Air India", items: [...] },
      { name: "IndiGo", items: [...] },
      { name: "Taj Hotels", items: [...] }
    ]
  }
}
```

---

## 📡 Network Requests

When you search, here are the actual HTTP requests:

### Request 1: Frontend → BAP
```
POST http://localhost:3000/beckn/search
Headers: Content-Type: application/json
Body: {
  context: { ... },
  message: { intent: { ... } }
}
```

### Request 2: BAP → Mock ONIX
```
POST http://localhost:9090/search
Headers: Content-Type: application/json, Authorization: Bearer ...
Body: {
  context: { ... },
  message: { intent: { ... } }
}
```

### Response: Mock ONIX → BAP
```
200 OK
Body: {
  context: { ... },
  message: {
    catalog: {
      providers: [
        Air India flights,
        IndiGo flights,
        Taj Hotels
      ]
    }
  }
}
```

### Response: BAP → Frontend
```
200 OK
Body: Same as above
```

### Display: Frontend shows results in browser

---

## 🔍 How to Verify It's Working

### 1. Watch Network Requests
Open browser DevTools (F12) → Network tab → Do a search
You'll see:
- `POST /beckn/search` → 200 ✅

### 2. Check Backend Logs
```bash
tail -f bap-travel-discovery/combined.log
```

You'll see:
```
info: Received Beckn search request
info: Processing Beckn search request
info: Sending request to ONIX: http://localhost:9090/search
info: Received response from ONIX: 200
```

### 3. Test Direct API Call
```bash
curl -X POST http://localhost:8080/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {"action": "search", ...},
    "message": {"intent": {...}}
  }' | jq .
```

You'll get mock data back!

---

## 🎭 What's Mock vs Real

### Mock Data (Fake but Realistic)
```javascript
// Returns hardcoded mock data:
{
  "id": "flight_1",
  "descriptor": { "name": "AI-101" },
  "price": { "value": "8500", "currency": "INR" }
}
```

### Real API Calls (Actually Happening)
```javascript
// Actual HTTP requests:
fetch('http://localhost:8080/beckn/search', {...})
// This is REAL - it actually contacts the server
```

### Real Protocol (Beckn Standard)
```javascript
// Follows Beckn protocol structure:
{
  context: { action, domain, transaction_id, ... },
  message: { intent: { ... } }
}
```

---

## 🔄 Data Flow in Code

### Step 1: Frontend (React)
```javascript
// User clicks search in browser
const response = await searchTravelOptions(searchData);
// Makes actual HTTP call to /beckn/search
```

### Step 2: BAP receives request
```javascript
// Express route handler receives POST request
app.post('/beckn/search', async (req, res) => {
  // Logs the request
  // Transforms it to Beckn format
  // Sends to ONIX
});
```

### Step 3: BAP calls Mock ONIX
```javascript
// Makes actual HTTP POST to mock adapter
const onixResponse = await axios.post(
  'http://localhost:9090/search',
  becknRequest
);
```

### Step 4: Mock ONIX returns data
```javascript
// Express route handler returns mock data
app.post('/search', (req, res) => {
  res.json({
    context: {...},
    message: {
      catalog: {
        providers: [
          // Hardcoded mock flight and hotel data
        ]
      }
    }
  });
});
```

### Step 5: BAP returns to frontend
```javascript
// Sends mock data back to frontend
res.status(200).json(onixResponse.data);
```

### Step 6: Frontend displays results
```javascript
// React component receives mock data
setResults(data);
// Re-renders to show flights and hotels
```

---

## ✨ In Summary

| Component | Type | Details |
|-----------|------|---------|
| Frontend Code | Real | React app running on port 3000 |
| API Calls | Real | Actual HTTP POST requests |
| BAP Service | Real | Express server on port 8080 |
| BAP Logic | Real | Processes Beckn protocol |
| ONIX Service | Mock | Returns fake but realistic data |
| Travel Data | Mock | Hardcoded flight/hotel options |

---

## 🎯 Production vs Development

### Development (Current Setup)
```
Frontend → BAP → Mock ONIX → Fake Data
```
- Mock ONIX on port 9090
- Returns hardcoded data
- Perfect for testing UI

### Production (Future)
```
Frontend → BAP → Real ONIX → Real Travel Providers
```
- Real ONIX on port 8081
- Connects to real airlines, hotels
- Actual search results

---

## 🧪 To See This In Action

1. **Start all services** (done ✅)
2. **Open browser**: http://localhost:3000
3. **Do a search**: Delhi → Mumbai
4. **Open DevTools** (F12): Network tab
5. **See the request**: `POST /beckn/search`
6. **Check logs**: `tail -f bap-travel-discovery/combined.log`
7. **Verify response**: Mock data returned ✅

---

## 🔐 Key Points

- ✅ **Real HTTP calls** are happening (not just frontend simulation)
- ✅ **Real Beckn protocol** structure is being used
- ✅ **Real servers** processing requests (BAP + Mock ONIX)
- ✅ **Mock data** returned (not connected to real providers yet)
- ✅ **Works exactly like production** (except data source)

---

**Status**: Using Mock Data via Real APIs ✅  
**Ready for Testing**: Yes ✅  
**Can Switch to Real ONIX**: Yes (just change ONIX_URL) ✅
