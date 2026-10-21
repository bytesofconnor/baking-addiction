# Verification Infrastructure

Risk-based end-to-end testing for The Family Recipe Book. Run full verification for HIGH-risk changes only.

## Quick Start

For **HIGH-risk changes** (schema, mutations, auth, admin, routing, deploys, deps):

```bash
# 1. Enable test auth bypass (dev only)
echo "VITE_TEST_AUTH_BYPASS=true" >> .env.local

# 2. Launch the stack
./scripts/verify/launch.sh

# 3. Health check
./scripts/verify/doctor.sh

# 4. Run verification tests
npx playwright test --config playwright.verify.config.ts

# 5. Cleanup
./scripts/verify/cleanup.sh

# 6. View evidence
open artifacts/verify/screenshots/
```

For **LOW-risk changes** (CSS, copy, docs): existing CI checks are sufficient.

## Test Auth Bypass

The write desk (`/add`) requires Google sign-in or kitchen code in production. For verification, we bypass auth:

**How it works:**
- Checks `import.meta.env.DEV === true` (Vite dev mode)
- Checks `import.meta.env.VITE_TEST_AUTH_BYPASS === "true"`
- If both true, `useFamily()` returns `status: "in"` with mock user/kitchen

**Safety guarantees:**
- **Dev-only:** `import.meta.env.DEV` is `false` after `vite build`
- **Explicit opt-in:** Must add `VITE_TEST_AUTH_BYPASS=true` to `.env.local`
- **Never in prod:** Environment variable not present in Vercel deployments
- **Never committed:** `.env.local` is in `.gitignore`

**Implementation:** See `src/lib/family.tsx` (~lines 58-62, 160-164, 170-230)

## Verification Tiers

Use `principle-blast-radius` skill to classify changes:

### LOW Risk
- CSS, copy, docs, single-component visuals
- **Verification:** Required CI checks + one targeted assertion
- **No verify skill needed**

### HIGH Risk
- Convex schema, mutations, auth, admin flows, data shape, routing, deploy/CI config, dependency upgrades, prod data
- **Verification:** Run `.cursor/skills/verify-baking-addiction` for each affected feature
- **Attach screenshot evidence in PR**

## Features

See `.cursor/skills/verify-baking-addiction/features/`:

1. **browse-search.md** — Browse recipes, search, clear button
2. **recipe-detail.md** — View recipe detail page
3. **admin-create-recipe.md** — Create recipe at /add
4. **admin-edit-recipe.md** — Edit recipe at /add?edit=<id>
5. **join-flow.md** — Join page with Google sign-in
6. **faq.md** — FAQ page

## Scripts

- `./scripts/verify/launch.sh` — Start Convex + Vite with seed data
- `./scripts/verify/doctor.sh` — Health check (readiness, auth bypass)
- `./scripts/verify/cleanup.sh` — Stop servers, preserve evidence

## Artifacts

Evidence saved to `artifacts/verify/`:
- `screenshots/` — Visual proof of features working
- `traces/` — Playwright traces (on retry)
- `videos/` — Test recordings (on failure)
- `playwright-report/` — HTML test report

## CI

**No always-on heavy CI job.** Verification runs locally for HIGH-risk PRs only.

Existing lightweight CI (`pr-checks.yml`):
- Lint (changed files only)
- Typecheck
- Production build
- Smoke tests (public routes: `/`, `/join`, `/faq`)
- Content guard (Sally hotlinks, prod seeds)

## Skill

`.cursor/skills/verify-baking-addiction/SKILL.md` — Full verification procedure with Launch, Doctor, Drive, Evidence, Cleanup, and Helpers sections.
