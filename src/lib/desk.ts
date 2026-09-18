export const DESK_PATH = "/admin";

const COOKIE_NAME = "mba_desk";
const STORAGE_KEY = "mba-desk-session";
export const LEGACY_PASSWORD_KEY = "mba-writer-password";
const MAX_AGE_SEC = 60 * 60 * 24 * 400;

function cookieSuffix(): string {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax${secure}`;
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.slice(prefix.length));
}

export function readLegacyPassword(): string | null {
  try {
    return localStorage.getItem(LEGACY_PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function readDeskToken(): string | null {
  const fromCookie = readCookie(COOKIE_NAME);
  if (fromCookie) {
    return fromCookie;
  }
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeDeskToken(token: string): void {
  const expires = new Date(Date.now() + MAX_AGE_SEC * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${MAX_AGE_SEC}; Expires=${expires}${cookieSuffix()}`;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private browsing can block storage; in-memory session still works.
  }
  try {
    localStorage.removeItem(LEGACY_PASSWORD_KEY);
  } catch {
    // ignore
  }
}

export function clearDeskToken(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${cookieSuffix()}`;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(LEGACY_PASSWORD_KEY);
  } catch {
    // ignore
  }
}
