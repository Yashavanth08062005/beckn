@echo off
echo Starting Beckn Protocol Layer 2 Infrastructure...

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running
    echo Please install Docker Desktop and ensure it's running
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Compose is not available
    echo Please ensure Docker Compose is installed
    pause
    exit /b 1
)

echo.
echo Setting up Layer 2 infrastructure...
echo This will start:
echo - Beckn Gateway (Port 5555)
echo - Redis Cache (Port 6379)
echo - Registry Service (Port 8090)
echo - Message Broker (Port 8091)
echo - Monitor Service (Port 8092)
echo - PostgreSQL (Port 5433)
echo - Prometheus (Port 9090)
echo - Grafana (Port 3001)
echo - Jaeger (Port 16686)
echo - Certificate Authority (Port 9000)
echo.

REM Create necessary directories
if not exist "layer2-services" mkdir layer2-services
if not exist "layer2-services\registry" mkdir layer2-services\registry
if not exist "layer2-services\message-broker" mkdir layer2-services\message-broker
if not exist "layer2-services\monitor" mkdir layer2-services\monitor

REM Create basic package.json files for Node.js services
echo Creating service configurations...

REM Registry service package.json
echo {> layer2-services\registry\package.json
echo   "name": "beckn-registry",>> layer2-services\registry\package.json
echo   "version": "1.0.0",>> layer2-services\registry\package.json
echo   "main": "src/registry-server.js",>> layer2-services\registry\package.json
echo   "dependencies": {>> layer2-services\registry\package.json
echo     "express": "^4.18.0",>> layer2-services\registry\package.json
echo     "redis": "^4.6.0",>> layer2-services\registry\package.json
echo     "pg": "^8.11.0",>> layer2-services\registry\package.json
echo     "yaml": "^2.3.0",>> layer2-services\registry\package.json
echo     "winston": "^3.10.0">> layer2-services\registry\package.json
echo   }>> layer2-services\registry\package.json
echo }>> layer2-services\registry\package.json

REM Message broker service package.json
echo {> layer2-services\message-broker\package.json
echo   "name": "beckn-message-broker",>> layer2-services\message-broker\package.json
echo   "version": "1.0.0",>> layer2-services\message-broker\package.json
echo   "main": "src/message-broker.js",>> layer2-services\message-broker\package.json
echo   "dependencies": {>> layer2-services\message-broker\package.json
echo     "express": "^4.18.0",>> layer2-services\message-broker\package.json
echo     "redis": "^4.6.0",>> layer2-services\message-broker\package.json
echo     "axios": "^1.5.0",>> layer2-services\message-broker\package.json
echo     "yaml": "^2.3.0",>> layer2-services\message-broker\package.json
echo     "winston": "^3.10.0">> layer2-services\message-broker\package.json
echo   }>> layer2-services\message-broker\package.json
echo }>> layer2-services\message-broker\package.json

REM Monitor service package.json
echo {> layer2-services\monitor\package.json
echo   "name": "beckn-monitor",>> layer2-services\monitor\package.json
echo   "version": "1.0.0",>> layer2-services\monitor\package.json
echo   "main": "src/monitor.js",>> layer2-services\monitor\package.json
echo   "dependencies": {>> layer2-services\monitor\package.json
echo     "express": "^4.18.0",>> layer2-services\monitor\package.json
echo     "redis": "^4.6.0",>> layer2-services\monitor\package.json
echo     "pg": "^8.11.0",>> layer2-services\monitor\package.json
echo     "axios": "^1.5.0",>> layer2-services\monitor\package.json
echo     "yaml": "^2.3.0",>> layer2-services\monitor\package.json
echo     "winston": "^3.10.0",>> layer2-services\monitor\package.json
echo     "prom-client": "^14.2.0">> layer2-services\monitor\package.json
echo   }>> layer2-services\monitor\package.json
echo }>> layer2-services\monitor\package.json

REM Create basic service files
if not exist "layer2-services\registry\src" mkdir layer2-services\registry\src
if not exist "layer2-services\message-broker\src" mkdir layer2-services\message-broker\src
if not exist "layer2-services\monitor\src" mkdir layer2-services\monitor\src

REM Basic registry server
echo const express = require('express');> layer2-services\registry\src\registry-server.js
echo const app = express();>> layer2-services\registry\src\registry-server.js
echo const PORT = process.env.PORT ^|^| 8090;>> layer2-services\registry\src\registry-server.js
echo app.use(express.json());>> layer2-services\registry\src\registry-server.js
echo app.get('/health', (req, res) =^> res.json({status: 'healthy', service: 'registry'}));>> layer2-services\registry\src\registry-server.js
echo app.listen(PORT, () =^> console.log(`Registry server running on port ${PORT}`));>> layer2-services\registry\src\registry-server.js

REM Basic message broker
echo const express = require('express');> layer2-services\message-broker\src\message-broker.js
echo const app = express();>> layer2-services\message-broker\src\message-broker.js
echo const PORT = process.env.PORT ^|^| 8091;>> layer2-services\message-broker\src\message-broker.js
echo app.use(express.json());>> layer2-services\message-broker\src\message-broker.js
echo app.get('/health', (req, res) =^> res.json({status: 'healthy', service: 'message-broker'}));>> layer2-services\message-broker\src\message-broker.js
echo app.listen(PORT, () =^> console.log(`Message broker running on port ${PORT}`));>> layer2-services\message-broker\src\message-broker.js

REM Basic monitor service
echo const express = require('express');> layer2-services\monitor\src\monitor.js
echo const app = express();>> layer2-services\monitor\src\monitor.js
echo const PORT = process.env.PORT ^|^| 8092;>> layer2-services\monitor\src\monitor.js
echo app.use(express.json());>> layer2-services\monitor\src\monitor.js
echo app.get('/health', (req, res) =^> res.json({status: 'healthy', service: 'monitor'}));>> layer2-services\monitor\src\monitor.js
echo app.get('/metrics', (req, res) =^> res.text('# Beckn metrics\nbeckn_up 1'));>> layer2-services\monitor\src\monitor.js
echo app.listen(PORT, () =^> console.log(`Monitor service running on port ${PORT}`));>> layer2-services\monitor\src\monitor.js

echo.
echo Starting Layer 2 infrastructure with Docker Compose...
docker compose -f docker-compose.layer2.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ Layer 2 infrastructure started successfully!
    echo.
    echo Services available at:
    echo - Beckn Gateway: http://localhost:5555
    echo - Registry Service: http://localhost:8090
    echo - Message Broker: http://localhost:8091
    echo - Monitor Service: http://localhost:8092
    echo - Prometheus: http://localhost:9090
    echo - Grafana: http://localhost:3001 (admin/admin123)
    echo - Jaeger: http://localhost:16686
    echo - Redis: localhost:6379
    echo - PostgreSQL: localhost:5433
    echo.
    echo To check status: docker compose -f docker-compose.layer2.yml ps
    echo To view logs: docker compose -f docker-compose.layer2.yml logs -f
    echo To stop: docker compose -f docker-compose.layer2.yml down
) else (
    echo.
    echo ❌ Failed to start Layer 2 infrastructure
    echo Check the logs for more details:
    echo docker compose -f docker-compose.layer2.yml logs
)

echo.
pause