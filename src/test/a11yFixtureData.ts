import type { Id } from "../../convex/_generated/dataModel";

/**
 * Local/CI accessibility fixtures. Generic kitchen copy only — never production
 * data, never real credentials, never personal names.
 */

export const FIXTURE_USER_ID = "jd7a11yfixture0000000000user" as Id<"users">;
export const FIXTURE_KITCHEN_ID =
  "jd7a11yfixture000000kitchen" as Id<"kitchens">;
export const FIXTURE_BAKE_ID = "jd7a11yfixture0000000000bake" as Id<"bakes">;
export const FIXTURE_PHOTO_ID = "jd7a11yfixture00000000photo" as Id<"photos">;
export const FIXTURE_STORAGE_ID =
  "jd7a11yfixture00000storage" as Id<"_storage">;
export const FIXTURE_BAKE_SLUG = "sunday-muffins";
export const FIXTURE_BAKE_TITLE = "Sunday muffins";
export const FIXTURE_CALLED = "Mom";
export const FIXTURE_EMAIL = "baker@example.test";
export const FIXTURE_PHOTO_URL = "/bakes/pumpkin-muffins-extra-spice.jpg";
export const FIXTURE_PHOTO_ALT = "A plate of pumpkin muffins";

export const FIXTURE_ME = {
  user: {
    _id: FIXTURE_USER_ID,
    called: FIXTURE_CALLED,
    email: FIXTURE_EMAIL,
    avatarUrl: null,
    hasCustomAvatar: false,
  },
  kitchens: [
    {
      _id: FIXTURE_KITCHEN_ID,
      name: "Mom's recipes",
      ownerCalled: FIXTURE_CALLED,
      role: "owner" as const,
    },
  ],
};

export const FIXTURE_EDIT_BAKE = {
  _id: FIXTURE_BAKE_ID,
  slug: FIXTURE_BAKE_SLUG,
  title: FIXTURE_BAKE_TITLE,
  story: "Always a hit on a slow morning.",
  sourceTitle: "",
  sourceUrl: "",
  sourceKind: "original" as const,
  kind: "muffins" as const,
  makes: "12 muffins",
  ingredients: ["2 cups flour", "1 cup sugar", "2 eggs"],
  steps: [
    "Heat the oven to 375.",
    "Mix the dry bowl.",
    "Bake until the tops spring back.",
  ],
  bakedOn: "2026-10-12",
  changes: [{ move: "Less", change: "sugar", why: "" }],
  status: "published" as const,
  photoUrl: FIXTURE_PHOTO_URL,
  coverStorageId: FIXTURE_STORAGE_ID,
  originStorageId: FIXTURE_STORAGE_ID,
};

export const FIXTURE_MINE = [
  {
    _id: FIXTURE_BAKE_ID,
    slug: FIXTURE_BAKE_SLUG,
    title: FIXTURE_BAKE_TITLE,
    status: "published" as const,
    bakedOn: FIXTURE_EDIT_BAKE.bakedOn,
  },
];

export const FIXTURE_TEASER = {
  _id: FIXTURE_BAKE_ID,
  slug: FIXTURE_BAKE_SLUG,
  title: FIXTURE_BAKE_TITLE,
  sourceTitle: "",
  sourceUrl: "",
  sourceKind: "original" as const,
  bakerName: FIXTURE_CALLED,
  bakerAvatarUrl: null,
  kind: "muffins" as const,
  publishedAt: Date.parse("2026-10-12T12:00:00.000Z"),
  bakedOn: FIXTURE_EDIT_BAKE.bakedOn,
  outcome: FIXTURE_EDIT_BAKE.story,
  changes: FIXTURE_EDIT_BAKE.changes,
  ingredients: FIXTURE_EDIT_BAKE.ingredients,
  photoUrl: FIXTURE_PHOTO_URL,
  ownerId: FIXTURE_USER_ID,
  madeByOthers: 0,
};

export const FIXTURE_PHOTOS = [
  {
    _id: FIXTURE_PHOTO_ID,
    storageId: FIXTURE_STORAGE_ID,
    url: FIXTURE_PHOTO_URL,
    alt: FIXTURE_PHOTO_ALT,
  },
];

export const FIXTURE_DUMMY_COOKS = [
  {
    key: "mom" as const,
    userId: FIXTURE_USER_ID,
    called: "Mom",
  },
  {
    key: "nana" as const,
    userId: "jd7a11yfixture0000000000nana" as Id<"users">,
    called: "Nana",
  },
];

export const FIXTURE_PUBLISHED_BAKE = {
  _id: FIXTURE_BAKE_ID,
  _creationTime: Date.parse("2026-10-12T12:00:00.000Z"),
  slug: FIXTURE_BAKE_SLUG,
  title: FIXTURE_BAKE_TITLE,
  story: FIXTURE_EDIT_BAKE.story,
  sourceTitle: "",
  sourceUrl: "",
  sourceKind: "original" as const,
  bakerName: FIXTURE_CALLED,
  bakerAvatarUrl: null,
  kind: "muffins" as const,
  method: undefined,
  makes: FIXTURE_EDIT_BAKE.makes,
  ingredients: FIXTURE_EDIT_BAKE.ingredients,
  steps: FIXTURE_EDIT_BAKE.steps,
  ingredientSearch: "flour sugar eggs",
  originStorageId: FIXTURE_STORAGE_ID,
  coverUrl: FIXTURE_PHOTO_URL,
  coverStorageId: FIXTURE_STORAGE_ID,
  ownerId: FIXTURE_USER_ID,
  kitchenId: FIXTURE_KITCHEN_ID,
  status: "published" as const,
  publishedAt: Date.parse("2026-10-12T12:00:00.000Z"),
  bakedOn: FIXTURE_EDIT_BAKE.bakedOn,
  outcome: FIXTURE_EDIT_BAKE.story,
  changes: FIXTURE_EDIT_BAKE.changes,
};
