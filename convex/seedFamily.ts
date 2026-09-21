import { v } from "convex/values";
import { internalMutation, mutation, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { startKitchen } from "./kitchens";
import {
  calledName,
  connectPair,
  ownedKitchen,
  recipesBookName,
  requireSignedIn,
} from "./lib/family";
import { SAMPLE_SUFFIX, sampleCollapseKey } from "./lib/samples";
import { chrisSamples, coverPath } from "./seed";

const nanaSamples = [
  {
    slug: "nana-rhubarb-crumble",
    title: "Rhubarb crumble, extra tart",
    kind: "crisp" as const,
    makes: "One 8×8",
    ingredients: [
      "A pile of rhubarb from the yard, cut in thumb pieces",
      "Just enough sugar that it isn't mean",
      "A squeeze of orange",
      "Butter, flour, and brown sugar for the lid",
      "A handful of oats if the tin looks lonely",
    ],
    steps: [
      "Toss the rhubarb with the lighter sugar and orange. It should still make you blink.",
      "Rub the topping till it looks like damp sand. Oats if you have them.",
      "Bake until the edges go jammy and the middle bubbles through.",
      "Cool twenty minutes or you'll burn your mouth. Cream on the side.",
    ],
    method:
      "One 8×8. Yard rhubarb, never the pale grocery stuff if you can help it.\n\nCut it in thumb pieces. Toss with just enough sugar and a squeeze of orange. Top with butter, flour, brown sugar, and oats if the tin looks lonely.\n\nBake till the edges go jammy. Cream, not ice cream.",
    story:
      "First warm week, the rhubarb is already too tall. I don't chase a recipe for this. Sugar stays shy so it tastes like the garden, not candy.\n\nThe kids used to call it pink spaghetti pie. They still ask for the corner piece.",
    sourceTitle: "The yard",
    sourceUrl: "",
    bakerName: "Nana",
    bakedOn: "2026-05-18",
    publishedAt: Date.UTC(2026, 4, 18),
    rating: 5,
    outcome: "One tin. Tart enough. Corner pieces went first.",
    changes: [
      {
        move: "Sugar",
        change: "Less than most recipes ask",
        why: "Rhubarb should still make you blink.",
      },
    ],
  },
  {
    slug: "nana-caramel-rolls",
    title: "Caramel rolls, Sunday potluck",
    kind: "bread" as const,
    makes: "One 9×13. Twelve rolls.",
    ingredients: [
      "A batch of sweet dough — milk, butter, egg, flour, a little sugar",
      "Brown sugar and butter for the pan",
      "Cinnamon in the swirl",
      "A pinch of salt in the caramel so it isn't flat",
    ],
    steps: [
      "Warm the milk. Soft dough. Let it rise while the coffee happens.",
      "Melt butter and brown sugar in the pan. Salt. That's the caramel.",
      "Roll, cinnamon, slice, nestle them in.",
      "Second rise till they look proud. Bake till the tops brown.",
      "Turn out while they're hot or the caramel stays in the pan.",
    ],
    method:
      "Nine by thirteen. Twelve rolls.\n\nSweet dough, not fussy. Caramel is butter, brown sugar, and a pinch of salt in the pan before the rolls go in.\n\nTurn the pan out while it's hot. If you wait, you'll be scraping.",
    story:
      "Church basement rolls. I never wrote this down for anyone but family. The trick is the salt in the caramel and flipping the pan before you think it's cool enough.\n\nIf a roll sticks, that's the one you eat standing at the stove.",
    sourceTitle: "Nana's notebook",
    sourceUrl: "",
    bakerName: "Nana",
    bakedOn: "2026-03-09",
    publishedAt: Date.UTC(2026, 2, 9),
    rating: 5,
    outcome: "Twelve rolls. Gone before the potluck started.",
    changes: [
      {
        move: "Caramel",
        change: "A pinch of salt in the pan",
        why: "Otherwise it tastes like candy, not breakfast.",
      },
    ],
  },
] as const;

const brendaSamples = [
  {
    slug: "brenda-thursday-brownies",
    title: "Thursday brownies, extra fudgy",
    kind: "bars" as const,
    makes: "One 8×8",
    ingredients: [
      "Two sticks of butter",
      "Cocoa, not the fancy stuff",
      "Sugar till it looks like frosting before the flour",
      "3 eggs",
      "A splash of vanilla",
      "Flour, just enough that they hold",
      "Flaky salt on top",
    ],
    steps: [
      "Melt the butter with the cocoa. It should shine.",
      "Sugar, eggs, vanilla. Then the least flour you can get away with.",
      "Bake till the edges set and the middle still jiggles a little.",
      "Salt. Eat one standing at the counter before they cool. That's the house rule.",
    ],
    method:
      "Eight by eight. Weeknight pan.\n\nButter and cocoa melted together. Sugar, eggs, vanilla, not much flour. Pull them when the middle still moves.\n\nSalt on top. The first one is eaten standing up.",
    story:
      "We make these on Thursdays when nobody wants a project. I don't ice them. Connor always cuts the corner. I take the middle while it's still warm.\n\nIf the pan's gone by morning, we don't talk about it.",
    sourceTitle: "The apartment",
    sourceUrl: "",
    bakerName: "Brenda",
    bakedOn: "2026-09-11",
    publishedAt: Date.UTC(2026, 8, 11),
    rating: 5,
    outcome: "One pan. Corner and middle, both gone.",
    changes: [
      {
        move: "Bake time",
        change: "Pulled a few minutes early",
        why: "Fudgy is the point.",
      },
    ],
  },
  {
    slug: "brenda-cinnamon-scones",
    title: "Cinnamon scones, Saturday pot",
    kind: "other" as const,
    makes: "Eight wedges",
    ingredients: [
      "Flour, baking powder, a pinch of salt",
      "Cold butter",
      "A little brown sugar and a lot of cinnamon",
      "Cream till it just comes together",
      "More cinnamon sugar on top",
    ],
    steps: [
      "Butter into flour with your fingers. Keep it ragged.",
      "Cinnamon in the bowl, not just on top.",
      "Cream, fold, pat into a circle. Don't knead it pretty.",
      "Wedges. Hot oven. They should look a little wild.",
    ],
    method:
      "Eight wedges. Coffee first.\n\nCold butter, cinnamon in the dough, cream till it holds. Pat, cut, cinnamon sugar on top.\n\nDon't fuss the shape. Saturday isn't for that.",
    story:
      "Saturday if we're home. I put the cinnamon in the dough so it isn't just a topping. Connor makes the coffee too strong and I don't correct him.\n\nThese are better than they look. That's also the house rule.",
    sourceTitle: "The apartment",
    sourceUrl: "",
    bakerName: "Brenda",
    bakedOn: "2026-09-06",
    publishedAt: Date.UTC(2026, 8, 6),
    rating: 5,
    outcome: "Eight. Two left for later, on a good week.",
    changes: [
      {
        move: "Cinnamon",
        change: "In the dough, not just the top",
        why: "Otherwise it's just a sugary lid.",
      },
    ],
  },
] as const;

async function findByEmail(
  ctx: MutationCtx,
  email: string,
): Promise<Doc<"users"> | null> {
  const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).take(8);
  return users[0] ?? null;
}

