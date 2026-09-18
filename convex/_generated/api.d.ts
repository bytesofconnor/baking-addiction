/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bakes from "../bakes.js";
import type * as desk from "../desk.js";
import type * as kitchen from "../kitchen.js";
import type * as lib_kinds from "../lib/kinds.js";
import type * as lib_kitchenLetter from "../lib/kitchenLetter.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_writer from "../lib/writer.js";
import type * as photos from "../photos.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bakes: typeof bakes;
  desk: typeof desk;
  kitchen: typeof kitchen;
  "lib/kinds": typeof lib_kinds;
  "lib/kitchenLetter": typeof lib_kitchenLetter;
  "lib/validators": typeof lib_validators;
  "lib/writer": typeof lib_writer;
  photos: typeof photos;
  seed: typeof seed;
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
