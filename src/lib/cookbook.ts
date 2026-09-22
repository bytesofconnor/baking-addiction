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
  bakerAvatarUrl?: string | null;
  ownerId?: string;
  kind?: BakeKind;
  bakedOn: string;
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
  return [
    bake.title,
    bake.sourceTitle,
    bake.bakerName,
    bake.outcome,
    KIND_LABELS[kind],
    changeText,
    ...(bake.ingredients ?? []),
  ]
    .join(" ")
    .toLowerCase();
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
) {
  const needle = query.trim().toLowerCase();
  const filtered = bakes.filter((bake) => {
    if (kind !== "all" && bakeKind(bake) !== kind) {
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
