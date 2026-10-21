import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { hashDeskToken, newDeskToken } from "./writer";

export const INVITE_MS = 30 * 24 * 60 * 60 * 1000;

export type KitchenRole = "owner" | "cook" | "reader";

export function recipesBookName(called: string): string {
  const who = called.trim() || "My";
  return `${who}'s recipes`;
}

export function calledName(user: Doc<"users">): string {
  return (
    user.called?.trim() ||
    user.name?.trim().split(/\s+/)[0] ||
    user.email?.split("@")[0] ||
    "Family"
  );
}

export function calledForViewer(
  nickname: string | undefined,
  other: Doc<"users">,
): string {
  const mine = nickname?.trim();
  return mine && mine.length > 0 ? mine : calledName(other);
}

export function newInviteToken(): string {
  return newDeskToken();
}

export async function hashFamilyToken(token: string): Promise<string> {
  return hashDeskToken(token);
}

export async function getSignedInUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  // Dev-only test bypass for local verification
  const testBypass = process.env.TEST_AUTH_BYPASS === "true";
  if (testBypass) {
    const testUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "test@local.dev"))
      .unique();
    if (testUser) {
      return testUser;
    }
  }
  
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return null;
  }
  return await ctx.db.get("users", userId);
}

export async function requireSignedIn(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await getSignedInUser(ctx);
  if (!user) {
    throw new Error("Not signed in");
  }
  return user;
}

export async function getMembership(
  ctx: QueryCtx | MutationCtx,
  kitchenId: Id<"kitchens">,
  userId: Id<"users">,
): Promise<Doc<"members"> | null> {
  return await ctx.db
    .query("members")
    .withIndex("by_kitchen_and_user", (q) =>
      q.eq("kitchenId", kitchenId).eq("userId", userId),
    )
    .unique();
}

export async function requireMember(
  ctx: QueryCtx | MutationCtx,
  kitchenId: Id<"kitchens">,
): Promise<{
  user: Doc<"users">;
  membership: Doc<"members">;
  kitchen: Doc<"kitchens">;
}> {
  const user = await requireSignedIn(ctx);
  const kitchen = await ctx.db.get("kitchens", kitchenId);
  if (!kitchen) {
    throw new Error("That kitchen isn't here.");
  }
  const membership = await getMembership(ctx, kitchenId, user._id);
  if (!membership) {
    throw new Error("You're not in this kitchen.");
  }
  return { user, membership, kitchen };
}

export function canWriteRole(role: KitchenRole): boolean {
  return role === "owner" || role === "cook";
}

export async function requireCook(
  ctx: QueryCtx | MutationCtx,
  kitchenId: Id<"kitchens">,
): Promise<{
  user: Doc<"users">;
  membership: Doc<"members">;
  kitchen: Doc<"kitchens">;
}> {
  const access = await requireMember(ctx, kitchenId);
  if (!canWriteRole(access.membership.role)) {
    throw new Error("This kitchen is read-only for you.");
  }
  return access;
}

export async function ownedKitchen(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
) {
  const owned = await ctx.db
    .query("kitchens")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .take(1);
  return owned[0] ?? null;
}

export async function ensureConnection(
  ctx: MutationCtx,
  viewerId: Id<"users">,
  otherUserId: Id<"users">,
): Promise<void> {
  if (viewerId === otherUserId) {
    return;
  }
  const existing = await ctx.db
    .query("connections")
    .withIndex("by_viewer_and_other", (q) =>
      q.eq("viewerId", viewerId).eq("otherUserId", otherUserId),
    )
    .unique();
  if (existing) {
    return;
  }
  await ctx.db.insert("connections", {
    viewerId,
    otherUserId,
    included: true,
    createdAt: Date.now(),
  });
}

export async function connectPair(
  ctx: MutationCtx,
  leftId: Id<"users">,
  rightId: Id<"users">,
): Promise<void> {
  await ensureConnection(ctx, leftId, rightId);
  await ensureConnection(ctx, rightId, leftId);
}

/** If A→B exists but B→A is missing, write the reverse so both books stay in sync. */
export async function mirrorOutgoingConnections(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const links = await ctx.db
    .query("connections")
    .withIndex("by_viewer", (q) => q.eq("viewerId", userId))
    .take(40);
  for (const link of links) {
    await ensureConnection(ctx, link.otherUserId, userId);
  }
}

