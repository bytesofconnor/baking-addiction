import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for verification tests.
 * Runs against local dev server with seed data.
 */
export default defineConfig({
  testDir: "./tests/verify",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/verify/playwright-report" }],
  ],
  use: {
    baseURL: "http://localhost:4821",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  outputDir: "artifacts/verify/test-results",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Verification tests assume the stack is already running
  // Run ./scripts/verify/launch.sh before running these tests
});
