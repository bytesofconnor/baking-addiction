import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { toTeaser } from "./bakes";
import {
  calledForViewer,
  calledName,
  getSignedInUser,
  isConnectedTo,
  kitchensForPeople,
} from "./lib/family";
import { bakeTeaserValidator } from "./lib/validators";
import {
  findUserByEmail,
  isSampleKey,
  SAMPLE_KEYS,
  sampleEmail,
  uniquifyPeople,
  type SampleKey,
} from "./lib/samples";

const dummyCookReturn = v.object({
  key: v.union(v.literal("mom"), v.literal("nana"), v.literal("brenda")),
  userId: v.id("users"),
  called: v.string(),
});

const dummyPersonReturn = v.object({
  otherUserId: v.id("users"),
  called: v.string(),
  email: v.string(),
  included: v.boolean(),
});

async function sampleCookOrNull(ctx: QueryCtx, key: SampleKey) {
  return await findUserByEmail(ctx, sampleEmail(key));
}

async function requirePeekableSample(
  ctx: QueryCtx,
  key: string,
): Promise<{ viewer: Doc<"users">; cook: Doc<"users">; key: SampleKey } | null> {
  if (!isSampleKey(key)) {
    return null;
  }
  const viewer = await getSignedInUser(ctx);
  if (!viewer) {
    return null;
  }
  const cook = await sampleCookOrNull(ctx, key);
  if (!cook) {
    return null;
  }
  if (!(await isConnectedTo(ctx, viewer._id, cook._id))) {
    return null;
  }
  return { viewer, cook, key };
}

async function peopleFor(ctx: QueryCtx, userId: Doc<"users">["_id"]) {
  const links = await ctx.db
    .query("connections")
    .withIndex("by_viewer", (q) => q.eq("viewerId", userId))
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
}

async function teasersForKitchens(
  ctx: QueryCtx,
  kitchenIds: Doc<"kitchens">["_id"][],
) {
  const collected: Doc<"bakes">[] = [];
  for (const kitchenId of kitchenIds) {
    const bakes = await ctx.db
      .query("bakes")
      .withIndex("by_kitchen_and_status", (q) =>
        q.eq("kitchenId", kitchenId).eq("status", "published"),
      )
      .order("desc")
      .take(80);
    collected.push(...bakes);
  }
  collected.sort(
    (left, right) => (right.publishedAt ?? 0) - (left.publishedAt ?? 0),
  );
  const teasers = [];
  for (const bake of collected.slice(0, 80)) {
    teasers.push(await toTeaser(ctx, bake));
  }
  return teasers;
}

export const dummyCooks = query({
  args: {},
  returns: v.array(dummyCookReturn),
  handler: async (ctx) => {
    const viewer = await getSignedInUser(ctx);
    if (!viewer) {
      return [];
    }
    const cooks = [];
    for (const key of SAMPLE_KEYS) {
      const cook = await sampleCookOrNull(ctx, key);
      if (!cook) {
        continue;
      }
      if (!(await isConnectedTo(ctx, viewer._id, cook._id))) {
        continue;
      }
      cooks.push({
        key,
        userId: cook._id,
        called: calledName(cook),
      });
    }
    return cooks;
  },
});

export const dummyBook = query({
  args: {
    key: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      key: v.union(v.literal("mom"), v.literal("nana"), v.literal("brenda")),
      userId: v.id("users"),
      called: v.string(),
      people: v.array(dummyPersonReturn),
    }),
  ),
  handler: async (ctx, args) => {
    const peek = await requirePeekableSample(ctx, args.key);
    if (!peek) {
      return null;
    }
    return {
      key: peek.key,
      userId: peek.cook._id,
      called: calledName(peek.cook),
      people: await peopleFor(ctx, peek.cook._id),
    };
  },
});

export const dummyBakes = query({
  args: {
    key: v.string(),
    includeMine: v.optional(v.boolean()),
    otherUserIds: v.optional(v.array(v.id("users"))),
  },
  returns: v.array(bakeTeaserValidator),
  handler: async (ctx, args) => {
    const peek = await requirePeekableSample(ctx, args.key);
    if (!peek) {
      return [];
    }
    const people = await peopleFor(ctx, peek.cook._id);
    const kitchenIds =
      args.otherUserIds !== undefined
        ? await kitchensForPeople(
            ctx,
            peek.cook._id,
            args.includeMine !== false,
            args.otherUserIds,
          )
        : await kitchensForPeople(
            ctx,
            peek.cook._id,
            true,
            people.map((person) => person.otherUserId),
          );
    return await teasersForKitchens(ctx, kitchenIds);
  },
});
