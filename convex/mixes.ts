import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSignedIn } from "./lib/family";

const mixReturn = v.object({
  _id: v.id("cookbookMixes"),
  name: v.string(),
  includeMine: v.boolean(),
  otherUserIds: v.array(v.id("users")),
  isDefault: v.boolean(),
});

export const list = query({
  args: {},
  returns: v.array(mixReturn),
  handler: async (ctx) => {
    const user = await requireSignedIn(ctx);
    const mixes = await ctx.db
      .query("cookbookMixes")
      .withIndex("by_viewer", (q) => q.eq("viewerId", user._id))
      .take(8);
    return mixes
      .map((mix) => ({
        _id: mix._id,
        name: mix.name,
        includeMine: mix.includeMine,
        otherUserIds: mix.otherUserIds,
        isDefault: mix.isDefault,
      }))
      .sort((left, right) => {
        if (left.isDefault !== right.isDefault) {
          return left.isDefault ? -1 : 1;
        }
        return left.name.localeCompare(right.name);
      });
  },
});

export const save = mutation({
  args: {
    name: v.string(),
    includeMine: v.boolean(),
    otherUserIds: v.array(v.id("users")),
    makeDefault: v.boolean(),
  },
  returns: v.id("cookbookMixes"),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const name = args.name.trim() || "Usual";
    if (name.length > 40) {
      throw new Error("Give that mix a shorter name.");
    }
    const otherUserIds = [...new Set(args.otherUserIds)].slice(0, 12);
    const existing = await ctx.db
      .query("cookbookMixes")
      .withIndex("by_viewer", (q) => q.eq("viewerId", user._id))
      .take(8);
    const same = existing.find(
      (mix) =>
        mix.includeMine === args.includeMine &&
        sameIds(mix.otherUserIds, otherUserIds),
    );
    if (args.makeDefault) {
      for (const mix of existing) {
        if (mix.isDefault && mix._id !== same?._id) {
          await ctx.db.patch("cookbookMixes", mix._id, { isDefault: false });
        }
      }
    }
    if (same) {
      await ctx.db.patch("cookbookMixes", same._id, {
        name,
        isDefault: args.makeDefault || same.isDefault,
      });
      return same._id;
    }
    if (existing.length >= 8) {
      throw new Error("That's enough saved mixes for now.");
    }
    return await ctx.db.insert("cookbookMixes", {
      viewerId: user._id,
      name,
      includeMine: args.includeMine,
      otherUserIds,
      isDefault: args.makeDefault || existing.length === 0,
      createdAt: Date.now(),
    });
  },
});

export const setDefault = mutation({
  args: {
    mixId: v.id("cookbookMixes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const mix = await ctx.db.get("cookbookMixes", args.mixId);
    if (!mix || mix.viewerId !== user._id) {
      throw new Error("That mix isn't yours.");
    }
    const existing = await ctx.db
      .query("cookbookMixes")
      .withIndex("by_viewer", (q) => q.eq("viewerId", user._id))
      .take(8);
    for (const other of existing) {
      if (other.isDefault && other._id !== mix._id) {
        await ctx.db.patch("cookbookMixes", other._id, { isDefault: false });
      }
    }
    await ctx.db.patch("cookbookMixes", mix._id, { isDefault: true });
    return null;
  },
});

function sameIds(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }
  const wanted = new Set(right);
  return left.every((id) => wanted.has(id));
}
