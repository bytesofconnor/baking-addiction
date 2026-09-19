import { v } from "convex/values";

export const SOURCE_KINDS = [
  "original",
  "family",
  "friend",
  "book",
  "sally",
  "tiktok",
  "pinterest",
] as const;

export const sourceKindValidator = v.union(
  v.literal("sally"),
  v.literal("original"),
  v.literal("family"),
  v.literal("friend"),
  v.literal("book"),
  v.literal("tiktok"),
  v.literal("pinterest"),
);

export type SourceKind = (typeof SOURCE_KINDS)[number];

export function isSourceKind(value: unknown): value is SourceKind {
  return (
    typeof value === "string" &&
    (SOURCE_KINDS as readonly string[]).includes(value)
  );
}

export function kindFromUrl(url: string): SourceKind | null {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return null;
  }
  try {
    const host = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    )
      .hostname.toLowerCase()
      .replace(/^www\./, "");
    if (
      host === "sallysbakingaddiction.com" ||
      host.endsWith(".sallysbakingaddiction.com")
    ) {
      return "sally";
    }
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
      return "tiktok";
    }
    if (
      host === "pinterest.com" ||
      host === "pin.it" ||
      host.endsWith(".pinterest.com")
    ) {
      return "pinterest";
    }
    return null;
  } catch {
    return null;
  }
}

export function inferSourceKind(
  sourceKind: SourceKind | undefined,
  sourceUrl: string,
): SourceKind {
  const fromUrl = kindFromUrl(sourceUrl);
  if (sourceKind && sourceKind !== "original") {
    return sourceKind;
  }
  return fromUrl ?? sourceKind ?? "original";
}

export function ingredientSearchText(ingredients: string[]): string {
  return ingredients
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .toLowerCase();
}
