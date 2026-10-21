# Feature: Browse and Search Recipes

## Sub-features

- View all published recipes on the home page (`/`)
- Live search by recipe title or ingredient
- Clear search button to reset
- Filter by recipe kind (muffins, cookies, bread, etc.)
- Navigate to recipe detail page by clicking a recipe card

## How to get to it

1. Navigate to http://localhost:4821/
2. The home page loads with all published recipes
3. Use the search box at the top to filter recipes
4. Click the "×" button to clear search

## Driving it with Playwright

**Test file:** `tests/verify/browse-recipes.spec.ts`

**Key selectors:**

- Search input: `input[type="search"]` or `role=searchbox`
- Recipe cards: `role=link` with recipe title text
- Clear search button: `button` with aria-label "Clear search"
- Filter buttons: `button[aria-pressed]` for recipe kinds

**User journey:**

```typescript
// Navigate to home
await page.goto('/');
await expect(page).toHaveTitle(/Recipe Book/i);

// Verify recipes render
const recipes = page.getByRole('link', { name: /muffins|cookies|bread/i });
await expect(recipes.first()).toBeVisible();

// Search for "pumpkin"
const searchBox = page.getByRole('searchbox');
await searchBox.fill('pumpkin');
await page.screenshot({ path: 'artifacts/verify/screenshots/browse-search-pumpkin.png' });

// Verify filtered results
await expect(page.getByText('Pumpkin muffins')).toBeVisible();

// Clear search
const clearButton = page.getByRole('button', { name: /clear/i });
await clearButton.click();
await expect(searchBox).toHaveValue('');
await page.screenshot({ path: 'artifacts/verify/screenshots/browse-search-cleared.png' });
```

## Gotchas

- **Search is live** — results update as you type, no submit button
- **Case-insensitive** — search works regardless of capitalization
- **Ingredient search** — searches both title and ingredient list
- **Empty state** — if no recipes match, show "No recipes found" message
- **Seed data** — must run `npx convex run seed:ensureSamples` for test data
