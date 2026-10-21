import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireWriterOrCook, writerOrCookArgs } from "./lib/access";
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
        storageId: photo.storageId,
        url,
        alt: photo.alt,
      });
    }
    return withUrls;
  },
});

export const generateUploadUrl = mutation({
  args: writerOrCookArgs,
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireWriterOrCook(ctx, args);
    return await ctx.storage.generateUploadUrl();
  },
});

export const attach = mutation({
  args: {
    ...writerOrCookArgs,
    bakeId: v.id("bakes"),
    storageId: v.id("_storage"),
    alt: v.string(),
    setCover: v.optional(v.boolean()),
  },
  returns: v.id("photos"),
  handler: async (ctx, args) => {
    await requireWriterOrCook(ctx, args);
    const bake = await ctx.db.get("bakes", args.bakeId);
    if (!bake) {
      throw new Error("Bake not found");
    }

    const photoId = await ctx.db.insert("photos", {
      bakeId: args.bakeId,
      storageId: args.storageId,
      alt: args.alt.trim() || bake.title,
    });

    // Set as cover if requested or if this is the first photo
    if (args.setCover || !bake.coverStorageId) {
      await ctx.db.patch("bakes", args.bakeId, { coverStorageId: args.storageId });
    }

    return photoId;
  },
});

export const remove = mutation({
  args: {
    ...writerOrCookArgs,
    photoId: v.id("photos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireWriterOrCook(ctx, args);
    const photo = await ctx.db.get("photos", args.photoId);
    if (!photo) {
      return null;
    }

    const bake = await ctx.db.get("bakes", photo.bakeId);
    if (!bake) {
      return null;
    }

    // If removing the cover photo, set a new cover from remaining photos
    if (bake.coverStorageId === photo.storageId) {
      const allPhotos = await ctx.db
        .query("photos")
        .withIndex("by_bake", (q) => q.eq("bakeId", photo.bakeId))
        .collect();
      
      const remainingPhotos = allPhotos.find(p => p._id !== args.photoId);

      await ctx.db.patch("bakes", photo.bakeId, {
        coverStorageId: remainingPhotos?.storageId ?? undefined,
      });
    }

    // Delete the storage file to prevent orphaned files
    await ctx.storage.delete(photo.storageId);

    await ctx.db.delete("photos", args.photoId);
    return null;
  },
});

export const setCover = mutation({
  args: {
    ...writerOrCookArgs,
    photoId: v.id("photos"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireWriterOrCook(ctx, args);
    const photo = await ctx.db.get("photos", args.photoId);
    if (!photo) {
      throw new Error("Photo not found");
    }

    await ctx.db.patch("bakes", photo.bakeId, { coverStorageId: photo.storageId });
    return null;
  },
});

export const reorder = mutation({
  args: {
    ...writerOrCookArgs,
    bakeId: v.id("bakes"),
    photoIds: v.array(v.id("photos")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireWriterOrCook(ctx, args);
    
    // Verify all photos belong to this bake
    for (const photoId of args.photoIds) {
      const photo = await ctx.db.get("photos", photoId);
      if (!photo || photo.bakeId !== args.bakeId) {
        throw new Error("Invalid photo ID");
      }
    }

    // Delete all existing photos for this bake
    const existingPhotos = await ctx.db
      .query("photos")
      .withIndex("by_bake", (q) => q.eq("bakeId", args.bakeId))
      .collect();

    // Store photo data
    const photoData = new Map();
    for (const photo of existingPhotos) {
      photoData.set(photo._id, photo);
    }

    // Delete all
    for (const photo of existingPhotos) {
      await ctx.db.delete("photos", photo._id);
    }

    // Re-insert in new order
    for (const photoId of args.photoIds) {
      const data = photoData.get(photoId);
      if (data) {
        await ctx.db.insert("photos", {
          bakeId: data.bakeId,
          storageId: data.storageId,
          alt: data.alt,
        });
      }
    }

    return null;
  },
});
