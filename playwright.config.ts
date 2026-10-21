import { defineConfig, devices } from "@playwright/test";

/**
 * Lightweight Playwright config for PR smoke tests.
 * Runs against `vite preview` on port 4821.
 */
export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/verify/**", // Exclude verify tests (run manually with verify config)
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
