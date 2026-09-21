import { DESK_PATH } from "@/lib/desk";

/** One turn always takes this long, near or far. */
export const BOOK_FLIP_MS = 480;
/** Front ↔ back of the book — a whole-book turn. */
export const BOOK_OVER_MS = 560;

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
  faq: 35,
  desk: 36,
  you: 42,
  lost: 48,
} as const;

export type FlipDirection = "forward" | "back";
export type FlipKind = "page" | "book";

export type FlipPlan = {
  from: number;
  to: number;
  direction: FlipDirection;
  durationMs: number;
  kind: FlipKind;
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
  if (pathname === "/faq") {
    return BOOK_PAGE.faq;
  }
  if (
    pathname === DESK_PATH ||
    pathname === "/admin" ||
    pathname === "/write" ||
    pathname === "/mom-desk"
  ) {
    return BOOK_PAGE.desk;
  }

  const bake = /^\/bakes\/([^/]+)/.exec(pathname);
  if (bake?.[1]) {
    return BOOK_PAGE.recipeStart + slugOffset(bake[1]);
  }

  return BOOK_PAGE.lost;
}

export type BookSection =
  | "cookbook"
  | "family"
  | "add"
  | "you"
  | "join"
  | "faq"
  | "other";

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
    pathname === "/mom-desk"
  ) {
    return "add";
  }
  if (pathname === "/join") {
    return "join";
  }
  if (pathname === "/faq") {
    return "faq";
  }
  return "other";
}

/** Page turns for Recipes / Add / You. Whole-book turns for Front ↔ Back. */
export function isDoorFlip(fromPath: string, toPath: string): boolean {
  const from = sectionOf(fromPath);
  const to = sectionOf(toPath);
  return (
    (from === "join" && to === "faq") || (from === "faq" && to === "join")
  );
}

export function shouldFlip(fromPath: string, toPath: string): boolean {
  if (fromPath === toPath) {
    return false;
  }
  if (isDoorFlip(fromPath, toPath)) {
    return true;
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
  const kind: FlipKind = isDoorFlip(fromPath, toPath) ? "book" : "page";
  const direction: FlipDirection =
    kind === "book"
      ? toPath === "/faq"
        ? "forward"
        : "back"
      : to >= from
        ? "forward"
        : "back";
  return {
    from,
    to,
    direction,
    durationMs: kind === "book" ? BOOK_OVER_MS : BOOK_FLIP_MS,
    kind,
  };
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
