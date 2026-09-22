import {
  Navigate,
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
  useLocation,
  useSearchParams,
} from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { BakePage } from "@/pages/BakePage";
import { FaqPage } from "@/pages/FaqPage";
import { JoinPage } from "@/pages/JoinPage";
import { Layout } from "@/pages/Layout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PersonPage } from "@/pages/PersonPage";
import { SlipPage } from "@/pages/SlipPage";
import { YouPage } from "@/pages/YouPage";
import { DESK_PATH } from "@/lib/desk";
import { ArriveProvider } from "@/lib/arrive";
import { PreviewProvider } from "@/lib/preview";
import { SeasonProvider } from "@/lib/SeasonTheme";
import { useFamily } from "@/lib/family";
import { ToastProvider } from "@/lib/toast";

function RedirectKeep({ to }: { to: string }) {
  const [params] = useSearchParams();
  const query = params.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

const PUBLIC_BOOK_PATHS = new Set(["/join", "/faq"]);

function BookRoutes() {
  const location = useLocation();
  const { status } = useFamily();

  // Do not mount the physical book until auth has resolved. Mounting it while
  // status is still "checking" makes ArriveProvider interpret a refresh as a
  // closed-cover visit and replay the cover-opening animation.
  if (status === "checking") {
    return (
      <p
        role="status"
        style={{
          margin: 0,
          padding: "2.5rem 1.5rem",
          color: "color-mix(in srgb, #f4ebe0 82%, transparent)",
          fontFamily: '"Source Serif 4", Georgia, serif',
          fontSize: "1.15rem",
          textAlign: "center",
        }}
      >
        Opening your recipe book…
      </p>
    );
  }

  if (status === "out" && !PUBLIC_BOOK_PATHS.has(location.pathname)) {
    return <Navigate to="/join" replace />;
  }

  return (
    <Routes>
      <Route
        element={
          <ArriveProvider>
            <Layout />
          </ArriveProvider>
        }
      >
        <Route path="/" />
        <Route path="/bakes/:slug" element={<BakePage />} />
        <Route path={DESK_PATH} />
        <Route path="/admin" element={<RedirectKeep to={DESK_PATH} />} />
        <Route path="/write" element={<RedirectKeep to={DESK_PATH} />} />
        <Route path="/chris-desk" element={<RedirectKeep to={DESK_PATH} />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/family" element={<RedirectKeep to="/you/family" />} />
        <Route path="/family/:userId" element={<PersonPage />} />
        <Route path="/you" element={<YouPage />} />
        <Route path="/you/family" element={<YouPage />} />
        <Route path="/about" element={<RedirectKeep to="/" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

/** SPA pageviews for React Router — keep path + route in sync. */
function VercelAnalytics() {
  const { pathname } = useLocation();
  return <Analytics path={pathname} route={pathname} />;
}

function AppShell() {
  return (
    <SeasonProvider>
      <ToastProvider>
        <PreviewProvider>
          <Routes>
            <Route path="/slip/:token" element={<SlipPage />} />
            <Route path="*" element={<BookRoutes />} />
          </Routes>
          <VercelAnalytics />
        </PreviewProvider>
      </ToastProvider>
    </SeasonProvider>
  );
}

const router = createBrowserRouter([
  { path: "*", element: <AppShell /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
