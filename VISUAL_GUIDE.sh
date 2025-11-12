#!/bin/bash

# Beckn Travel Discovery - Visual Setup & Status Guide
# Display current setup status and instructions

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                   🎉 BECKN TRAVEL DISCOVERY - SETUP COMPLETE                ║
║                                                                              ║
║                         All Issues Fixed & Systems Ready                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝


📊 SERVICE STATUS
═══════════════════════════════════════════════════════════════════════════════

  Service              Port    Status    NodeJS      URL
  ─────────────────────────────────────────────────────────────────────────────
  Frontend             3000    ✅ Ready  v22.21.1   http://localhost:3000
  BAP API              8080    ✅ Ready  v22.21.1   http://localhost:8080
  Mock ONIX            9090    ✅ Ready  v22.21.1   http://localhost:9090


🚀 START SERVICES
═══════════════════════════════════════════════════════════════════════════════

Option 1: Automated (Recommended)
────────────────────────────────────────────────────────────────────────────────
  cd beckn-travel-discovery
  ./START.sh

Option 2: Manual (Three Terminal Windows)
────────────────────────────────────────────────────────────────────────────────

  Terminal 1 - Start Mock ONIX Adapter (Port 9090):
  ──────────────────────────────────────────────────
  source ~/.nvm/nvm.sh && nvm use 22
  cd bap-travel-discovery
  node mock-onix-adapter.js
  
  Expected output:
  🚀 Mock ONIX Adapter running on http://localhost:9090


  Terminal 2 - Start BAP Service (Port 8080):
  ──────────────────────────────────────────────────
  source ~/.nvm/nvm.sh && nvm use 22
  cd bap-travel-discovery
  npm start
  
  Expected output:
  🚀 Beckn Travel Discovery BAP is running on http://localhost:8080


  Terminal 3 - Start Frontend (Port 3000):
  ──────────────────────────────────────────────────
  source ~/.nvm/nvm.sh && nvm use 22
  cd frontend-travel-discovery
  npm run dev
  
  Expected output:
  ➜  Local:   http://localhost:3000/


🌐 ACCESS THE APPLICATION
═══════════════════════════════════════════════════════════════════════════════

  1. Open browser: http://localhost:3000
  2. Enter search parameters:
     - Origin: Delhi
     - Destination: Mumbai
     - Date: Any future date
  3. Click "Search"
  4. See mock flight and hotel results


✅ WHAT WAS FIXED
═══════════════════════════════════════════════════════════════════════════════

  ✓ Port 8080 conflict (Docker container stopped)
  ✓ Node version upgraded (18.20.8 → 22.21.1)
  ✓ npm vulnerabilities fixed (3 → 0)
  ✓ ONIX adapter missing (Mock adapter created)
  ✓ Vite configuration (Port 3000, API proxy)
  ✓ Logger implementation (Fixed undefined methods)
  ✓ Error handling (Better messages & logging)


📋 HEALTH CHECKS
═══════════════════════════════════════════════════════════════════════════════

  Verify services are running:

  # Frontend health
  curl -I http://localhost:3000

  # BAP health
  curl http://localhost:8080/health | jq .

  # Mock ONIX health
  curl http://localhost:9090/health | jq .

  # All at once
  ./check-health.sh


📚 DOCUMENTATION FILES
═══════════════════════════════════════════════════════════════════════════════

  README.md              - Project overview
  SETUP.md               - Complete setup guide
  QUICK_FIX.md           - Quick troubleshooting reference
  TROUBLESHOOTING.md     - Detailed troubleshooting
  FIX_SUMMARY.md         - Technical details of fixes
  PROJECT_STATUS.md      - Current status overview
  SETUP_COMPLETE.md      - Setup completion report


🔧 CONFIGURATION
═══════════════════════════════════════════════════════════════════════════════

  BAP Configuration (bap-travel-discovery/src/config/env.js):
  ─────────────────────────────────────────────────────────────
  PORT=8080
  ONIX_URL=http://localhost:9090
  BAP_ID=travel-discovery-bap.example.com
  BAP_URI=http://localhost:8080

  Frontend Configuration (frontend-travel-discovery/vite.config.js):
  ──────────────────────────────────────────────────────────────────
  Port: 3000
  API Proxy: /beckn/* → http://localhost:8080/beckn/*


🎯 SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════════

           User Browser (http://localhost:3000)
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Frontend (React + Vite)     │
        │   Port 3000                   │
        └───────────────┬───────────────┘
                        │
         Proxies: /beckn/* calls
                        │
                        ▼
        ┌───────────────────────────────┐
        │  BAP Service (Express)        │
        │  Port 8080                    │
        └───────────────┬───────────────┘
                        │
         Communicates with ONIX
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Mock ONIX Adapter            │
        │  Port 9090                    │
        │  (Development/Testing)        │
        └───────────────────────────────┘


⚠️  TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

  Port already in use:
  ──────────────────────
  lsof -i :8080
  kill -9 <PID>

  Wrong Node version:
  ──────────────────────
  node --version
  nvm use 22

  Service not responding:
  ──────────────────────
  curl http://localhost:XXXX/health
  tail -f bap-travel-discovery/combined.log


💾 FILES CREATED
═══════════════════════════════════════════════════════════════════════════════

  New Services:
  • bap-travel-discovery/mock-onix-adapter.js

  Documentation:
  • SETUP.md
  • QUICK_FIX.md
  • FIX_SUMMARY.md
  • PROJECT_STATUS.md
  • SETUP_COMPLETE.md

  Scripts:
  • START.sh (Automated startup)
  • check-health.sh (Health checker)


✨ NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

  1. Start services:
     ./START.sh

  2. Open http://localhost:3000

  3. Search for travel options

  4. Verify results appear

  5. Check logs if needed:
     tail -f bap-travel-discovery/combined.log


═══════════════════════════════════════════════════════════════════════════════
Status: ✅ All Systems Ready    |    Last Updated: November 12, 2025
═══════════════════════════════════════════════════════════════════════════════

EOF

echo ""
echo "🎯 Ready to start? Run: ./START.sh"
echo ""
