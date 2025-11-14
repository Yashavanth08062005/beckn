# 🚀 Beckn Travel Discovery - Start Guide

## Quick Start (Recommended)

### Prerequisites
- Node.js 22+ (or 20.19+)
- npm 10+
- Git

---

## 📋 Step 1: Install Dependencies

### Install BAP Service Dependencies
```bash
cd bap-travel-discovery
npm install
cd ..
```

### Install Frontend Dependencies
```bash
cd frontend-travel-discovery
npm install
cd ..
```

### Install BPP Hotels Dependencies (Optional)
```bash
cd travel-discovery-bpp-hotels
npm install
cd ..
```

### Install All at Once
```bash
npm install --prefix bap-travel-discovery && npm install --prefix frontend-travel-discovery && npm install --prefix travel-discovery-bpp-hotels
```

---

## 🏃 Step 2: Run the Project

### Terminal 1: Start Mock ONIX Adapter (Port 9090)
```bash
cd bap-travel-discovery
node mock-onix-adapter.js
```

**Expected Output:**
```
🚀 Mock ONIX Adapter running on http://localhost:9090
✓ Ready to handle search requests
```

---

### Terminal 2: Start BAP Service (Port 8081)
```bash
cd bap-travel-discovery
npm start
```

**Expected Output:**
```
🚀 Beckn Travel Discovery BAP is running on http://localhost:8081
📋 Health check available at: http://localhost:8081/health
```

---

### Terminal 3: Start Frontend (Port 3000)
```bash
cd frontend-travel-discovery
npm run dev
```

**Expected Output:**
```
VITE v7.2.2 ready in XXX ms
➜  Local:   http://localhost:3000/
```

---

## 🌐 Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## ✅ Verify All Services

### Health Checks

**BAP Service:**
```bash
curl http://localhost:8081/health
```

**Mock ONIX:**
```bash
curl http://localhost:9090/health
```

**Frontend:**
```bash
curl http://localhost:3000/
```

---

## 🧪 Test the Application

### Test Flight Search
1. Go to http://localhost:3000
2. Click on **Flights** tab
3. Enter:
   - **From**: Delhi (DEL)
   - **To**: Mumbai (BOM)
   - **Date**: 2025-12-20
   - **Passengers**: 1
4. Click **Search Flights**

### Test Hotel Search
1. Go to http://localhost:3000
2. Click on **Hotels** tab
3. Enter:
   - **City**: Mumbai
   - **Check-in**: 2025-12-20
   - **Check-out**: 2025-12-23
   - **Rooms**: 1
   - **Guests**: 2
4. Click **Search Hotels**

---

## 🛑 Stop All Services

### Windows PowerShell
```bash
Get-Process node | Stop-Process -Force
```

### macOS/Linux
```bash
pkill -f "node"
```

---

## 📁 Project Structure

```
beckn-travel-discovery/
├── bap-travel-discovery/              # BAP (Port 8081)
│   ├── src/
│   ├── mock-onix-adapter.js          # Mock ONIX (Port 9090)
│   └── package.json
├── frontend-travel-discovery/         # Frontend React (Port 3000)
│   ├── src/
│   └── package.json
├── travel-discovery-bpp-hotels/      # Hotels BPP
│   └── package.json
└── START.md                           # This file
```

---

## 🔧 Environment Configuration

### BAP .env (Already Configured)
Located at: `bap-travel-discovery/.env`
```
PORT=8081
ONIX_URL=http://127.0.0.1:9090
BAP_ID=travel-discovery-bap.example.com
BAP_URI=http://localhost:8081
```

### Frontend Configuration
Located at: `frontend-travel-discovery/src/services/api.js`
```javascript
const API_BASE_URL = 'http://localhost:8081';
```

---

## 📊 Service Endpoints

### BAP Service (Port 8081)
- `GET /health` - Health check
- `POST /beckn/search` - Search flights/hotels
- `POST /beckn/select` - Select option
- `POST /beckn/init` - Initialize booking
- `POST /beckn/confirm` - Confirm booking
- `POST /beckn/status` - Check status

### Mock ONIX Adapter (Port 9090)
- `GET /health` - Health check
- `POST /search` - Mock search response
- `POST /select` - Mock select response
- `POST /init` - Mock init response
- `POST /confirm` - Mock confirm response
- `POST /status` - Mock status response

### Frontend (Port 3000)
- Home page with search form
- Search results page
- Hotel and flight cards display

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows: Find and kill process using port
Get-NetTCPConnection -LocalPort 9090 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 8081 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install --prefix bap-travel-discovery
npm install --prefix frontend-travel-discovery
```

### Frontend Not Loading
- Clear browser cache (Ctrl+Shift+Delete)
- Check if port 3000 is accessible
- Verify BAP service is running on port 8081

### Search Not Working
- Ensure Mock ONIX is running on port 9090
- Ensure BAP service is running on port 8081
- Check browser DevTools console for errors

---

## 📝 Notes

- Services should be started in the order: ONIX → BAP → Frontend
- All services are configured for local development
- Mock ONIX provides sample data for testing
- For production, replace mock adapters with real services

---

## 🎉 Ready to Go!

All services are configured and ready to run. Follow the steps above and enjoy exploring the Beckn Travel Discovery platform!

For more information, check the main `README.md` or `DOCUMENTATION.md` files.
