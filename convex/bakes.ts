import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  calledName,
  canReadBake,
  getSignedInUser,
  isConnectedTo,
  kitchensForPeople,
  requireMember,
  requireSignedIn,
  visibleKitchenIds,
} from "./lib/family";
import { requireWriterOrCook } from "./lib/access";
import { requireWriterToken } from "./lib/writer";
import { inferKind } from "./lib/kinds";
import {
  bakeTeaserValidator,
  bakeValidator,
  kindValidator,
} from "./lib/validators";
import {
  ingredientSearchText,
  inferSourceKind,
  sourceKindValidator,
} from "./lib/sources";
import { sampleCoverUrl } from "./seed";
import { countMadeByOthers } from "./lib/makeCounts";

export async function photoUrlForBake(
  ctx: QueryCtx,
  bake: Doc<"bakes">,
): Promise<string | null> {
  if (bake.coverStorageId) {
    const stored = await ctx.storage.getUrl(bake.coverStorageId);
    if (stored) {
      return stored;
    }
  }
  const photos = await ctx.db
    .query("photos")
    .withIndex("by_bake", (q) => q.eq("bakeId", bake._id))
    .take(1);
  const first = photos[0];
  if (first) {
    const stored = await ctx.storage.getUrl(first.storageId);
    if (stored) {
      return stored;
    }
  }
  return bake.coverUrl ?? sampleCoverUrl(bake.slug);
}

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "bake";
}

export async function toTeaser(
  ctx: QueryCtx,
  bake: Doc<"bakes">,
) {
  return {
    _id: bake._id,
    slug: bake.slug,
    title: bake.title,
    sourceTitle: bake.sourceTitle,
    sourceUrl: bake.sourceUrl,
    sourceKind: inferSourceKind(bake.sourceKind, bake.sourceUrl),
    bakerName: bake.bakerName,
    kind: bake.kind ?? inferKind(bake.title, bake.sourceTitle),
    publishedAt: bake.publishedAt,
    bakedOn: bake.bakedOn,
    rating: bake.rating,
    outcome: bake.outcome,
    changes: bake.changes,
    ingredients: bake.ingredients ?? [],
    photoUrl: await photoUrlForBake(ctx, bake),
    ownerId: bake.ownerId,
    madeByOthers: await countMadeByOthers(ctx, bake),
  };
}

export const listPublished = query({
  args: {
    includeMine: v.optional(v.boolean()),
    otherUserIds: v.optional(v.array(v.id("users"))),
    mineOnly: v.optional(v.boolean()),
  },
  returns: v.array(bakeTeaserValidator),
  handler: async (ctx, args) => {
    const user = await getSignedInUser(ctx);
    if (!user) {
      return [];
    }

    const kitchenIds =
      args.mineOnly === true
        ? await visibleKitchenIds(ctx, user._id, true)
        : args.otherUserIds !== undefined
          ? await kitchensForPeople(
              ctx,
              user._id,
              args.includeMine !== false,
              args.otherUserIds,
            )
          : await visibleKitchenIds(ctx, user._id, false);
    const collected: Doc<"bakes">[] = [];
    for (const kitchenId of kitchenIds) {
      const bakes = await ctx.db
        .query("bakes")
        .withIndex("by_kitchen_and_status", (q) =>
          q.eq("kitchenId", kitchenId).eq("status", "published"),
        )
        .order("desc")
        .take(80);
      collected.push(...bakes);
    }
    collected.sort(
      (left, right) => (right.publishedAt ?? 0) - (left.publishedAt ?? 0),
    );

    const teasers = [];
    for (const bake of collected.slice(0, 80)) {
      teasers.push(await toTeaser(ctx, bake));
    }
    return teasers;
  },
});

