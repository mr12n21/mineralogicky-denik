#!/bin/bash

# Production Deployment Script for Raspberry Pi
# ==============================================

set -e  # Exit on error

echo "🚀 Mineralogický deník - Production Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: This doesn't appear to be a Raspberry Pi${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose plugin: sudo apt install docker-compose-plugin"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found${NC}"
    echo "Please create .env.production from template and configure it"
    exit 1
fi

echo -e "${GREEN}✓ .env.production found${NC}"

# Check if secrets directory exists
if [ ! -d secrets ]; then
    echo "📁 Creating secrets directory..."
    mkdir -p secrets
fi

# Check for Portainer password
if [ ! -f secrets/portainer_password.txt ]; then
    echo -e "${YELLOW}⚠️  Portainer password file not found${NC}"
    echo "Creating default password (please change after first login)"
    echo '$2y$05$example.hash.change.after.first.login' > secrets/portainer_password.txt
    chmod 600 secrets/portainer_password.txt
fi

echo -e "${GREEN}✓ Secrets directory configured${NC}"
echo ""

# Validate critical environment variables
echo "🔍 Validating environment configuration..."
source .env.production

if [ "$DB_PASSWORD" == "changeme123" ] || [ "$SECRET_KEY" == "your-secret-key-change-in-production" ]; then
    echo -e "${RED}❌ Default passwords detected in .env.production${NC}"
    echo "Please change DB_PASSWORD and SECRET_KEY before deploying to production"
    exit 1
fi

echo -e "${GREEN}✓ Environment validation passed${NC}"
echo ""

# Ask for confirmation
echo "📋 Deployment Summary:"
echo "  - Docker Compose file: docker-compose.production.yml"
echo "  - Environment: .env.production"
echo "  - Services: Backend, Frontend, Database, Keycloak, Caddy, Portainer, Backup"
echo ""
read -p "🚀 Ready to deploy? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Stop any running containers
echo ""
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.production.yml down || true

# Pull latest images
echo ""
echo "📥 Pulling latest Docker images..."
docker compose -f docker-compose.production.yml pull

# Build custom images
echo ""
echo "🔨 Building application images..."
docker compose -f docker-compose.production.yml build --no-cache

# Start services
echo ""
echo "🚀 Starting services..."
docker compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.production.yml ps

# Check if all services are running
RUNNING=$(docker compose -f docker-compose.production.yml ps --services --filter "status=running" | wc -l)
TOTAL=$(docker compose -f docker-compose.production.yml ps --services | wc -l)

echo ""
if [ $RUNNING -eq $TOTAL ]; then
    echo -e "${GREEN}✅ All services are running successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may not be running. Check logs:${NC}"
    echo "   docker compose -f docker-compose.production.yml logs"
fi

# Print access information
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Access Points:"
echo "  🌐 Frontend:    https://${KEYCLOAK_HOSTNAME}/"
echo "  🔌 Backend API: https://${KEYCLOAK_HOSTNAME}/api"
echo "  📚 API Docs:    https://${KEYCLOAK_HOSTNAME}/api/docs"
echo "  🔐 Keycloak:    https://${KEYCLOAK_HOSTNAME}:8080 (admin: ${KEYCLOAK_ADMIN})"
echo "  🐳 Portainer:   https://${KEYCLOAK_HOSTNAME}:9443"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure Keycloak realm and client"
echo "  2. Create admin user in Keycloak"
echo "  3. Access Portainer for container management"
echo "  4. Monitor logs: docker compose -f docker-compose.production.yml logs -f"
echo ""
echo "📖 Full documentation: PRODUCTION_SETUP.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
