import { inferKind, type BakeKind } from "../../convex/lib/kinds";

export type ChangeRow = { move: string; change: string; why: string };

export const CHANGE_MOVES = [
  "More",
  "Less",
  "Skipped",
  "Swapped",
  "Time",
  "Heat",
] as const;

export const CHANGE_HINT: Record<(typeof CHANGE_MOVES)[number], string> = {
  More: "cinnamon",
  Less: "sugar",
  Skipped: "butter",
  Swapped: "flour",
  Time: "chilled overnight",
  Heat: "375 instead of 350",
};

export function changeHint(move: string): string {
  if (move in CHANGE_HINT) {
    return CHANGE_HINT[move as (typeof CHANGE_MOVES)[number]];
  }
  return "what changed";
}

export function readyChanges(changes: ChangeRow[]): ChangeRow[] {
  return changes
    .map((row) => ({
      move: row.move.trim(),
      change: row.change.trim(),
      why: row.why.trim(),
    }))
    .filter((row) => row.move.length > 0 && row.change.length > 0);
}

export const MAKES_HINT: Record<BakeKind, string> = {
  muffins: "About a dozen. Muffin tin.",
  cookies: "Two dozen. Two trays.",
  cake: "One cake, or two dozen cupcakes.",
  bread: "One loaf.",
  crisp: "One 9×13.",
  bars: "One pan.",
  other: "One batch.",
};

export function normalizeSallyUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function isSallyUrl(value: string): boolean {
  try {
    const host = new URL(normalizeSallyUrl(value)).hostname.toLowerCase();
    return (
      host === "sallysbakingaddiction.com" ||
      host === "www.sallysbakingaddiction.com"
    );
  } catch {
    return false;
  }
}

export function houseTitleFromSally(sallyTitle: string): string {
  return sallyTitle
    .replace(/^(my favorite|the best|best|classic|easy|homemade|popular)\s+/i, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+recipe$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function trayFor(title: string, sourceTitle: string): BakeKind {
  return inferKind(title, sourceTitle);
}

