## Overview

Brief description of what this PR does and why.

## Verification

Show evidence that the change works. Required per [principle-prove-it-works](../.cursor/skills/principle-prove-it-works/SKILL.md).

Examples:
- Test output (paste the full command and results)
- Build logs (show the build succeeded)
- Screenshots or screen recordings (for UI changes)
- Script results (for data migrations or config changes)

```bash
# Example: paste your verification commands here
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Blast Radius

For non-trivial changes: what could this break, and why won't it?

- Which components/routes/functions use the code you changed?
- What testing proves it's safe?
- What edge cases did you consider?

Example:
> **Blast radius:** Changes `BookCover.tsx`, used only on home (`/`). Other routes unaffected. Added test coverage for new prop. No data model or API changes.

---

**CI Checks:** This PR must pass lint, typecheck, build, content guard, and smoke tests before merge.
