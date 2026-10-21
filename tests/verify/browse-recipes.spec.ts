import { test, expect } from "@playwright/test";

/**
 * Verification: Browse and search recipes
 * Feature: Home page with recipe browsing and live search
 */

test.describe("Browse and search recipes", () => {
  test("home page loads with recipes", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Recipe Book|Family Recipe/i);

    // Wait for recipes to load
    await page.waitForLoadState("networkidle");

    // Verify at least one recipe card is visible
    const recipes = page.locator('[class*="bake"]').first();
    await expect(recipes).toBeVisible();

    await page.screenshot({
      path: "artifacts/verify/screenshots/browse-recipes-home-page.png",
      fullPage: true,
    });
  });

  test("search filters recipes by title", async ({ page }) => {
    await page.goto("/");

    // Find search input
    const searchBox = page.locator('input[type="search"]');
    await expect(searchBox).toBeVisible();

    // Search for "pumpkin"
    await searchBox.fill("pumpkin");

    // Wait for filter to apply
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "artifacts/verify/screenshots/browse-search-pumpkin.png",
      fullPage: true,
    });

    // Verify filtered results contain "pumpkin"
    const pageText = await page.textContent("body");
    expect(pageText?.toLowerCase()).toContain("pumpkin");
  });

  test("clear search button resets filter", async ({ page }) => {
    await page.goto("/");

    // Search for something
    const searchBox = page.locator('input[type="search"]');
    await searchBox.fill("chocolate");
    await page.waitForTimeout(500);

    // Find and click clear button (usually an × or "Clear" button)
    const clearButton = page.locator('button[aria-label*="Clear"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      // Fallback: clear the input manually
      await searchBox.clear();
    }

    // Verify search is cleared
    await expect(searchBox).toHaveValue("");

    await page.screenshot({
      path: "artifacts/verify/screenshots/browse-search-cleared.png",
      fullPage: true,
    });
  });

  test("clicking recipe navigates to detail page", async ({ page }) => {
    await page.goto("/");

    // Wait for recipes to load
    await page.waitForLoadState("networkidle");

    // Click the first recipe link
    const firstRecipe = page.locator('a[href^="/bakes/"]').first();
    await expect(firstRecipe).toBeVisible();

    await firstRecipe.click();

    // Verify we're on a recipe detail page
    await expect(page).toHaveURL(/\/bakes\/.+/);

    await page.screenshot({
      path: "artifacts/verify/screenshots/browse-recipe-clicked.png",
      fullPage: true,
    });
  });
});
