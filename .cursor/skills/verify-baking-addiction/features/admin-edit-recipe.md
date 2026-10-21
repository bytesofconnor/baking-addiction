# Feature: Admin Edit Recipe

## Sub-features

- Edit an existing recipe at `/add?edit=<bakeId>`
- Pre-populate form with existing recipe data
- Update title, story, ingredients, steps, source
- Replace or remove cover photo
- Change recipe kind or date
- Save changes (updates existing record, keeps slug)
- Cancel returns to recipe detail page

## How to get to it

1. Navigate to a recipe detail page (e.g., `/bakes/pumpkin-muffins-extra-spice`)
2. Look for "Edit" link (visible only to recipe owner or admin)
3. Click "Edit" → redirects to `/add?edit=<bakeId>`

Or directly: http://localhost:4821/add?edit=<bakeId>

**Auth bypass:** Requires `VITE_TEST_AUTH_BYPASS=true` in `.env.local` (dev only)

## Driving it with Playwright

**Test file:** `tests/verify/admin-edit-recipe.spec.ts`

**Key selectors:**

- Edit link: `role=link` with text "Edit" on recipe detail page
- Pre-filled title: `input#bake-title[value="<existing title>"]`
- Pre-filled story: `textarea#story` with existing content
- Save button: `button[type="submit"]` with text "Save changes"
- Cancel button: `button` with text "Cancel"

**User journey:**

```typescript
// Start from a recipe detail page
await page.goto('/bakes/pumpkin-muffins-extra-spice');

// Click edit link (assumes auth bypass is enabled)
await page.getByRole('link', { name: /edit/i }).click();
await expect(page).toHaveURL(/\/add\?edit=/);

// Verify form is pre-populated
const titleInput = page.locator('#bake-title');
await expect(titleInput).toHaveValue(/pumpkin muffins/i);
await page.screenshot({ path: 'artifacts/verify/screenshots/admin-edit-form-loaded.png' });

// Make a change
const storyTextarea = page.locator('#story');
await storyTextarea.fill('Updated story: These muffins are even better than before!');

await page.screenshot({ path: 'artifacts/verify/screenshots/admin-edit-form-changed.png' });

// Save changes
await page.getByRole('button', { name: /save changes/i }).click();

// Verify redirect back to recipe detail
await expect(page).toHaveURL(/\/bakes\/pumpkin-muffins-extra-spice/);
await expect(page.getByText(/updated story/i)).toBeVisible();
await page.screenshot({ path: 'artifacts/verify/screenshots/admin-edit-saved.png' });
```

## Gotchas

- **Auth required** — Same as create: Google sign-in, kitchen code, or test bypass
- **Ownership check** — Only recipe owner or admin can edit
- **Slug preserved** — Editing title does NOT change the URL slug
- **Photo replacement** — Can add new photo or remove existing, but not both in one action
- **Unsaved changes warning** — Browser warns before leaving with unsaved edits
- **Cancel behavior** — Returns to recipe detail page (does not go to home)
- **Draft → Published** — Can edit a draft and publish it, or vice versa
