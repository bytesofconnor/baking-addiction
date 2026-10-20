# Blast Radius

**Know what could break before you ship.**

## Principle

Every code change has a blast radius — the set of features, components, and behaviors that could be affected. Before merging, identify and document what else might break.

## Questions to Ask

1. **What imports this?** — Which files import the code you changed?
2. **Where is it used?** — Which routes, pages, or components use this?
3. **What depends on its shape?** — Does anything rely on this API, type, or data structure?
4. **What side effects?** — Does this touch auth, routing, data fetching, environment config, or build process?

## In Practice

❌ **Don't:**
- Ship without considering downstream impact
- Assume "it's a small change" means no risk
- Forget to check imports and usages

✅ **Do:**
- "This changes `RecipeCard.tsx`, used on home page and `/bakes/:slug`. No other routes affected."
- "Updated `family.tsx` utility — used by `FamilyPage`, `PersonPage`, and `SiteHeader`. All three routes need retesting."
- "Modified Vite config — affects build output for all routes. Full smoke test required."

## Why It Matters

Small changes in shared code can have large ripple effects. Documenting blast radius helps reviewers assess risk and guides testing strategy.

**Think before you merge.** A clear blast radius statement shows you understand the system.
