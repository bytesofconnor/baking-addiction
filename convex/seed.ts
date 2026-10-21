import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { inferKind } from "./lib/kinds";

export const chrisSamples = [
  {
    slug: "pumpkin-muffins-extra-spice",
    title: "Pumpkin muffins, extra spice",
    kind: "muffins" as const,
    makes: "About 15. Muffin tin, paper liners.",
    ingredients: [
      "1 can pumpkin",
      "1/2 cup oil",
      "2 eggs",
      "A splash of milk",
      "1 3/4 cups flour",
      "1 cup sugar",
      "1 tsp baking soda",
      "A pinch of salt",
      "2 tsp pumpkin pie spice — twice what I used to use",
      "Crumb: butter, brown sugar, flour",
      "Chocolate chips for the crumb if kids are around",
    ],
    steps: [
      "Whisk pumpkin, oil, eggs, and milk.",
      "Fold in flour, sugar, baking soda, salt, and the doubled spice. No icing.",
      "Mix the crumb. Chocolate chips on top if kids are home.",
      "Fill the tins. 22 minutes, until the tops spring back.",
      "The crumb should stay put. Next time I'll warm the chips so they don't sink.",
    ],
    method:
      "Muffin tin, paper liners. About 15.\n\nPumpkin, oil, eggs, a splash of milk. Fold in flour, sugar, baking soda, salt, and two teaspoons of pumpkin pie spice — twice what I used to use. No icing.\n\nCrumb is butter, brown sugar, flour. Chocolate chips on top if kids are around.\n\nTwenty-two minutes. The crumb should stay put. Next time I'll warm the chips so they don't sink.",
    story:
      "Sunday morning, house already smelled like cinnamon before the oven beeped. I used Sally's pumpkin crumb muffins as the base and cooked them like I always do: more spice, no icing, chocolate on the crumb if kids are around.\n\nThey went in 22 minutes. The crumb stayed put. Next time I might warm the chocolate chips first so they don't sink.",
    sourceTitle: "Pumpkin Crumb Cake Muffins",
    sourceUrl: "https://sallysbakingaddiction.com/pumpkin-crumb-cake-muffins/",
    bakerName: "Chris",
    bakedOn: "2026-09-14",
    publishedAt: Date.UTC(2026, 8, 14),
    outcome: "15 muffins. Gone by noon. Doubled spice is the keeper.",
    changes: [
      {
        move: "Pumpkin pie spice",
        change: "1 tsp → 2 tsp",
        why: "Our house likes it warmer.",
      },
      {
        move: "Maple icing",
        change: "Skipped",
        why: "Too sweet for Sunday breakfast.",
      },
      {
        move: "Crumb topping",
        change: "Added chocolate chips",
        why: "The kids asked. Keep it.",
      },
    ],
  },
  {
    slug: "apple-crisp-less-sugar",
    title: "Apple crisp, less sugar",
    kind: "crisp" as const,
    makes: "One 9×13",
    ingredients: [
      "A heap of Honeycrisp apples, peeled and sliced",
      "A squeeze of lemon",
      "Cinnamon and a pinch of salt",
      "About two-thirds the sugar you'd usually put in a filling",
      "Butter, brown sugar, and flour for the topping",
      "An extra handful of oats",
    ],
    steps: [
      "Toss the apples with lemon, cinnamon, salt, and the lighter sugar. They were already sweet.",
      "Mix the topping and add the extra oats so you get more crunch than fruit.",
      "Bake until the edges go darker than the photos and the middle bubbles.",
      "Serve warm with a little cream, not ice cream.",
    ],
    method:
      "One 9×13. The apples from the market were already sweet.\n\nPeel and slice a heap of Honeycrisps. Toss with lemon, cinnamon, a pinch of salt, and about two-thirds of the sugar you'd usually put in a filling. They don't need more.\n\nTopping is butter, brown sugar, flour, and an extra handful of oats so you get more crunch than fruit.\n\nBake until the edges go darker than the photos and the middle bubbles. Serve warm with a little cream, not ice cream.",
    story:
      "The apples from the market were already sweet, so I cut the sugar in the filling and let the crumb do the talking. Same pan I always use. Served it warm with a little cream, not ice cream.\n\nThe edges got darker than Sally's photos. That's how we like it.",
    sourceTitle: "Classic Apple Crisp",
    sourceUrl: "https://sallysbakingaddiction.com/classic-apple-crisp/",
    bakerName: "Chris",
    bakedOn: "2026-09-02",
    publishedAt: Date.UTC(2026, 8, 2),
    outcome: "One 9×13. Enough for the table, none for tomorrow.",
    changes: [
      {
        move: "Filling sugar",
        change: "Cut by a third",
        why: "The Honeycrisps didn't need it.",
      },
      {
        move: "Oats in the topping",
        change: "An extra handful",
        why: "I like more crunch than filling.",
      },
    ],
  },
  {
    slug: "banana-bread-browned-butter",
    title: "Banana bread, browned butter",
    kind: "bread" as const,
    makes: "One loaf",
    ingredients: [
      "4 black bananas",
      "1 stick butter, browned until it smells like toffee",
      "Sugar",
      "2 eggs",
      "Flour, baking soda, salt",
    ],
    steps: [
      "Brown the butter. That's the whole note.",
      "Mash the bananas into it with the sugar and eggs.",
      "Fold in flour, baking soda, and salt. No walnuts — not everyone at the table eats them.",
      "About an hour. Tent it at 45 so the top doesn't go too far.",
      "Better on day two, toasted.",
    ],
    method:
      "One loaf pan.\n\nFour black bananas and a stick of butter browned until it smells like toffee. That's the whole note. Mix with sugar, eggs, flour, baking soda, salt. No walnuts — not everyone at the table eats them.\n\nAbout an hour. Tent it at 45 so the top doesn't go too far. Better on day two, toasted.",
    story:
      "Four black bananas on the counter and a stick of butter I browned until it smelled like toffee. Sally's banana bread is the bones. The browned butter is the thing I write down so I don't forget.\n\nLoaf took a full hour. I tented it at 45 so the top wouldn't go too far.",
    sourceTitle: "My Favorite Banana Bread Recipe",
    sourceUrl: "https://sallysbakingaddiction.com/banana-bread/",
    bakerName: "Chris",
    bakedOn: "2026-08-21",
    publishedAt: Date.UTC(2026, 7, 21),
    outcome: "One loaf. Better on day two, toasted.",
    changes: [
      {
        move: "Butter",
        change: "Browned it first",
        why: "That's the whole note.",
      },
      {
        move: "Walnuts",
        change: "Skipped",
        why: "Not everyone at the table eats them.",
      },
    ],
  },
  {
    slug: "chocolate-chip-cookies-flaky-salt",
    title: "Chocolate chip cookies, flaky salt",
    kind: "cookies" as const,
    makes: "Two dozen. Two trays.",
    ingredients: [
      "2 sticks butter, softened",
      "1 cup brown sugar",
      "1/2 cup white sugar",
      "2 eggs",
      "A splash of vanilla",
      "2 1/4 cups flour",
      "1 tsp baking soda",
      "A pinch of salt",
      "2 cups chocolate chips",
      "Flaky salt for the tops",
    ],
    steps: [
      "Mix the sugars with the butter, then the eggs and vanilla.",
      "Fold in flour, baking soda, and salt, then the chips.",
      "Chill 45 minutes while homework happens — not overnight.",
      "Scoop onto two trays.",
      "Bake until the edges set. Pull a minute early; they finish on the sheet.",
      "A pinch of flaky salt on each one while they're hot. Not optional.",
    ],
    method:
      "Two trays. After school.\n\nChewy cookie dough, chilled 45 minutes while homework happens — not overnight. Scoop, bake, pinch of flaky salt on each one while they're hot.\n\nPull them a minute early. They finish on the sheet. The salt is not optional.",
    story:
      "After-school batch. I chilled the dough while the kids did homework, then baked two trays so nobody had to wait. Sally's chewy cookies are the start. The flaky salt on top is how you can tell they're from this kitchen.\n\nI pull them a minute early. They finish on the sheet.",
    sourceTitle: "Chewy Chocolate Chip Cookies",
    sourceUrl: "https://sallysbakingaddiction.com/chewy-chocolate-chip-cookies/",
    bakerName: "Chris",
    bakedOn: "2026-08-08",
    publishedAt: Date.UTC(2026, 7, 8),
    outcome: "Two dozen. The salt is not optional.",
    changes: [
      {
        move: "Flaky salt",
        change: "A pinch on each cookie",
        why: "Makes the chocolate taste darker.",
      },
      {
        move: "Chill time",
        change: "45 minutes, not overnight",
        why: "School pickup doesn't wait.",
      },
    ],
  },
  {
    slug: "vanilla-cupcakes-less-frosting",
    title: "Vanilla cupcakes, less frosting",
    kind: "cake" as const,
    makes: "Two dozen",
    ingredients: [
      "Vanilla cupcake batter — flour, sugar, butter, eggs, milk, vanilla",
      "Frosting, about two-thirds of a bakery swirl",
      "Sprinkles for half the batch",
    ],
    steps: [
      "Small scoop so the tops come out even.",
      "Bake until they spring back.",
      "Modest swirl so they pack in a tin without smearing.",
      "Sprinkles on half. The rest stay plain.",
    ],
    method:
      "Two dozen. The small scoop so the tops come out even.\n\nVanilla cupcakes, modest swirl — about two-thirds of a bakery frosting so they pack in a tin without smearing. Sprinkles on half. The other half stay plain.\n\nThey traveled. Came home empty.",
    story:
      "Birthday week at school. I made Sally's vanilla cupcakes and went lighter on the swirl so they pack without smearing. Still enough frosting that a first grader knows it's a party.\n\nI used the small scoop. Twenty-four even tops.",
    sourceTitle: "Vanilla Cupcakes",
    sourceUrl: "https://sallysbakingaddiction.com/vanilla-cupcakes/",
    bakerName: "Chris",
    bakedOn: "2026-07-19",
    publishedAt: Date.UTC(2026, 6, 19),
    outcome: "Two dozen. Traveled. Came home empty.",
    changes: [
      {
        move: "Frosting",
        change: "About two-thirds of her swirl",
        why: "They have to ride in a tin.",
      },
      {
        move: "Sprinkles",
        change: "Just on half the batch",
        why: "Some of my kids like them plain.",
      },
    ],
  },
] as const;

