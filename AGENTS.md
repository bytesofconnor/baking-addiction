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

### Principles

See `.cursor/skills/` for detailed guidance on:

- **prove-it-works** — Verify the real outcome, don't just claim done
- **blast-radius** — List what a change can affect before shipping
- **fix-root-causes** — Don't paper over symptoms; fix the underlying issue
- **experience-first** — Judge by what the user sees and feels
- **minimize-reader-load** — Write code others can understand quickly
- **laziness-protocol** — Make the simplest change that works

## Factory

### Environments

- **Production:** https://thefamilyrecipebook.app
- **Preview URLs:** Vercel PR preview deployments (if enabled in Vercel project settings)
- **Deploy mechanism:** GitHub Actions workflow deploys on push to `main`
  - Vercel production deployment
  - Convex production deployment (`beloved-lapwing-642`)
  - See [`ops.md`](./ops.md) for details

### Required CI Checks

All pull requests to `main` must pass these checks:

- **PR Checks / checks** — Runs lint, typecheck, production build, and Playwright smoke tests
- **PR Checks / content-guard** — Blocks banned content (Sally's Baking Addiction images/branding, production seed commands)

### Content Rules for CI

The content-guard check enforces:

- **No Sally's Baking Addiction assets:** No image hotlinks to `sallysbakingaddiction.com` or `sallysbakinaddiction.com` domains
- **No Sally's branding:** No copied recipe text or branding strings (e.g., "Sally's Baking Addiction" in recipe bodies, photo credits from Sally's site)
- **No production seed:** Never run `convex run seed:` commands on production deployment (`beloved-lapwing-642`)

Sally's recipes are credited with `source: "sally"` in recipe data and link to the original — we do not duplicate her content.

### Merge Policy

As of 2026-10-20:

- **Auto-merge to main** when all required checks pass
- Requires owner approval
- Small, focused PRs preferred
- PR body must include Verification and Blast radius sections

## Operations

See [`ops.md`](./ops.md) for:

- CI/CD deployment flow
- Environment configuration
- Local development setup
- Required secrets and environment variables
- Production URLs and service locations

## Contact

This is Connor Barrett's project for his family. Questions? Open an issue or reach out directly.
