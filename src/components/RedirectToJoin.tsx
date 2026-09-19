import { Navigate, useSearchParams } from "react-router";

export function RedirectToJoin() {
  const [params] = useSearchParams();
  const query = params.toString();
  return <Navigate to={query ? `/join?${query}` : "/join"} replace />;
}
