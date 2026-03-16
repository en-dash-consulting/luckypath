/**
 * Shared constants for token usage functionality.
 *
 * Centralises polling key, interval, and view identifier so that the
 * token-usage view, polling integration tests, and navigation tests
 * all reference the same source of truth.
 */
import type { ViewId } from "../types.js";
/** Polling-manager registration key for the token usage poller. */
export declare const TOKEN_USAGE_POLL_KEY = "token-usage";
/** Polling interval for automatic usage data refresh (ms). */
export declare const USAGE_POLL_INTERVAL_MS = 10000;
/** View ID used in routing and sidebar navigation. */
export declare const TOKEN_USAGE_VIEW_ID: ViewId;
