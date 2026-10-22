import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for PR checks (smoke + accessibility).
 * Runs against `vite preview` on port 4821.
 * Accessibility specs set their own desktop (1280x800) and mobile (390x844) viewports.
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4821",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4821",
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
});