async function retireDuplicate(
  ctx: MutationCtx,
  extraId: Id<"users">,
  keepId: Id<"users">,
): Promise<void> {
  const outgoing = await ctx.db
    .query("connections")
    .withIndex("by_viewer", (q) => q.eq("viewerId", extraId))
    .take(40);
  for (const link of outgoing) {
    await ctx.db.delete(link._id);
    if (link.otherUserId !== keepId) {
      await connectPair(ctx, keepId, link.otherUserId);
    }
  }
  const incoming = await ctx.db
    .query("connections")
    .withIndex("by_other", (q) => q.eq("otherUserId", extraId))
    .take(40);
  for (const link of incoming) {
    await ctx.db.delete(link._id);
    if (link.viewerId !== keepId) {
      await connectPair(ctx, link.viewerId, keepId);
    }
  }
}

async function foldSampleDuplicates(
  ctx: MutationCtx,
  keep: Doc<"users">,
): Promise<void> {
  const key = sampleCollapseKey(keep);
  const users = await ctx.db.query("users").take(80);
  for (const user of users) {
    if (user._id === keep._id) {
      continue;
    }
    if (sampleCollapseKey(user) !== key) {
      continue;
    }
    await retireDuplicate(ctx, user._id, keep._id);
  }
}

async function sampleCook(
  ctx: MutationCtx,
  info: { called: string; name: string; email: string },
): Promise<Doc<"users">> {
  const existing = await findByEmail(ctx, info.email);
  if (existing) {
    if (existing.called !== info.called) {
      await ctx.db.patch(existing._id, { called: info.called, name: info.name });
    }
    const fresh = await ctx.db.get("users", existing._id);
    if (fresh) {
      await foldSampleDuplicates(ctx, fresh);
      const kept = await ctx.db.get("users", fresh._id);
      if (kept) {
        return kept;
      }
      return fresh;
    }
  }
  const userId = await ctx.db.insert("users", {
    name: info.name,
    called: info.called,
    email: info.email,
  });
  const user = await ctx.db.get("users", userId);
  if (!user) {
    throw new Error("Couldn't make a sample cook.");
  }
  await foldSampleDuplicates(ctx, user);
  const kept = await ctx.db.get("users", user._id);
  if (!kept) {
    return user;
  }
  return kept;
}

