import { mutation } from "./_generated/server";
import { env } from "./_generated/server";
import { v } from "convex/values";
import {
  assertUnlockAllowed,
  clearUnlockFailures,
  codesMatch,
  createDeskSession,
  newDeskToken,
  recordUnlockFailure,
  refreshDeskSession,
  requireFreshWriterToken,
} from "./lib/writer";

export const unlock = mutation({
  args: { code: v.string() },
  returns: v.object({ token: v.string() }),
  handler: async (ctx, args) => {
    await assertUnlockAllowed(ctx);

    if (!codesMatch(args.code, env.WRITER_PASSWORD)) {
      await recordUnlockFailure(ctx);
      throw new Error("That code didn't work.");
    }

    const token = newDeskToken();
    await createDeskSession(ctx, token);
    await clearUnlockFailures(ctx);
    return { token };
  },
});

export const touch = mutation({
  args: { writerToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await requireFreshWriterToken(ctx, args.writerToken);
    await refreshDeskSession(ctx, session._id);
    return null;
  },
});

export const lock = mutation({
  args: { writerToken: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const session = await requireFreshWriterToken(ctx, args.writerToken);
      await ctx.db.delete("deskSessions", session._id);
    } catch {
      return null;
    }
    return null;
  },
});
