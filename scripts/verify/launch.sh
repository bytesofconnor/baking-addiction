#!/usr/bin/env bash
set -euo pipefail

# Start Convex and Vite for verification
# Usage: ./scripts/verify/launch.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "🔍 Setting up local anonymous Convex backend..."

# Create .env.local WITHOUT CONVEX_DEPLOYMENT to trigger anonymous mode
cat > .env.local << 'EOF'
# Local anonymous Convex backend for verification (no CONVEX_DEPLOYMENT = anonymous mode)
VITE_CONVEX_URL=http://127.0.0.1:3210
VITE_CONVEX_SITE_URL=http://127.0.0.1:3211
VITE_TEST_AUTH_BYPASS=true
EOF

echo "✅ Created .env.local for anonymous Convex (no login required)"

echo ""
echo "🚀 Starting anonymous Convex dev server..."

# Export backend env vars so Convex process inherits them
export TEST_AUTH_BYPASS=true
export WRITER_PASSWORD="test-writer-pw"
export SITE_URL="http://localhost:4821"

# Start Convex dev - will run in anonymous mode without CONVEX_DEPLOYMENT
npx convex dev > /tmp/verify-convex.log 2>&1 &
CONVEX_PID=$!
echo $CONVEX_PID > /tmp/verify-convex.pid
echo "   PID: $CONVEX_PID"
echo "   Logs: /tmp/verify-convex.log"
echo "   Backend env: TEST_AUTH_BYPASS=true, WRITER_PASSWORD=***, SITE_URL=$SITE_URL"

echo "⏳ Waiting for Convex to be ready (this may take 10-15 seconds)..."
sleep 15

MAX_WAIT=45
WAITED=0
until curl -s http://127.0.0.1:3210 > /dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "❌ Convex did not start within ${MAX_WAIT}s"
    echo "   Last 30 lines of logs:"
    tail -30 /tmp/verify-convex.log
    kill $CONVEX_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

echo "✅ Convex is ready at http://127.0.0.1:3210"

# Wait a bit more for Convex to be fully initialized
sleep 3

echo ""
echo "🌱 Seeding sample data..."
npx convex run seed:ensureSamples 2>&1 || {
  echo "⚠️  Seed failed, retrying in 5s..."
  sleep 5
  npx convex run seed:ensureSamples
}

echo ""
echo "🚀 Starting Vite dev server..."

npm run dev > /tmp/verify-vite.log 2>&1 &
VITE_PID=$!
echo $VITE_PID > /tmp/verify-vite.pid
echo "   PID: $VITE_PID"
echo "   Logs: /tmp/verify-vite.log"

echo "⏳ Waiting for Vite to be ready..."

MAX_WAIT=30
WAITED=0
until curl -s http://localhost:4821 > /dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "❌ Vite did not start within ${MAX_WAIT}s"
    echo "   Check logs: tail -f /tmp/verify-vite.log"
    kill $VITE_PID 2>/dev/null || true
    kill $CONVEX_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

echo "✅ Vite is ready at http://localhost:4821"
echo ""
echo "🎉 Verification stack is running!"
echo ""
echo "📋 Next steps:"
echo "   1. Run doctor: ./scripts/verify/doctor.sh"
echo "   2. Run tests: npx playwright test tests/verify/"
echo "   3. Cleanup: ./scripts/verify/cleanup.sh"