async function kitchenFor(
  ctx: MutationCtx,
  user: Doc<"users">,
): Promise<Doc<"kitchens">> {
  const mine = await ownedKitchen(ctx, user._id);
  if (mine) {
    return mine;
  }
  const kitchenId = await startKitchen(
    ctx,
    user._id,
    recipesBookName(calledName(user)),
  );
  const kitchen = await ctx.db.get("kitchens", kitchenId);
  if (!kitchen) {
    throw new Error("Couldn't open their book.");
  }
  return kitchen;
}

async function writeCard(
  ctx: MutationCtx,
  user: Doc<"users">,
  kitchenId: Id<"kitchens">,
  sample: {
    slug: string;
    title: string;
    kind: Doc<"bakes">["kind"];
    makes: string;
    ingredients: readonly string[];
    steps: readonly string[];
    method: string;
    story: string;
    sourceTitle: string;
    sourceUrl: string;
    bakerName: string;
    bakedOn: string;
    publishedAt: number;
    rating: number;
    outcome: string;
    changes: readonly { move: string; change: string; why: string }[];
  },
): Promise<void> {
  const matches = await ctx.db
    .query("bakes")
    .withIndex("by_slug", (q) => q.eq("slug", sample.slug))
    .take(8);
  const mine = matches.find((bake) => bake.ownerId === user._id);
  const orphan = matches[0];
  const ingredients = [...sample.ingredients];
  const steps = [...sample.steps];
  const changes = [...sample.changes];
  const fields = {
    title: sample.title,
    story: sample.story,
    sourceTitle: sample.sourceTitle,
    sourceUrl: sample.sourceUrl,
    sourceKind:
      sample.sourceUrl.length > 0
        ? ("sally" as const)
        : ("family" as const),
    bakerName: sample.bakerName,
    kind: sample.kind,
    method: sample.method,
    makes: sample.makes,
    ingredients,
    steps,
    ingredientSearch: ingredients.join("\n").toLowerCase(),
    ownerId: user._id,
    kitchenId,
    coverUrl: coverPath(sample.slug),
    status: "published" as const,
    publishedAt: sample.publishedAt,
    bakedOn: sample.bakedOn,
    rating: sample.rating,
    outcome: sample.outcome,
    changes,
  };

  if (mine) {
    await ctx.db.patch(mine._id, fields);
    return;
  }
  if (orphan && !orphan.ownerId) {
    await ctx.db.patch(orphan._id, fields);
    return;
  }
  if (orphan && orphan.ownerId !== user._id) {
    await ctx.db.patch(orphan._id, fields);
    return;
  }
  await ctx.db.insert("bakes", {
    slug: sample.slug,
    ...fields,
  });
}

