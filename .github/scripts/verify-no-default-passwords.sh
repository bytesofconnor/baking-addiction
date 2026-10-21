#!/usr/bin/env bash
set -euo pipefail

# CI assertion: Fail if any convex/ file contains hardcoded default passwords
# or if auth.config.ts is missing

echo "🔒 Checking for unsafe password defaults in convex/ files..."

FAILED=0

# Check for hardcoded default passwords
if grep -r "test-writer-pw\|test-password\|default.*password" convex/ --include="*.ts" --exclude="*.test.ts"; then
  echo "❌ FAIL: Found hardcoded default password in convex/ files"
  echo "   Production must never have password fallbacks"
  FAILED=1
else
  echo "✓ No hardcoded default passwords found"
fi

# Check that auth.config.ts exists
if [ ! -f convex/auth.config.ts ]; then
  echo "❌ FAIL: convex/auth.config.ts is missing"
  echo "   Production Google sign-in depends on this file"
  FAILED=1
else
  echo "✓ convex/auth.config.ts exists"
fi

# Check that WRITER_PASSWORD is required in convex.config.ts
if ! grep -q "WRITER_PASSWORD: v.string()" convex/convex.config.ts; then
  echo "❌ FAIL: WRITER_PASSWORD must be v.string() (required), not optional"
  echo "   Production must fail closed if env var is missing"
  FAILED=1
else
  echo "✓ WRITER_PASSWORD is required (v.string())"
fi

if [ $FAILED -eq 1 ]; then
  echo ""
  echo "❌ Security checks failed"
  exit 1
fi

echo ""
echo "✅ All security checks passed"
