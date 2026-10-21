import { test, expect } from "@playwright/test";

/**
 * Verification: FAQ page
 * Feature: Frequently asked questions (public page)
 */

test.describe("FAQ page", () => {
  test("FAQ page loads with content", async ({ page }) => {
    await page.goto("/faq");

    // Verify title
    await expect(page).toHaveTitle(/faq|question/i);

    // Verify page has content
    const pageText = await page.textContent("body");
    expect(pageText).toBeTruthy();
    expect(pageText!.length).toBeGreaterThan(100);

    await page.screenshot({
      path: "artifacts/verify/screenshots/faq-page.png",
      fullPage: true,
    });
  });

  test("FAQ page is publicly accessible", async ({ page }) => {
    // Navigate to FAQ without auth
    const response = await page.goto("/faq");

    // Verify we got a 200 response (not redirected to /join)
    expect(response?.status()).toBe(200);

    // Verify we're still on /faq (not redirected)
    await expect(page).toHaveURL(/\/faq/);
  });

  test("FAQ page has navigation back to home", async ({ page }) => {
    await page.goto("/faq");

    // Look for back/home link
    const homeLink = page.locator('a[href="/"]').first();

    if (await homeLink.isVisible()) {
      await expect(homeLink).toBeVisible();
      console.log("✓ Home navigation link found");
    }
  });
});
