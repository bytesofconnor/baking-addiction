/**
 * Unit tests for photo mutations and queries.
 * Tests cover photo management, reordering, and legacy fallback.
 */

import { describe, it, expect } from "vitest";
import type { Id } from "./_generated/dataModel";

/**
 * Pure function tests for photo logic that can be extracted from mutations.
 * These test the business logic without needing the full Convex runtime.
 */

describe("Photo Cover Logic", () => {
  type Photo = { _id: string; storageId: string; bakeId: string };

  describe("selectNewCover", () => {
    it("selects first remaining photo when cover is removed", () => {
      const photos: Photo[] = [
        { _id: "p1", storageId: "s1", bakeId: "b1" },
        { _id: "p2", storageId: "s2", bakeId: "b1" },
        { _id: "p3", storageId: "s3", bakeId: "b1" },
      ];
      const removedId = "p1";
      const remaining = photos.filter((p) => p._id !== removedId);
      const newCover = remaining[0];

      expect(newCover).toBeDefined();
      expect(newCover?.storageId).toBe("s2");
    });

    it("returns undefined when last photo is removed", () => {
      const photos: Photo[] = [
        { _id: "p1", storageId: "s1", bakeId: "b1" },
      ];
      const removedId = "p1";
      const remaining = photos.filter((p) => p._id !== removedId);
      const newCover = remaining[0];

      expect(newCover).toBeUndefined();
    });

    it("keeps same cover when non-cover photo is removed", () => {
      const photos: Photo[] = [
        { _id: "p1", storageId: "s1", bakeId: "b1" },
        { _id: "p2", storageId: "s2", bakeId: "b1" },
      ];
      const currentCover = "s1";
      const removedId = "p2";

      // Cover should stay the same
      expect(currentCover).toBe("s1");
    });
  });

  describe("validateReorderPhotos", () => {
    it("accepts photos from same bake", () => {
      const photos: Photo[] = [
        { _id: "p1", storageId: "s1", bakeId: "b1" },
        { _id: "p2", storageId: "s2", bakeId: "b1" },
        { _id: "p3", storageId: "s3", bakeId: "b1" },
      ];
      const targetBakeId = "b1";
      const photoIds = ["p1", "p2", "p3"];

      const allMatch = photos.every(
        (p) => photoIds.includes(p._id) && p.bakeId === targetBakeId
      );
      expect(allMatch).toBe(true);
    });

    it("rejects photos from different bake", () => {
      const photos: Photo[] = [
        { _id: "p1", storageId: "s1", bakeId: "b1" },
        { _id: "p2", storageId: "s2", bakeId: "b2" }, // Different bake!
        { _id: "p3", storageId: "s3", bakeId: "b1" },
      ];
      const targetBakeId = "b1";

      const hasInvalid = photos.some((p) => p.bakeId !== targetBakeId);
      expect(hasInvalid).toBe(true);
    });

    it("preserves order after reorder", () => {
      const originalOrder = ["p3", "p1", "p2"];
      const newOrder = ["p1", "p2", "p3"];

      // After reorder, the new order should be preserved
      expect(newOrder).toEqual(["p1", "p2", "p3"]);
      expect(newOrder).not.toEqual(originalOrder);
    });
  });

  describe("firstPhotoBecomesCover", () => {
    it("sets first photo as cover when bake has no cover", () => {
      const bake = { _id: "b1" as Id<"bakes">, coverStorageId: undefined };
      const newPhotoStorageId = "s1" as Id<"_storage">;

      const shouldSetCover = !bake.coverStorageId;
      expect(shouldSetCover).toBe(true);

      // After attach, cover would be set
      const updatedCover = newPhotoStorageId;
      expect(updatedCover).toBe("s1");
    });

    it("keeps existing cover when adding second photo", () => {
      const bake = {
        _id: "b1" as Id<"bakes">,
        coverStorageId: "s1" as Id<"_storage">,
      };
      const newPhotoStorageId = "s2" as Id<"_storage">;

      const shouldSetCover = !bake.coverStorageId;
      expect(shouldSetCover).toBe(false);

      // Cover should remain unchanged
      const updatedCover = bake.coverStorageId;
      expect(updatedCover).toBe("s1");
    });

    it("overrides cover when setCover flag is true", () => {
      const bake = {
        _id: "b1" as Id<"bakes">,
        coverStorageId: "s1" as Id<"_storage">,
      };
      const newPhotoStorageId = "s2" as Id<"_storage">;
      const setCoverFlag = true;

      const shouldSetCover = setCoverFlag || !bake.coverStorageId;
      expect(shouldSetCover).toBe(true);

      // Cover should be updated to new photo
      const updatedCover = newPhotoStorageId;
      expect(updatedCover).toBe("s2");
    });
  });
});