export function coverPath(slug: string) {
  return `/bakes/${slug}.jpg`;
}

const SAMPLE_COVER_SLUGS = new Set([
  ...chrisSamples.map((sample) => sample.slug),
  "nana-rhubarb-crumble",
  "nana-caramel-rolls",
  "brenda-thursday-brownies",
  "brenda-cinnamon-scones",
]);

export function sampleCoverUrl(slug: string): string | null {
  return SAMPLE_COVER_SLUGS.has(slug) ? coverPath(slug) : null;
}

export const populateIfEmpty = internalMutation({
  args: {},
  returns: v.union(v.id("bakes"), v.null()),
  handler: async (ctx) => {
    const existing = await ctx.db.query("bakes").take(1);
    if (existing.length > 0) {
      return null;
    }
    const first = chrisSamples[0];
    return await ctx.db.insert("bakes", {
      ...first,
      coverUrl: coverPath(first.slug),
      status: "published",
      changes: [...first.changes],
      ingredients: [...first.ingredients],
      steps: [...first.steps],
      sourceKind: "sally",
      ingredientSearch: first.ingredients.join("\n").toLowerCase(),
    });
  },
});

export const createTestUser = internalMutation({
  args: {},
  returns: v.object({
    userId: v.id("users"),
    kitchenId: v.id("kitchens"),
  }),
  handler: async (ctx) => {
    const testEmail = "test@local.dev";
    let user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", testEmail))
      .unique();
    
    if (!user) {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        email: testEmail,
        name: "Test User",
        called: "Test",
        emailVerificationTime: now,
      });
      user = (await ctx.db.get("users", userId))!;
    }

    let kitchen = await ctx.db
      .query("kitchens")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .unique();

    if (!kitchen) {
      const kitchenId = await ctx.db.insert("kitchens", {
        name: "Test's recipes",
        ownerId: user._id,
        createdAt: Date.now(),
      });
      kitchen = (await ctx.db.get("kitchens", kitchenId))!;
      
      await ctx.db.insert("members", {
        kitchenId: kitchen._id,
        userId: user._id,
        role: "owner",
      });
    }

    return { userId: user._id, kitchenId: kitchen._id };
  },
});

