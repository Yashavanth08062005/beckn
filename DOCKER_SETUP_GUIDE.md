# Beckn Travel Discovery - Docker Setup Guide

## 🚀 Quick Start

This guide will help you run the complete Beckn travel discovery platform using Docker.

---

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)
- **8GB RAM minimum** recommended
- **Ports 3000, 7001, 7003, 8080** should be available

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│               Beckn Travel Discovery Platform            │
│                                                          │
│  ┌─────────────┐    HTTP    ┌─────────────┐             │
│  │  Frontend   │◄──────────►│ BAP Service │             │
│  │  (React)    │            │ (Node.js)   │             │
│  │  Port: 3000 │            │ Port: 8080  │             │
│  └─────────────┘            └──────┬──────┘             │
│                                     │                    │
│                            ┌────────┴────────┐          │
│                            │                 │           │
│                            ▼                 ▼           │
│  ┌─────────────────┐              ┌─────────────────┐   │
│  │  Flights BPP    │              │   Hotels BPP    │   │
│  │  (Node.js)      │              │   (Node.js)     │   │
│  │  Port: 7001     │              │   Port: 7003    │   │
│  └─────────────────┘              └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Step 1: Build and Start All Services

### Option A: Start All Services (Recommended)

```bash
# Navigate to project directory
cd beckn-travel-discovery

# Build and start all services in detached mode
docker-compose up -d
```

**Expected Output:**
```
✔ Container beckn-travel-discovery-bpp-flights-1    Started
✔ Container beckn-travel-discovery-bpp-hotels-1     Started  
✔ Container beckn-travel-discovery-bap-travel-discovery-1  Started
✔ Container beckn-travel-discovery-frontend-1       Started
```

### Option B: Start with Live Logs (for debugging)

```bash
# Start with logs visible (press Ctrl+C to stop)
docker-compose up
```

**Build Time:** 5-10 minutes (first time only)

---

## ✅ Step 2: Verify Services Are Running

### Check all containers status:
```bash
docker ps
```

**You should see 4 running containers:**
```
CONTAINER ID   IMAGE                         PORTS                    STATUS
xxxxxxxxxx     beckn-travel-discovery-frontend       0.0.0.0:3000->3000/tcp   Up
xxxxxxxxxx     beckn-travel-discovery-bap             0.0.0.0:8080->8080/tcp   Up  
xxxxxxxxxx     beckn-travel-discovery-bpp-flights     0.0.0.0:7001->7001/tcp   Up
xxxxxxxxxx     beckn-travel-discovery-bpp-hotels      0.0.0.0:7003->7003/tcp   Up
```

### Check health status:
```bash
# Check BAP health
curl http://localhost:8080/health

# Check Flights BPP health  
curl http://localhost:7001/health

# Check Hotels BPP health
curl http://localhost:7003/health
```

**Expected Response (for each):**
```json
{
  "status": "healthy",
  "service": "BAP Travel Discovery", // or respective service name
  "timestamp": "2024-11-09T..."
}
```

---

## 🌐 Step 3: Access the Application

### Frontend (User Interface)
```
URL: http://localhost:3000
```
**What you'll see:**
- Travel search form
- Flight and hotel search options
- Real-time results from BPP providers

### BAP API (Backend Service)
```
URL: http://localhost:8080
Key Endpoints:
  - GET  /health           - Health check
  - POST /search           - Search travel options  
  - POST /select           - Select specific option
  - POST /init             - Initialize booking
  - POST /confirm          - Confirm booking
```

### Direct BPP Access (for testing)
```
Flights BPP: http://localhost:7001
  - GET /health           - Health check
  - GET /flights          - List available flights
  - POST /search          - Search flights (Beckn format)

Hotels BPP: http://localhost:7003  
  - GET /health           - Health check
  - GET /hotels           - List available hotels
  - POST /search          - Search hotels (Beckn format)
```

---

## 🧪 Step 4: Test the Complete Flow

### Test 1: Frontend to BAP (Full User Flow)

1. **Open Frontend:** http://localhost:3000
2. **Search Travel:** Fill in departure/destination
3. **View Results:** See combined flights + hotels
4. **Book Travel:** Select options and confirm

### Test 2: Direct API Testing with curl

#### Search Travel Options
```bash
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "mobility",
      "action": "search",
      "version": "1.1.0",
      "bap_id": "travel-discovery-bap",
      "bap_uri": "http://localhost:8080",
      "transaction_id": "txn-001",
      "message_id": "msg-001",
      "timestamp": "2024-11-09T10:00:00.000Z"
    },
    "message": {
      "intent": {
        "fulfillment": {
          "type": "journey",
          "start": {
            "location": {
              "city": { "name": "Delhi" },
              "country": { "code": "IND" }
            }
          },
          "end": {
            "location": {
              "city": { "name": "Mumbai" },
              "country": { "code": "IND" }
            }
          }
        }
      }
    }
  }'
```

#### Select Flight
```bash
curl -X POST http://localhost:8080/select \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "mobility", 
      "action": "select",
      "version": "1.1.0",
      "bap_id": "travel-discovery-bap",
      "bap_uri": "http://localhost:8080",
      "bpp_id": "flights-bpp.example.com",
      "bpp_uri": "http://localhost:7001",
      "transaction_id": "txn-001",
      "message_id": "msg-002", 
      "timestamp": "2024-11-09T10:01:00.000Z"
    },
    "message": {
      "order": {
        "items": [
          { "id": "flight-AI-101" }
        ]
      }
    }
  }'
```

### Test 3: Direct BPP Testing

#### Get All Flights
```bash
curl http://localhost:7001/flights
```

#### Get All Hotels  
```bash
curl http://localhost:7003/hotels
```

---

