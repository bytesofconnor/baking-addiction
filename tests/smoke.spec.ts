import { test, expect } from "@playwright/test";

/**
 * Lightweight smoke tests for PR checks.
 * These run against the production build via `vite preview`.
 * No auth required — only public routes.
 */

const publicRoutes = [
  { path: "/", name: "Home" },
  { path: "/join", name: "Join (Family Door)" },
  { path: "/faq", name: "FAQ" },
];

for (const route of publicRoutes) {
  test(`${route.name} (${route.path}) returns 200 and renders`, async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const failedRequests: string[] = [];
    let vercelAnalytics404 = false;

    // Track failed requests
    page.on("requestfailed", (request) => {
      const url = request.url();
      
      // Detect Vercel Analytics 404 (should not happen - Analytics was removed)
      if (url.includes("/_vercel/insights/")) {
        vercelAnalytics404 = true;
        failedRequests.push(
          `⚠️  Vercel Analytics 404: ${url} (Analytics not configured - remove @vercel/analytics)`,
        );
      } else {
        failedRequests.push(
          `${request.method()} ${url} - ${request.failure()?.errorText || "unknown"}`,
        );
      }
    });

    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        // Filter expected 404s for resources that don't exist in preview
        // (but catch Vercel Analytics 404 as a real error since we removed it)
        if (text.includes("Failed to load resource") && text.includes("404")) {
          if (vercelAnalytics404) {
            // This is a bug - Analytics was removed but might have been re-added
            consoleErrors.push(text);
          }
          // Other 404s are expected in preview (e.g., optional third-party scripts)
          return;
        }
        consoleErrors.push(text);
      } else if (msg.type() === "warning") {
        consoleWarnings.push(text);
      }
    });

    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);

    // Wait for React to hydrate
    await page.waitForLoadState("networkidle");

    // Check that something rendered (not a blank page)
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();
    expect(bodyText!.trim().length).toBeGreaterThan(0);

    // Report and fail on failed requests (including Analytics 404)
    if (failedRequests.length > 0) {
      console.error(
        `Failed requests on ${route.path}:\n${failedRequests.join("\n")}`,
      );
      expect(
        failedRequests,
        `Unexpected failed requests on ${route.path}`,
      ).toHaveLength(0);
    }

    // Report console errors (fail the test if any exist)
    if (consoleErrors.length > 0) {
      console.error(
        `Console errors on ${route.path}:\n${consoleErrors.join("\n")}`,
      );
      expect(
        consoleErrors,
        `Console errors found on ${route.path}`,
      ).toHaveLength(0);
    }

    // Report console warnings (just log, don't fail)
    if (consoleWarnings.length > 0) {
      console.warn(
        `Console warnings on ${route.path}:\n${consoleWarnings.join("\n")}`,
      );
    }
  });
}
