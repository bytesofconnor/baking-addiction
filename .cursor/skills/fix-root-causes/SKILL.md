# Fix Root Causes

**Don't paper over symptoms — fix the underlying issue.**

## Principle

When you encounter a bug or error, dig deeper. Symptoms are not causes. Workarounds accumulate tech debt. Fix the root cause, or document why you can't and what the trade-off is.

## Red Flags

- Adding `try/catch` without understanding why it throws
- Using `// @ts-ignore` without investigating the type error
- Wrapping logic in conditionals to "make it work" without understanding why it was failing
- Copy-pasting a fix from StackOverflow without understanding it

## In Practice

❌ **Don't:**
- "Added a null check to stop the crash" (why was it null?)
- "Used `any` to fix the type error" (what's the real type?)
- "Refreshed the page and it worked" (what caused the stale state?)

✅ **Do:**
- "The null came from a race condition where the component rendered before the query resolved. Fixed by adding a loading state."
- "Type error was because the API response changed. Updated the type definition to match."
- "Stale state was caused by React Router not unmounting the component on route change. Added a key prop to force remount."

## When You Can't Fix the Root Cause

Sometimes root causes are in third-party libraries, browser quirks, or deep architectural issues. When you must work around:

1. **Document it** — Explain why you couldn't fix the root cause
2. **Link to the issue** — Reference the upstream bug or limitation
3. **Mark it clearly** — Use comments like `// WORKAROUND:` so others understand

## Why It Matters

Workarounds compound. Each shortcut makes the next problem harder to debug. Root-cause fixes make the codebase more maintainable and prevent the same issue from recurring elsewhere.

**Fix it once, fix it right.**
