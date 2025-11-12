# 🚀 Step-by-Step: Start All Services & Test

## 📋 Simple 3-Step Process

### Step 1: Start Mock ONIX Adapter (Port 9090)
Open Terminal 1 and run:
```bash
cd beckn-travel-discovery/bap-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
node mock-onix-adapter.js
```

**Expected Output:**
```
============================================================
🚀 Mock ONIX Adapter running on http://localhost:9090
============================================================

📋 Available Endpoints:
   GET  http://localhost:9090/health
   POST http://localhost:9090/search
   POST http://localhost:9090/select
   ...
```

✅ When you see this, Mock ONIX is ready!

---

### Step 2: Start BAP Service (Port 8080)
Open Terminal 2 and run:
```bash
cd beckn-travel-discovery/bap-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
npm start
```

**Expected Output:**
```
> beckn-travel-discovery-bap@1.0.0 start
> node src/app.js

🚀 Beckn Travel Discovery BAP is running on http://localhost:8080
📋 Health check available at: http://localhost:8080/health
🔄 Beckn endpoints available at: http://localhost:8080/beckn/*
```

✅ When you see this, BAP is ready!

---

### Step 3: Start Frontend (Port 3000)
Open Terminal 3 and run:
```bash
cd beckn-travel-discovery/frontend-travel-discovery
source ~/.nvm/nvm.sh && nvm use 22
npm run dev
```

**Expected Output:**
```
> beckn-travel-discovery-frontend@1.0.0 dev
> vite

  VITE v7.2.2  ready in 502 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ When you see this, Frontend is ready!

---

## 🌐 Test in Browser

### 1. Open Application
```
Open: http://localhost:3000
```

### 2. Search for Flights
Fill in the form:
- **Origin**: Delhi
- **Destination**: Mumbai  
- **Travel Date**: 2025-12-20 (any future date)
- **Passengers**: 1

Then click **"Search"**

### 3. Expected Results
You should see:
- **Air India flights** (AI-101, AI-102) with prices ₹8500, ₹7500
- **IndiGo flights** (6E-201) with price ₹5500
- Flight details with amenities and timings

### 4. Test Features
- **Filter by price**: Drag the max price slider
- **Sort results**: Click "Sort by Price (Low to High)"
- **View details**: Click on any flight card

---

## 🔍 Verify Everything is Running

### Quick Health Check
```bash
# In any terminal, run:
curl http://localhost:3000/
curl http://localhost:8080/health | jq .
curl http://localhost:9090/health | jq .
```

### Or Use the Health Check Script
```bash
cd beckn-travel-discovery
./check-health.sh
```

**Expected Output:**
```
🔍 Beckn Travel Discovery - Service Health Check

Checking Frontend on port 3000... ✓ Running
Checking BAP Service on port 8080... ✓ Running
Checking Mock ONIX on port 9090... ✓ Running

✓ All services are running!

📋 Service URLs:
  Frontend:    http://localhost:3000
  BAP API:     http://localhost:8080
  ONIX:        http://localhost:9090
```

---

## 📊 Service Status

When all 3 are running:

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Frontend | 3000 | ✅ | http://localhost:3000 |
| BAP API | 8080 | ✅ | http://localhost:8080 |
| Mock ONIX | 9090 | ✅ | http://localhost:9090 |

---

## 🎯 Complete Data Flow

```
1. User enters search in browser (http://localhost:3000)
                          ↓
2. Frontend calls /beckn/search on BAP
                          ↓
3. BAP (port 8080) receives request
                          ↓
4. BAP calls Mock ONIX at port 9090
                          ↓
5. Mock ONIX returns flight/hotel data
                          ↓
6. BAP returns data to frontend
                          ↓
7. Frontend displays results in browser
```

---

## ⚠️ Troubleshooting

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::8080`

**Solution**:
```bash
# Find what's using the port
lsof -i :8080

# Kill it (replace XXXX with PID)
kill -9 XXXX

# Then start the service again
npm start
```

### Issue: Node Version Wrong

**Error**: `You are using Node.js 18.20.8. Vite requires Node.js version 20.19+`

**Solution**:
```bash
source ~/.nvm/nvm.sh
nvm use 22
node --version  # Should show v22.x.x
```

### Issue: Service Not Responding

**Test each service**:
```bash
# Test Frontend
curl -I http://localhost:3000

# Test BAP
curl http://localhost:8080/health

# Test Mock ONIX
curl http://localhost:9090/health
```

### Issue: Module Not Found

**If you see npm errors**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 What to Expect

### Mock Search Results Include:

**Flights:**
- Air India (Delhi to Mumbai)
  - AI-101: ₹8,500 (09:00 AM)
  - AI-102: ₹7,500 (05:00 PM)
- IndiGo (Delhi to Mumbai)
  - 6E-201: ₹5,500 (08:30 AM)

**Hotels:**
- Taj Gateway Mumbai
  - Deluxe Room: ₹18,000/night
  - Includes free WiFi, gym access

**Note**: This is mock data for testing. In production, it will connect to real travel providers.

---

## 💾 Key Logs to Monitor

### Watch BAP logs:
```bash
tail -f bap-travel-discovery/combined.log
```

### Watch errors only:
```bash
tail -f bap-travel-discovery/error.log
```

### Check console output while services run - you'll see:
- Search requests logged
- Backend processing
- Mock ONIX responses
- Any errors clearly displayed

---

## 🎓 System Architecture

```
┌─────────────────────────────┐
│  Browser (Port 3000)        │
│  http://localhost:3000      │
└──────────────┬──────────────┘
               │
               ▼ (API calls)
┌─────────────────────────────┐
│  Frontend (React + Vite)    │
│  Port: 3000                 │
│  - Search UI                │
│  - Results display          │
└──────────────┬──────────────┘
               │
    (Proxies /beckn/* calls)
               │
               ▼
┌─────────────────────────────┐
│  BAP Service (Express)      │
│  Port: 8080                 │
│  - Beckn protocol handler   │
│  - Routes requests          │
└──────────────┬──────────────┘
               │
    (Communicates via HTTP)
               │
               ▼
┌─────────────────────────────┐
│  Mock ONIX (Express)        │
│  Port: 9090                 │
│  - Simulates responses      │
│  - Returns mock data        │
└─────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Terminal 1: Mock ONIX running on port 9090
- [ ] Terminal 2: BAP running on port 8080
- [ ] Terminal 3: Frontend running on port 3000
- [ ] Browser: Open http://localhost:3000
- [ ] Search results displaying flight/hotel data
- [ ] No error messages in browser console
- [ ] Filtering and sorting working

---

## 🎉 Ready to Test!

When all 3 services are running:

1. **Open browser**: http://localhost:3000
2. **Try a search**: Delhi → Mumbai
3. **See results**: Flights and hotels appear
4. **Test filters**: Adjust price, sort options
5. **Check logs**: tail -f bap-travel-discovery/combined.log

---

**Pro Tip**: Keep all 3 terminal windows visible so you can see what's happening in each service as you interact with the UI!

---

**Status**: All Services Configured ✅
**Last Updated**: November 12, 2025
