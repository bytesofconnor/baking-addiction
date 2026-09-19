import type { Doc } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { calledName } from "./family";

export const SAMPLE_SUFFIX = "@thatsyum.sample";

export const SAMPLE_KEYS = ["mom", "nana", "brenda"] as const;

export type SampleKey = (typeof SAMPLE_KEYS)[number];

export function isSampleKey(value: string): value is SampleKey {
  return SAMPLE_KEYS.some((key) => key === value);
}

export function sampleEmail(key: SampleKey): string {
  return `${key}${SAMPLE_SUFFIX}`;
}

export function sampleKeyFromEmail(
  email: string | undefined,
): SampleKey | null {
  if (!email?.endsWith(SAMPLE_SUFFIX)) {
    return null;
  }
  const key = email.slice(0, -SAMPLE_SUFFIX.length);
  return isSampleKey(key) ? key : null;
}

export async function findUserByEmail(
  ctx: QueryCtx | MutationCtx,
  email: string,
): Promise<Doc<"users"> | null> {
  const users = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .take(8);
  return users[0] ?? null;
}

export function sampleCollapseKey(user: Doc<"users">): string {
  const fromEmail = sampleKeyFromEmail(user.email);
  if (fromEmail) {
    return fromEmail;
  }
  const called = calledName(user)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (called === "mom" || called === "christine" || called === "chris") {
    return "mom";
  }
  if (called === "nana" || called === "grandma") {
    return "nana";
  }
  if (called === "brenda") {
    return "brenda";
  }
  return called || user._id;
}

export type LinkedPerson = {
  otherUserId: Doc<"users">["_id"];
  called: string;
  email: string;
  included: boolean;
};

export function uniquifyPeople(
  people: Array<LinkedPerson & { user: Doc<"users"> }>,
): LinkedPerson[] {
  const kept = new Map<string, LinkedPerson & { user: Doc<"users"> }>();
  for (const person of people) {
    const key = sampleCollapseKey(person.user);
    const existing = kept.get(key);
    if (!existing) {
      kept.set(key, person);
      continue;
    }
    if (sampleKeyFromEmail(person.user.email)) {
      kept.set(key, person);
      continue;
    }
    if (
      person.included &&
      !existing.included &&
      !sampleKeyFromEmail(existing.user.email)
    ) {
      kept.set(key, person);
    }
  }
  const unique = [...kept.values()].map((person) => ({
    otherUserId: person.otherUserId,
    called: person.called,
    email: person.email,
    included: person.included,
  }));
  unique.sort((left, right) => left.called.localeCompare(right.called));
  return unique;
}
