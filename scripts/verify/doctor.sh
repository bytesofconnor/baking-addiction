#!/usr/bin/env bash
set -euo pipefail

# Health check for verification stack
# Usage: ./scripts/verify/doctor.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

# Load port configuration
if [ -f /tmp/verify-ports.env ]; then
  source /tmp/verify-ports.env
else
  # Fallback to default ports
  CONVEX_PORT=3210
  VITE_PORT=4821
fi

echo "🩺 Running health checks..."
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Check if PIDs exist and processes are running
echo -n "Process status: "
if [ -f /tmp/verify-convex.pid ] && [ -f /tmp/verify-vite.pid ]; then
  CONVEX_PID=$(cat /tmp/verify-convex.pid)
  VITE_PID=$(cat /tmp/verify-vite.pid)
  
  if ps -p $CONVEX_PID > /dev/null 2>&1 && ps -p $VITE_PID > /dev/null 2>&1; then
    echo "✅ Both processes running (Convex: $CONVEX_PID, Vite: $VITE_PID)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo "❌ FAIL (one or more processes not running)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
  fi
else
  echo "❌ FAIL (PID files not found)"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check Vite HTTP endpoint
echo -n "Vite (http://localhost:${VITE_PORT}): "
if curl -sf -o /dev/null -w "%{http_code}" http://localhost:${VITE_PORT} | grep -q "200"; then
  echo "✅ OK"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "❌ FAIL"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check Convex HTTP endpoint
echo -n "Convex (http://127.0.0.1:${CONVEX_PORT}): "
if curl -sf http://127.0.0.1:${CONVEX_PORT} > /dev/null 2>&1; then
  echo "✅ OK"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "❌ FAIL"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check for seed data with real Convex query
echo -n "Seed data (recipes in database): "
if RECIPE_COUNT=$(npx convex run seed:countBakes 2>&1 | tail -1); then
  if [ "$RECIPE_COUNT" -gt 0 ] 2>/dev/null; then
    echo "✅ OK ($RECIPE_COUNT recipes)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo "⚠️  No recipes found (seed may have failed)"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
  fi
else
  echo "⚠️  Could not query database"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check home page renders
echo -n "Home page renders: "
HOME_PAGE=$(curl -sf http://localhost:${VITE_PORT} 2>/dev/null || echo "")
if echo "$HOME_PAGE" | grep -q "recipe\|bake\|Recipe\|Book"; then
  echo "✅ OK"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "⚠️  WARNING (unexpected content)"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check test auth bypass
echo -n "Test auth bypass: "
if [ -f .env.local ] && grep -q "VITE_TEST_AUTH_BYPASS=true" .env.local; then
  echo "✅ ENABLED"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "⚠️  NOT ENABLED (admin tests will be skipped)"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

echo ""
echo "📊 Results: $CHECKS_PASSED passed, $CHECKS_FAILED failed"

if [ $CHECKS_FAILED -gt 0 ]; then
  echo ""
  echo "💡 To fix:"
  echo "   - Ensure both servers are running: ./scripts/verify/launch.sh"
  echo "   - Check logs: tail -f /tmp/verify-convex.log /tmp/verify-vite.log"
  exit 1
fi

echo ""
echo "🎉 All checks passed! Stack is healthy."
