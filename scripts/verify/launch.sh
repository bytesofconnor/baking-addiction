#!/usr/bin/env bash
set -euo pipefail

# Start Convex and Vite for verification with deterministic port allocation
# Usage: ./scripts/verify/launch.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

# Function to find a free port
find_free_port() {
  local START_PORT=$1
  local MAX_ATTEMPTS=20
  for ((i=0; i<MAX_ATTEMPTS; i++)); do
    local PORT=$((START_PORT + i))
    # Check if port is in use using lsof or /proc
    if command -v lsof >/dev/null 2>&1; then
      if ! lsof -i:$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo $PORT
        return 0
      fi
    elif [ -d /proc/net ]; then
      # Fallback: check if anything is listening on the port
      local HEX_PORT=$(printf '%04X' $PORT)
      if ! grep -q ":$HEX_PORT" /proc/net/tcp /proc/net/tcp6 2>/dev/null; then
        echo $PORT
        return 0
      fi
    else
      # Last resort: just try the port
      echo $PORT
      return 0
    fi
  done
  echo "Error: Could not find free port starting from $START_PORT" >&2
  return 1
}

# Function to wait for HTTP endpoint with real readiness check
wait_for_http() {
  local URL=$1
  local NAME=$2
  local MAX_WAIT=${3:-60}
  local WAITED=0
  
  echo "⏳ Waiting for $NAME to be ready at $URL (max ${MAX_WAIT}s)..."
  
  while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -sf "$URL" > /dev/null 2>&1; then
      echo "✅ $NAME is ready at $URL"
      return 0
    fi
    sleep 1
    WAITED=$((WAITED + 1))
  done
  
  echo "❌ $NAME did not respond within ${MAX_WAIT}s" >&2
  return 1
}

# Function to wait for Convex readiness with log check
wait_for_convex() {
  local CONVEX_URL=$1
  local MAX_WAIT=${2:-120}
  local WAITED=0
  
  echo "⏳ Waiting for Convex to be ready (this takes ~20-30s for first push)..."
  
  # Wait for the "Convex functions ready!" message in logs
  while [ $WAITED -lt $MAX_WAIT ]; do
    if grep -q "Convex functions ready!" /tmp/verify-convex.log 2>/dev/null; then
      echo "✅ Convex functions are deployed and ready"
      # Give a moment for HTTP endpoint to be available
      sleep 2
      return 0
    fi
    sleep 1
    WAITED=$((WAITED + 1))
  done
  
  echo "❌ Convex did not complete deployment within ${MAX_WAIT}s" >&2
  return 1
}

# Check if already running
if [ -f /tmp/verify-convex.pid ] || [ -f /tmp/verify-vite.pid ]; then
  echo "⚠️  Verification stack may already be running"
  echo "   Run ./scripts/verify/cleanup.sh first to stop existing processes"
  exit 1
fi

# Allocate ports
CONVEX_PORT=$(find_free_port 3210)
CONVEX_SITE_PORT=$(find_free_port 3211)
VITE_PORT=$(find_free_port 4821)

echo "🔍 Setting up local anonymous Convex backend..."
echo "   Allocated ports: Convex=$CONVEX_PORT, ConvexSite=$CONVEX_SITE_PORT, Vite=$VITE_PORT"

# Create .env.local for anonymous Convex mode
cat > .env.local << EOF
# Local anonymous Convex backend for verification
VITE_CONVEX_URL=http://127.0.0.1:${CONVEX_PORT}
VITE_TEST_AUTH_BYPASS=true
SITE_URL=http://localhost:${VITE_PORT}
EOF

echo "✅ Created .env.local for anonymous Convex"

# Export environment variables for Convex backend
export SITE_URL="http://localhost:${VITE_PORT}"

echo ""
echo "🚀 Starting Convex dev server (anonymous mode)..."

# Remove any existing .convex config to ensure anonymous mode
rm -rf .convex

# Start Convex dev server - will create anonymous deployment automatically
npx convex dev > /tmp/verify-convex.log 2>&1 &
CONVEX_PID=$!
echo $CONVEX_PID > /tmp/verify-convex.pid
echo "   PID: $CONVEX_PID"
echo "   Logs: /tmp/verify-convex.log"
echo "   Mode: anonymous (auto-created)"

# Wait for Convex with real readiness check
if ! wait_for_convex "http://127.0.0.1:${CONVEX_PORT}"; then
  echo "   Last 30 lines of Convex logs:"
  tail -30 /tmp/verify-convex.log
  kill $CONVEX_PID 2>/dev/null || true
  rm -f /tmp/verify-convex.pid
  exit 1
fi

echo ""
echo "🌱 Seeding sample data..."
# Retry seed up to 3 times with exponential backoff
SEED_ATTEMPTS=0
SEED_MAX=3
until npx convex run seed:ensureSamples 2>&1; do
  SEED_ATTEMPTS=$((SEED_ATTEMPTS + 1))
  if [ $SEED_ATTEMPTS -ge $SEED_MAX ]; then
    echo "❌ Seed failed after $SEED_MAX attempts"
    kill $CONVEX_PID 2>/dev/null || true
    rm -f /tmp/verify-convex.pid
    exit 1
  fi
  WAIT_TIME=$((2 ** SEED_ATTEMPTS))
  echo "⚠️  Seed attempt $SEED_ATTEMPTS failed, retrying in ${WAIT_TIME}s..."
  sleep $WAIT_TIME
done

echo ""
echo "🚀 Starting Vite dev server..."

# Start Vite with the allocated port
PORT=$VITE_PORT npm run dev > /tmp/verify-vite.log 2>&1 &
VITE_PID=$!
echo $VITE_PID > /tmp/verify-vite.pid
echo "   PID: $VITE_PID"
echo "   Logs: /tmp/verify-vite.log"

# Wait for Vite with real readiness check
if ! wait_for_http "http://localhost:${VITE_PORT}" "Vite" 60; then
  echo "   Last 30 lines of Vite logs:"
  tail -30 /tmp/verify-vite.log
  kill $VITE_PID 2>/dev/null || true
  kill $CONVEX_PID 2>/dev/null || true
  rm -f /tmp/verify-vite.pid /tmp/verify-convex.pid
  exit 1
fi

# Write port information for other scripts to use
cat > /tmp/verify-ports.env << EOF
CONVEX_PORT=${CONVEX_PORT}
VITE_PORT=${VITE_PORT}
EOF

echo ""
echo "🎉 Verification stack is running!"
echo ""
echo "📋 Service URLs:"
echo "   Vite:   http://localhost:${VITE_PORT}"
echo "   Convex: http://127.0.0.1:${CONVEX_PORT}"
echo ""
echo "📋 Next steps:"
echo "   1. Run doctor: ./scripts/verify/doctor.sh"
echo "   2. Run tests: npx playwright test tests/verify/"
echo "   3. Cleanup: ./scripts/verify/cleanup.sh"