export const ensureSamples = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    // Create test user and kitchen for verification
    // User will be created via Password provider signin in the frontend
    const testEmail = "test@local.dev";
    let user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", testEmail))
      .unique();
    
    // If user doesn't exist, they'll be created on first password signin
    // For now, find or create a placeholder to assign recipes to
    if (!user) {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        email: testEmail,
        name: "Test User",
        called: "Test",
        emailVerificationTime: now,
      });
      user = (await ctx.db.get("users", userId))!;
    }

    let kitchen = await ctx.db
      .query("kitchens")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .unique();

    if (!kitchen) {
      const kitchenId = await ctx.db.insert("kitchens", {
        name: "Test's recipes",
        ownerId: user._id,
        createdAt: Date.now(),
      });
      kitchen = (await ctx.db.get("kitchens", kitchenId))!;
      
      await ctx.db.insert("members", {
        kitchenId: kitchen._id,
        userId: user._id,
        role: "owner",
      });
    }

    const userId = user._id;
    const kitchenId = kitchen._id;
    
    let inserted = 0;
    for (const sample of chrisSamples) {
      const already = await ctx.db
        .query("bakes")
        .withIndex("by_slug", (q) => q.eq("slug", sample.slug))
        .unique();
      if (already) {
        await ctx.db.patch("bakes", already._id, {
          kind: already.kind ?? sample.kind,
          coverUrl: already.coverUrl ?? coverPath(sample.slug),
          method: sample.method,
          makes: sample.makes,
          ingredients: [...sample.ingredients],
          steps: [...sample.steps],
          sourceKind: "sally",
          ingredientSearch: sample.ingredients.join("\n").toLowerCase(),
          kitchenId,
          ownerId: userId,
        });
        continue;
      }
      await ctx.db.insert("bakes", {
        ...sample,
        coverUrl: coverPath(sample.slug),
        status: "published",
        kitchenId,
        ownerId: userId,
        changes: [...sample.changes],
        ingredients: [...sample.ingredients],
        steps: [...sample.steps],
        sourceKind: "sally",
        ingredientSearch: sample.ingredients.join("\n").toLowerCase(),
      });
      inserted += 1;
    }
    return inserted;
  },
});

