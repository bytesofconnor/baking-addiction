#!/usr/bin/env bash
set -euo pipefail

# Start Convex and Vite for verification
# Usage: ./scripts/verify/launch.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "🔍 Checking local Convex configuration..."

if [ ! -f .env.local ]; then
  echo "❌ .env.local not found. Run 'npx convex dev' first to generate it."
  exit 1
fi

if ! grep -q "CONVEX_DEPLOYMENT=dev:anonymous" .env.local; then
  echo "❌ .env.local is not configured for local development."
  echo "   Expected CONVEX_DEPLOYMENT=dev:anonymous-*"
  echo "   Never run verification against production."
  exit 1
fi

echo "✅ Convex is configured for local development"

echo ""
echo "🚀 Starting Convex dev server..."

npx convex dev > /tmp/verify-convex.log 2>&1 &
CONVEX_PID=$!
echo $CONVEX_PID > /tmp/verify-convex.pid
echo "   PID: $CONVEX_PID"
echo "   Logs: /tmp/verify-convex.log"

echo "⏳ Waiting for Convex to be ready..."
sleep 5

MAX_WAIT=30
WAITED=0
until curl -s http://127.0.0.1:3210 > /dev/null 2>&1; do
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "❌ Convex did not start within ${MAX_WAIT}s"
    echo "   Check logs: tail -f /tmp/verify-convex.log"
    kill $CONVEX_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

echo "✅ Convex is ready at http://127.0.0.1:3210"

echo ""
echo "🌱 Seeding sample data..."
npx convex run seed:ensureSamples

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
