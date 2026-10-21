#!/usr/bin/env bash
set -euo pipefail

# Stop verification servers and preserve evidence
# Usage: ./scripts/verify/cleanup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "🧹 Cleaning up verification stack..."
echo ""

if [ -f /tmp/verify-vite.pid ]; then
  VITE_PID=$(cat /tmp/verify-vite.pid)
  echo "Stopping Vite (PID $VITE_PID)..."
  kill $VITE_PID 2>/dev/null || echo "  (already stopped)"
  rm /tmp/verify-vite.pid
fi

if [ -f /tmp/verify-convex.pid ]; then
  CONVEX_PID=$(cat /tmp/verify-convex.pid)
  echo "Stopping Convex (PID $CONVEX_PID)..."
  kill $CONVEX_PID 2>/dev/null || echo "  (already stopped)"
  rm /tmp/verify-convex.pid
fi

echo ""
echo "✅ Cleanup complete"
echo ""
echo "📦 Evidence preserved in:"
if [ -d artifacts/verify ]; then
  du -sh artifacts/verify 2>/dev/null || echo "  artifacts/verify/"
  echo ""
  echo "Screenshots:"
  ls -lh artifacts/verify/screenshots/ 2>/dev/null | tail -n +2 | head -10 || echo "  (none)"
  echo ""
  echo "Traces:"
  ls -lh artifacts/verify/traces/ 2>/dev/null | tail -n +2 | head -5 || echo "  (none)"
else
  echo "  artifacts/verify/ (directory not created yet — run tests to generate evidence)"
fi
