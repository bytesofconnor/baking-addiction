# Experience First

**Judge by what the user sees and feels.**

## Principle

Code quality is measured by user experience, not lines of code or architectural purity. Optimize for outcomes, not abstractions.

## Questions to Guide You

1. **Does it feel fast?** — Perceived performance matters more than milliseconds
2. **Is it clear?** — Can users accomplish their goal without confusion?
3. **Does it delight?** — Small touches make the difference between "it works" and "I love this"
4. **Is it accessible?** — Can everyone use it, regardless of device or ability?

## In Practice

❌ **Don't:**
- "The API call is optimized to 50ms" (but the UI shows no feedback for 3 seconds)
- "I refactored the code to be more DRY" (but it's now harder to understand)
- "It works on desktop" (but breaks on mobile)

✅ **Do:**
- "Added a loading spinner so users know something is happening"
- "Kept the code slightly repetitive because it's easier to read and modify"
- "Tested on iPhone, Pixel, and iPad — all work smoothly"

## Trade-offs

Sometimes developer experience and user experience conflict. When they do:

- **Users come first** — Choose the version that works better for users
- **Document the trade-off** — Explain why you made the choice
- **Keep it simple** — Complexity for purity's sake helps no one

## Why It Matters

Elegant code that frustrates users is a failure. Messy code that delights users is a success. Ship experiences, not abstractions.

**The user is the test.**
