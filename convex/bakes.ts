import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  requireFreshWriterToken,
  requireWriterToken,
} from "./lib/writer";
import { inferKind } from "./lib/kinds";
import { bakeTeaserValidator, bakeValidator, kindValidator } from "./lib/validators";

async function photoUrlForBake(
  ctx: QueryCtx,
  bake: Doc<"bakes">,
): Promise<string | null> {
  if (bake.coverStorageId) {
    const stored = await ctx.storage.getUrl(bake.coverStorageId);
    if (stored) {
      return stored;
    }
  }
  return bake.coverUrl ?? null;
}

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "bake";
}

export const listPublished = query({
  args: {},
  returns: v.array(bakeTeaserValidator),
  handler: async (ctx) => {
    const bakes = await ctx.db
      .query("bakes")
      .withIndex("by_status_and_publishedAt", (q) =>
        q.eq("status", "published"),
      )
      .order("desc")
      .take(80);

    const teasers = [];
    for (const bake of bakes) {
      teasers.push({
        _id: bake._id,
        slug: bake.slug,
        title: bake.title,
        sourceTitle: bake.sourceTitle,
        sourceUrl: bake.sourceUrl,
        bakerName: bake.bakerName,
        kind: bake.kind ?? inferKind(bake.title, bake.sourceTitle),
        publishedAt: bake.publishedAt,
        bakedOn: bake.bakedOn,
        outcome: bake.outcome,
        changes: bake.changes,
        photoUrl: await photoUrlForBake(ctx, bake),
      });
    }
    return teasers;
  },
});

export const getPublishedBySlug = query({
  args: { slug: v.string() },
  returns: v.union(bakeValidator, v.null()),
  handler: async (ctx, args) => {
    const bake = await ctx.db
      .query("bakes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!bake || bake.status !== "published") {
      return null;
    }

    return bake;
  },
});

const writerBakeValidator = v.object({
  _id: v.id("bakes"),
  slug: v.string(),
  title: v.string(),
  status: v.union(v.literal("draft"), v.literal("published")),
  bakedOn: v.string(),
});

export const listMine = query({
  args: { writerToken: v.string() },
  returns: v.array(writerBakeValidator),
  handler: async (ctx, args) => {
    await requireWriterToken(ctx, args.writerToken);

    const published = await ctx.db
      .query("bakes")
      .withIndex("by_status_and_publishedAt", (q) =>
        q.eq("status", "published"),
      )
      .order("desc")
      .take(20);
    const drafts = await ctx.db
      .query("bakes")
      .withIndex("by_status_and_publishedAt", (q) => q.eq("status", "draft"))
      .order("desc")
      .take(20);

    return [...drafts, ...published].map((bake) => ({
      _id: bake._id,
      slug: bake.slug,
      title: bake.title,
      status: bake.status,
      bakedOn: bake.bakedOn,
    }));
  },
});

export const save = mutation({
  args: {
    writerToken: v.string(),
    title: v.string(),
    story: v.string(),
    sourceTitle: v.string(),
    sourceUrl: v.string(),
    bakerName: v.string(),
    kind: v.optional(kindValidator),
    method: v.optional(v.string()),
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
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  returns: v.object({
    bakeId: v.id("bakes"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireFreshWriterToken(ctx, args.writerToken);

    const title = args.title.trim();
    if (title.length < 2) {
      throw new Error("Title must be at least 2 characters");
    }
    if (!args.sourceUrl.trim().startsWith("http")) {
      throw new Error("Sally's recipe needs a full URL");
    }

    let slug = slugify(title);
    const existing = await ctx.db
      .query("bakes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }

    const bakeId = await ctx.db.insert("bakes", {
      slug,
      title,
      story: args.story.trim(),
      sourceTitle: args.sourceTitle.trim(),
      sourceUrl: args.sourceUrl.trim(),
      bakerName: args.bakerName.trim() || "Mom",
      kind: args.kind ?? inferKind(title, args.sourceTitle),
      method: args.method?.trim() || undefined,
      status: args.status,
      publishedAt: args.status === "published" ? Date.now() : undefined,
      bakedOn: args.bakedOn,
      rating: args.rating,
      outcome: args.outcome.trim(),
      changes: args.changes.filter(
        (change) =>
          change.move.trim().length > 0 || change.change.trim().length > 0,
      ),
    });

    return { bakeId, slug };
  },
});
