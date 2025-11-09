# Beckn-Based Travel Discovery Engine

This repository is the base setup for a **Beckn protocol–based travel discovery system**.  
It uses the open-source [Beckn-ONIX](https://github.com/Beckn-One/beckn-onix) framework as the Beckn adapter layer.

### Purpose
This project implements a **Single BAP – Multiple BPP** architecture for a unified travel discovery experience across:
- Flights  
- Hotels  
- Trains  

The `beckn-onix` folder contains the official open-source Beckn adapter that handles:
- Beckn message signing and verification  
- Routing between BAP and BPPs  
- Protocol compliance

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │◄──►│   Travel BAP    │◄──►│  Flights BPP    │    │   Hotels BPP    │
│   (Port 3000)   │    │   (Port 8080)   │    │  (Port 7001)    │    │  (Port 7003)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd beckn-travel-discovery
```

### 2. Start All Services
```bash
docker-compose up -d
```

### 3. Access Applications
- **Frontend**: http://localhost:3000
- **BAP API**: http://localhost:8080
- **Flights BPP**: http://localhost:7001  
- **Hotels BPP**: http://localhost:7003

## Testing

### Health Checks
```bash
curl http://localhost:8080/health   # BAP
curl http://localhost:7001/health   # Flights BPP
curl http://localhost:7003/health   # Hotels BPP
```

### Beckn Search Test
```bash
curl -X POST http://localhost:8080/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "domain": "mobility",
      "action": "search",
      "core_version": "1.1.0",
      "bap_id": "travel-discovery-bap.example.com",
      "bap_uri": "http://localhost:8080",
      "transaction_id": "test-txn-001",
      "message_id": "test-msg-001",
      "timestamp": "2024-11-10T10:00:00.000Z"
    },
    "message": {
      "intent": {
        "fulfillment": {
          "start": { "location": { "gps": "12.9716,77.5946" } },
          "end": { "location": { "gps": "19.0760,72.8777" } }
        }
      }
    }
  }'
```

## Project Structure

```
beckn-travel-discovery/
├── bap-travel-discovery/           # BAP (Aggregator service)
├── travel-discovery-bpp-flights/   # Flights provider
├── travel-discovery-bpp-hotels/    # Hotels provider
├── frontend-travel-discovery/      # React frontend
├── beckn-onix/                     # Beckn protocol engine (optional)
├── docker-compose.yml             # Development setup
└── DOCKER_SETUP_GUIDE.md         # Detailed setup guide
```

## � API Endpoints

### BAP Endpoints (Port 8080)
- `POST /beckn/search` - Search flights/hotels
- `POST /beckn/select` - Select item
- `POST /beckn/init` - Initialize booking
- `POST /beckn/confirm` - Confirm booking
- `GET /health` - Health check

### BPP Endpoints (Ports 7001, 7003)
- `POST /search` - Handle discovery
- `POST /select` - Handle selection
- `POST /init` - Handle initialization
- `POST /confirm` - Handle confirmation
- `GET /health` - Health check

## � Stop Services

```bash
docker-compose down
```

## 📄 License & Acknowledgment

This project uses the open-source [Beckn-ONIX](https://github.com/Beckn-One/beckn-onix) framework, licensed under the **MIT License**.  
All rights for the Beckn-ONIX code belong to the original authors.

Our travel discovery implementation is also licensed under MIT License - Uses open-source [Beckn Protocol](https://developers.becknprotocol.io/)

---

**For detailed setup instructions, see [DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)**