async function forgetPartnerHomeMix(
  ctx: MutationCtx,
  viewerId: Id<"users">,
): Promise<void> {
  const existing = await ctx.db
    .query("cookbookMixes")
    .withIndex("by_viewer", (q) => q.eq("viewerId", viewerId))
    .take(8);
  for (const mix of existing) {
    if (mix.name === "Home" && mix.isDefault) {
      await ctx.db.patch(mix._id, { isDefault: false });
    }
  }
}

function samplesAllowed(): boolean {
  const site = process.env.SITE_URL ?? "";
  return (
    site.includes("localhost") ||
    site.includes("127.0.0.1") ||
    site.startsWith("http://192.168.")
  );
}

export async function plantSampleFamily(
  ctx: MutationCtx,
  viewerId: Id<"users">,
): Promise<{ people: string[] }> {
  if (!samplesAllowed()) {
    return { people: [] };
  }
  const viewer = await ctx.db.get("users", viewerId);
  if (!viewer || viewer.email?.endsWith(SAMPLE_SUFFIX)) {
    return { people: [] };
  }

  const mom = await sampleCook(ctx, {
    called: "Mom",
    name: "Christine Barrett",
    email: `mom${SAMPLE_SUFFIX}`,
  });
  const nana = await sampleCook(ctx, {
    called: "Nana",
    name: "Nana",
    email: `nana${SAMPLE_SUFFIX}`,
  });
  const brenda = await sampleCook(ctx, {
    called: "Brenda",
    name: "Brenda",
    email: `brenda${SAMPLE_SUFFIX}`,
  });
  const momKitchen = await kitchenFor(ctx, mom);
  const nanaKitchen = await kitchenFor(ctx, nana);
  const brendaKitchen = await kitchenFor(ctx, brenda);

  for (const sample of chrisSamples) {
    await writeCard(ctx, mom, momKitchen._id, {
      ...sample,
      bakerName: "Mom",
    });
  }
  for (const sample of nanaSamples) {
    await writeCard(ctx, nana, nanaKitchen._id, sample);
  }
  for (const sample of brendaSamples) {
    await writeCard(ctx, brenda, brendaKitchen._id, sample);
  }

  await connectPair(ctx, viewerId, mom._id);
  await connectPair(ctx, viewerId, nana._id);
  await connectPair(ctx, viewerId, brenda._id);
  await connectPair(ctx, mom._id, nana._id);
  await connectPair(ctx, mom._id, brenda._id);
  await connectPair(ctx, nana._id, brenda._id);
  await forgetPartnerHomeMix(ctx, viewerId);

  return { people: ["Mom", "Nana", "Brenda"] };
}

export const intoMyBook = mutation({
  args: {},
  returns: v.object({
    people: v.array(v.string()),
  }),
  handler: async (ctx) => {
    if (!samplesAllowed()) {
      throw new Error("Sample family is only for local development.");
    }
    const user = await requireSignedIn(ctx);
    return await plantSampleFamily(ctx, user._id);
  },
});

