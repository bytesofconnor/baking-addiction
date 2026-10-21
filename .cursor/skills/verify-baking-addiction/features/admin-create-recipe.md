# Feature: Admin Create Recipe

## Sub-features

- Access write desk at `/add` (requires auth or kitchen code)
- Choose intake method (photo, file upload, link, type manually)
- Enter recipe title, story, source, ingredients, steps
- Mark changes made to original recipe
- Upload cover photo
- Save as draft or publish immediately
- View newly created recipe on detail page

## How to get to it

1. Navigate to http://localhost:4821/add
2. **Auth bypass:** Requires `VITE_TEST_AUTH_BYPASS=true` in `.env.local` (dev only)
3. Write desk loads with intake options

Or redirect: `/admin` → `/add`

## Driving it with Playwright

**Test file:** `tests/verify/admin-create-recipe.spec.ts`

**Key selectors:**

- Intake buttons: `button` with text "Type it myself", "Take or choose a photo", etc.
- Title input: `input#bake-title`
- Story textarea: `textarea#story`
- Source kind buttons: `button[aria-pressed]` for "Original", "Sally", etc.
- Ingredients textarea: `textarea#ingredients`
- Steps textarea: `textarea#steps`
- Submit button: `button[type="submit"]` with text "Put it in the book"

**User journey:**

```typescript
// Navigate to write desk
await page.goto('/add');
await expect(page.getByText(/Add a recipe/i)).toBeVisible();

// Choose "Type it myself"
await page.getByRole('button', { name: /type it myself/i }).click();
await page.screenshot({ path: 'artifacts/verify/screenshots/admin-create-form-blank.png' });

// Fill in recipe details
await page.locator('#bake-title').fill('Test Chocolate Chip Cookies');
await page.locator('#story').fill('Baked these for testing. They came out perfect.');
await page.locator('#ingredients').fill('2 cups flour\n1 cup sugar\n2 eggs');
await page.locator('#steps').fill('Mix ingredients\nBake at 350°F for 12 minutes');

// Select source kind
await page.getByRole('button', { name: /original/i, pressed: false }).click();

await page.screenshot({ path: 'artifacts/verify/screenshots/admin-create-form-filled.png' });

// Submit
await page.getByRole('button', { name: /put it in the book/i }).click();

// Verify redirect to recipe detail page
await expect(page).toHaveURL(/\/bakes\/.+/);
await expect(page.getByRole('heading', { name: /test chocolate chip cookies/i })).toBeVisible();
await page.screenshot({ path: 'artifacts/verify/screenshots/admin-create-published.png' });
```

## Gotchas

- **Auth required** — `/add` redirects to `/join` unless:
  - User is signed in with Google as a family member
  - Kitchen code is stored in local storage
  - Test bypass is enabled (`VITE_TEST_AUTH_BYPASS=true` in dev)
- **Test bypass guards:**
  - Only works when `import.meta.env.DEV === true` (never in prod builds)
  - Must be explicitly enabled in `.env.local`
  - Cannot bypass in `vite build` output
- **Required fields** — Title, story, and ingredients must be filled for publish
- **Validation** — Sally source requires valid Sally URL
- **Form state** — Warns before leaving if unsaved changes exist
- **Draft vs. Publish** — "Save for later" stores as draft, "Put it in the book" publishes
