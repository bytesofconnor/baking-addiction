import { DESK_PATH } from "@/lib/desk";

/** One turn always takes this long, near or far. */
export const BOOK_FLIP_MS = 760;

const RECIPE_START = 8;
const RECIPE_SPAN = 18;

/**
 * Physical order of the recipe book. Tabs and routes share these numbers
 * so a turn is just `to - from`.
 */
export const BOOK_PAGE = {
  cookbook: 1,
  recipeStart: RECIPE_START,
  family: 32,
  person: 33,
  join: 34,
  desk: 36,
  you: 42,
  lost: 48,
} as const;

export type FlipDirection = "forward" | "back";

export type FlipPlan = {
  from: number;
  to: number;
  direction: FlipDirection;
  durationMs: number;
};

function slugOffset(slug: string): number {
  let n = 0;
  for (const char of slug) {
    n = (n + char.charCodeAt(0) * 7) % RECIPE_SPAN;
  }
  return n;
}

export function pageForPath(pathname: string): number {
  if (pathname === "/") {
    return BOOK_PAGE.cookbook;
  }
  if (pathname === "/you" || pathname.startsWith("/you/")) {
    return BOOK_PAGE.you;
  }
  if (pathname.startsWith("/family/")) {
    return BOOK_PAGE.person;
  }
  if (pathname === "/join") {
    return BOOK_PAGE.join;
  }
  if (
    pathname === DESK_PATH ||
    pathname === "/admin" ||
    pathname === "/write" ||
    pathname === "/chris-desk"
  ) {
    return BOOK_PAGE.desk;
  }

  const bake = /^\/bakes\/([^/]+)/.exec(pathname);
  if (bake?.[1]) {
    return BOOK_PAGE.recipeStart + slugOffset(bake[1]);
  }

  return BOOK_PAGE.lost;
}

export type BookSection = "cookbook" | "family" | "add" | "you" | "join" | "other";

export function sectionOf(pathname: string): BookSection {
  if (pathname === "/" || pathname.startsWith("/bakes/")) {
    return "cookbook";
  }
  if (pathname === "/you" || pathname.startsWith("/you/")) {
    return "you";
  }
  if (pathname.startsWith("/family/")) {
    return "family";
  }
  if (
    pathname === DESK_PATH ||
    pathname === "/admin" ||
    pathname === "/write" ||
    pathname === "/chris-desk"
  ) {
    return "add";
  }
  if (pathname === "/join") {
    return "join";
  }
  return "other";
}

/** Page turns are for the three leaves: recipe book, add, your page (the back). */
export function shouldFlip(fromPath: string, toPath: string): boolean {
  if (fromPath === toPath) {
    return false;
  }
  if (toPath === "/join") {
    return false;
  }
  const from = sectionOf(fromPath);
  const to = sectionOf(toPath);
  if (from === to) {
    return false;
  }
  const tabs = new Set<BookSection>(["cookbook", "add", "you"]);
  return tabs.has(from) && tabs.has(to);
}

export function planFlip(fromPath: string, toPath: string): FlipPlan {
  const from = pageForPath(fromPath);
  const to = pageForPath(toPath);
  return {
    from,
    to,
    direction: to >= from ? "forward" : "back",
    durationMs: BOOK_FLIP_MS,
  };
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
