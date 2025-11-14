Error Loading Results
Server error: Failed to process search request

Troubleshooting tips:

Ensure the BAP service is running on port 8081
Check that the ONIX adapter is running
Verify network connectivity
Try refreshing the pag#!/bin/bash

# Beckn Travel Discovery - Complete Startup Script
# This script starts all services with proper Node.js version handling

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Beckn Travel Discovery - Startup Script${NC}\n"

# Check if NVM is installed
if [ ! -f "$HOME/.nvm/nvm.sh" ]; then
    echo -e "${RED}✗ NVM not found. Please install NVM first:${NC}"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

# Source NVM
source ~/.nvm/nvm.sh

# Check Node version requirement
echo -e "${YELLOW}📋 Checking Node.js version...${NC}"
nvm use 22 || {
    echo -e "${YELLOW}Installing Node 22...${NC}"
    nvm install 22
    nvm use 22
}

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Using Node ${NODE_VERSION}${NC}\n"

# Kill any existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
pkill -f "node src/app.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment
sleep 1

# Start BAP Service
echo -e "${BLUE}📦 Starting BAP Service (port 8080)...${NC}"
cd bap-travel-discovery

# Install/update dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

npm start &
BAP_PID=$!
echo -e "${GREEN}✓ BAP started (PID: $BAP_PID)${NC}"

# Wait for BAP to be ready
echo -e "${YELLOW}⏳ Waiting for BAP to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ BAP is ready${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ BAP failed to start${NC}"
        kill $BAP_PID 2>/dev/null || true
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (port 3000)...${NC}"
cd frontend-travel-discovery

# Install/update dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}\n"

# Wait for frontend to be ready
echo -e "${YELLOW}⏳ Waiting for Frontend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is ready${NC}\n"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Frontend taking longer to start, continuing anyway...${NC}\n"
    fi
    echo -n "."
    sleep 1
done

# Display startup summary
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📋 Service URLs:${NC}"
echo -e "  ${GREEN}Frontend:${NC}     http://localhost:3000"
echo -e "  ${GREEN}BAP API:${NC}      http://localhost:8080"
echo -e "  ${GREEN}BAP Health:${NC}   http://localhost:8080/health"
echo -e "  ${GREEN}Beckn API:${NC}    http://localhost:8080/beckn/*\n"

echo -e "${BLUE}📊 Process Information:${NC}"
echo -e "  ${GREEN}BAP PID:${NC}      $BAP_PID"
echo -e "  ${GREEN}Frontend PID:${NC} $FRONTEND_PID"
echo -e "  ${GREEN}Node Version:${NC} $NODE_VERSION\n"

echo -e "${YELLOW}⚙️  To stop services:${NC}"
echo -e "  ${BLUE}kill $BAP_PID $FRONTEND_PID${NC}\n"

echo -e "${GREEN}✓ Ready to search for travel options!${NC}"
echo -e "${GREEN}✓ Open http://localhost:3000 in your browser${NC}\n"

# Keep script running
wait
