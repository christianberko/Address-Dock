#!/bin/bash

# Build and deployment script
# Runs  steps in order, stops if any step fails

set -e  # Exit immediately if any command fails

# Configuration - change these if needed
IMAGE_NAME="address-dock"
CONTAINER_NAME="address-dock"
PORT=4900

echo "========================================="
echo "Starting Build Pipeline"
echo "========================================="
echo ""

#  Static Analysis - Check TypeScript for errors
echo "[Step 1/8] Running static analysis (checking for TypeScript errors)..."
npx tsc --noEmit
echo "Static analysis passed!"
echo ""

# Run Unit Tests - Run all tests
echo "[Step 2/8] Running unit tests..."
npm test
echo "All tests passed!"
echo ""

# Build Code 
echo "[Step 3/8] Building TypeScript code..."
npm run build
echo "Build successful!"
echo ""

# Build Docker Image - Create Docker container image
echo "[Step 4/8] Building Docker image..."
docker build -t "$IMAGE_NAME:latest" .
echo "Docker image built!"
echo ""

# Stop Old Container - Remove old container if it exists
echo "[Step 5/8] Stopping old container (if running)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || echo "No old container found"
echo ""

# Start New Container - Run the new Docker container
echo "[Step 6/8] Starting new container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:$PORT" \
    -e SERVER_PORT=$PORT \
    -e ENV=production \
    "$IMAGE_NAME:latest"
echo "Container started!"
echo ""

# Health Check - Verify server is responding
echo "[Step 7/8] Running health check..."
./health-check.sh $PORT
echo "Health check passed!"
echo ""

# Profiling - Monitor CPU and Memory usage
echo "[Step 8/8] Running profiling analysis..."
echo ""
./profile.sh "$CONTAINER_NAME" 10
echo ""

# Success message
echo "========================================="
echo "Build Pipeline Complete!"
echo "========================================="
echo ""
echo "Container name: $CONTAINER_NAME"
echo "Image name: $IMAGE_NAME:latest"
echo "Server running on: http://localhost:$PORT"
echo "Health check: http://localhost:$PORT/health"

