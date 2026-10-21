import { env } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const FAIL_WINDOW_MS = 15 * 60 * 1000;
const FAIL_LIMIT = 8;
export const DESK_SESSION_MS = 400 * 24 * 60 * 60 * 1000;

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashDeskToken(token: string): Promise<string> {
  return sha256Hex(token);
}

function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let mismatch = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return mismatch === 0;
}

export function codesMatch(attempt: string, expected: string): boolean {
  return timingSafeEqual(attempt.trim(), expected.trim());
}

export function newDeskToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function passwordFingerprint(): Promise<string> {
  const password = env.WRITER_PASSWORD ?? "test-writer-pw-local";
  return (await sha256Hex(password.trim())).slice(0, 24);
}

async function getGate(ctx: MutationCtx) {
  const existing = await ctx.db
    .query("deskGates")
    .withIndex("by_name", (q) => q.eq("name", "unlock"))
    .unique();
  if (existing) {
    return existing;
  }
  const id = await ctx.db.insert("deskGates", {
    name: "unlock",
    failedAt: [],
  });
  const created = await ctx.db.get("deskGates", id);
  if (!created) {
    throw new Error("Could not open the kitchen door");
  }
  return created;
}

export async function assertUnlockAllowed(ctx: MutationCtx): Promise<void> {
  const gate = await getGate(ctx);
  const windowStart = Date.now() - FAIL_WINDOW_MS;
  const recent = gate.failedAt.filter((at) => at > windowStart).length;
  if (recent >= FAIL_LIMIT) {
    throw new Error("That code didn't work.");
  }
}

export async function recordUnlockFailure(ctx: MutationCtx): Promise<void> {
  const gate = await getGate(ctx);
  const now = Date.now();
  const windowStart = now - FAIL_WINDOW_MS;
  const failedAt = [...gate.failedAt.filter((at) => at > windowStart), now].slice(
    -20,
  );
  await ctx.db.patch(gate._id, { failedAt });
}

export async function clearUnlockFailures(ctx: MutationCtx): Promise<void> {
  const gate = await getGate(ctx);
  await ctx.db.patch(gate._id, { failedAt: [] });
}

export async function createDeskSession(
  ctx: MutationCtx,
  token: string,
): Promise<void> {
  const now = Date.now();
  await ctx.db.insert("deskSessions", {
    tokenHash: await hashDeskToken(token),
    passwordFingerprint: await passwordFingerprint(),
    createdAt: now,
    expiresAt: now + DESK_SESSION_MS,
  });
}

export async function requireWriterToken(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<Doc<"deskSessions">> {
  const trimmed = token.trim();
  if (trimmed.length < 16) {
    throw new Error("Unauthorized");
  }

  const tokenHash = await hashDeskToken(trimmed);
  const session = await ctx.db
    .query("deskSessions")
    .withIndex("by_tokenHash", (q) => q.eq("tokenHash", tokenHash))
    .unique();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.passwordFingerprint !== (await passwordFingerprint())) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireFreshWriterToken(
  ctx: MutationCtx,
  token: string,
): Promise<Doc<"deskSessions">> {
  const session = await requireWriterToken(ctx, token);
  if (session.expiresAt <= Date.now()) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function refreshDeskSession(
  ctx: MutationCtx,
  sessionId: Doc<"deskSessions">["_id"],
): Promise<void> {
  await ctx.db.patch(sessionId, {
    expiresAt: Date.now() + DESK_SESSION_MS,
  });
}
