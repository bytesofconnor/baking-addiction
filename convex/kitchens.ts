import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  backfillConnections,
  calledName,
  claimOrphanBakes,
  recipesBookName,
  hashFamilyToken,
  INVITE_MS,
  newInviteToken,
  requireCook,
  requireMember,
  requireSignedIn,
} from "./lib/family";

const memberReturn = v.object({
  userId: v.id("users"),
  called: v.string(),
  role: v.union(v.literal("owner"), v.literal("cook"), v.literal("reader")),
});

export async function startKitchen(
  ctx: MutationCtx,
  userId: Id<"users">,
  name: string,
) {
  const kitchenId = await ctx.db.insert("kitchens", {
    name,
    ownerId: userId,
    createdAt: Date.now(),
  });
  await ctx.db.insert("members", {
    kitchenId,
    userId,
    role: "owner",
  });
  const alreadyIn = await ctx.db
    .query("members")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(8);
  if (alreadyIn.length === 1) {
    await claimOrphanBakes(ctx, kitchenId, userId);
  }
  return kitchenId;
}

export const create = mutation({
  args: {
    name: v.string(),
  },
  returns: v.id("kitchens"),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const name = args.name.trim();
    if (name.length < 2) {
      throw new Error("The book needs a name.");
    }
    const owned = await ctx.db
      .query("kitchens")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .take(8);
    if (owned.length >= 8) {
      throw new Error("That's enough kitchens for now.");
    }
    return await startKitchen(ctx, user._id, name);
  },
});

export const ensureMine = mutation({
  args: {},
  returns: v.id("kitchens"),
  handler: async (ctx) => {
    const user = await requireSignedIn(ctx);
    const owned = await ctx.db
      .query("kitchens")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .take(1);
    const mine = owned[0];
    const kitchenId = mine
      ? mine._id
      : await startKitchen(ctx, user._id, recipesBookName(calledName(user)));
    if (mine) {
      const called = calledName(user);
      if (
        mine.name === "Mom's recipes" &&
        called.toLowerCase() !== "mom"
      ) {
        await ctx.db.patch(mine._id, { name: recipesBookName(called) });
      }
    }
    await backfillConnections(ctx, user._id);
    return kitchenId;
  },
});

export const createInvite = mutation({
  args: {
    kitchenId: v.id("kitchens"),
    role: v.union(v.literal("cook"), v.literal("reader")),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const access = await requireCook(ctx, args.kitchenId);
    if (access.membership.role !== "owner") {
      throw new Error("Only the person who started this kitchen can invite.");
    }
    const token = newInviteToken();
    const now = Date.now();
    await ctx.db.insert("invites", {
      kitchenId: args.kitchenId,
      tokenHash: await hashFamilyToken(token),
      role: args.role,
      createdBy: access.user._id,
      createdAt: now,
      expiresAt: now + INVITE_MS,
    });
    return { token };
  },
});

export const listFamily = query({
  args: {
    kitchenId: v.id("kitchens"),
  },
  returns: v.array(memberReturn),
  handler: async (ctx, args) => {
    await requireMember(ctx, args.kitchenId);
    const members = await ctx.db
      .query("members")
      .withIndex("by_kitchen", (q) => q.eq("kitchenId", args.kitchenId))
      .take(40);
    const people = [];
    for (const member of members) {
      const user = await ctx.db.get("users", member.userId);
      if (!user) {
        continue;
      }
      people.push({
        userId: user._id,
        called: calledName(user),
        role: member.role,
      });
    }
    people.sort((left, right) => left.called.localeCompare(right.called));
    return people;
  },
});

export const get = query({
  args: {
    kitchenId: v.id("kitchens"),
  },
  returns: v.union(
    v.object({
      _id: v.id("kitchens"),
      name: v.string(),
      role: v.union(v.literal("owner"), v.literal("cook"), v.literal("reader")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    try {
      const access = await requireMember(ctx, args.kitchenId);
      return {
        _id: access.kitchen._id,
        name: access.kitchen.name,
        role: access.membership.role,
      };
    } catch {
      return null;
    }
  },
});
