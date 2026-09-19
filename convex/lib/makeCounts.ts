import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function countMadeByOthers(
  ctx: QueryCtx,
  bake: Doc<"bakes">,
): Promise<number> {
  const rows = await ctx.db
    .query("bakeMakes")
    .withIndex("by_bake", (q) => q.eq("bakeId", bake._id))
    .take(200);
  if (!bake.ownerId) {
    return rows.length;
  }
  const ownerId: Id<"users"> = bake.ownerId;
  return rows.filter((row) => row.userId !== ownerId).length;
}
