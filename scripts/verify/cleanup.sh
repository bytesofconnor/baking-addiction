#!/usr/bin/env bash
set -euo pipefail

# Stop verification servers and preserve evidence
# Usage: ./scripts/verify/cleanup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$WORKSPACE_ROOT"

echo "🧹 Cleaning up verification stack..."
echo ""

STOPPED=0

# Stop Vite
if [ -f /tmp/verify-vite.pid ]; then
  VITE_PID=$(cat /tmp/verify-vite.pid)
  if ps -p $VITE_PID > /dev/null 2>&1; then
    echo "Stopping Vite (PID $VITE_PID)..."
    kill $VITE_PID 2>/dev/null && STOPPED=$((STOPPED + 1))
    
    # Wait up to 5 seconds for graceful shutdown
    for i in {1..5}; do
      if ! ps -p $VITE_PID > /dev/null 2>&1; then
        break
      fi
      sleep 1
    done
    
    # Force kill if still running
    if ps -p $VITE_PID > /dev/null 2>&1; then
      echo "  Force killing Vite..."
      kill -9 $VITE_PID 2>/dev/null || true
    fi
  else
    echo "Vite (PID $VITE_PID) already stopped"
  fi
  rm -f /tmp/verify-vite.pid
fi

# Stop Convex
if [ -f /tmp/verify-convex.pid ]; then
  CONVEX_PID=$(cat /tmp/verify-convex.pid)
  if ps -p $CONVEX_PID > /dev/null 2>&1; then
    echo "Stopping Convex (PID $CONVEX_PID)..."
    kill $CONVEX_PID 2>/dev/null && STOPPED=$((STOPPED + 1))
    
    # Wait up to 5 seconds for graceful shutdown
    for i in {1..5}; do
      if ! ps -p $CONVEX_PID > /dev/null 2>&1; then
        break
      fi
      sleep 1
    done
    
    # Force kill if still running
    if ps -p $CONVEX_PID > /dev/null 2>&1; then
      echo "  Force killing Convex..."
      kill -9 $CONVEX_PID 2>/dev/null || true
    fi
  else
    echo "Convex (PID $CONVEX_PID) already stopped"
  fi
  rm -f /tmp/verify-convex.pid
fi

# Clean up port info
rm -f /tmp/verify-ports.env

echo ""
echo "✅ Cleanup complete ($STOPPED processes stopped)"
echo ""
echo "📦 Evidence preserved in:"
if [ -d artifacts/verify ]; then
  TOTAL_SIZE=$(du -sh artifacts/verify 2>/dev/null | cut -f1)
  echo "  artifacts/verify/ ($TOTAL_SIZE total)"
  echo ""
  
  if [ -d artifacts/verify/screenshots ]; then
    SCREENSHOT_COUNT=$(ls -1 artifacts/verify/screenshots/ 2>/dev/null | wc -l)
    echo "  Screenshots: $SCREENSHOT_COUNT files"
    ls -lh artifacts/verify/screenshots/ 2>/dev/null | tail -n +2 | head -10 || true
  else
    echo "  Screenshots: (none)"
  fi
  
  echo ""
  
  if [ -d artifacts/verify/test-results ]; then
    TRACE_COUNT=$(find artifacts/verify/test-results -name "*.zip" 2>/dev/null | wc -l)
    echo "  Traces: $TRACE_COUNT files"
  else
    echo "  Traces: (none)"
  fi
else
  echo "  artifacts/verify/ (no tests run yet)"
fi

echo ""
echo "💡 Logs preserved at:"
echo "  /tmp/verify-convex.log"
echo "  /tmp/verify-vite.log"