export const stampKinds = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const bakes = await ctx.db.query("bakes").take(80);
    let patched = 0;
    for (const bake of bakes) {
      const kind = bake.kind ?? inferKind(bake.title, bake.sourceTitle);
      if (bake.kind === kind) {
        continue;
      }
      await ctx.db.patch("bakes", bake._id, { kind });
      patched += 1;
    }
    return patched;
  },
});

export const signAsChris = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const bakes = await ctx.db.query("bakes").take(40);
    let patched = 0;
    for (const bake of bakes) {
      const crumb = bake.changes.map((change) =>
        change.why === "The grandkids asked. Keep it."
          ? { ...change, why: "The kids asked. Keep it." }
          : change,
      );
      const bakerNeedsUpdate = bake.bakerName !== "Chris";
      const crumbNeedsUpdate = crumb.some(
        (change, index) => change.why !== bake.changes[index]?.why,
      );
      if (!bakerNeedsUpdate && !crumbNeedsUpdate) {
        continue;
      }
      await ctx.db.patch("bakes", bake._id, {
        bakerName: "Chris",
        changes: crumb,
      });
      patched += 1;
    }
    return patched;
  },
});

export const countBakes = internalQuery({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const bakes = await ctx.db.query("bakes").collect();
    return bakes.length;
  },
});
