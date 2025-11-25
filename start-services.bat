@echo off
echo 🚀 Beckn Travel Discovery - Starting All Services
echo.

REM Kill existing Node processes (optional - uncomment if needed)
REM taskkill /F /IM node.exe 2>nul

REM Start Mock ONIX Adapter (Port 9090)
echo 📦 Starting Mock ONIX Adapter (port 9090)...
start "Mock ONIX" cmd /k "cd /d bap-travel-discovery && node mock-onix-adapter.js"
timeout /t 3 /nobreak >nul

REM Start Flights BPP (Port 7001)
echo 📦 Starting Flights BPP (port 7001)...
start "Flights BPP" cmd /k "cd /d travel-discovery-bpp-flights && npm start"
timeout /t 2 /nobreak >nul

REM Start Hotels BPP (Port 7003)
echo 📦 Starting Hotels BPP (port 7003)...
start "Hotels BPP" cmd /k "cd /d travel-discovery-bpp-hotels && npm start"
timeout /t 2 /nobreak >nul

REM Start BAP Service (Port 8081)
echo 📦 Starting BAP Service (port 8081)...
start "BAP Service" cmd /k "cd /d bap-travel-discovery && npm start"
timeout /t 3 /nobreak >nul

REM Start Frontend (Port 3000)
echo 🎨 Starting Frontend (port 3000)...
start "Frontend" cmd /k "cd /d frontend-travel-discovery && npm run dev"

echo.
echo ═══════════════════════════════════════════════════════════
echo ✓ All services started!
echo ═══════════════════════════════════════════════════════════
echo.
echo 📋 Service URLs:
echo   Frontend:    http://localhost:3000
echo   BAP API:     http://localhost:8081
echo   BAP Health:  http://localhost:8081/health
echo   Mock ONIX:   http://localhost:9090/health
echo   Flights BPP: http://localhost:7001/health
echo   Hotels BPP:  http://localhost:7003/health
echo.
echo ✓ Open http://localhost:3000 in your browser
echo.
echo All services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause

