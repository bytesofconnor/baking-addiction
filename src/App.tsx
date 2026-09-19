import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from "react-router";
import { BakePage } from "@/pages/BakePage";
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

function RedirectKeep({ to }: { to: string }) {
  const [params] = useSearchParams();
  const query = params.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <SeasonProvider>
        <PreviewProvider>
          <Routes>
            <Route path="/slip/:token" element={<SlipPage />} />
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
              <Route path="/family" element={<RedirectKeep to="/you/family" />} />
              <Route path="/family/:userId" element={<PersonPage />} />
              <Route path="/you" element={<YouPage />} />
              <Route path="/you/family" element={<YouPage />} />
              <Route path="/about" element={<RedirectKeep to="/" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </PreviewProvider>
      </SeasonProvider>
    </BrowserRouter>
  );
}
