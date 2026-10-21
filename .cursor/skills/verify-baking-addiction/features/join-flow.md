# Feature: Join Flow

## Sub-features

- Public join page at `/join`
- Sign in with Google OAuth
- Enter kitchen code to unlock write desk on device
- Join with invite link (`/join?code=<invite>`)
- Family Door branding and messaging
- Redirect to home after successful join

## How to get to it

1. Navigate to http://localhost:4821/join
2. Join page loads with "Sign in with Google" button

Or with invite: http://localhost:4821/join?code=<invite-code>

## Driving it with Playwright

**Test file:** `tests/verify/join-flow.spec.ts`

**Key selectors:**

- Join heading: `h1` with text "Welcome" or "Family Door"
- Google sign-in button: `button` with text "Sign in with Google"
- Kitchen code input: `input[type="password"]` or text input for code
- Submit button: `button[type="submit"]`

**User journey:**

```typescript
// Navigate to join page
await page.goto('/join');
await expect(page).toHaveTitle(/join/i);

// Verify page content
await expect(page.getByRole('heading', { name: /welcome|family door/i })).toBeVisible();
await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
await page.screenshot({ path: 'artifacts/verify/screenshots/join-page.png' });

// Note: Cannot fully test Google OAuth in headless mode
// Instead, verify the button exists and has correct attributes
const googleButton = page.getByRole('button', { name: /sign in with google/i });
await expect(googleButton).toHaveAttribute('type', 'button');
```

## Gotchas

- **OAuth testing** — Google sign-in requires real OAuth flow (can't fully test in headless)
- **Test bypass** — For verification, use `VITE_TEST_AUTH_BYPASS=true` to access `/add` directly
- **Kitchen code** — Stored in localStorage (`mba-desk-session`) and cookie (`mba_desk`)
- **Invite links** — Query param `?code=` unlocks a specific kitchen after Google auth
- **Redirect behavior** — After successful join, redirects to home (`/`) or intended route
- **Already signed in** — If user is already authenticated, join page redirects to home
- **FAQ link** — Join page includes link to `/faq` for more info
