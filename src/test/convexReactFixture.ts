import { getFunctionName } from "convex/server";
import type { ReactNode } from "react";
import {
  FIXTURE_DUMMY_COOKS,
  FIXTURE_EDIT_BAKE,
  FIXTURE_KITCHEN_ID,
  FIXTURE_ME,
  FIXTURE_MINE,
  FIXTURE_PHOTOS,
  FIXTURE_PUBLISHED_BAKE,
  FIXTURE_TEASER,
} from "@/test/a11yFixtureData";
import { isA11ySignedIn } from "@/test/a11yFixtureMode";

type QueryArgs = Record<string, unknown> | "skip" | undefined;

function functionName(ref: unknown): string {
  try {
    return getFunctionName(ref as never);
  } catch {
    return "";
  }
}

function queryValue(ref: unknown, args: QueryArgs): unknown {
  const name = functionName(ref);
  const bakeId = args && args !== "skip" ? args.bakeId : undefined;
  const slug = args && args !== "skip" ? args.slug : undefined;

  switch (name) {
    case "familyAuth:me":
      return isA11ySignedIn() ? FIXTURE_ME : null;
    case "familyAuth:peekInvite":
      return null;
    case "bakes:listMine":
      return FIXTURE_MINE;
    case "bakes:listPosted":
    case "bakes:listPublished":
    case "bakes:listByPerson":
      return [FIXTURE_TEASER];
    case "bakes:getMineForEdit":
      return bakeId === FIXTURE_EDIT_BAKE._id ? FIXTURE_EDIT_BAKE : null;
    case "bakes:getPublishedBySlug":
      return slug === FIXTURE_PUBLISHED_BAKE.slug
        ? FIXTURE_PUBLISHED_BAKE
        : null;
    case "photos:listForBake":
      return bakeId === FIXTURE_EDIT_BAKE._id ? FIXTURE_PHOTOS : [];
    case "connections:list":
      return [];
    case "mixes:list":
      return [];
    case "preview:dummyCooks":
      return FIXTURE_DUMMY_COOKS;
    case "preview:dummyBook":
      return null;
    case "preview:dummyBakes":
      return [];
    case "makes:forBake":
      return [];
    case "slips:open":
      return null;
    default:
      return [];
  }
}

function mutationValue(ref: unknown): unknown {
  const name = functionName(ref);
  switch (name) {
    case "kitchens:ensureMine":
    case "familyAuth:acceptInvite":
      return FIXTURE_KITCHEN_ID;
    case "kitchens:createInvite":
      return { token: "fixture-invite-token" };
    case "bakes:save":
    case "bakes:updateMine":
      return { bakeId: FIXTURE_EDIT_BAKE._id, slug: FIXTURE_EDIT_BAKE.slug };
    case "photos:generateUploadUrl":
    case "familyAuth:generateUploadUrl":
      return "https://example.test/upload";
    case "desk:unlock":
      return { token: "fixture-desk-token" };
    default:
      return null;
  }
}

export function useConvexAuth() {
  return {
    isLoading: false,
    isAuthenticated: isA11ySignedIn(),
  };
}

export function useQuery(query: unknown, args?: QueryArgs) {
  if (args === "skip") {
    return undefined;
  }
  return queryValue(query, args);
}

export function useMutation(mutation: unknown) {
  return (args?: unknown) => {
    void args;
    return Promise.resolve(mutationValue(mutation));
  };
}

export function useAction(action: unknown) {
  void action;
  return async () => ({ hostOk: false, title: null, cards: [] });
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  return children;
}

export class ConvexReactClient {
  constructor(url: string) {
    void url;
  }
}
