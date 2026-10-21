import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "fs";

/**
 * Playwright config for verification tests.
 * Runs against local dev server with seed data.
 */

// Read port from launch script output
let vitePort = 4821;
try {
  const portsFile = readFileSync("/tmp/verify-ports.env", "utf-8");
  const match = portsFile.match(/VITE_PORT=(\d+)/);
  if (match) {
    vitePort = parseInt(match[1], 10);
  }
} catch {
  // Fallback to default port if file doesn't exist
}

// Set environment variable for Playwright tests
process.env.VITE_TEST_AUTH_BYPASS = "true";

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
    baseURL: `http://localhost:${vitePort}`,
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
