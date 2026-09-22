import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/** Custom upload first, then Google OAuth image. */
export async function avatarUrlForUser(
  ctx: QueryCtx,
  user: Doc<"users"> | null | undefined,
): Promise<string | null> {
  if (!user) {
    return null;
  }
  if (user.avatarStorageId) {
    const stored = await ctx.storage.getUrl(user.avatarStorageId);
    if (stored) {
      return stored;
    }
  }
  const oauth = user.image?.trim();
  return oauth && oauth.length > 0 ? oauth : null;
}
