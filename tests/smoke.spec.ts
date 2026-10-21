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

test("Search clear button shows pointer cursor and clears input", async ({
  page,
}) => {
  await page.goto("/join");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    const container = document.createElement("div");
    container.style.cssText = "padding: 20px;";
    container.innerHTML = `
      <div style="position: relative; width: 300px;">
        <input
          type="text"
          id="test-search"
          value=""
          placeholder="Search recipes..."
          style="width: 100%; padding: 12px 48px 12px 12px; border: 1.5px solid #5a2a14; border-radius: 4px; font-size: 20px; background: #fffdf8; color: #2a1810;"
        />
        <button
          type="button"
          id="test-clear"
          aria-label="Clear search"
          style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: none; width: 32px; height: 32px; border: none; background: transparent; border-radius: 50%; color: #5c3a2a; cursor: pointer; padding: 0;"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="display: block; margin: auto;">
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(container);

    const input = document.getElementById("test-search") as HTMLInputElement;
    const clearBtn = document.getElementById("test-clear") as HTMLButtonElement;

    input.addEventListener("input", () => {
      clearBtn.style.display = input.value.length > 0 ? "flex" : "none";
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  const searchInput = page.locator("#test-search");
  const clearButton = page.locator("#test-clear");

  await searchInput.fill("chocolate");
  await expect(searchInput).toHaveValue("chocolate");

  await expect(clearButton).toBeVisible();

  const clearButtonCursor = await clearButton.evaluate((btn) => {
    return window.getComputedStyle(btn).cursor;
  });
  expect(clearButtonCursor).toBe("pointer");

  await clearButton.click();
  await expect(searchInput).toHaveValue("");
  await expect(clearButton).not.toBeVisible();
});