## 🔍 Step 5: Monitor and Debug

### View Container Logs

#### View all logs:
```bash
# All services logs
docker-compose logs

# Follow logs in real-time (Ctrl+C to stop)
docker-compose logs -f
```

#### View specific service logs:
```bash
# BAP service logs
docker-compose logs bap-travel-discovery

# Frontend logs
docker-compose logs frontend

# Flights BPP logs  
docker-compose logs bpp-flights

# Hotels BPP logs
docker-compose logs bpp-hotels
```

### Check Resource Usage
```bash
# View container resource usage
docker stats
```

---

## 🛑 Step 6: Stop Services

### Stop all services (keeps data):
```bash
docker-compose down
```

### Stop and remove all data:
```bash
docker-compose down -v
```

### Stop individual service:
```bash
# Stop only frontend
docker-compose stop frontend

# Start it again
docker-compose start frontend
```

---

## 🔄 Step 7: Restart and Update

### Restart after code changes:
```bash
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild only specific service
docker-compose up -d --build frontend
```

### Update after pulling new code:
```bash
# Pull latest code
git pull

# Rebuild everything
docker-compose down
docker-compose up -d --build
```

---

## 🗑️ Step 8: Complete Cleanup

### Remove all containers, images, and volumes:
```bash
# Stop services
docker-compose down -v

# Remove project images
docker images | grep beckn-travel-discovery | awk '{print $3}' | xargs docker rmi -f

# Clean up dangling images
docker image prune -f

# Clean up unused volumes
docker volume prune -f
```

---

## 📊 Service Endpoints Reference

| Service | URL | Purpose | Health Check |
|---------|-----|---------|-------------|
| **Frontend** | http://localhost:3000 | User Interface | Browser access |
| **BAP Service** | http://localhost:8080 | Travel aggregator API | `/health` |
| **Flights BPP** | http://localhost:7001 | Flight provider | `/health` |
| **Hotels BPP** | http://localhost:7003 | Hotel provider | `/health` |

### API Endpoints Detail

#### BAP Service (Port 8080)
```
POST /search       - Search travel options
POST /select       - Select travel item  
POST /init         - Initialize booking
POST /confirm      - Confirm booking
POST /status       - Check booking status
POST /cancel       - Cancel booking
GET  /health       - Service health
```

#### Flights BPP (Port 7001)  
```
GET  /flights      - List all flights
POST /search       - Search flights (Beckn)
POST /select       - Select flight (Beckn)
POST /init         - Initialize flight booking (Beckn)
POST /confirm      - Confirm flight booking (Beckn) 
GET  /health       - Service health
```

#### Hotels BPP (Port 7003)
```
GET  /hotels       - List all hotels
POST /search       - Search hotels (Beckn)
POST /select       - Select hotel (Beckn)
POST /init         - Initialize hotel booking (Beckn)
POST /confirm      - Confirm hotel booking (Beckn)
GET  /health       - Service health
```

---

## 🎯 Mock Data Available

### Flights (3 options available):
- **Air India AI-101** - Delhi → Mumbai - ₹8,500 
- **IndiGo 6E-202** - Delhi → Mumbai - ₹6,200
- **Vistara UK-303** - Delhi → Mumbai - ₹9,800

### Hotels (3 options available):  
- **Taj Mahal Palace** - Mumbai - ₹25,000/night
- **The Oberoi** - Mumbai - ₹28,000/night  
- **ITC Grand Central** - Mumbai - ₹15,000/night

---

## ⚠️ Troubleshooting

### Common Issues & Solutions

#### 1. **Port conflicts**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill process using port (replace PID)
taskkill /PID <PID> /F
```

#### 2. **Build failures**  
```bash
# Clean build
docker system prune -a
docker-compose build --no-cache
```

#### 3. **Services not healthy**
```bash
# Check logs for specific service
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

#### 4. **Frontend not loading**
- Check if port 3000 is available
- Verify BAP service is running on 8080
- Check browser console for errors

#### 5. **API calls failing**
- Verify all health endpoints return 200
- Check service logs for errors
- Ensure proper request format (JSON)

---

## 🚀 Development Workflow

### For Active Development:

1. **Start services with volume mounts** (already configured):
   ```bash
   docker-compose up -d
   ```

2. **Make code changes** - they'll be reflected immediately due to volume mounts

3. **Restart service if needed** (for package.json changes):
   ```bash
   docker-compose restart [service-name]
   ```

4. **View logs during development**:
   ```bash
   docker-compose logs -f [service-name]
   ```

### For Production Deployment:

1. **Use production dockerfile** (multi-stage build)
2. **Remove volume mounts** in production compose file  
3. **Set production environment variables**
4. **Use proper orchestration** (Kubernetes, Docker Swarm)

---

## ✅ Success Checklist

Before considering setup complete, verify:

- [ ] All 4 containers running (`docker ps` shows 4 UP containers)
- [ ] All health checks pass (BAP, Flights BPP, Hotels BPP)  
- [ ] Frontend accessible at http://localhost:3000
- [ ] Search functionality works end-to-end
- [ ] API endpoints respond correctly
- [ ] Logs show no critical errors
- [ ] Can search and select travel options
- [ ] Mock data displays correctly

---

## 🔗 Related Documentation

- [Beckn Protocol Specification](https://developers.becknprotocol.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [API Testing with Postman](./api-testing-guide.md) *(if exists)*

---

## 📞 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs`
2. **Verify health endpoints**: All should return 200 OK
3. **Check ports**: Ensure no conflicts with other services
4. **Review this guide**: Follow steps in exact order
5. **Clean start**: Use cleanup commands and rebuild

---

**🎉 Your Beckn Travel Discovery Platform is now ready for development and testing!**