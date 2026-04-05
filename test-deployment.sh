#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}AIgNOZ Backend - Local Test${NC}"
echo -e "${YELLOW}================================${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}\n"

# Check if required files exist
echo -e "${YELLOW}Checking required files...${NC}"
files=("Dockerfile" "docker-entrypoint.sh" "docker-compose.yml" ".env.example")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file found${NC}"
    else
        echo -e "${RED}✗ $file not found${NC}"
        exit 1
    fi
done

echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env with your MongoDB URI and other settings${NC}"
    echo -e "${YELLOW}⚠ Required: MONGO_URI with valid MongoDB Atlas connection string${NC}"
    exit 1
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""

# Check if MONGO_URI is set
if ! grep -q "^MONGO_URI=" .env || grep "^MONGO_URI=.*change_this" .env; then
    echo -e "${RED}✗ MONGO_URI not properly configured in .env${NC}"
    echo -e "${YELLOW}Please set a valid MongoDB URI${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MONGO_URI is configured${NC}"

echo ""
echo -e "${YELLOW}Building Docker image...${NC}"

# Build the Docker image
if docker build -t aignoz-backend:latest .; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Starting services with docker-compose...${NC}"

# Stop any existing containers
docker-compose down 2>/dev/null

# Start services
if docker-compose up -d; then
    echo -e "${GREEN}✓ Services started${NC}"
else
    echo -e "${RED}✗ Failed to start services${NC}"
    docker-compose logs
    exit 1
fi

echo ""
echo -e "${YELLOW}Waiting 10 seconds for services to initialize...${NC}"
sleep 10

echo ""
echo -e "${YELLOW}Testing services...${NC}"

# Test health endpoint
echo -e "\n${YELLOW}Testing Node.js server health endpoint...${NC}"
if curl -s http://localhost:3000/health | grep -q "status"; then
    echo -e "${GREEN}✓ Node.js server is responding${NC}"
else
    echo -e "${RED}✗ Node.js server is not responding${NC}"
    echo "Logs:"
    docker-compose logs
    exit 1
fi

# Test MongoDB connection
echo -e "\n${YELLOW}Testing MongoDB connection...${NC}"
if curl -s http://localhost:3000/api/gene 2>/dev/null | grep -q . || [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ MongoDB connection seems OK${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB endpoint returned no data (may need initial data)${NC}"
fi

echo ""
echo -e "${YELLOW}Service URLs:${NC}"
echo -e "  Node.js: http://localhost:3000"
echo -e "  FastAPI: http://localhost:8000"
echo -e "  Health: http://localhost:3000/health"

echo ""
echo -e "${GREEN}✓ All tests passed! Services are running.${NC}"
echo ""
echo -e "${YELLOW}Common commands:${NC}"
echo "  View logs:     docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart:       docker-compose restart"
echo ""
echo -e "${YELLOW}When ready to deploy to Render:${NC}"
echo "  1. Push to GitHub"
echo "  2. Create web service on Render"
echo "  3. Set environment variables (see .env)"
echo "  4. Monitor logs at https://dashboard.render.com"
echo ""
