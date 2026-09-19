import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canReadBake, getSignedInUser, requireSignedIn } from "./lib/family";

const NOTE_MAX = 400;

const makeLogValidator = v.object({
  _id: v.id("bakeMakes"),
  bakeId: v.id("bakes"),
  title: v.string(),
  slug: v.string(),
  rating: v.number(),
  note: v.string(),
  madeAt: v.number(),
});

const latestValidator = v.object({
  rating: v.number(),
  note: v.string(),
  madeAt: v.number(),
});

function clipNote(note: string): string {
  const trimmed = note.trim();
  return trimmed.length > NOTE_MAX ? trimmed.slice(0, NOTE_MAX) : trimmed;
}

function starRating(value: number): number {
  const rating = Math.round(value);
  if (rating < 1 || rating > 5) {
    throw new Error("Give it one to five stars.");
  }
  return rating;
}

function madeAtFromStamp(stamp: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(stamp.trim());
  if (!match) {
    throw new Error("What day did you try it?");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error("That date looks off.");
  }
  if (year < 1990) {
    throw new Error("Pick a day you actually baked.");
  }
  if (date.getTime() > Date.now() + 36 * 60 * 60 * 1000) {
    throw new Error("That day’s still coming.");
  }
  return date.getTime();
}

export const save = mutation({
  args: {
    bakeId: v.id("bakes"),
    rating: v.number(),
    note: v.optional(v.string()),
    madeOn: v.string(),
  },
  returns: v.id("bakeMakes"),
  handler: async (ctx, args) => {
    const user = await requireSignedIn(ctx);
    const bake = await ctx.db.get("bakes", args.bakeId);
    if (!bake || bake.status !== "published") {
      throw new Error("That card isn’t in the book.");
    }
    if (!(await canReadBake(ctx, user._id, bake))) {
      throw new Error("That card isn’t in your book.");
    }

    return await ctx.db.insert("bakeMakes", {
      bakeId: bake._id,
      userId: user._id,
      rating: starRating(args.rating),
      note: clipNote(args.note ?? ""),
      madeAt: madeAtFromStamp(args.madeOn),
      title: bake.title,
      slug: bake.slug,
    });
  },
});

export const mine = query({
  args: {},
  returns: v.array(makeLogValidator),
  handler: async (ctx) => {
    const user = await getSignedInUser(ctx);
    if (!user) {
      return [];
    }
    const rows = await ctx.db
      .query("bakeMakes")
      .withIndex("by_user_and_madeAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(40);
    return rows.map((row) => ({
      _id: row._id,
      bakeId: row.bakeId,
      title: row.title,
      slug: row.slug,
      rating: row.rating,
      note: row.note,
      madeAt: row.madeAt,
    }));
  },
});

export const forBake = query({
  args: {
    bakeId: v.id("bakes"),
  },
  returns: v.union(
    v.object({
      count: v.number(),
      latest: v.union(latestValidator, v.null()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await getSignedInUser(ctx);
    if (!user) {
      return null;
    }
    const bake = await ctx.db.get("bakes", args.bakeId);
    if (!bake || bake.status !== "published") {
      return null;
    }
    if (!(await canReadBake(ctx, user._id, bake))) {
      return null;
    }

    const rows = await ctx.db
      .query("bakeMakes")
      .withIndex("by_bake_and_user", (q) =>
        q.eq("bakeId", args.bakeId).eq("userId", user._id),
      )
      .take(40);
    rows.sort((left, right) => right.madeAt - left.madeAt);
    const latest = rows[0];
    return {
      count: rows.length,
      latest: latest
        ? {
            rating: latest.rating,
            note: latest.note,
            madeAt: latest.madeAt,
          }
        : null,
    };
  },
});
