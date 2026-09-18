import { v } from "convex/values";

export const changeValidator = v.object({
  move: v.string(),
  change: v.string(),
  why: v.string(),
});

export const kindValidator = v.union(
  v.literal("muffins"),
  v.literal("cookies"),
  v.literal("cake"),
  v.literal("bread"),
  v.literal("crisp"),
  v.literal("bars"),
  v.literal("other"),
);

export const bakeValidator = v.object({
  _id: v.id("bakes"),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  story: v.string(),
  sourceTitle: v.string(),
  sourceUrl: v.string(),
  bakerName: v.string(),
  kind: v.optional(kindValidator),
  method: v.optional(v.string()),
  coverUrl: v.optional(v.string()),
  coverStorageId: v.optional(v.id("_storage")),
  status: v.union(v.literal("draft"), v.literal("published")),
  publishedAt: v.optional(v.number()),
  bakedOn: v.string(),
  rating: v.number(),
  outcome: v.string(),
  changes: v.array(changeValidator),
});

export const bakeTeaserValidator = v.object({
  _id: v.id("bakes"),
  slug: v.string(),
  title: v.string(),
  sourceTitle: v.string(),
  sourceUrl: v.string(),
  bakerName: v.string(),
  kind: v.optional(kindValidator),
  publishedAt: v.optional(v.number()),
  bakedOn: v.string(),
  outcome: v.string(),
  changes: v.array(changeValidator),
  photoUrl: v.union(v.string(), v.null()),
});

export const photoValidator = v.object({
  _id: v.id("photos"),
  url: v.union(v.string(), v.null()),
  alt: v.string(),
});
