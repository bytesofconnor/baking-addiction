const RETURN_KEY = "yum-oauth-return";
const INVITE_KEY = "yum-pending-invite";

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

/** Keep invite tokens across Google OAuth when the return URL drops `?invite=`. */
export function stashInvite(token: string): void {
  const clean = token.trim();
  if (!clean) {
    return;
  }
  try {
    sessionStorage.setItem(INVITE_KEY, clean);
  } catch {
    // Private browsing can block storage.
  }
}

export function peekInvite(): string | null {
  try {
    return sessionStorage.getItem(INVITE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function clearInvite(): void {
  try {
    sessionStorage.removeItem(INVITE_KEY);
  } catch {
    // ignore
  }
}

/** True when the URL holds a Convex Auth OAuth `code` (not a kitchen invite). */
export function hasAuthCode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return Boolean(new URLSearchParams(window.location.search).get("code"));
}

/**
 * Invites use `?invite=`. Kitchen unlock uses `?code=` on /add only.
 * Everywhere else, `?code=` is the Google OAuth callback and must be handled.
 */
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
  return true;
}
