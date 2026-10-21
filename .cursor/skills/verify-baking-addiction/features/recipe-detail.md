# Feature: Recipe Detail Page

## Sub-features

- View a single recipe at `/bakes/:slug`
- Display recipe title, story, baker name, baked date
- Show ingredients and steps
- Display "what I changed" section if present
- Show recipe photo if uploaded
- Link to original source (e.g., external recipe sites)
- Navigate back to home page

## How to get to it

1. Navigate to home page (`/`)
2. Click on any recipe card
3. Recipe detail page loads at `/bakes/:slug`

Or directly: http://localhost:4821/bakes/pumpkin-muffins-extra-spice

## Driving it with Playwright

**Test file:** `tests/verify/recipe-detail.spec.ts`

**Key selectors:**

- Recipe title: `h1` with recipe name
- Story section: Text containing "how it went"
- Ingredients list: `role=list` within ingredients section
- Steps list: `role=list` within steps section
- Source link: `role=link` with source URL
- Back button: `role=link` with "Back to the book"

**User journey:**

```typescript
// Navigate to a recipe
await page.goto('/bakes/pumpkin-muffins-extra-spice');
await expect(page).toHaveTitle(/Pumpkin muffins/i);

// Verify recipe metadata
await expect(page.getByRole('heading', { name: /pumpkin muffins/i })).toBeVisible();
await expect(page.getByText(/Mom/i)).toBeVisible(); // Baker name
await expect(page.getByText(/2026/i)).toBeVisible(); // Date

// Verify ingredients render
const ingredients = page.locator('text=pumpkin');
await expect(ingredients.first()).toBeVisible();
await page.screenshot({ path: 'artifacts/verify/screenshots/recipe-detail-page.png' });

// Verify source attribution (external recipe site)
const sourceLink = page.getByRole('link', { name: /sally/i });
await expect(sourceLink).toHaveAttribute('href', /sallysbakingaddiction/);
```

## Gotchas

- **Slug format** — recipe slugs are kebab-case derived from title
- **404 handling** — non-existent slugs show "Recipe not found"
- **Draft recipes** — only published recipes are accessible on detail page
- **Photo URLs** — may be null; handle missing photos gracefully
- **Source types** — Sally, original, family, book, friend (each displays differently)
