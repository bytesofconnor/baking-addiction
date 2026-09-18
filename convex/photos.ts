import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireFreshWriterToken } from "./lib/writer";
import { photoValidator } from "./lib/validators";

export const listForBake = query({
  args: { bakeId: v.id("bakes") },
  returns: v.array(photoValidator),
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_bake", (q) => q.eq("bakeId", args.bakeId))
      .take(12);

    const withUrls = [];
    for (const photo of photos) {
      const url = await ctx.storage.getUrl(photo.storageId);
      withUrls.push({
        _id: photo._id,
        url,
        alt: photo.alt,
      });
    }
    return withUrls;
  },
});

export const generateUploadUrl = mutation({
  args: { writerToken: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireFreshWriterToken(ctx, args.writerToken);
    return await ctx.storage.generateUploadUrl();
  },
});

export const attach = mutation({
  args: {
    writerToken: v.string(),
    bakeId: v.id("bakes"),
    storageId: v.id("_storage"),
    alt: v.string(),
  },
  returns: v.id("photos"),
  handler: async (ctx, args) => {
    await requireFreshWriterToken(ctx, args.writerToken);
    const bake = await ctx.db.get("bakes", args.bakeId);
    if (!bake) {
      throw new Error("Bake not found");
    }

    const photoId = await ctx.db.insert("photos", {
      bakeId: args.bakeId,
      storageId: args.storageId,
      alt: args.alt.trim() || bake.title,
    });

    if (!bake.coverStorageId) {
      await ctx.db.patch(args.bakeId, { coverStorageId: args.storageId });
    }

    return photoId;
  },
});
