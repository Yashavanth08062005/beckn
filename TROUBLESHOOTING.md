# Troubleshooting 500 Error Issues

## Problem Summary
The frontend is receiving a **500 Internal Server Error** when attempting to search for travel options.

## Root Causes Fixed

### 1. Logger Method Mismatch ✅
**Issue**: The logger module was exporting `logError()` but `becknService.js` was calling `logger.error()`
**Fix**: Updated logger to export the winston logger instance directly with proper methods

### 2. Error Details Not Propagating ✅
**Issue**: Error messages were being swallowed and replaced with generic "Internal server error"
**Fix**: Updated error handlers to properly log and pass error details to frontend

### 3. ONIX Connection Issues
**Issue**: Most likely the ONIX adapter is not running or not accessible at the configured URL
**Symptoms**: 
- `ECONNREFUSED` errors
- Connection timeout
- 404 errors

## Diagnostic Steps

### Step 1: Verify BAP Service is Running
```bash
# Check if BAP is running on port 8080
curl http://localhost:8080/health

# Expected response:
# {
#   "status": "OK",
#   "service": "Beckn Travel Discovery BAP",
#   "version": "1.0.0",
#   "timestamp": "2025-11-12T..."
# }
```

### Step 2: Verify ONIX Adapter is Running
```bash
# Check if ONIX adapter is running on port 5000
curl http://localhost:5000/health

# If ONIX is not running, you'll see "Connection refused"
```

### Step 3: Check Environment Variables
```bash
# Verify these are set correctly in .env:
echo "ONIX_URL=$ONIX_URL"
echo "BAP_ID=$BAP_ID"
echo "BAP_URI=$BAP_URI"
echo "PORT=$PORT"
```

### Step 4: Check Server Logs
```bash
# View BAP logs (if running locally)
tail -f combined.log
tail -f error.log

# Look for specific error messages about ONIX connection
```

## Common Issues & Solutions

### Issue 1: "Cannot connect to ONIX adapter"
**Cause**: ONIX service is not running
**Solution**:
1. Start ONIX adapter:
   ```bash
   cd beckn-onix
   docker-compose -f install/docker-compose.yml up
   # or
   ./install/setup.sh
   ```

### Issue 2: "ONIX endpoint not found (404)"
**Cause**: ONIX is running but the `/search` endpoint doesn't exist or has different routing
**Solution**:
1. Check ONIX service logs for the correct endpoint paths
2. Verify ONIX configuration in `beckn-onix/config/travel-discovery.yaml`

### Issue 3: "Request timeout"
**Cause**: ONIX is responding too slowly or not responding at all
**Solution**:
1. Check ONIX service health
2. Check network connectivity
3. Consider increasing timeout in `bap-travel-discovery/src/services/becknService.js` (currently 30s)

## Testing the Fix

### Using curl to test the BAP endpoint directly:
```bash
curl -X POST http://localhost:8080/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "mobility",
      "country": "IND",
      "city": "std:080",
      "action": "search",
      "core_version": "1.1.0",
      "bap_id": "travel-discovery-bap.example.com",
      "bap_uri": "http://localhost:8080",
      "transaction_id": "txn-123",
      "message_id": "msg-123",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "ttl": "PT30S"
    },
    "message": {
      "intent": {
        "fulfillment": {
          "start": {
            "location": {
              "gps": "28.5665,77.1031"
            }
          },
          "end": {
            "location": {
              "gps": "19.0760,72.8777"
            }
          },
          "time": {
            "range": {
              "start": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "end": "'$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%SZ)'"
            }
          }
        },
        "category": {
          "id": "MOBILITY"
        }
      }
    }
  }'
```

## Improved Error Messages

With these fixes, you should now see more informative error messages:

### Frontend Console:
- `Server error: Cannot connect to ONIX adapter at http://localhost:5000...`
- `Server error: ONIX endpoint not found: /search`
- `Request timeout. The service is taking too long to respond.`

### Backend Logs (error.log):
```
2025-11-12T10:30:45.123Z [error]: Error communicating with ONIX: {
  "message": "connect ECONNREFUSED 127.0.0.1:5000",
  "code": "ECONNREFUSED",
  "url": "http://localhost:5000/search"
}
```

## Quick Start to Fix

1. **Ensure all services are running:**
   ```bash
   # Terminal 1: Start ONIX
   cd beckn-onix/install
   docker-compose -f docker-compose.yml up
   
   # Terminal 2: Start BAP
   cd bap-travel-discovery
   npm install
   npm start
   
   # Terminal 3: Start Frontend
   cd frontend-travel-discovery
   npm install
   npm run dev
   ```

2. **Verify health check:**
   ```bash
   curl http://localhost:8080/health
   curl http://localhost:5000/health
   ```

3. **Try a search query** through the frontend

4. **Check logs for detailed errors:**
   ```bash
   tail -f bap-travel-discovery/combined.log
   ```

## Additional Resources

- [ONIX Setup Guide](beckn-onix/SETUP.md)
- [BAP Configuration](bap-travel-discovery/src/config/env.js)
- [Docker Setup](DOCKER_SETUP_GUIDE.md)
