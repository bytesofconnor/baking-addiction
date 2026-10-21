#!/usr/bin/env bash
set -euo pipefail

# Health check for verification stack
# Usage: ./scripts/verify/doctor.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "🩺 Running health checks..."
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Check Vite
echo -n "Vite (http://localhost:4821): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4821 | grep -q "200"; then
  echo "✅ OK"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "❌ FAIL"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check Convex
echo -n "Convex (http://127.0.0.1:3210): "
if curl -s http://127.0.0.1:3210 > /dev/null 2>&1; then
  echo "✅ OK"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "❌ FAIL"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check for seed data
echo -n "Seed data (home page renders): "
SEED_CHECK=$(curl -s http://localhost:4821 | grep -o "recipe\|bake" | head -1 || echo "")
if [ -n "$SEED_CHECK" ]; then
  echo "✅ OK"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "⚠️  WARNING (home page may be empty)"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Check test auth bypass
echo -n "Test auth bypass: "
if [ -f .env.local ] && grep -q "VITE_TEST_AUTH_BYPASS=true" .env.local; then
  echo "✅ ENABLED"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo "⚠️  NOT ENABLED (admin tests will be skipped)"
fi

echo ""
echo "📊 Results: $CHECKS_PASSED passed, $CHECKS_FAILED failed"

if [ $CHECKS_FAILED -gt 0 ]; then
  echo ""
  echo "💡 To fix:"
  echo "   - Ensure both servers are running: ./scripts/verify/launch.sh"
  echo "   - For admin tests, add VITE_TEST_AUTH_BYPASS=true to .env.local"
  exit 1
fi

echo ""
echo "🎉 All checks passed! Stack is healthy."
