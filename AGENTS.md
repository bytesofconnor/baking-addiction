# Agent Guidelines

## About This Project

**The Family Recipe Book** is Chris's private family cookbook. This is not a public blog or recipe site — it's a personal collection of family favorites for Chris and her family to use.

## Content Rules

### Sally's Baking Addiction

Many recipes are sourced from [Sally's Baking Addiction](https://sallysbakingaddiction.com/). When working with these recipes:

- **Never copy Sally's recipe text, photos, or branding** into this codebase
- **Credit and link only** — maintain attribution as `source: "sally"` in the recipe data
- Sally's content is copyrighted; we respect that by linking to the original, not duplicating it

### Chris Edits Through Forms Only

Chris does not write code or markdown. All recipe edits happen through the web forms at `/add` (the write desk). Never suggest that Chris edit code or markdown files directly.

## Development Workflow

### Keep PRs Small

Each PR should make one focused change. Small PRs are easier to review, test, and roll back if needed.

### Required PR Sections

Every pull request body **must** include:

#### Verification

Exact commands you ran and their results. Examples:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run preview & npx playwright test
```

Show that checks passed, tests ran, and the app still works.

#### Blast Radius

What else could this change affect? Consider:

- Which components read the code you changed?
- Which routes or pages use those components?
- Does this touch shared utilities or types?
- Could this break auth, routing, data fetching, or builds?

Example:

> **Blast radius:** Changes `BookCover.tsx` component, used only on home page (`/`). Routes `/join`, `/faq`, and `/bakes/*` are unaffected. No data model changes. Build and auth flows unchanged.

### Principle Skills

Use these skills to maintain code quality and shipping standards:

- **principle-prove-it-works** (`.cursor/skills/principle-prove-it-works/SKILL.md`): Apply after completing any task, before declaring done. Verify against the real artifact — run the feature, read the actual value, inspect the diff. Never infer from proxies or "it compiles."

- **principle-blast-radius** (`.cursor/skills/principle-blast-radius/SKILL.md`): Use before opening a PR to find what a change could break beyond the diff. Prove the one fact it's safe because of by running real code. Required for refactors and API changes.

- **principle-fix-root-causes** (`.cursor/skills/principle-fix-root-causes/SKILL.md`): Apply when debugging. Trace each symptom back to the first place the system went wrong and fix it there. Don't add guards for states that should never exist.

- **principle-experience-first** (`.cursor/skills/principle-experience-first/SKILL.md`): Use when product, UX, or feature-scope tradeoffs come up. Choose user delight over implementation convenience. Ship fewer polished features over more rough ones.

- **principle-minimize-reader-load** (`.cursor/skills/principle-minimize-reader-load/SKILL.md`): Apply when reviewing or shaping code that's hard to trace. Count layers between question and answer. Collapse one-caller wrappers and shrink mutable scope.

- **principle-laziness-protocol** (`.cursor/skills/principle-laziness-protocol/SKILL.md`): Use when refactoring or evaluating diff size. Bias toward deletion and the smallest change that solves the problem. Minimize the diff.

## Factory

### Production

- **URL:** https://thefamilyrecipebook.app
- **Preview URLs:** Vercel PR preview deployments (if enabled in project settings)
- **Deploy mechanism:** GitHub Actions on push to `main`:
  - Vercel production build and deployment
  - Convex production deployment (`beloved-lapwing-642`)
  - See [`ops.md`](./ops.md) for deployment details

### Required CI Checks

All PRs to `main` must pass:

- **PR Checks / checks** — Lint (changed files only), typecheck, production build (`vite build`), Playwright smoke tests
- **PR Checks / content-guard** — Blocks Sally's Baking Addiction image hotlinks, copied branding text, and production seed commands

### Content Rules

Content guard enforces:

- **No Sally's Baking Addiction hotlinks:** No `<img>` tags or URLs pointing to `sallysbakingaddiction.com` images
- **No Sally's branding:** No copied recipe text, branding strings, or photo credits from Sally's site (credit with `source: "sally"` and link to original)
- **No production seeds:** Never `convex run seed:` commands targeting production (`beloved-lapwing-642`)

### Vercel Analytics

The `@vercel/analytics` package was removed because Analytics is not enabled in the Vercel project. If you need pageview tracking, enable Analytics in the Vercel dashboard, then reinstall `npm install @vercel/analytics` and add the component back to `App.tsx`.

### Merge Policy

**Auto-merge to main when all required checks are green** (owner granted 2026-10-20).

### Pull Request Requirements

Every PR must:

1. **Pass CI:** All checks (lint, typecheck, build, content guard, smoke tests) must pass
2. **State blast-radius tier:** LOW or HIGH, with justification (see Verification Tiers below)
3. **Include verification:** Evidence appropriate to the tier (see Verification Tiers below)

### Verification Tiers

Use the `principle-blast-radius` skill to classify your change, then follow the tier's requirements:

#### LOW Risk

**Qualifies as LOW if:**
- CSS or copy tweaks (colors, spacing, text)
- Documentation changes
- Single-component visual changes (no state, routing, or data flow changes)
- Typo fixes

**Verification required:**
- Required CI checks (lint, typecheck, build, smoke tests) — already automated
- One targeted Playwright assertion proving the change works (can be added to `tests/smoke.spec.ts`)
- Optional: screenshot showing before/after

**Example LOW verification:**

```bash
npm run typecheck
npm run lint
npm run build
npm run preview & npx playwright test
# Screenshot: artifacts/button-color-change.png
```

#### HIGH Risk

**Qualifies as HIGH if:**
- Convex schema changes (new tables, fields, indexes)
- Mutations or queries (create, update, delete operations)
- Auth flows (sign-in, permissions, tokens, kitchen code)
- Admin flows (`/add` write desk, recipe create/edit/delete)
- Data shape changes (how recipes, users, or photos are stored)
- Routing changes (new routes, redirects, route guards)
- Deploy or CI config changes (workflows, environment variables, build steps)
- Dependency upgrades (especially Convex, React Router, auth libraries)
- Anything touching production data or deployments

**Verification required:**
1. **Run the verify skill** for each feature the change touches:
   ```bash
   # Launch local stack with seed data
   ./scripts/verify/launch.sh
   
   # Health check
   ./scripts/verify/doctor.sh
   
   # Run verification for affected features
   npx playwright test tests/verify/browse-recipes.spec.ts
   npx playwright test tests/verify/admin-create-recipe.spec.ts
   
   # Cleanup
   ./scripts/verify/cleanup.sh
   ```

2. **Attach screenshot evidence** in the PR Verification section:
   - Screenshots from `artifacts/verify/screenshots/` showing the feature working
   - If a user flow broke and you fixed it, show before/after or the error → fix progression

3. **Verify side effects:** For mutations, prove the data was written (query Convex, check the recipe appears in the book)

**Example HIGH verification:**

```bash
./scripts/verify/launch.sh
./scripts/verify/doctor.sh
npx playwright test tests/verify/admin-create-recipe.spec.ts
./scripts/verify/cleanup.sh

# Evidence attached:
# - artifacts/verify/screenshots/admin-create-recipe-form.png
# - artifacts/verify/screenshots/admin-create-recipe-published.png
# - Convex query showing the new recipe row
```

### Blast Radius

State your tier (LOW or HIGH) and justify it. What could this break? Why won't it?

- Which components/routes/functions use the code you changed?
- What testing proves it's safe?
- What edge cases did you consider?

Example:

> **Tier: LOW**
> **Blast radius:** Changes button color in `BookCover.tsx`, used only on home page (`/`). No state, routing, or data changes. Smoke tests confirm the page renders.

> **Tier: HIGH**
> **Blast radius:** Adds `photoUrl` field to `bakes` table schema. Mutations updated to handle optional photo. Affects recipe create/edit flows at `/add` and detail pages at `/bakes/:slug`. Verified with `.cursor/skills/verify-baking-addiction` — screenshot evidence attached showing photo upload and display working.

## Operations

See [`ops.md`](./ops.md) for:

- CI/CD deployment flow
- Environment configuration
- Local development setup
- Required secrets and environment variables
- Production URLs and service locations

## Contact

This is Connor Barrett's project for his family. Questions? Open an issue or reach out directly.
