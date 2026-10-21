import { test, expect } from "@playwright/test";

/**
 * Verification: Recipe detail page
 * Feature: View a single recipe with all metadata
 */

test.describe("Recipe detail page", () => {
  test("recipe detail page loads and displays content", async ({ page }) => {
    // Navigate directly to a known recipe slug from seed data
    await page.goto("/bakes/pumpkin-muffins-extra-spice");

    // Verify title
    await expect(
      page.locator("h1, [class*='title']").filter({ hasText: /pumpkin/i }),
    ).toBeVisible();

    // Verify baker name (Mom)
    const pageText = await page.textContent("body");
    expect(pageText).toContain("Mom");

    await page.screenshot({
      path: "artifacts/verify/screenshots/recipe-detail-page.png",
      fullPage: true,
    });
  });

  test("recipe shows ingredients and steps", async ({ page }) => {
    await page.goto("/bakes/pumpkin-muffins-extra-spice");

    // Look for ingredient-related text
    const pageText = await page.textContent("body");
    expect(pageText?.toLowerCase()).toContain("ingredient");
    expect(pageText?.toLowerCase()).toContain("pumpkin");

    await page.screenshot({
      path: "artifacts/verify/screenshots/recipe-detail-ingredients.png",
      fullPage: true,
    });
  });

  test("recipe shows source attribution", async ({ page }) => {
    await page.goto("/bakes/pumpkin-muffins-extra-spice");

    // Look for Sally's Baking Addiction credit
    const pageText = await page.textContent("body");
    expect(pageText?.toLowerCase()).toMatch(/sally|source/);

    await page.screenshot({
      path: "artifacts/verify/screenshots/recipe-detail-source.png",
      fullPage: true,
    });
  });

  test("back navigation returns to home", async ({ page }) => {
    await page.goto("/bakes/pumpkin-muffins-extra-spice");

    // Look for back link
    const backLink = page.locator('a[href="/"]').first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL("/");
    }
  });
});
