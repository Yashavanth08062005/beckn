#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Beckn Travel Discovery - Service Health Check${NC}\n"

# Function to check if a service is running
check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    echo -n "Checking $name on port $port... "
    
    if nc -z localhost $port 2>/dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        
        if [ "$response" == "200" ] || [ "$response" == "404" ]; then
            echo -e "${GREEN}✓ Running${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Port open but health check returned $response${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Check each service
services_ok=true

if ! check_service "ONIX Adapter" "http://localhost:5000/health" "5000"; then
    services_ok=false
fi

if ! check_service "BAP Service" "http://localhost:8080/health" "8080"; then
    services_ok=false
fi

if ! check_service "Frontend" "http://localhost:3000" "3000"; then
    services_ok=false
fi

echo ""

if [ "$services_ok" = true ]; then
    echo -e "${GREEN}✓ All services are running!${NC}\n"
    
    echo "📋 Service URLs:"
    echo "  Frontend:    http://localhost:3000"
    echo "  BAP API:     http://localhost:8080"
    echo "  ONIX:        http://localhost:5000"
    echo ""
    echo -e "${GREEN}Ready to search for travel options!${NC}"
    
else
    echo -e "${RED}✗ Some services are not running${NC}\n"
    
    echo "📋 To start services, run in separate terminals:"
    echo ""
    echo -e "${YELLOW}Terminal 1 - ONIX Adapter:${NC}"
    echo "  cd beckn-onix/install"
    echo "  docker-compose -f docker-compose.yml up"
    echo ""
    echo -e "${YELLOW}Terminal 2 - BAP Service:${NC}"
    echo "  cd bap-travel-discovery"
    echo "  npm install"
    echo "  npm start"
    echo ""
    echo -e "${YELLOW}Terminal 3 - Frontend:${NC}"
    echo "  cd frontend-travel-discovery"
    echo "  npm install"
    echo "  npm run dev"
    echo ""
    
fi

# Check environment variables
echo ""
echo -e "${BLUE}🔧 Environment Configuration${NC}"
echo "  ONIX_URL:   ${ONIX_URL:-http://localhost:5000}"
echo "  BAP_ID:     ${BAP_ID:-travel-discovery-bap.example.com}"
echo "  BAP_URI:    ${BAP_URI:-http://localhost:8080}"
echo "  PORT:       ${PORT:-8080}"
