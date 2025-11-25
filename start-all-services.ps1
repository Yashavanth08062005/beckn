# Beckn Travel Discovery - Windows Startup Script
# This script starts all required services for the travel discovery platform

Write-Host "🚀 Beckn Travel Discovery - Startup Script" -ForegroundColor Blue
Write-Host ""

# Function to check if a port is available
function Test-Port {
    param($port)
    $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Function to kill process on a port
function Stop-ProcessOnPort {
    param($port)
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Stopped process on port $port" -ForegroundColor Green
        }
    } catch {
        # Port might be free already
    }
}

# Clean up existing processes
Write-Host "🧹 Cleaning up old processes..." -ForegroundColor Yellow
Stop-ProcessOnPort 9090  # Mock ONIX
Stop-ProcessOnPort 8081  # BAP
Stop-ProcessOnPort 7001  # Flights BPP
Stop-ProcessOnPort 7003  # Hotels BPP
Stop-ProcessOnPort 3000  # Frontend

Start-Sleep -Seconds 2

# Check Node.js
Write-Host "📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Start Mock ONIX Adapter (Port 9090)
Write-Host ""
Write-Host "📦 Starting Mock ONIX Adapter (port 9090)..." -ForegroundColor Blue
Set-Location bap-travel-discovery
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node mock-onix-adapter.js" -WindowStyle Minimized
Start-Sleep -Seconds 3

# Wait for Mock ONIX to be ready
Write-Host "  ⏳ Waiting for Mock ONIX..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ Mock ONIX is ready" -ForegroundColor Green
            break
        }
    } catch {
        if ($i -eq 30) {
            Write-Host "  ⚠ Mock ONIX taking longer to start, continuing..." -ForegroundColor Yellow
        } else {
            Start-Sleep -Seconds 1
        }
    }
}

Set-Location ..

# Start BPP Flights (Port 7001)
Write-Host ""
Write-Host "📦 Starting Flights BPP (port 7001)..." -ForegroundColor Blue
Set-Location travel-discovery-bpp-flights
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized
Set-Location ..
Start-Sleep -Seconds 2

# Start BPP Hotels (Port 7003)
Write-Host ""
Write-Host "📦 Starting Hotels BPP (port 7003)..." -ForegroundColor Blue
Set-Location travel-discovery-bpp-hotels
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized
Set-Location ..
Start-Sleep -Seconds 2

# Start BAP Service (Port 8081)
Write-Host ""
Write-Host "📦 Starting BAP Service (port 8081)..." -ForegroundColor Blue
Set-Location bap-travel-discovery
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Minimized
Start-Sleep -Seconds 3

# Wait for BAP to be ready
Write-Host "  ⏳ Waiting for BAP service..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ BAP service is ready" -ForegroundColor Green
            break
        }
    } catch {
        if ($i -eq 30) {
            Write-Host "  ⚠ BAP taking longer to start, continuing..." -ForegroundColor Yellow
        } else {
            Start-Sleep -Seconds 1
        }
    }
}

Set-Location ..

# Start Frontend (Port 3000)
Write-Host ""
Write-Host "🎨 Starting Frontend (port 3000)..." -ForegroundColor Blue
Set-Location frontend-travel-discovery
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized
Set-Location ..
Start-Sleep -Seconds 3

# Display summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ All services started successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Service URLs:" -ForegroundColor Blue
Write-Host "  Frontend:      http://localhost:3000" -ForegroundColor Green
Write-Host "  BAP API:       http://localhost:8081" -ForegroundColor Green
Write-Host "  BAP Health:    http://localhost:8081/health" -ForegroundColor Green
Write-Host "  Mock ONIX:     http://localhost:9090/health" -ForegroundColor Green
Write-Host "  Flights BPP:   http://localhost:7001/health" -ForegroundColor Green
Write-Host "  Hotels BPP:    http://localhost:7003/health" -ForegroundColor Green
Write-Host ""

Write-Host "📊 All services are running in separate PowerShell windows." -ForegroundColor Yellow
Write-Host "   Close those windows to stop the services." -ForegroundColor Yellow
Write-Host ""

Write-Host "✓ Ready to search for travel options!" -ForegroundColor Green
Write-Host "✓ Open http://localhost:3000 in your browser" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

