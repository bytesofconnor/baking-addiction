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
    const vercelAnalytics404 = { seen: false };

    // Track failed requests (excluding expected Vercel Analytics 404 in preview)
    page.on("requestfailed", (request) => {
      const url = request.url();
      if (url.includes("/_vercel/insights/")) {
        vercelAnalytics404.seen = true;
      } else {
        failedRequests.push(
          `${request.method()} ${url} - ${request.failure()?.errorText || "unknown"}`,
        );
      }
    });

    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        // Skip generic "Failed to load resource" 404 errors - these are expected
        // in preview mode (e.g., Vercel Analytics script). Real JS errors will
        // have different messages (syntax errors, undefined variables, etc.)
        if (text.includes("Failed to load resource") && text.includes("404")) {
          // This is expected in preview mode - some resources aren't available locally
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

    // Report failed requests (diagnostic info)
    if (failedRequests.length > 0) {
      console.error(
        `Failed requests on ${route.path}:\n${failedRequests.join("\n")}`,
      );
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
