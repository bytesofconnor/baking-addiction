import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from "react-router";
import { AboutPage } from "@/pages/AboutPage";
import { BakePage } from "@/pages/BakePage";
import { HomePage } from "@/pages/HomePage";
import { Layout } from "@/pages/Layout";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { WritePage } from "@/pages/WritePage";
import { DESK_PATH } from "@/lib/desk";

function LegacyDeskRedirect() {
  const [params] = useSearchParams();
  const query = params.toString();
  return (
    <Navigate to={query ? `${DESK_PATH}?${query}` : DESK_PATH} replace />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/bakes/:slug" element={<BakePage />} />
          <Route path={DESK_PATH} element={<WritePage />} />
          <Route path="/chris-desk" element={<LegacyDeskRedirect />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
