import type { BakeKind } from "../../convex/lib/kinds";
import type { SourceKind } from "../../convex/lib/sources";
import { inferKind, KIND_LABELS, KINDS } from "../../convex/lib/kinds";
import { whoKey } from "@/lib/cookbookMix";

export type CookbookBake = {
  _id?: string;
  slug: string;
  title: string;
  sourceTitle: string;
  sourceKind?: SourceKind;
  bakerName: string;
  ownerId?: string;
  kind?: BakeKind;
  bakedOn: string;
  rating?: number;
  outcome: string;
  changes: Array<{ move: string; change: string; why: string }>;
  ingredients?: string[];
  photoUrl?: string | null;
  madeByOthers?: number;
};

export type CookbookSort = "newest" | "oldest" | "az";

function haystack(bake: CookbookBake) {
  const changeText = bake.changes
    .flatMap((change) => [change.move, change.change, change.why])
    .join(" ");
  const kind = bake.kind ?? inferKind(bake.title, bake.sourceTitle);
  const stars = bakeStars(bake);
  const starWords =
    stars > 0
      ? [
          `${stars} star`,
          `${stars} stars`,
          `${stars}-star`,
          STAR_NAMES[stars] ?? "",
          `${STAR_NAMES[stars] ?? ""} stars`,
          "★".repeat(stars),
        ]
      : [];
  return [
    bake.title,
    bake.sourceTitle,
    bake.bakerName,
    bake.outcome,
    KIND_LABELS[kind],
    changeText,
    ...starWords,
    ...(bake.ingredients ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

const STAR_NAMES: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
};

export function bakeStars(bake: CookbookBake): number {
  const rating = Math.round(bake.rating ?? 0);
  return rating >= 1 && rating <= 5 ? rating : 0;
}

export function madeByOthersLine(count: number | undefined): string | null {
  if (!count || count < 1) {
    return null;
  }
  if (count === 1) {
    return "Made once by others";
  }
  return `Made ${count} times by others`;
}

export function accordingTo(bake: CookbookBake, selfId?: string): string | null {
  const stars = bakeStars(bake);
  if (stars < 1) {
    return null;
  }
  if (selfId && bake.ownerId && bake.ownerId === selfId) {
    return "According to you";
  }
  const who = bake.bakerName.trim();
  return who.length > 0 ? `According to ${who}` : null;
}

export function bakeKind(bake: CookbookBake): BakeKind {
  return bake.kind ?? inferKind(bake.title, bake.sourceTitle);
}

export function bakeIsWhose(
  bake: CookbookBake,
  who: { called: string; ownerId?: string },
) {
  if (who.ownerId && bake.ownerId) {
    return bake.ownerId === who.ownerId;
  }
  return whoKey(bake.bakerName) === whoKey(who.called);
}

export function filterCookbook(
  bakes: CookbookBake[],
  query: string,
  kind: BakeKind | "all",
  sort: CookbookSort,
  stars: number | "all" = "all",
) {
  const needle = query.trim().toLowerCase();
  const filtered = bakes.filter((bake) => {
    if (kind !== "all" && bakeKind(bake) !== kind) {
      return false;
    }
    if (stars !== "all" && bakeStars(bake) !== stars) {
      return false;
    }
    if (needle.length === 0) {
      return true;
    }
    return haystack(bake).includes(needle);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "az") {
      return a.title.localeCompare(b.title);
    }
    if (sort === "oldest") {
      return a.bakedOn.localeCompare(b.bakedOn);
    }
    return b.bakedOn.localeCompare(a.bakedOn);
  });

  return sorted;
}

export function ingredientHits(bake: CookbookBake, query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }
  return (bake.ingredients ?? []).filter((line) =>
    line.toLowerCase().includes(needle),
  );
}

export function kindsInCookbook(bakes: CookbookBake[]) {
  const present = new Set(bakes.map(bakeKind));
  return KINDS.filter((kind) => present.has(kind));
}
