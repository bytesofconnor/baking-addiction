/**
 * @vitest-environment node
 *
 * Unit tests for kitchen rename validation and patch behavior.
 * Imports the same helper the internal mutation calls.
 */

import { describe, it, expect } from "vitest";
import { renameKitchenDoc } from "./kitchens";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

type KitchenRow = {
  name: string;
  ownerId: Id<"users">;
  createdAt: number;
};

function kitchenHarness(existing: KitchenRow | null) {
  const kitchenId = "kitchens:weeknight" as Id<"kitchens">;
  const store = new Map<Id<"kitchens">, KitchenRow>();
  if (existing) {
    store.set(kitchenId, { ...existing });
  }
  const patches: Array<Record<string, unknown>> = [];
  const ctx = {
    db: {
      get: async (_table: "kitchens", id: Id<"kitchens">) =>
        store.get(id) ?? null,
      patch: async (
        _table: "kitchens",
        id: Id<"kitchens">,
        value: { name: string },
      ) => {
        patches.push({ ...value });
        const current = store.get(id);
        if (current) {
          store.set(id, { ...current, ...value });
        }
      },
    },
  } as unknown as MutationCtx;
  return { ctx, kitchenId, store, patches };
}

const seedKitchen = (): KitchenRow => ({
  name: "Weeknight Book",
  ownerId: "users:owner" as Id<"users">,
  createdAt: 1_700_000_000_000,
});

describe("renameKitchenDoc", () => {
  it("trims the name and patches only that field", async () => {
    const { ctx, kitchenId, store, patches } = kitchenHarness(seedKitchen());

    await renameKitchenDoc(ctx, kitchenId, "  Sunday Book  ");

    expect(patches).toEqual([{ name: "Sunday Book" }]);
    expect(store.get(kitchenId)).toEqual({
      ...seedKitchen(),
      name: "Sunday Book",
    });
  });

  it("rejects an empty or whitespace-only name without patching", async () => {
    const { ctx, kitchenId, store, patches } = kitchenHarness(seedKitchen());

    await expect(renameKitchenDoc(ctx, kitchenId, "")).rejects.toThrow(
      "The book needs a name.",
    );
    await expect(renameKitchenDoc(ctx, kitchenId, "   ")).rejects.toThrow(
      "The book needs a name.",
    );
    expect(patches).toEqual([]);
    expect(store.get(kitchenId)?.name).toBe("Weeknight Book");
  });

  it("rejects names longer than 80 characters without patching", async () => {
    const { ctx, kitchenId, store, patches } = kitchenHarness(seedKitchen());
    const tooLong = "x".repeat(81);

    await expect(renameKitchenDoc(ctx, kitchenId, tooLong)).rejects.toThrow(
      "That name is too long.",
    );
    expect(patches).toEqual([]);
    expect(store.get(kitchenId)?.name).toBe("Weeknight Book");
  });

  it("accepts a name of exactly 80 characters", async () => {
    const { ctx, kitchenId, patches } = kitchenHarness(seedKitchen());
    const maxName = "x".repeat(80);

    await renameKitchenDoc(ctx, kitchenId, `  ${maxName}  `);

    expect(patches).toEqual([{ name: maxName }]);
    expect(maxName.length).toBe(80);
  });

  it("throws when the kitchen document does not exist", async () => {
    const { ctx, kitchenId, patches } = kitchenHarness(null);

    await expect(
      renameKitchenDoc(ctx, kitchenId, "Sunday Book"),
    ).rejects.toThrow("Kitchen not found.");
    expect(patches).toEqual([]);
  });
});
