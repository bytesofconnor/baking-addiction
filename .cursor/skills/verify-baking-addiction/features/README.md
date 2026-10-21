# Feature Map: The Family Recipe Book

Top user features and how to verify each one with `.cursor/skills/verify-baking-addiction`.

## Feature Index

1. **Browse and search recipes** — Home page with live search and clear button
2. **Recipe detail page** — View a single recipe with all metadata
3. **Admin: Create recipe** — Add a new recipe at `/add`
4. **Admin: Edit recipe** — Modify an existing recipe at `/add?edit=<id>`
5. **Join flow** — Sign in with Google or enter kitchen code
6. **FAQ** — Frequently asked questions page

## When to Verify

Use the tier system from [AGENTS.md](../../../../AGENTS.md#verification-tiers):

- **LOW risk** (CSS, copy, single-component visuals): Required CI checks + one targeted assertion
- **HIGH risk** (schema, mutations, auth, admin, routing, deploys, deps): Run the verify skill for each affected feature

## Feature Details

See individual feature files for:
- Sub-features (what's included)
- How to get there (user's perspective)
- Driving it with Playwright
- Gotchas and edge cases