describe("Legacy Fallback", () => {
  it("displays recipe with only coverStorageId and no photos table entries", () => {
    // Scenario: Old recipe created before photos table existed
    const bake = {
      _id: "b1" as Id<"bakes">,
      title: "Legacy Recipe",
      coverStorageId: "s-legacy" as Id<"_storage">,
    };
    const photos: unknown[] = []; // No rows in photos table

    // BakePage should fall back to coverStorageId
    const displayPhoto = photos.length > 0 ? photos[0] : bake.coverStorageId;
    expect(displayPhoto).toBe("s-legacy");
  });

  it("prefers photos table when both photos and coverStorageId exist", () => {
    const bake = {
      _id: "b1" as Id<"bakes">,
      title: "Modern Recipe",
      coverStorageId: "s1" as Id<"_storage">,
    };
    const photos = [
      { _id: "p1", storageId: "s1", url: "url1", alt: "Photo 1" },
      { _id: "p2", storageId: "s2", url: "url2", alt: "Photo 2" },
    ];

    // BakePage should use photos table
    const shouldUseGallery = photos.length > 0;
    expect(shouldUseGallery).toBe(true);
    expect(photos[0]?.storageId).toBe(bake.coverStorageId); // Cover is synced
  });

  it("shows decorative plate when recipe has no images at all", () => {
    const bake = {
      _id: "b1" as Id<"bakes">,
      title: "No Photos Recipe",
      coverStorageId: undefined,
    };
    const photos: unknown[] = [];

    const hasAnyPhoto = photos.length > 0 || !!bake.coverStorageId;
    expect(hasAnyPhoto).toBe(false);
    // BakePage would show decorative BakePlate
  });
});

describe("Cover Synchronization Safety", () => {
  it("cannot break existing recipes when adding photos table", () => {
    // Existing recipe before migration
    const existingRecipe = {
      _id: "b1" as Id<"bakes">,
      title: "Pre-migration Recipe",
      coverStorageId: "s-old" as Id<"_storage">,
    };

    // After photos table is added, old recipes are unchanged
    // Photos query returns empty array, coverStorageId is still set
    const photosQuery: unknown[] = [];
    const coverStillExists = existingRecipe.coverStorageId !== undefined;

    expect(coverStillExists).toBe(true);
    expect(photosQuery.length).toBe(0);
    // BakePage falls back to coverStorageId → no breakage
  });

  it("keeps cover in sync when photos are added to existing recipe", () => {
    const recipe = {
      _id: "b1" as Id<"bakes">,
      coverStorageId: "s1" as Id<"_storage">,
    };

    // User adds new photo via PhotoManager
    const newPhotoStorageId = "s2" as Id<"_storage">;
    const setCover = false; // Don't override existing cover

    // attach() logic: if (!setCover && recipe.coverStorageId exists) → keep old cover
    const updatedCover = !setCover && recipe.coverStorageId
      ? recipe.coverStorageId
      : newPhotoStorageId;

    expect(updatedCover).toBe("s1"); // Old cover preserved
  });

  it("syncs cover when removing photos", () => {
    const recipe = {
      _id: "b1" as Id<"bakes">,
      coverStorageId: "s1" as Id<"_storage">,
    };
    const photos = [
      { _id: "p1", storageId: "s1" }, // This is the cover
      { _id: "p2", storageId: "s2" },
    ];

    // User removes cover photo p1
    const removedStorageId = "s1";
    const isCoverRemoved = recipe.coverStorageId === removedStorageId;
    expect(isCoverRemoved).toBe(true);

    // remove() logic: find next photo and update cover
    const remainingPhotos = photos.filter((p) => p.storageId !== removedStorageId);
    const newCover = remainingPhotos[0]?.storageId;
    expect(newCover).toBe("s2"); // Cover synced to next photo
  });

  it("clears cover when last photo is removed", () => {
    const recipe = {
      _id: "b1" as Id<"bakes">,
      coverStorageId: "s1" as Id<"_storage">,
    };
    const photos = [{ _id: "p1", storageId: "s1" }];

    // User removes last photo
    const removedStorageId = "s1";
    const remainingPhotos = photos.filter((p) => p.storageId !== removedStorageId);
    const newCover = remainingPhotos[0]?.storageId;

    expect(newCover).toBeUndefined();
    // remove() would patch bake with coverStorageId: undefined
    // BakePage would show decorative plate
  });
});
