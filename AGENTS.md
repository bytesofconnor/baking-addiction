# Agent Guidelines

## About This Project

**The Family Recipe Book** is a private family cookbook. This is not a public blog or recipe site — it's a personal collection of family favorites.

## Content Rules

### Sally's Baking Addiction

Many recipes are sourced from [Sally's Baking Addiction](https://sallysbakingaddiction.com/). When working with these recipes:

- **Never copy Sally's recipe text, photos, or branding** into this codebase
- **Credit and link only** — maintain attribution as `source: "sally"` in the recipe data
- Sally's content is copyrighted; we respect that by linking to the original, not duplicating it

### The baker edits through forms only

The baker does not write code or markdown. All recipe edits happen through the web forms at `/add` (the write desk). Never suggest editing code or markdown files directly.

### No personal names or emails

Never put real personal names or emails in code, docs, or site content. Use generic wording (the baker, Mom, or `SITE_NAME`). Content guard rejects personal names in tracked source and docs.

## Development Workflow

Agents working in this repo operate under /poteto-mode.
Cursor models first (grok-4.7, then grok-4.6, then composer-2.5); others opt-in only; retry on a Cursor model if refused for usage.

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

- **accessibility** (`.cursor/skills/accessibility/SKILL.md`): Use for any UI, form, or route change. Accessibility is required, not extra.

## Accessibility

This book is used by a non-technical person on phones and desktops. Treat accessibility as a product requirement. Follow [`.cursor/skills/accessibility/SKILL.md`](./.cursor/skills/accessibility/SKILL.md) and the pstack principles: prove it works, test behavior not implementation, and check blast radius.

### Must follow

- **Semantic HTML.** Use headings, lists, `main`, `nav`, `button`, and labels that match what the control does. Do not rebuild native controls as clickable `div`s.
- **Labels for every form input.** The write desk at `/add` is used by a non-technical person. Every input, select, textarea, and file picker needs a visible label (or a purpose-clear `aria-label` when a visible label would repeat chrome). Placeholder text is not a label.
- **Alt text for recipe photos.** Real food photos describe the dish. Decorative art (cover boards, seasonal doodles, colophon marks) uses empty `alt` and stays out of the accessibility tree.
- **Color contrast.** Body text, links, and controls must meet WCAG 2.1 AA. Do not rely on color alone to mean “active,” “error,” or “required.”
- **Focus states.** Keyboard users must see a visible focus ring on every interactive control. Do not remove outlines without a stronger replacement.
- **Reduced motion.** Honor `prefers-reduced-motion` for cover opens, page turns, and other motion. The book should still be usable with motion off.
- **44px touch targets.** Primary controls (sign-in, dock tabs, FAQ summaries, save/submit, photo picker) must be at least 44×44px on mobile. Do not tuck actions under the bottom dock.
- **Test both viewports.** Every UI change is verified at desktop (1280×800) and mobile (390×844). A desktop-only pass is not done.
- **Add or update an a11y test** for any new page or interactive component. Public pages and signed-in write-desk / edit / You / family / admin pages are covered by `tests/a11y.spec.ts` (`@axe-core/playwright`, keyboard, tap targets, dock clearance). Signed-in scans use the local `vite --mode a11y` fixture — never production data or real credentials. If a surface still cannot be reached, say so in the PR — do not skip or weaken the test.

### What “prove it works” means here

Run the real page, then read the real result: axe serious/critical violations, a keyboard-only pass that lands on the main controls with a visible ring, and a mobile pass where primary targets are 44px and content is not hidden behind the dock. “It compiles” and “the screenshot looks fine” are not proof.

### Names in site content

Never include any person's name in site content. Credit sources by site name and link, not by naming family members in the UI.

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

- **PR Checks / checks** — Lint (changed files only), typecheck, production build (`vite build`), Playwright smoke and accessibility tests
- **PR Checks / content-guard** — Blocks Sally's Baking Addiction image hotlinks, copied branding text, production seed commands, and personal names

### Content Rules

Content guard enforces:

- **No Sally's Baking Addiction hotlinks:** No `<img>` tags or URLs pointing to `sallysbakingaddiction.com` images
- **No Sally's branding:** No copied recipe text, branding strings, or photo credits from Sally's site (credit with `source: "sally"` and link to original)
- **No production seeds:** Never `convex run seed:` commands targeting production (`beloved-lapwing-642`)
- **No personal names or emails:** Never put real personal names or emails in code, docs, or site content

### Vercel Analytics

The `@vercel/analytics` package was removed because Analytics is not enabled in the Vercel project. If you need pageview tracking, enable Analytics in the Vercel dashboard, then reinstall `npm install @vercel/analytics` and add the component back to `App.tsx`.

### Merge Policy

**Auto-merge to main when all required checks are green** (owner granted 2026-10-20).

### Pull Request Requirements

Every PR must:

1. **Pass CI:** All checks (lint, typecheck, build, content guard, smoke tests) must pass
2. **Include verification:** Show evidence the change works — test output, build logs, screenshots, or script results
3. **Include blast-radius note:** For non-trivial changes, document what could break and why it won't (or what testing proves it's safe)

## Operations

See [`ops.md`](./ops.md) for:

- CI/CD deployment flow
- Environment configuration
- Local development setup
- Required secrets and environment variables
- Production URLs and service locations

## Contact

This is a family project. Questions? Open an issue.
