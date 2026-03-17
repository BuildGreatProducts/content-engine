/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_createClient from "../actions/createClient.js";
import type * as actions_generateContent from "../actions/generateContent.js";
import type * as actions_notifyAdminReview from "../actions/notifyAdminReview.js";
import type * as actions_sendInvitation from "../actions/sendInvitation.js";
import type * as auth from "../auth.js";
import type * as clientRecords from "../clientRecords.js";
import type * as content from "../content.js";
import type * as documents from "../documents.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/createClient": typeof actions_createClient;
  "actions/generateContent": typeof actions_generateContent;
  "actions/notifyAdminReview": typeof actions_notifyAdminReview;
  "actions/sendInvitation": typeof actions_sendInvitation;
  auth: typeof auth;
  clientRecords: typeof clientRecords;
  content: typeof content;
  documents: typeof documents;
  helpers: typeof helpers;
  http: typeof http;
  invitations: typeof invitations;
  seed: typeof seed;
  users: typeof users;
  workspaces: typeof workspaces;
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
