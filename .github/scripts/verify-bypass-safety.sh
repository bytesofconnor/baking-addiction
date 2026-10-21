#!/usr/bin/env bash
set -euo pipefail

# Verify test auth bypass cannot ship to production
# This script ensures the bypass is dev-only and stripped from prod builds

echo "🔒 Verifying test auth bypass cannot ship to production..."
echo ""

cd "$(dirname "$0")/../.."

# Build with VITE_TEST_AUTH_BYPASS intentionally set
echo "Building with VITE_TEST_AUTH_BYPASS=true..."
VITE_TEST_AUTH_BYPASS=true VITE_CONVEX_URL=https://preview-only.convex.cloud npm run build > /tmp/build.log 2>&1

echo "✓ Build completed"
echo ""

# Search for bypass-related strings in dist/
echo "Searching for bypass strings in dist/..."

BYPASS_FOUND=0

# Check for test user/kitchen IDs (these would only exist if bypass leaked)
if grep -r "test-user-id\|test-kitchen-id" dist/ 2>/dev/null; then
  echo "❌ FAIL: Found test user/kitchen IDs in production build"
  BYPASS_FOUND=1
fi

# Check for VITE_TEST_AUTH_BYPASS env var name
if grep -r "VITE_TEST_AUTH_BYPASS" dist/ 2>/dev/null; then
  echo "❌ FAIL: Found VITE_TEST_AUTH_BYPASS in production build"
  BYPASS_FOUND=1
fi

# Check for testAuthBypass variable name
if grep -r "testAuthBypass" dist/ 2>/dev/null; then
  echo "❌ FAIL: Found testAuthBypass variable in production build"
  BYPASS_FOUND=1
fi

if [ $BYPASS_FOUND -eq 0 ]; then
  echo "✓ No bypass strings found in dist/"
  echo ""
  echo "✅ Test auth bypass is dev-only and cannot ship to production"
  echo ""
  echo "Guards verified:"
  echo "  • import.meta.env.DEV is false after vite build"
  echo "  • Bypass condition fails in production builds"
  echo "  • Test user/kitchen mocks are stripped"
  exit 0
else
  echo ""
  echo "❌ FAIL: Test auth bypass leaked into production build"
  echo ""
  echo "This means the bypass guard is broken. Check src/lib/family.tsx"
  exit 1
fi
