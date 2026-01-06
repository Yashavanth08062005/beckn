# 🎯 Experience BPP Setup Guide

## Overview
The Experience BPP (Beckn Provider Platform) handles tours, activities, and attractions. It works alongside the existing Flights and Hotels BPPs to provide a complete travel platform.

## 🗄️ Database Setup

### Step 1: Install PostgreSQL
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with password: `2005` (or remember your password)
3. Default port: `5432`

### Step 2: Create Databases
Open PostgreSQL (pgAdmin or psql) and run:

```sql
-- Create all required databases
CREATE DATABASE travel_discovery;     -- Main BAP database
CREATE DATABASE flights_bpp;          -- Flights BPP database  
CREATE DATABASE experience_bpp;       -- Experiences BPP database
CREATE DATABASE hotels_bpp;           -- Hotels BPP database (optional)
```

### Step 3: Setup Database Schemas
Run the SQL scripts in this order:

1. **Main Database (travel_discovery)**:
   ```bash
   psql -U postgres -d travel_discovery -f database/complete-setup-all-databases.sql
   ```

2. **Experience Database (experience_bpp)**:
   ```bash
   psql -U postgres -d experience_bpp -f database/experience.sql
   ```

## 🔧 Environment Configuration

### BAP Service (.env)
Create `bap-travel-discovery/.env`:
```env
NODE_ENV=development
PORT=8081
DB_NAME=travel_discovery
DB_PASSWORD=2005
EXPERIENCES_BPP_URL=http://localhost:7004
FLIGHTS_BPP_URL=http://localhost:7001
FLIGHTS_INTL_BPP_URL=http://localhost:7005
HOTELS_BPP_URL=http://localhost:7003
```

### Experiences BPP (.env)
Create `travel-discovery-bpp-experiences/.env`:
```env
PORT=7004
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=experience_bpp
DB_USER=postgres
DB_PASSWORD=2005
BPP_ID=experiences-bpp.example.com
BPP_URI=http://localhost:7004
```

### Flights BPP (.env)
Create `travel-discovery-bpp-flights/.env`:
```env
PORT=7001
DB_NAME=flights_bpp
DB_PASSWORD=2005
```

## 🚀 Starting Services

### Option 1: Automated Script
```bash
# Run the startup script
scripts/start-all-services.bat
```

This opens 6 terminal windows:
- BAP Service (Port 8081)
- Flights BPP (Port 7001)
- International Flights BPP (Port 7005)
- Hotels BPP (Port 7003)
- **Experiences BPP (Port 7004)**
- Frontend (Port 3000)

### Option 2: Manual Start
Open separate terminals for each:

```bash
# Terminal 1 - BAP Service
cd bap-travel-discovery
npm start

# Terminal 2 - Flights BPP
cd travel-discovery-bpp-flights
npm start

# Terminal 3 - International Flights BPP
cd travel-discovery-bpp-international-flights
npm start

# Terminal 4 - Hotels BPP
cd travel-discovery-bpp-hotels
npm start

# Terminal 5 - Experiences BPP
cd travel-discovery-bpp-experiences
npm start

# Terminal 6 - Frontend
cd frontend-travel-discovery
npm run dev
```

## ✅ Verification

### Health Checks
- **Frontend**: http://localhost:3000
- **BAP API**: http://localhost:8081/health
- **Flights BPP**: http://localhost:7001/health
- **Experiences BPP**: http://localhost:7004/health
- **Hotels BPP**: http://localhost:7003/health

### Test Experience Search
1. Go to http://localhost:3000
2. Select "Experience" mode (if available in frontend)
3. Search for experiences in "Mumbai" or "Bangalore"
4. You should see tours, food walks, and activities

### API Test
```bash
curl -X POST http://localhost:8081/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {"action": "search"},
    "message": {
      "intent": {
        "category": {"id": "EXPERIENCE"},
        "fulfillment": {
          "start": {"location": {"gps": "18.9322,72.8264"}},
          "end": {"location": {"gps": "18.9322,72.8264"}}
        }
      }
    }
  }'
```

## 📊 Sample Experience Data

The database includes:

### Mumbai Experiences
- **Heritage Walk** - Fort District (₹1,200, 3 hours)
- **Street Food Tour** - Mohammed Ali Road (₹1,800, 4 hours)

### Bangalore Experiences  
- **Tech City Tour** - Electronic City (₹1,500, 4 hours)

### Delhi Experiences
- **Old Delhi Heritage Walk** - Chandni Chowk (₹1,000, 4 hours)

### Goa Experiences
- **Beach Hopping Adventure** - North Goa (₹3,500, 8 hours)

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -l

# Verify experience_bpp database exists
psql -U postgres -c "\l" | grep experience_bpp

# Check tables in experience_bpp
psql -U postgres -d experience_bpp -c "\dt"
```

### Port Conflicts
```bash
# Check if port 7004 is in use
netstat -ano | findstr :7004

# Kill process if needed
taskkill /PID <PID> /F
```

### No Experience Results
```bash
# Verify experiences in database
psql -U postgres -d experience_bpp -c "SELECT COUNT(*) FROM experiences WHERE status='ACTIVE';"

# Check BPP logs for errors
# Look at the Experiences BPP terminal window
```

## 🎯 Experience Categories

The system supports:
- **TOUR** - City tours, heritage walks, tech tours
- **FOOD** - Street food tours, brewery hopping, culinary trails
- **ATTRACTION** - Museums, temples, historical sites
- **ADVENTURE** - Water sports, trekking, beach activities
- **CULTURAL** - Religious tours, traditional experiences
- **ACTIVITY** - Workshops, classes, interactive experiences

## 🔄 Integration Flow

1. **Frontend** sends search request to **BAP** (Port 8081)
2. **BAP** determines category is "EXPERIENCE"
3. **BAP** forwards request to **Experiences BPP** (Port 7004)
4. **Experiences BPP** queries PostgreSQL `experience_bpp` database
5. **Experiences BPP** returns formatted results to **BAP**
6. **BAP** aggregates and returns to **Frontend**

## 📝 Next Steps

1. **Frontend Integration**: Update frontend to support experience search
2. **More Data**: Add more cities and experience types
3. **Booking Flow**: Test complete booking process
4. **Reviews**: Implement review and rating system
5. **Images**: Add experience photos and galleries

The Experience BPP is now fully integrated with your Beckn travel platform! 🎉