export async function visibleKitchenIds(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  mineOnly: boolean,
): Promise<Id<"kitchens">[]> {
  if (mineOnly) {
    return await kitchensForPeople(ctx, userId, true, []);
  }
  const links = await ctx.db
    .query("connections")
    .withIndex("by_viewer", (q) => q.eq("viewerId", userId))
    .take(40);
  const others = links
    .filter((link) => link.included)
    .map((link) => link.otherUserId);
  return await kitchensForPeople(ctx, userId, true, others);
}

export async function kitchensForPeople(
  ctx: QueryCtx | MutationCtx,
  viewerId: Id<"users">,
  includeMine: boolean,
  otherUserIds: Id<"users">[],
): Promise<Id<"kitchens">[]> {
  const ids: Id<"kitchens">[] = [];
  if (includeMine) {
    const mine = await ownedKitchen(ctx, viewerId);
    if (mine) {
      ids.push(mine._id);
    }
  }
  for (const otherId of otherUserIds.slice(0, 20)) {
    if (otherId === viewerId) {
      continue;
    }
    if (!(await isConnectedTo(ctx, viewerId, otherId))) {
      continue;
    }
    const kitchen = await ownedKitchen(ctx, otherId);
    if (kitchen) {
      ids.push(kitchen._id);
    }
  }
  return ids;
}

export async function isConnectedTo(
  ctx: QueryCtx | MutationCtx,
  viewerId: Id<"users">,
  otherUserId: Id<"users">,
): Promise<boolean> {
  if (viewerId === otherUserId) {
    return true;
  }
  const link = await ctx.db
    .query("connections")
    .withIndex("by_viewer_and_other", (q) =>
      q.eq("viewerId", viewerId).eq("otherUserId", otherUserId),
    )
    .unique();
  return link !== null;
}

export async function canReadBake(
  ctx: QueryCtx | MutationCtx,
  viewerId: Id<"users">,
  bake: Doc<"bakes">,
): Promise<boolean> {
  if (bake.ownerId === viewerId) {
    return true;
  }
  const mine = await ownedKitchen(ctx, viewerId);
  if (mine && bake.kitchenId === mine._id) {
    return true;
  }
  if (bake.ownerId) {
    return await isConnectedTo(ctx, viewerId, bake.ownerId);
  }
  if (bake.kitchenId) {
    const kitchen = await ctx.db.get("kitchens", bake.kitchenId);
    if (kitchen) {
      return await isConnectedTo(ctx, viewerId, kitchen.ownerId);
    }
  }
  return false;
}

export async function backfillConnections(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const mine = await ownedKitchen(ctx, userId);
  if (mine) {
    const members = await ctx.db
      .query("members")
      .withIndex("by_kitchen", (q) => q.eq("kitchenId", mine._id))
      .take(40);
    for (const member of members) {
      await connectPair(ctx, userId, member.userId);
    }
  }
  const memberships = await ctx.db
    .query("members")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(20);
  for (const membership of memberships) {
    const kitchen = await ctx.db.get("kitchens", membership.kitchenId);
    if (kitchen) {
      await connectPair(ctx, userId, kitchen.ownerId);
      const peers = await ctx.db
        .query("members")
        .withIndex("by_kitchen", (q) => q.eq("kitchenId", kitchen._id))
        .take(40);
      for (const peer of peers) {
        await connectPair(ctx, userId, peer.userId);
      }
    }
  }
  await mirrorOutgoingConnections(ctx, userId);
}

export async function claimOrphanBakes(
  ctx: MutationCtx,
  kitchenId: Id<"kitchens">,
  ownerId: Id<"users">,
): Promise<void> {
  for (const status of ["published", "draft"] as const) {
    const bakes = await ctx.db
      .query("bakes")
      .withIndex("by_status_and_publishedAt", (q) => q.eq("status", status))
      .take(80);
    for (const bake of bakes) {
      if (bake.kitchenId) {
        continue;
      }
      await ctx.db.patch(bake._id, { kitchenId, ownerId });
    }
  }
}
