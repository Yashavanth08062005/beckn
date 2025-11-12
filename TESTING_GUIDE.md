# 🎯 FINAL TESTING GUIDE - How to Test Everything

## 📊 Current Status

All three services should now be running:

| Service | Port | Status | Started? |
|---------|------|--------|----------|
| Mock ONIX | 9090 | ✅ | Check if you see "Mock ONIX Adapter running" in Terminal 1 |
| BAP | 8080 | Should start | Run: `npm start` in Terminal 2 |
| Frontend | 3000 | ✅ | Showing "Local: http://localhost:3000/" in Terminal 3 |

---

## ✅ Step-by-Step Test

### 1. Verify All Services Are Running

In Terminal 1 (Mock ONIX), you should see:
```
🚀 Mock ONIX Adapter running on http://localhost:9090
✓ Ready to handle search requests
```

In Terminal 2 (BAP), you should see:
```
🚀 Beckn Travel Discovery BAP is running on http://localhost:8080
📋 Health check available at: http://localhost:8080/health
```

In Terminal 3 (Frontend), you should see:
```
VITE v7.2.2  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### 2. Open Browser & Search

1. Open: **http://localhost:3000**
2. You should see a search form
3. Fill in:
   - **Origin**: Delhi
   - **Destination**: Mumbai
   - **Travel Date**: 2025-12-20
   - **Passengers**: 1
4. Click **"Search"**

### 3. Verify Results

You should see:
- **Air India flights** with prices
- **IndiGo flights** with prices
- **Taj Hotels** options
- All with ₹ (Indian Rupees) pricing

### 4. Test Filtering

- Drag the **price slider** → Results filter
- Click **"Sort by Price (Low to High)"** → Results reorder

### 5. Check Browser Console

Open DevTools (F12) → Console tab:
- Look for logs like: `✅ Transformed items:`
- Should NOT show errors (red text)

### 6. Check Terminal Logs

In Terminal 2 (BAP), you should see logs:
```
info: Received Beckn search request
info: Processing Beckn search request  
info: Sending request to ONIX: http://localhost:9090/search
info: Received response from ONIX: 200
```

---

## 🔍 Data Flow Verification

### What's Happening Behind the Scenes:

```
1. Browser Search (Frontend)
   ↓ User clicks "Search"
   ↓ Frontend creates Beckn request
   
2. API Call to BAP
   ↓ POST /beckn/search to http://localhost:8080
   ↓ Real HTTP request
   
3. BAP Processes Request
   ↓ Validates Beckn protocol
   ↓ Logs the request
   
4. BAP Calls Mock ONIX
   ↓ POST to http://localhost:9090/search
   ↓ Real HTTP request
   
5. Mock ONIX Returns Data
   ↓ Air India flights
   ↓ IndiGo flights
   ↓ Taj Hotels
   
6. BAP Sends to Frontend
   ↓ Returns formatted response
   
7. Frontend Displays Results
   ↓ React re-renders
   ↓ Cards appear on screen
```

---

## 🧪 Test Scenarios

### Scenario 1: Search Flights ✅
```
Origin: Delhi
Destination: Mumbai
Date: 2025-12-20
Expected: Air India + IndiGo flights with prices
```

### Scenario 2: Filter by Price ✅
```
1. Do a search (above)
2. Drag price slider to 6000
3. Should only show flights ≤ 6000 (IndiGo)
```

### Scenario 3: Sort Results ✅
```
1. Do a search
2. Click dropdown "Sort by Price (Low to High)"
3. Flights should reorder: IndiGo first (₹5500), then Air India (₹7500)
```

### Scenario 4: Check Logs ✅
```
In Terminal 2, you should see multiple INFO logs
showing the request processing pipeline
```

---

## 📱 What You Should See in Browser

### Search Results Display:
```
┌─────────────────────────────────┐
│ Search Results                  │
│ Delhi → Mumbai on 2025-12-20    │
├─────────────────────────────────┤
│ [Filter Sidebar]  [Results]     │
│ Price slider      [Flight Card] │
│ Sort options      [Flight Card] │
│                   [Flight Card] │
│                   [Hotel Card]  │
└─────────────────────────────────┘
```

### Each Flight Card Shows:
```
┌─────────────────────────┐
│ Airline: Air India      │
│ Flight: AI-101          │
│ Time: [Departure time]  │
│ Duration: 2h 30m        │
│ Price: ₹8,500          │
│ [View Details]          │
└─────────────────────────┘
```

---

## 🔄 How Mock Data Works

### Frontend Makes Real API Call:
```javascript
// This is REAL - it actually happens
fetch('http://localhost:8080/beckn/search', {
  method: 'POST',
  body: JSON.stringify({ ... })
})
```

### BAP Makes Real API Call:
```javascript
// This is REAL - it actually happens
axios.post('http://localhost:9090/search', { ... })
```

### Mock ONIX Returns Mock Data:
```javascript
// This returns hardcoded but realistic data
{
  providers: [
    {
      descriptor: { name: "Air India" },
      items: [
        { price: { value: "8500" }, descriptor: { name: "AI-101" } }
      ]
    }
  ]
}
```

---

## 🎯 Summary

| Component | Type | What Happens |
|-----------|------|--------------|
| Browser | Real | User enters search |
| Frontend → BAP API Call | Real | Actual HTTP POST request |
| BAP Processing | Real | Server processes request |
| BAP → Mock ONIX API Call | Real | Actual HTTP POST request |
| Mock ONIX | Simulated | Returns fake but realistic data |
| Data Returned | Real | Goes back through BAP to Frontend |
| Browser Display | Real | React renders flight/hotel cards |

**Bottom Line**: ✅ Real APIs + Real HTTP Calls + Mock Data = Perfect for Testing

---

## ✨ Testing Checklist

- [ ] Mock ONIX running on port 9090
- [ ] BAP running on port 8080
- [ ] Frontend running on port 3000
- [ ] Browser opens http://localhost:3000
- [ ] Search form visible
- [ ] Search returns results
- [ ] Flights display with prices
- [ ] Hotels display with prices
- [ ] Filtering works
- [ ] Sorting works
- [ ] No red errors in console (F12)
- [ ] Logs showing in Terminal 2

---

## 🚀 Ready to Test!

All systems are configured. Simply:

1. **Terminal 1**: Mock ONIX running ✅
2. **Terminal 2**: Start BAP with `npm start`
3. **Terminal 3**: Frontend already running ✅
4. **Browser**: Open http://localhost:3000
5. **Search**: Delhi → Mumbai
6. **Verify**: See results ✅

---

## 📚 For More Details

- **Data Flow**: See `DATA_FLOW_EXPLAINED.md`
- **System Architecture**: See `PROJECT_STATUS.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`

---

**Status**: Ready for Complete Testing ✅
**All Services**: Configured ✅
**Mock Data**: Available ✅
