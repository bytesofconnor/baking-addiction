import type { BakeKind } from "../../convex/lib/kinds";
import { inferKind, KIND_LABELS, KINDS } from "../../convex/lib/kinds";

export type CookbookBake = {
  slug: string;
  title: string;
  sourceTitle: string;
  bakerName: string;
  kind?: BakeKind;
  bakedOn: string;
  outcome: string;
  changes: Array<{ move: string; change: string; why: string }>;
  photoUrl?: string | null;
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
  ]
    .join(" ")
    .toLowerCase();
}

export function bakeKind(bake: CookbookBake): BakeKind {
  return bake.kind ?? inferKind(bake.title, bake.sourceTitle);
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

export function kindsInCookbook(bakes: CookbookBake[]) {
  const present = new Set(bakes.map(bakeKind));
  return KINDS.filter((kind) => present.has(kind));
}