export const listByPerson = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(bakeTeaserValidator),
  handler: async (ctx, args) => {
    const user = await getSignedInUser(ctx);
    if (!user) {
      return [];
    }
    if (!(await isConnectedTo(ctx, user._id, args.userId))) {
      return [];
    }

    const bakes = await ctx.db
      .query("bakes")
      .withIndex("by_owner_and_status", (q) =>
        q.eq("ownerId", args.userId).eq("status", "published"),
      )
      .order("desc")
      .take(40);

    const teasers = [];
    for (const bake of bakes) {
      teasers.push(await toTeaser(ctx, bake));
    }
    return teasers;
  },
});

export const getPublishedBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(bakeValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getSignedInUser(ctx);
    if (!user) {
      return null;
    }

    const matches = await ctx.db
      .query("bakes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .take(8);

    for (const bake of matches) {
      if (bake.status !== "published") {
        continue;
      }
      if (await canReadBake(ctx, user._id, bake)) {
        return {
          ...bake,
          coverUrl: bake.coverUrl ?? sampleCoverUrl(bake.slug) ?? undefined,
        };
      }
    }

    return null;
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
  args: {
    writerToken: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
  },
  returns: v.array(writerBakeValidator),
  handler: async (ctx, args) => {
    if (args.kitchenId) {
      const user = await requireSignedIn(ctx);
      await requireMember(ctx, args.kitchenId);
      const published = await ctx.db
        .query("bakes")
        .withIndex("by_owner_and_status", (q) =>
          q.eq("ownerId", user._id).eq("status", "published"),
        )
        .take(20);
      const drafts = await ctx.db
        .query("bakes")
        .withIndex("by_owner_and_status", (q) =>
          q.eq("ownerId", user._id).eq("status", "draft"),
        )
        .take(20);
      return [...drafts, ...published]
        .filter((bake) => bake.kitchenId === args.kitchenId)
        .map((bake) => ({
          _id: bake._id,
          slug: bake.slug,
          title: bake.title,
          status: bake.status,
          bakedOn: bake.bakedOn,
        }));
    }
    if (!args.writerToken) {
      return [];
    }
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
    writerToken: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
    title: v.string(),
    story: v.string(),
    sourceTitle: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    sourceKind: v.optional(sourceKindValidator),
    bakerName: v.string(),
    kind: v.optional(kindValidator),
    method: v.optional(v.string()),
    makes: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    steps: v.optional(v.array(v.string())),
    originStorageId: v.optional(v.id("_storage")),
    coverStorageId: v.optional(v.id("_storage")),
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
    const family = await requireWriterOrCook(ctx, {
      writerToken: args.writerToken,
      kitchenId: args.kitchenId,
    });

    const title = args.title.trim();
    if (title.length < 2) {
      throw new Error("Give it a name so you can find it later.");
    }
    const ingredients = (args.ingredients ?? [])
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const steps = (args.steps ?? [])
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const sourceUrl = args.sourceUrl?.trim() ?? "";
    const sourceKind = inferSourceKind(args.sourceKind, sourceUrl);
    if (sourceKind === "sally" && !sourceUrl.startsWith("http")) {
      throw new Error("Sally's recipe needs her full link for the credit.");
    }
    let slug = slugify(title);
    const existing = await ctx.db
      .query("bakes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }

    let kitchenId = family?.kitchen._id ?? args.kitchenId;
    if (!kitchenId) {
      const firstKitchen = await ctx.db.query("kitchens").take(1);
      kitchenId = firstKitchen[0]?._id;
    }

    const bakeId = await ctx.db.insert("bakes", {
      slug,
      title,
      story: args.story.trim(),
      sourceTitle: (args.sourceTitle ?? "").trim(),
      sourceUrl,
      sourceKind,
      bakerName: family
        ? calledName(family.user)
        : args.bakerName.trim() || "Chris",
      kind: args.kind ?? inferKind(title, args.sourceTitle ?? ""),
      method: args.method?.trim() || undefined,
      makes: args.makes?.trim() || undefined,
      ingredients,
      steps,
      ingredientSearch: ingredientSearchText(ingredients),
      originStorageId: args.originStorageId,
      coverStorageId: args.coverStorageId,
      ownerId: family?.user._id,
      kitchenId,
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
