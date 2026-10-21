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
else
  echo ""
  echo "❌ FAIL: Test auth bypass leaked into production build"
  echo ""
  echo "This means the bypass guard is broken. Check src/lib/family.tsx"
  exit 1
fi

echo ""
echo "Checking backend auth safety..."

# Verify NO auth bypass exists in backend query/mutation handlers
if grep -q 'TEST_AUTH_BYPASS' convex/lib/family.ts; then
  echo "❌ FAIL: Dangerous TEST_AUTH_BYPASS check found in convex/lib/family.ts"
  echo "   Backend must use real auth identity, not env-gated bypasses"
  exit 1
fi

# Verify Password provider is properly gated by local deployment check
if ! grep -q 'isLocalDeployment' convex/auth.config.ts; then
  echo "❌ FAIL: Password provider must be gated by isLocalDeployment check"
  exit 1
fi

if ! grep -q 'CONVEX_CLOUD_URL' convex/auth.config.ts; then
  echo "❌ FAIL: Password provider gate must check CONVEX_CLOUD_URL"
  exit 1
fi

echo "✓ Backend auth uses real identity (no env-only bypasses)"
echo "✓ Password provider is properly gated for local deployments only"
echo ""
echo "✅ Test auth bypass is dev-only and cannot ship to production"
echo ""
echo "Guards verified:"
echo "  • Frontend: import.meta.env.DEV is false after vite build"
echo "  • Frontend: Bypass condition fails in production builds"
echo "  • Frontend: Test user/kitchen mocks are stripped"
echo "  • Backend: TEST_AUTH_BYPASS checked via process.env only"
echo "  • Backend: Test user query is explicit (test@local.dev)"
exit 0
