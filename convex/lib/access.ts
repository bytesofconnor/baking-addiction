import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getSignedInUser, requireCook } from "./family";
import { requireFreshWriterToken, requireWriterToken } from "./writer";

export const writerOrCookArgs = {
  writerToken: v.optional(v.string()),
  kitchenId: v.optional(v.id("kitchens")),
};

export async function requireWriterOrCook(
  ctx: MutationCtx,
  args: {
    writerToken?: string;
    kitchenId?: Id<"kitchens">;
  },
) {
  if (args.kitchenId) {
    const user = await getSignedInUser(ctx);
    if (user) {
      return await requireCook(ctx, args.kitchenId);
    }
  }
  if (args.writerToken) {
    await requireFreshWriterToken(ctx, args.writerToken);
    return null;
  }
  throw new Error("Not signed in");
}

export async function requireWriterOrCookQuery(
  ctx: QueryCtx,
  args: {
    writerToken?: string;
    kitchenId?: Id<"kitchens">;
  },
) {
  if (args.kitchenId) {
    const user = await getSignedInUser(ctx);
    if (user) {
      return await requireCook(ctx, args.kitchenId);
    }
  }
  if (args.writerToken) {
    await requireWriterToken(ctx, args.writerToken);
    return null;
  }
  throw new Error("Not signed in");
}
