# ✅ Mock ONIX Adapter - FIXED!

## What Was Wrong

The mock ONIX adapter endpoints were returning `Cannot GET /search` error because:
1. Middleware wasn't properly configured for JSON parsing
2. Request logging wasn't catching POST requests
3. No catch-all error handler for undefined routes
4. Missing global error handler for server errors

## What's Fixed

### ✅ Middleware Enhancements
```javascript
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

### ✅ Request Logging
All incoming requests are now logged:
```
📨 GET /health
📨 POST /search
   Body: {"context":{"domain":"nic2004:60212"...
✅ Search endpoint called
✅ Returning mock search response with 3 providers
```

### ✅ Error Handling
- Catch-all 404 handler for undefined routes
- Global error handler for server errors
- Helpful error messages showing available endpoints

### ✅ POST Endpoints Now Working
```
✅ POST /search   - Returns mock flights & hotels
✅ POST /select   - Processes item selection
✅ POST /init     - Initializes order
✅ POST /confirm  - Confirms booking
✅ POST /status   - Gets order status
```

## Testing the Endpoints

### 1. Check Health Status
```bash
curl http://localhost:9090/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "Mock ONIX Adapter",
  "version": "1.0.0 (MOCK)",
  "timestamp": "2025-11-12T06:44:35.061Z",
  "note": "This is a mock adapter for development..."
}
```

### 2. Search for Flights & Hotels
```bash
curl -X POST http://localhost:9090/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "nic2004:60212",
      "country": "IND",
      "city": "Delhi",
      "action": "search"
    },
    "message": {
      "intent": {
        "item": {
          "descriptor": {
            "name": "flights"
          }
        }
      }
    }
  }'
```

**Response:** Returns 3 providers (Air India, IndiGo, Taj Hotels) with complete mock data

### 3. Mock Data Returned
- **Air India flights**: ₹8500, ₹7500
- **IndiGo flights**: ₹5500
- **Taj Hotels**: ₹18,000/night

All with realistic amenities, baggage, aircraft types, and policies

## Architecture

```
Browser (Port 3000)
   ↓ POST /beckn/search
BAP Service (Port 8080)
   ↓ POST /search (with Beckn protocol)
Mock ONIX Adapter (Port 9090)
   ↓ Returns mock travel data
BAP transforms
   ↓
Frontend displays results
```

## Files Modified

✅ `/bap-travel-discovery/mock-onix-adapter.js`
- Enhanced middleware
- Added request logging
- Added error handlers
- Added catch-all 404 handler
- Added global error handler

## Current Status

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| /health | GET | ✅ Working | JSON with status |
| /search | POST | ✅ Working | 3 providers (flights + hotels) |
| /select | POST | ✅ Working | Order with selections |
| /init | POST | ✅ Working | Initialized order |
| /confirm | POST | ✅ Working | Confirmation ID |
| /status | POST | ✅ Working | Order status |

## Starting the Service

```bash
# Kill old process if any
pkill -f "mock-onix-adapter"

# Start the service
cd bap-travel-discovery
node mock-onix-adapter.js

# Or with nohup to keep running
nohup node mock-onix-adapter.js > mock-onix.log 2>&1 &
```

## Logs

Check the logs for debugging:
```bash
tail -f mock-onix.log
```

Output shows:
- All incoming requests with method and path
- Request body preview (first 100 chars for POST)
- Processing messages
- Response details

## Next Steps

1. ✅ Mock ONIX is running on port 9090
2. ✅ All endpoints are working
3. ✅ Mock data is being returned correctly
4. 🔄 Ensure BAP is running on port 8080
5. 🔄 Ensure Frontend is running on port 3000
6. 🔄 Test full end-to-end flow in browser

## Verification Command

```bash
# Test all endpoints quickly
echo "=== Health ===" && curl -s http://localhost:9090/health | head -1
echo "=== Search ===" && curl -s -X POST http://localhost:9090/search \
  -H "Content-Type: application/json" \
  -d '{"context":{"action":"search"},"message":{"intent":{}}}' | head -1
```

---

**Status**: ✅ **ALL ENDPOINTS FIXED AND WORKING**
