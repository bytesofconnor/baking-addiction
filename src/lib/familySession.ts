const COOKIE_NAME = "yum_session";
const STORAGE_KEY = "yum-session";
const KITCHEN_KEY = "yum-kitchen";
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

export function readFamilyToken(): string | null {
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

export function writeFamilyToken(token: string): void {
  const expires = new Date(Date.now() + MAX_AGE_SEC * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Max-Age=${MAX_AGE_SEC}; Expires=${expires}${cookieSuffix()}`;
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private browsing can block storage.
  }
}

export function clearFamilyToken(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${cookieSuffix()}`;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readKitchenId(): string | null {
  try {
    return localStorage.getItem(KITCHEN_KEY);
  } catch {
    return null;
  }
}

export function writeKitchenId(kitchenId: string): void {
  try {
    localStorage.setItem(KITCHEN_KEY, kitchenId);
  } catch {
    // ignore
  }
}

export function clearKitchenId(): void {
  try {
    localStorage.removeItem(KITCHEN_KEY);
  } catch {
    // ignore
  }
}
