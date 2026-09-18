import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { App } from "@/App";
import { WriterProvider } from "@/lib/writer";
import "@/index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element missing");
}

if (!convexUrl) {
  createRoot(rootElement).render(
    <p style={{ padding: 24, fontFamily: "Figtree, sans-serif" }}>
      Convex is not configured. Run `npx convex dev` and restart Vite.
    </p>,
  );
} else {
  const convex = new ConvexReactClient(convexUrl);
  createRoot(rootElement).render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <WriterProvider>
          <App />
        </WriterProvider>
      </ConvexProvider>
    </StrictMode>,
  );
}
