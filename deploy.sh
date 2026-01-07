#!/bin/bash
# PEPO Deployment Script
# Handles building, testing, and deploying all applications

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
REGISTRY=${2:-docker.io}
PUSH_IMAGES=${3:-false}

echo -e "${YELLOW}🚀 PEPO Deployment Script${NC}"
echo "Environment: $ENVIRONMENT"
echo "Registry: $REGISTRY"
echo ""

# Functions
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}✗ $1 is not installed${NC}"
    exit 1
  fi
}

print_step() {
  echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Check required commands
print_step "Checking prerequisites..."
check_command node
check_command npm
check_command docker
print_success "All prerequisites installed"
echo ""

# Install dependencies
print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"
echo ""

# Run tests
print_step "Running tests..."
npm run test || {
  print_error "Tests failed"
  exit 1
}
print_success "All tests passed"
echo ""

# Run linting
print_step "Running linter..."
npm run lint || {
  print_error "Linting failed"
  exit 1
}
print_success "Linting passed"
echo ""

# Build applications
print_step "Building applications..."
npm run build || {
  print_error "Build failed"
  exit 1
}
print_success "All applications built successfully"
echo ""

# Build Docker images
print_step "Building Docker images..."

docker build -f apps/admin/Dockerfile -t ${REGISTRY}/pepo-admin:${ENVIRONMENT} -t ${REGISTRY}/pepo-admin:latest . || {
  print_error "Admin image build failed"
  exit 1
}
print_success "Admin image built"

docker build -f backend/Dockerfile -t ${REGISTRY}/pepo-backend:${ENVIRONMENT} -t ${REGISTRY}/pepo-backend:latest . || {
  print_error "Backend image build failed"
  exit 1
}
print_success "Backend image built"
echo ""

# Push images if requested
if [ "$PUSH_IMAGES" = "true" ]; then
  print_step "Pushing images to registry..."
  docker push ${REGISTRY}/pepo-admin:${ENVIRONMENT}
  docker push ${REGISTRY}/pepo-admin:latest
  docker push ${REGISTRY}/pepo-backend:${ENVIRONMENT}
  docker push ${REGISTRY}/pepo-backend:latest
  print_success "Images pushed to registry"
  echo ""
fi

# Summary
echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║  🎉 Deployment Preparation Complete! ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy Docker images:"
echo "   - Admin:  ${REGISTRY}/pepo-admin:${ENVIRONMENT}"
echo "   - Backend: ${REGISTRY}/pepo-backend:${ENVIRONMENT}"
echo ""
echo "2. Run migrations:"
echo "   npm run db:migrate --workspace=backend"
echo ""
echo "3. Verify health:"
echo "   curl http://your-api-url/health"
echo ""
echo "For more information, see TESTING_AND_DEPLOYMENT.md"
