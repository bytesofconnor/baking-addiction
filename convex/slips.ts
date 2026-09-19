import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { photoUrlForBake } from "./bakes";
import { canReadBake, requireSignedIn } from "./lib/family";
import { hashDeskToken, newDeskToken } from "./lib/writer";
import { inferKind } from "./lib/kinds";
import { inferSourceKind, sourceKindValidator } from "./lib/sources";
import { changeValidator, kindValidator } from "./lib/validators";

const slipRecipeValidator = v.object({
  title: v.string(),
  kind: kindValidator,
  makes: v.optional(v.string()),
  ingredients: v.array(v.string()),
  steps: v.array(v.string()),
  method: v.optional(v.string()),
  sourceTitle: v.string(),
  sourceUrl: v.string(),
  sourceKind: v.optional(sourceKindValidator),
  photoUrl: v.union(v.string(), v.null()),
  changes: v.array(changeValidator),
});

export const create = mutation({
  args: {
    bakeId: v.id("bakes"),
  },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const bake = await ctx.db.get("bakes", args.bakeId);
    if (!bake || bake.status !== "published") {
      throw new Error("That recipe isn't here.");
    }
    if (!(await canReadBake(ctx, user._id, bake))) {
      throw new Error("That recipe isn't in your book.");
    }

    const token = newDeskToken();
    await ctx.db.insert("recipeSlips", {
      tokenHash: await hashDeskToken(token),
      bakeId: bake._id,
      createdBy: user._id,
      createdAt: Date.now(),
    });
    return { token };
  },
});

export const open = query({
  args: {
    token: v.string(),
  },
  returns: v.union(slipRecipeValidator, v.null()),
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (token.length < 16) {
      return null;
    }

    const tokenHash = await hashDeskToken(token);
    const slip = await ctx.db
      .query("recipeSlips")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!slip) {
      return null;
    }

    const bake = await ctx.db.get("bakes", slip.bakeId);
    if (!bake || bake.status !== "published") {
      return null;
    }

    return {
      title: bake.title,
      kind: bake.kind ?? inferKind(bake.title, bake.sourceTitle),
      makes: bake.makes,
      ingredients: bake.ingredients ?? [],
      steps: bake.steps ?? [],
      method: bake.method,
      sourceTitle: bake.sourceTitle,
      sourceUrl: bake.sourceUrl,
      sourceKind: inferSourceKind(bake.sourceKind, bake.sourceUrl),
      photoUrl: await photoUrlForBake(ctx, bake),
      changes: bake.changes,
    };
  },
});
