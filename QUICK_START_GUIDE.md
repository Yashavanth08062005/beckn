# 🚀 QUICK START - ALL SERVICES RUNNING!

## ✅ Current Status

```
🟢 Mock ONIX (Port 9090)  ✅ RUNNING
🟢 BAP Service (Port 8080) ✅ RUNNING  
🟢 Frontend (Port 3000)    ✅ RUNNING
```

---

## 🎯 Test Right Now!

### Option 1: Browser Test (Recommended)
1. Open: **http://localhost:3000**
2. Fill Search Form:
   - **From**: Delhi
   - **To**: Mumbai
   - **Date**: 2025-12-20
   - **Passengers**: 1
3. Click **Search**
4. See Results:
   - ✈️ Air India (₹8500, ₹7500)
   - ✈️ IndiGo (₹5500)
   - 🏨 Taj Hotels (₹18,000)

### Option 2: Terminal Test
```bash
# Test Mock ONIX directly
curl http://localhost:9090/health

# Test BAP
curl http://localhost:8080/health

# Test full search flow
curl -X POST http://localhost:8080/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "nic2004:60212",
      "country": "IND",
      "action": "search",
      "version": "1.1.0"
    },
    "message": {
      "intent": {
        "item": {"descriptor": {"name": "flights"}}
      }
    }
  }'
```

---

## 📊 Data Flow

```
You → Browser (3000) → BAP (8080) → Mock ONIX (9090)
↓
See Results: Air India ₹8500, IndiGo ₹5500, Taj ₹18k
```

**Real HTTP calls + Real Beckn protocol + Mock data = Perfect for testing**

---

## 🎨 Frontend Features

### Search
- Origin/Destination input
- Travel date picker
- Passenger count

### Results
- Flight cards with prices & amenities
- Hotel cards with room details & policies
- Provider logos and descriptions

### Filters
- Price range slider
- Sort by price (low to high)
- Sort by duration

### Error Handling
- Network errors shown clearly
- Timeout detection
- Troubleshooting tips

---

## 📋 API Endpoints

### Mock ONIX (9090)
```
GET  /health              → Service status
POST /search              → Get flights/hotels
POST /select              → Select item
POST /init                → Initialize booking
POST /confirm             → Confirm reservation
POST /status              → Check booking status
```

### BAP Service (8080)
```
GET  /health              → Service status
POST /beckn/search        → Beckn protocol search
POST /beckn/select        → Beckn protocol select
POST /beckn/init          → Beckn protocol init
POST /beckn/confirm       → Beckn protocol confirm
POST /beckn/status        → Beckn protocol status
```

### Frontend (3000)
```
GET  /                    → React application
POST /api/search          → Proxied to BAP /beckn/search
```

---

## 🔍 Verify Working

### Mock ONIX
```bash
curl http://localhost:9090/health
```
Should return: `{"status":"OK","service":"Mock ONIX Adapter"...}`

### BAP Service  
```bash
curl http://localhost:8080/health
```
Should return: `{"status":"OK","message":"Beckn Travel Discovery BAP is running"...}`

### Frontend
```bash
curl http://localhost:3000 | grep "<html"
```
Should return HTML content

---

## 📊 Mock Data

### Air India
- **AI-101**: ₹8,500 | Boeing 777 | Meals, 20kg baggage, WiFi
- **AI-102**: ₹7,500 | Airbus A320 | Evening flight

### IndiGo
- **6E-201**: ₹5,500 | Airbus A320neo | 15kg baggage

### Taj Hotels
- **Taj Gateway Mumbai**: ₹18,000/night | Deluxe room | Wifi, AC, Gym

---

## 🛑 Stop Services

```bash
# Stop all services
pkill -f "mock-onix-adapter"
pkill -f "npm start"
pkill -f "npm run dev"
```

---

## 🔄 Restart Services

```bash
# Mock ONIX
cd /path/to/bap-travel-discovery
nohup node mock-onix-adapter.js > mock-onix.log 2>&1 &

# BAP
npm start 2>&1 &

# Frontend (in separate terminal)
cd /path/to/frontend-travel-discovery
npm run dev
```

---

## 🎓 System Architecture

```
┌─────────────────┐
│  Browser User   │
│  http://3000    │
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────────────┐
│   Frontend (Vite React) │
│   - Search form         │
│   - Results display     │
│   - Price filter        │
└────────┬────────────────┘
         │ /beckn/search
         ↓
┌──────────────────────────┐
│  BAP Service             │
│  http://8080             │
│  - Beckn protocol        │
│  - Request transformation│
│  - ONIX communication    │
└────────┬─────────────────┘
         │ POST /search
         ↓
┌──────────────────────────┐
│  Mock ONIX Adapter       │
│  http://9090 (Port 9090) │
│  - Returns flight data   │
│  - Returns hotel data    │
│  - Mock but realistic    │
└──────────────────────────┘
```

---

## 📱 Browser Testing Checklist

- [ ] Open http://localhost:3000
- [ ] Search form visible
- [ ] Can enter origin: "Delhi"
- [ ] Can enter destination: "Mumbai"
- [ ] Can select date: "2025-12-20"
- [ ] Can change passengers to 1
- [ ] Click Search button
- [ ] Results load quickly (< 2 seconds)
- [ ] See Air India flights
- [ ] See IndiGo flights
- [ ] See Taj Hotels
- [ ] All prices shown in ₹
- [ ] Filter by price works
- [ ] Sort by price works
- [ ] No red errors in console (F12)

---

## 🆘 If Something Breaks

### Mock ONIX not responding
```bash
pkill -f "mock-onix-adapter"
cd bap-travel-discovery
node mock-onix-adapter.js
```

### BAP not responding
```bash
pkill -f "npm start" | grep bap
cd bap-travel-discovery
npm start
```

### Frontend not loading
```bash
pkill -f "npm run dev" | grep frontend
cd frontend-travel-discovery
npm run dev
```

### Port already in use
```bash
lsof -i :9090  # Mock ONIX
lsof -i :8080  # BAP
lsof -i :3000  # Frontend
# Kill with: kill -9 <PID>
```

---

## 📞 Support

**All issues fixed:**
- ✅ Logger method mismatches
- ✅ 500 error responses
- ✅ Missing ONIX connection
- ✅ Port conflicts
- ✅ Node version issues
- ✅ npm vulnerabilities
- ✅ POST endpoints not working

**Current State**: Production-ready for testing ✅

---

## 🎉 You're All Set!

**Next Step**: Open http://localhost:3000 and search for flights! 🚀

---

**Last Updated**: 2025-11-12 @ 06:45 UTC
**All Services**: ✅ Operational
**Status**: 🟢 Ready to Test
