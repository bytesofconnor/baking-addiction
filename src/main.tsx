import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { App } from "@/App";
import { FamilyProvider } from "@/lib/family";
import { shouldHandleAuthCode } from "@/lib/oauthReturn";
import { applySeasonTheme } from "@/lib/season";
import { WriterProvider } from "@/lib/writer";
import "@/index.css";

applySeasonTheme();

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element missing");
}

if (!convexUrl) {
  createRoot(rootElement).render(
      <p style={{ padding: 24, fontFamily: '"Source Serif 4", Georgia, serif' }}>
      Convex is not configured. Run `npx convex dev` and restart Vite.
    </p>,
  );
} else {
  const convex = new ConvexReactClient(convexUrl);
  createRoot(rootElement).render(
    <ConvexAuthProvider
      client={convex}
      shouldHandleCode={shouldHandleAuthCode}
    >
      <WriterProvider>
        <FamilyProvider>
          <App />
        </FamilyProvider>
      </WriterProvider>
    </ConvexAuthProvider>,
  );
}
