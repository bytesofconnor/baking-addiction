const RETURN_KEY = "yum-oauth-return";

export function markOAuthReturn(): void {
  try {
    sessionStorage.setItem(RETURN_KEY, "1");
  } catch {
    // Private browsing can block storage.
  }
}

export function clearOAuthReturn(): void {
  try {
    sessionStorage.removeItem(RETURN_KEY);
  } catch {
    // ignore
  }
}

export function isOAuthReturn(): boolean {
  try {
    return sessionStorage.getItem(RETURN_KEY) === "1";
  } catch {
    return false;
  }
}

export function shouldHandleAuthCode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (!params.get("code")) {
    return false;
  }
  const path = window.location.pathname;
  if (path === "/add" || path === "/admin" || path.startsWith("/slip/")) {
    return false;
  }
  if (path === "/join" && !params.get("invite") && !isOAuthReturn()) {
    return false;
  }
  return true;
}