/** Wipe Mom/Nana/Brenda sample cooks and every connection to them. Prod cleanup. */
export const clearSamples = internalMutation({
  args: {},
  returns: v.object({
    users: v.number(),
    bakes: v.number(),
    connections: v.number(),
  }),
  handler: async (ctx) => {
    const sampleUsers = (await ctx.db.query("users").take(200)).filter((user) =>
      user.email?.endsWith(SAMPLE_SUFFIX),
    );
    let bakes = 0;
    let connections = 0;

    for (const sample of sampleUsers) {
      const outgoing = await ctx.db
        .query("connections")
        .withIndex("by_viewer", (q) => q.eq("viewerId", sample._id))
        .take(80);
      for (const link of outgoing) {
        await ctx.db.delete(link._id);
        connections += 1;
      }
      const incoming = await ctx.db
        .query("connections")
        .withIndex("by_other", (q) => q.eq("otherUserId", sample._id))
        .take(80);
      for (const link of incoming) {
        await ctx.db.delete(link._id);
        connections += 1;
      }

      const kitchen = await ownedKitchen(ctx, sample._id);
      if (kitchen) {
        const kitchenBakes = await ctx.db
          .query("bakes")
          .withIndex("by_kitchen_and_status", (q) =>
            q.eq("kitchenId", kitchen._id).eq("status", "published"),
          )
          .take(100);
        const drafts = await ctx.db
          .query("bakes")
          .withIndex("by_kitchen_and_status", (q) =>
            q.eq("kitchenId", kitchen._id).eq("status", "draft"),
          )
          .take(100);
        for (const bake of [...kitchenBakes, ...drafts]) {
          const photos = await ctx.db
            .query("photos")
            .withIndex("by_bake", (q) => q.eq("bakeId", bake._id))
            .take(40);
          for (const photo of photos) {
            await ctx.db.delete(photo._id);
          }
          const makes = await ctx.db
            .query("bakeMakes")
            .withIndex("by_bake", (q) => q.eq("bakeId", bake._id))
            .take(40);
          for (const make of makes) {
            await ctx.db.delete(make._id);
          }
          const slips = await ctx.db
            .query("recipeSlips")
            .withIndex("by_bake_and_creator", (q) =>
              q.eq("bakeId", bake._id).eq("createdBy", sample._id),
            )
            .take(40);
          for (const slip of slips) {
            await ctx.db.delete(slip._id);
          }
          await ctx.db.delete(bake._id);
          bakes += 1;
        }
        const members = await ctx.db
          .query("members")
          .withIndex("by_kitchen", (q) => q.eq("kitchenId", kitchen._id))
          .take(40);
        for (const member of members) {
          await ctx.db.delete(member._id);
        }
        const invites = await ctx.db
          .query("invites")
          .withIndex("by_kitchen", (q) => q.eq("kitchenId", kitchen._id))
          .take(40);
        for (const invite of invites) {
          await ctx.db.delete(invite._id);
        }
        await ctx.db.delete(kitchen._id);
      }

      const mixes = await ctx.db
        .query("cookbookMixes")
        .withIndex("by_viewer", (q) => q.eq("viewerId", sample._id))
        .take(40);
      for (const mix of mixes) {
        await ctx.db.delete(mix._id);
      }

      await ctx.db.delete(sample._id);
    }

    // Drop sample user ids from real people's saved mixes.
    const realMixes = await ctx.db.query("cookbookMixes").take(200);
    const sampleIds = new Set(sampleUsers.map((user) => user._id));
    for (const mix of realMixes) {
      const next = mix.otherUserIds.filter((id) => !sampleIds.has(id));
      if (next.length !== mix.otherUserIds.length) {
        await ctx.db.patch(mix._id, { otherUserIds: next });
      }
    }

    return { users: sampleUsers.length, bakes, connections };
  },
});

export const intoAllBooks = internalMutation({
  args: {},
  returns: v.object({
    books: v.number(),
  }),
  handler: async (ctx) => {
    if (!samplesAllowed()) {
      return { books: 0 };
    }
    const users = await ctx.db.query("users").take(40);
    let books = 0;
    for (const user of users) {
      if (user.email?.endsWith(SAMPLE_SUFFIX)) {
        continue;
      }
      await plantSampleFamily(ctx, user._id);
      books += 1;
    }
    return { books };
  },
});
