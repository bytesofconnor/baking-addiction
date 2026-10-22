import { test, expect } from "@playwright/test";

/**
 * Mobile dock clearance tests - ensures fixed bottom tab bar doesn't cover content
 */

test.describe("Mobile Dock Clearance", () => {
  // Skip this test in preview builds without Convex - the dock requires
  // family.status from Convex to determine if it should render
  test.skip("content clears bottom tab bar on all dock pages at iPhone viewport", async ({
    page,
  }) => {
    // iPhone 12 Pro viewport (390x844)
    await page.setViewportSize({ width: 390, height: 844 });

    // Test pages that show the dock: Join, FAQ, and signed-in pages
    // For unauthenticated tests, we can only test /join and /faq
    const dockPages = [
      { path: "/join", name: "Join" },
      { path: "/faq", name: "FAQ" },
    ];

    for (const { path, name } of dockPages) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // Check that the dock is visible
      const dock = page.locator(".book-dock");
      await expect(dock).toBeVisible();

      // Get the dock's bounding box
      const dockBox = await dock.boundingBox();
      expect(dockBox).toBeTruthy();

      if (!dockBox) continue;

      // Get the main content container
      const main = page.locator("#main");
      await expect(main).toBeVisible();

      // Find all direct children of main (these are the top-level content elements)
      const contentElements = main.locator("> *");
      const count = await contentElements.count();

      if (count === 0) continue;

      // Get the last visible content element
      let lastVisibleBox = null;

      for (let i = count - 1; i >= 0; i--) {
        const element = contentElements.nth(i);
        const box = await element.boundingBox();

        if (box && box.height > 0) {
          lastVisibleBox = box;
          break;
        }
      }

      // If we found a visible element, verify it's above the dock
      if (lastVisibleBox) {
        const lastElementBottom = lastVisibleBox.y + lastVisibleBox.height;
        const dockTop = dockBox.y;

        expect(
          lastElementBottom,
          `On ${name} (${path}): Last content element bottom (${lastElementBottom.toFixed(1)}px) should be above dock top (${dockTop.toFixed(1)}px)`,
        ).toBeLessThanOrEqual(dockTop);
      }

      // Also verify that the main element has bottom padding
      const mainPaddingBottom = await main.evaluate((el) => {
        return window.getComputedStyle(el).paddingBottom;
      });

      const paddingValue = parseFloat(mainPaddingBottom);
      expect(
        paddingValue,
        `On ${name} (${path}): Main element should have sufficient bottom padding (got ${paddingValue}px)`,
      ).toBeGreaterThan(50); // At least 50px to clear typical dock height
    }
  });

  // Skip - requires Convex for dock to render
  test.skip("sticky elements position above dock at iPhone viewport", async ({
    page,
  }) => {
    // iPhone 12 Pro viewport
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/join");
    await page.waitForLoadState("networkidle");

    // Check sticky elements with bottom-0 class
    const stickyElements = page.locator(".sticky.bottom-0");
    const stickyCount = await stickyElements.count();

    if (stickyCount === 0) {
      // No sticky elements on this page - test passes
      return;
    }

    // Get dock position
    const dock = page.locator(".book-dock");
    const dockBox = await dock.boundingBox();
    expect(dockBox).toBeTruthy();

    if (!dockBox) return;

    // Check each sticky element
    for (let i = 0; i < stickyCount; i++) {
      const element = stickyElements.nth(i);
      const box = await element.boundingBox();

      if (box) {
        const elementBottom = box.y + box.height;
        const dockTop = dockBox.y;

        expect(
          elementBottom,
          `Sticky element ${i + 1} bottom should be above or at dock top`,
        ).toBeLessThanOrEqual(dockTop + 1); // +1px tolerance for rounding
      }
    }
  });
});
