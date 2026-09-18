export const KINDS = [
  "muffins",
  "cookies",
  "cake",
  "bread",
  "crisp",
  "bars",
  "other",
] as const;

export type BakeKind = (typeof KINDS)[number];

export const KIND_LABELS: Record<BakeKind, string> = {
  muffins: "Muffins",
  cookies: "Cookies",
  cake: "Cakes",
  bread: "Breads",
  crisp: "Crisps",
  bars: "Bars",
  other: "Everything else",
};

export function inferKind(title: string, sourceTitle: string): BakeKind {
  const hay = `${title} ${sourceTitle}`.toLowerCase();
  if (hay.includes("muffin")) {
    return "muffins";
  }
  if (hay.includes("cookie")) {
    return "cookies";
  }
  if (hay.includes("cupcake")) {
    return "cake";
  }
  if (hay.includes("bread") || hay.includes("bagel") || hay.includes("scone")) {
    return "bread";
  }
  if (
    hay.includes("crisp") ||
    hay.includes("crumble") ||
    hay.includes("cobbler")
  ) {
    return "crisp";
  }
  if (hay.includes("bar") || hay.includes("brownie")) {
    return "bars";
  }
  if (hay.includes("cake") || hay.includes("pie")) {
    return "cake";
  }
  return "other";
}

export function kindLabel(kind: BakeKind | undefined, title: string, sourceTitle: string) {
  return KIND_LABELS[kind ?? inferKind(title, sourceTitle)];
}
