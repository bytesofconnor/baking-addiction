import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": `${rootDir}src`,
    },
  },
  server: {
    port: 4821,
    strictPort: true,
  },
  preview: {
    port: 4821,
    strictPort: true,
  },
});
