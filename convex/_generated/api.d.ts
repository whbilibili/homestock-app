/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as auth from "../auth.js";
import type * as batches from "../batches.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as items from "../items.js";
import type * as seed from "../seed.js";
import type * as seed_commonItems from "../seed/commonItems.js";
import type * as shoppingList from "../shoppingList.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  auth: typeof auth;
  batches: typeof batches;
  crons: typeof crons;
  http: typeof http;
  inventory: typeof inventory;
  items: typeof items;
  seed: typeof seed;
  "seed/commonItems": typeof seed_commonItems;
  shoppingList: typeof shoppingList;
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
