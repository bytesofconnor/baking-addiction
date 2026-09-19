/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bakes from "../bakes.js";
import type * as connections from "../connections.js";
import type * as desk from "../desk.js";
import type * as extractCard from "../extractCard.js";
import type * as familyAuth from "../familyAuth.js";
import type * as http from "../http.js";
import type * as kitchen from "../kitchen.js";
import type * as kitchens from "../kitchens.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_cardFromText from "../lib/cardFromText.js";
import type * as lib_family from "../lib/family.js";
import type * as lib_kinds from "../lib/kinds.js";
import type * as lib_kitchenLetter from "../lib/kitchenLetter.js";
import type * as lib_makeCounts from "../lib/makeCounts.js";
import type * as lib_passwords from "../lib/passwords.js";
import type * as lib_samples from "../lib/samples.js";
import type * as lib_sources from "../lib/sources.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_writer from "../lib/writer.js";
import type * as makes from "../makes.js";
import type * as mixes from "../mixes.js";
import type * as photos from "../photos.js";
import type * as preview from "../preview.js";
import type * as sallyCredit from "../sallyCredit.js";
import type * as seed from "../seed.js";
import type * as seedFamily from "../seedFamily.js";
import type * as slips from "../slips.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bakes: typeof bakes;
  connections: typeof connections;
  desk: typeof desk;
  extractCard: typeof extractCard;
  familyAuth: typeof familyAuth;
  http: typeof http;
  kitchen: typeof kitchen;
  kitchens: typeof kitchens;
  "lib/access": typeof lib_access;
  "lib/cardFromText": typeof lib_cardFromText;
  "lib/family": typeof lib_family;
  "lib/kinds": typeof lib_kinds;
  "lib/kitchenLetter": typeof lib_kitchenLetter;
  "lib/makeCounts": typeof lib_makeCounts;
  "lib/passwords": typeof lib_passwords;
  "lib/samples": typeof lib_samples;
  "lib/sources": typeof lib_sources;
  "lib/validators": typeof lib_validators;
  "lib/writer": typeof lib_writer;
  makes: typeof makes;
  mixes: typeof mixes;
  photos: typeof photos;
  preview: typeof preview;
  sallyCredit: typeof sallyCredit;
  seed: typeof seed;
  seedFamily: typeof seedFamily;
  slips: typeof slips;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
