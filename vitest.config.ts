import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/tests/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    environmentMatchGlobs: [
      ["convex/**/*.test.ts", "node"],
      ["src/**/*.test.{ts,tsx}", "happy-dom"],
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
