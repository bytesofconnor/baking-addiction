## Overview

Brief description of what this PR does and why.

## Blast Radius

**Tier:** LOW | HIGH _(choose one and delete the other)_

**Justification:**

_(Explain why this change qualifies for this tier. See [Verification Tiers in AGENTS.md](../AGENTS.md#verification-tiers))_

**What could break:**
- _(Which components/routes/functions use the code you changed?)_
- _(What edge cases did you consider?)_

**Why it won't:**
- _(What testing proves it's safe?)_

Example LOW:
> **Tier: LOW**
> Changed button padding in `BookCover.tsx`. Used only on home (`/`). No state, routing, or data changes. Smoke tests confirm page renders.

Example HIGH:
> **Tier: HIGH**
> Added `photoUrl` to `bakes` schema. Affects recipe create at `/add` and detail pages. Verified with `.cursor/skills/verify-baking-addiction` — evidence attached below.

## Verification

Show evidence appropriate to your tier (see [Verification Tiers in AGENTS.md](../AGENTS.md#verification-tiers)).

### For LOW-risk changes:

Required CI checks (automated) plus one targeted assertion:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview & npx playwright test
```

Optional: attach screenshot showing the change.

### For HIGH-risk changes:

Run the verify skill for each affected feature and attach screenshot evidence:

```bash
./scripts/verify/launch.sh
./scripts/verify/doctor.sh
npx playwright test tests/verify/<affected-feature>.spec.ts
./scripts/verify/cleanup.sh
```

**Evidence:** _(Attach screenshots from `artifacts/verify/screenshots/` showing the feature working. Paste verification command output.)_

---

**Note:** Tier classification uses the `principle-blast-radius` skill. When in doubt, choose HIGH and run the verify skill.

---

**CI Checks:** This PR must pass lint, typecheck, build, content guard, and smoke tests before merge.
