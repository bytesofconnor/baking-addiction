import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const a11yFixture = mode === "a11y";

  return {
    plugins: [react(), tailwindcss()],
    define: a11yFixture
      ? {
          "import.meta.env.VITE_A11Y_FIXTURE": JSON.stringify("1"),
          "import.meta.env.VITE_CONVEX_URL": JSON.stringify(
            "https://preview-only-not-connected.convex.cloud",
          ),
        }
      : undefined,
    resolve: {
      alias: {
        "@": `${rootDir}src`,
        ...(a11yFixture
          ? {
              "convex/react": `${rootDir}src/test/convexReactFixture.ts`,
              "@convex-dev/auth/react": `${rootDir}src/test/convexAuthReactFixture.ts`,
            }
          : {}),
      },
    },
    server: {
      host: "localhost",
      port: 4821,
      strictPort: true,
    },
    preview: {
      host: "localhost",
      port: 4821,
      strictPort: true,
    },
  };
});
