import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  calledName,
  connectPair,
  getSignedInUser,
  hashFamilyToken,
  ownedKitchen,
  recipesBookName,
  requireSignedIn,
} from "./lib/family";
import { startKitchen } from "./kitchens";

const userReturn = v.object({
  _id: v.id("users"),
  called: v.string(),
  email: v.string(),
});

const kitchenReturn = v.object({
  _id: v.id("kitchens"),
  name: v.string(),
  ownerCalled: v.string(),
  role: v.union(v.literal("owner"), v.literal("cook"), v.literal("reader")),
});

export const me = query({
  args: {},
  returns: v.union(
    v.object({
      user: userReturn,
      kitchens: v.array(kitchenReturn),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getSignedInUser(ctx);
    if (!user) {
      return null;
    }
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(20);
    const kitchens = [];
    for (const membership of memberships) {
      const kitchen = await ctx.db.get("kitchens", membership.kitchenId);
      if (kitchen) {
        const owner = await ctx.db.get("users", kitchen.ownerId);
        kitchens.push({
          _id: kitchen._id,
          name: kitchen.name,
          ownerCalled: owner ? calledName(owner) : kitchen.name,
          role: membership.role,
        });
      }
    }
    return {
      user: {
        _id: user._id,
        called: calledName(user),
        email: user.email ?? "",
      },
      kitchens,
    };
  },
});

export const peekInvite = query({
  args: { inviteToken: v.string() },
  returns: v.union(
    v.object({
      kitchenName: v.string(),
      role: v.union(v.literal("cook"), v.literal("reader")),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const tokenHash = await hashFamilyToken(args.inviteToken);
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!invite) {
      return null;
    }
    const kitchen = await ctx.db.get("kitchens", invite.kitchenId);
    if (!kitchen) {
      return null;
    }
    return {
      kitchenName: kitchen.name.replace(/'s recipes$/i, ""),
      role: invite.role,
    };
  },
});

export const acceptInvite = mutation({
  args: {
    inviteToken: v.string(),
  },
  returns: v.id("kitchens"),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    return await joinInvite(ctx, user._id, args.inviteToken);
  },
});

async function joinInvite(
  ctx: MutationCtx,
  userId: Id<"users">,
  inviteToken: string,
): Promise<Id<"kitchens">> {
  const tokenHash = await hashFamilyToken(inviteToken.trim());
  const invite = await ctx.db
    .query("invites")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!invite) {
    throw new Error("That invite isn't good anymore.");
  }
  if (invite.expiresAt <= Date.now()) {
    throw new Error("That invite ran out. Ask for a new one.");
  }
  const kitchen = await ctx.db.get("kitchens", invite.kitchenId);
  if (!kitchen) {
    throw new Error("That book isn't here anymore.");
  }
  if (kitchen.ownerId !== userId) {
    await connectPair(ctx, userId, kitchen.ownerId);
  }
  const mine = await ownedKitchen(ctx, userId);
  if (mine) {
    return mine._id;
  }
  const user = await ctx.db.get("users", userId);
  if (!user) {
    throw new Error("Not signed in");
  }
  return await startKitchen(ctx, userId, recipesBookName(calledName(user)));
}

export const setCalled = mutation({
  args: { called: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const called = args.called.trim().replace(/\s+/g, " ");
    if (called.length < 1) {
      throw new Error("What should we call you in the book?");
    }
    if (called.length > 32) {
      throw new Error("A little shorter — it has to fit in the corner.");
    }
    await ctx.db.patch(user._id, { called });
    const kitchen = await ownedKitchen(ctx, user._id);
    if (kitchen && called.toLowerCase() !== "mom") {
      await ctx.db.patch(kitchen._id, { name: recipesBookName(called) });
    }
    return null;
  },
});
