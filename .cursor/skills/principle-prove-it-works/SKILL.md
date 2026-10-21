# Prove It Works

**Never claim done without verification.**

## Principle

Code that builds is not the same as code that works. Before you call a task complete:

1. **Run it** — Execute the actual commands (build, test, lint, serve)
2. **Observe the outcome** — Read the output, check the logs, test the UI
3. **Verify end-to-end** — Confirm the user-facing behavior is correct

## In Practice

❌ **Don't:**
- "I've updated the component, it should work now"
- "The build passes, so the feature is ready"
- "I fixed the bug" (without showing the fix working)

✅ **Do:**
- "I ran `npm run build` and `npm run preview`, then tested in the browser at `http://localhost:4821/join`. The form submits correctly and shows the expected success message."
- "Ran `npm test` — all 12 tests pass. Here's the output: [paste results]"
- "Deployed to preview environment and clicked through the flow. Screenshots attached."

## Why It Matters

Users experience running code, not source code. A green CI badge means the code compiles and tests pass — it does not guarantee the feature works as intended.

**Show, don't tell.** Evidence builds trust and catches issues before they reach production.
