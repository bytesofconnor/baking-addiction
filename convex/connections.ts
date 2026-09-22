import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { calledForViewer, requireSignedIn } from "./lib/family";
import { uniquifyPeople } from "./lib/samples";

const connectionReturn = v.object({
  otherUserId: v.id("users"),
  called: v.string(),
  email: v.string(),
  included: v.boolean(),
});

export const list = query({
  args: {},
  returns: v.array(connectionReturn),
  handler: async (ctx) => {
    const user = await requireSignedIn(ctx);
    const links = await ctx.db
      .query("connections")
      .withIndex("by_viewer", (q) => q.eq("viewerId", user._id))
      .take(40);
    const people = [];
    for (const link of links) {
      const other = await ctx.db.get("users", link.otherUserId);
      if (!other) {
        continue;
      }
      people.push({
        otherUserId: link.otherUserId,
        called: calledForViewer(link.called, other),
        email: other.email?.trim() ?? "",
        included: link.included,
        user: other,
      });
    }
    return uniquifyPeople(people);
  },
});

export const setCalled = mutation({
  args: {
    otherUserId: v.id("users"),
    called: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const link = await ctx.db
      .query("connections")
      .withIndex("by_viewer_and_other", (q) =>
        q.eq("viewerId", user._id).eq("otherUserId", args.otherUserId),
      )
      .unique();
    if (!link) {
      throw new Error("They aren't in your book.");
    }
    const called = args.called.trim().replace(/\s+/g, " ");
    if (called.length > 32) {
      throw new Error("A little shorter — it's a name in your book.");
    }
    await ctx.db.patch(link._id, {
      called: called.length > 0 ? called : "",
    });
    return null;
  },
});

export const setIncluded = mutation({
  args: {
    otherUserId: v.id("users"),
    included: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const link = await ctx.db
      .query("connections")
      .withIndex("by_viewer_and_other", (q) =>
        q.eq("viewerId", user._id).eq("otherUserId", args.otherUserId),
      )
      .unique();
    if (!link) {
      throw new Error("They aren't synced with you.");
    }
    await ctx.db.patch(link._id, { included: args.included });
    return null;
  },
});

export const throwOut = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const link = await ctx.db
      .query("connections")
      .withIndex("by_viewer_and_other", (q) =>
        q.eq("viewerId", user._id).eq("otherUserId", args.otherUserId),
      )
      .unique();
    if (!link) {
      throw new Error("They aren't in your book.");
    }
    await ctx.db.delete(link._id);

    // Drop the reverse link too — family is mutual.
    const reverse = await ctx.db
      .query("connections")
      .withIndex("by_viewer_and_other", (q) =>
        q.eq("viewerId", args.otherUserId).eq("otherUserId", user._id),
      )
      .unique();
    if (reverse) {
      await ctx.db.delete(reverse._id);
    }

    for (const viewerId of [user._id, args.otherUserId]) {
      const mixes = await ctx.db
        .query("cookbookMixes")
        .withIndex("by_viewer", (q) => q.eq("viewerId", viewerId))
        .take(40);
      const dropId = viewerId === user._id ? args.otherUserId : user._id;
      for (const mix of mixes) {
        if (!mix.otherUserIds.includes(dropId)) {
          continue;
        }
        await ctx.db.patch(mix._id, {
          otherUserIds: mix.otherUserIds.filter((id) => id !== dropId),
        });
      }
    }
    return null;
  },
});
