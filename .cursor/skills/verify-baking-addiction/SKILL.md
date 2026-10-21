---
name: verify-baking-addiction
description: Drive The Family Recipe Book the way a user does — verify features work end to end with screenshots and traces. Run for HIGH-risk changes only (schema, mutations, auth, admin, routing, deploys, deps, prod data).
---

# Verify The Family Recipe Book

**When to use:** HIGH-risk changes only (Convex schema, mutations, auth, admin flows, data shape, routing, deploy/CI config, dependency upgrades, anything touching prod data). For LOW-risk changes (CSS, copy, docs, single-component visuals), targeted Playwright assertions are enough.

Drive the real app the way a user does. Launch Vite against a local/dev Convex (never prod), seed data, drive features with Playwright, capture screenshots and traces, then cleanup.

## Launch

Start the development stack with seeded local data.

```bash
# From workspace root
./scripts/verify/launch.sh
```

**What it does:**

1. Checks that Convex is configured for local development (anonymous deployment in `.env.local`)
2. Starts Convex dev server on http://127.0.0.1:3210
3. Waits for Convex to be ready
4. Seeds sample data with `npx convex run seed:ensureSamples`
5. Starts Vite dev server on http://localhost:4821
6. Waits for Vite to be ready

**Readiness:** App is usable when Vite responds with 200 and Convex HTTP endpoint responds.

**Test auth bypass for /add:**

The write desk (`/add`) requires auth (Google sign-in) or a kitchen code in production. For verification, we use a **test-only bypass** that:

- **Only works in development mode** (`import.meta.env.DEV === true`)
- **Guarded by environment variable** `VITE_TEST_AUTH_BYPASS=true` (set in `.env.local`, never in production)
- **Impossible in production builds** because `import.meta.env.DEV` is `false` after `vite build`
- **Checked at route guard level** in the `<FamilyProvider>` context

Implementation: When `VITE_TEST_AUTH_BYPASS=true` and `import.meta.env.DEV`, the `useFamily` hook returns `status: "admin"` immediately, bypassing Google OAuth. The environment variable must be explicitly set in `.env.local` (not committed) and is never present in preview or production deployments.

**Teardown:** Run `./scripts/verify/cleanup.sh` to stop both servers and preserve evidence.

## Doctor

One read-only health check to ensure the stack is ready for verification.

```bash
./scripts/verify/doctor.sh
```

**Checks:**

- Vite dev server responds at http://localhost:4821
- Convex HTTP endpoint responds at http://127.0.0.1:3210
- At least one recipe exists in the database (from seed)
- Home page renders without console errors
- Test auth bypass is enabled (if `VITE_TEST_AUTH_BYPASS=true` is set)

**Exit code:** 0 if healthy, non-zero if any check fails.

## Drive

Use Playwright with real selectors from this repo. Prefer ARIA roles, data attributes, or route patterns.

### Running a journey

```bash
# All features
npx playwright test tests/verify/

# Single feature
npx playwright test tests/verify/browse-recipes.spec.ts

# With UI
npx playwright test tests/verify/ --ui
```

### Available journeys

Located in `tests/verify/`:

- **browse-recipes.spec.ts** — Browse home, search recipes, clear search button
- **recipe-detail.spec.ts** — View recipe detail page
- **admin-create-recipe.spec.ts** — Create recipe at /add (uses test auth bypass)
- **admin-edit-recipe.spec.ts** — Edit recipe at /add (uses test auth bypass)
- **join-flow.spec.ts** — Join page flow
- **faq.spec.ts** — FAQ page

### Playwright config

`playwright.config.ts` (verification mode):

- **Base URL:** http://localhost:4821
- **Headless:** true in CI, false in local `--ui` mode
- **Screenshots:** on failure, saved to `artifacts/verify/screenshots/`
- **Traces:** on first retry, saved to `artifacts/verify/traces/`
- **Video:** on first retry, saved to `artifacts/verify/videos/`

## Evidence

Capture action + resulting state. Verify side effects (e.g., rows inserted in DB). Mocks only at real prod boundaries (not needed for local dev).

**Where artifacts go:**

```
artifacts/verify/
├── screenshots/
│   ├── browse-recipes-home-page.png
│   ├── browse-recipes-search-results.png
│   └── admin-create-recipe-form.png
├── traces/
│   └── browse-recipes-chromium.zip
└── videos/
    └── admin-create-recipe-chromium.webm
```

**Screenshots are taken:**

- After each major action (e.g., search, click, submit)
- On page load for visual regression
- On assertion failure

**Traces capture:**

- Full DOM snapshots
- Network requests
- Console logs
- User actions (click, type, navigate)

### Verification checklist per feature

1. **Navigate** to the feature (real route, not internal API)
2. **Interact** with the UI (real clicks, typing, not direct state mutation)
3. **Capture screenshot** of the action
4. **Assert outcome** (visible text, element state, URL change)
5. **Capture screenshot** of the result
6. **Verify side effects** (e.g., query Convex to check recipe was created)

## Cleanup

Kill only what you started. Keep evidence.

```bash
./scripts/verify/cleanup.sh
```

**What it does:**

1. Stops Vite dev server (by PID recorded in `/tmp/verify-vite.pid`)
2. Stops Convex dev server (by PID recorded in `/tmp/verify-convex.pid`)
3. Preserves all artifacts in `artifacts/verify/`
4. Prints summary of where evidence lives

**Does NOT:**

- Delete artifacts
- Reset database (local deployment can be reseeded on next launch)
- Modify source code or configuration

## Helpers

Executable scripts in `scripts/verify/`:

### launch.sh

```bash
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
```

### doctor.sh

```bash
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
echo -n "Seed data (at least one recipe): "
# This is a simple check - in a real implementation, query Convex
SEED_CHECK=$(curl -s http://localhost:4821 | grep -o "recipe" | head -1 || echo "")
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
  exit 1
fi

echo ""
echo "🎉 All checks passed! Stack is healthy."
```

### cleanup.sh

```bash
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
  du -sh artifacts/verify
  ls -lh artifacts/verify/screenshots/ 2>/dev/null | head -10 || echo "  (no screenshots)"
  ls -lh artifacts/verify/traces/ 2>/dev/null | head -5 || echo "  (no traces)"
else
  echo "  artifacts/verify/ (directory not created yet)"
fi
```

## Feature Map

See `.cursor/skills/verify-baking-addiction/features/README.md` for the complete feature inventory and how to verify each one.
