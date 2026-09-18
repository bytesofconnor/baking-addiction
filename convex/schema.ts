import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { kindValidator } from "./lib/validators";

export default defineSchema({
  bakes: defineTable({
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
    changes: v.array(
      v.object({
        move: v.string(),
        change: v.string(),
        why: v.string(),
      }),
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_status_and_publishedAt", ["status", "publishedAt"]),

  photos: defineTable({
    bakeId: v.id("bakes"),
    storageId: v.id("_storage"),
    alt: v.string(),
  }).index("by_bake", ["bakeId"]),

  deskSessions: defineTable({
    tokenHash: v.string(),
    passwordFingerprint: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_tokenHash", ["tokenHash"]),

  deskGates: defineTable({
    name: v.string(),
    failedAt: v.array(v.number()),
  }).index("by_name", ["name"]),
});
