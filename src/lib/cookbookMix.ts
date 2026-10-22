import type { Id } from "../../convex/_generated/dataModel";

export type MixPerson = {
  otherUserId: Id<"users">;
  called: string;
  email?: string;
  included?: boolean;
  avatarUrl?: string | null;
};

export function whoKey(called: string): string {
  const name = called
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (
    name === "me" ||
    name === "my" ||
    name === "mine" ||
    name === "myself"
  ) {
    return "me";
  }
  if (name === "mom") {
    return "mom";
  }
  if (name === "nana" || name === "grandma") {
    return "nana";
  }
  if (name === "brenda") {
    return "brenda";
  }
  return name;
}

function personKey(person: MixPerson): string {
  return whoKey(person.called) || person.otherUserId;
}

function personMatches(person: MixPerson, key: string): boolean {
  if (personKey(person) === key) {
    return true;
  }
  const email = person.email?.trim().toLowerCase() ?? "";
  if (email.length === 0) {
    return false;
  }
  const local = email.split("@")[0] ?? "";
  return whoKey(local) === key || email === key;
}

export type CookbookWho = {
  called: string;
  ownerId?: MixPerson["otherUserId"] | string;
};

export function splitWhoQuery(
  query: string,
  people: MixPerson[],
  self?: { id?: string; called?: string },
): { who: CookbookWho | null; rest: string } {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { who: null, rest: "" };
  }

  const selfKey = self?.called ? whoKey(self.called) : "";
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index] ?? "";
    const key = whoKey(token);
    if (key.length === 0) {
      continue;
    }
    if (key === "me" || (selfKey.length > 0 && key === selfKey)) {
      return {
        who: { called: self?.called && self.called !== "You" ? self.called : "Me", ownerId: self?.id },
        rest: tokens.filter((_, i) => i !== index).join(" "),
      };
    }
    const person = people.find((entry) => personMatches(entry, key));
    if (person) {
      return {
        who: { called: person.called, ownerId: person.otherUserId },
        rest: tokens.filter((_, i) => i !== index).join(" "),
      };
    }
  }

  return { who: null, rest: query.trim() };
}

export function collapsePeople<T extends MixPerson>(people: T[]): T[] {
  const kept = new Map<string, T>();
  for (const person of people) {
    if (!kept.has(person.otherUserId)) {
      kept.set(person.otherUserId, person);
    }
  }
  return [...kept.values()].sort((left, right) =>
    left.called.localeCompare(right.called),
  );
}

export type SavedMix = {
  _id: Id<"cookbookMixes">;
  name: string;
  includeMine: boolean;
  otherUserIds: Id<"users">[];
  isDefault: boolean;
};

export type MixSelection = {
  includeMine: boolean;
  otherUserIds: Id<"users">[];
};

export function sameMix(left: MixSelection, right: MixSelection) {
  if (left.includeMine !== right.includeMine) {
    return false;
  }
  if (left.otherUserIds.length !== right.otherUserIds.length) {
    return false;
  }
  const wanted = new Set(right.otherUserIds);
  return left.otherUserIds.every((id) => wanted.has(id));
}

export function mixName(
  includeMine: boolean,
  others: MixPerson[],
  selfCalled: string,
) {
  const names = [
    ...(includeMine ? [selfCalled === "You" ? "me" : selfCalled] : []),
    ...others.map((person) => person.called),
  ];
  if (names.length === 0) {
    return "Nobody";
  }
  if (names.length === 1) {
    const only = names[0] ?? "Just me";
    return only === "me" || only === selfCalled ? "Just me" : only;
  }
  if (names.length === 2) {
    return `${names[0] ?? "Someone"} & ${names[1] ?? "someone"}`;
  }
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1] ?? "someone"}`;
}

export function resolveMix(
  params: URLSearchParams,
  people: MixPerson[],
  mixes: SavedMix[],
): MixSelection {
  const ids = new Set(people.map((person) => person.otherUserId));
  const known = (value: string): value is Id<"users"> =>
    ids.has(value as Id<"users">);

  if (params.get("mine") === "1") {
    return { includeMine: true, otherUserIds: [] };
  }
  if (params.get("all") === "1") {
    return {
      includeMine: true,
      otherUserIds: people.map((person) => person.otherUserId),
    };
  }
  const withParam = params.get("with");
  if (withParam !== null) {
    return {
      includeMine: params.get("me") !== "0",
      otherUserIds: withParam.split(",").filter(known),
    };
  }
  const view = params.get("view");
  const fromView = view
    ? mixes.find((mix) => mix._id === view)
    : undefined;
  if (fromView) {
    return {
      includeMine: fromView.includeMine,
      otherUserIds: fromView.otherUserIds.filter(known),
    };
  }
  // Always open on the whole book — no saved default lens.
  return {
    includeMine: true,
    otherUserIds: people.map((person) => person.otherUserId),
  };
}

export function writeMixParams(
  params: URLSearchParams,
  selection: MixSelection,
  people: MixPerson[],
  mixes: SavedMix[],
) {
  const next = new URLSearchParams(params);
  next.delete("mine");
  next.delete("all");
  next.delete("with");
  next.delete("me");
  next.delete("view");

  if (selection.includeMine && selection.otherUserIds.length === 0) {
    next.set("mine", "1");
    return next;
  }
  const everyone =
    selection.includeMine &&
    selection.otherUserIds.length === people.length &&
    people.every((person) => selection.otherUserIds.includes(person.otherUserId));
  if (everyone) {
    next.set("all", "1");
    return next;
  }
  const saved = mixes.find((mix) =>
    sameMix(selection, {
      includeMine: mix.includeMine,
      otherUserIds: mix.otherUserIds,
    }),
  );
  if (saved) {
    next.set("view", saved._id);
    return next;
  }
  next.set("with", selection.otherUserIds.join(","));
  if (!selection.includeMine) {
    next.set("me", "0");
  }
  return next;
}
