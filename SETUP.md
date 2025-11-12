# 🚀 Installation & Setup Guide

## Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
cd beckn-travel-discovery
./START.sh
```

This script will:
- ✓ Ensure Node.js 22 is installed (via NVM)
- ✓ Clean up old processes
- ✓ Install dependencies
- ✓ Start BAP service on port 8080
- ✓ Start Frontend on port 3000
- ✓ Verify all services are healthy

### Option 2: Manual Setup

#### Prerequisites
1. **Node.js 22+** (Vite requires 20.19+ or 22.12+)
2. **NVM** (recommended for Node version management)
3. **npm 10+**

#### Step 1: Install Node 22 (if not already installed)
```bash
# Using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22
nvm alias default 22
```

#### Step 2: Verify Node Version
```bash
node --version  # Should show v22.x.x or higher
npm --version   # Should show 10.x.x or higher
```

#### Step 3: Start BAP Service
```bash
cd bap-travel-discovery
npm install
npm start
# Should see: 🚀 Beckn Travel Discovery BAP is running on http://localhost:8080
```

#### Step 4: Start Frontend (in a new terminal)
```bash
# Make sure you're using Node 22
source ~/.nvm/nvm.sh
nvm use 22

cd frontend-travel-discovery
npm install
npm run dev
# Should see: VITE v7.2.2  ready in XXX ms
#            ➜  Local:   http://localhost:3000/
```

#### Step 5: Verify Services
```bash
# In another terminal
curl http://localhost:8080/health
# Should return: {"status":"OK","service":"Beckn Travel Discovery BAP",...}

curl http://localhost:3000
# Should return HTML (frontend is running)
```

## System Requirements

| Component | Version | Required |
|-----------|---------|----------|
| Node.js | 22.21.1+ | ✓ |
| npm | 10.9.4+ | ✓ |
| macOS | 10.15+ | ✓ |
| Disk Space | ~500MB | For dependencies |

## Environment Variables

### BAP Configuration
Create or update `bap-travel-discovery/.env`:
```env
PORT=8080
ONIX_URL=http://localhost:5000
BAP_ID=travel-discovery-bap.example.com
BAP_URI=http://localhost:8080
NODE_ENV=development
```

### Frontend Configuration
Create or update `frontend-travel-discovery/.env`:
```env
VITE_BAP_URL=http://localhost:8080
```

## Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React app (Vite dev server) |
| BAP | 8080 | Beckn protocol API |
| ONIX | 5000 | Beckn adapter (if running locally) |

### Change Frontend Port (if 3000 is in use)
Edit `frontend-travel-discovery/vite.config.js`:
```javascript
server: {
  port: 3001,  // Change to your desired port
  proxy: {
    '/beckn': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

## Troubleshooting

### Issue: "Port already in use"
```bash
# Find process using port
lsof -i :8080

# Kill process (replace PID with actual process ID)
kill -9 <PID>

# Or use the script to clean up
pkill -f "node src/app.js"
pkill -f "vite"
```

### Issue: "Node version too old"
```bash
# Check your Node version
node --version

# If less than 20.19.0, upgrade:
nvm install 22
nvm use 22
nvm alias default 22

# Verify
node --version  # Should show v22.x.x
```

### Issue: "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall with correct Node version
nvm use 22
npm install
```

### Issue: "Vite compilation errors"
```bash
# Clean and reinstall
cd frontend-travel-discovery
rm -rf node_modules package-lock.json dist
npm install
npm run dev
```

### Issue: "Cannot connect to BAP"
```bash
# Check if BAP is running
curl http://localhost:8080/health

# If not running, start it
cd bap-travel-discovery
npm start

# Check logs for errors
tail -50 combined.log
```

## Health Checks

### Verify All Services
```bash
./check-health.sh
```

### Individual Health Checks
```bash
# BAP Service
curl http://localhost:8080/health

# Frontend (should return HTML)
curl -I http://localhost:3000
```

## Production Build

### Build Frontend for Production
```bash
cd frontend-travel-discovery
npm run build
# Output will be in dist/ directory
```

### Serve Production Build
```bash
# Using Vite preview
npm run preview

# Or use any static server
npx http-server dist/
```

## Development Tips

### Debug Logs
```bash
# Watch BAP logs in real-time
tail -f bap-travel-discovery/combined.log

# Watch errors only
tail -f bap-travel-discovery/error.log
```

### Enable Verbose Logging
Set in `bap-travel-discovery/.env`:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Hot Module Replacement (HMR)
Frontend automatically reloads on file changes in development mode.

### API Testing
Use the Postman collection in `beckn-onix/validation-scripts/postman-collection/`

## Next Steps

1. ✅ Verify all services are running
2. ✅ Open http://localhost:3000 in your browser
3. ✅ Try a search query
4. ✅ Check browser console for logs
5. ✅ Read TROUBLESHOOTING.md if issues occur

## Support

For detailed troubleshooting, see:
- `TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- `QUICK_FIX.md` - Quick reference for common issues
- `FIX_SUMMARY.md` - Details on recent fixes

---

**Last Updated**: November 12, 2025
**Node.js Version Requirement**: v22.21.1+ (or 20.19+)
**Status**: Ready for Development ✅
