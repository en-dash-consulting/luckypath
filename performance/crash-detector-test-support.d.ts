/**
 * Test-only constants and helpers for crash-detector.ts.
 *
 * Separated from the production module to keep the public API surface
 * clean and avoid bundling internal implementation details into production.
 *
 * @internal Only import this file from test code.
 */
export declare const HEARTBEAT_KEY = "ndx-crash-heartbeat";
export declare const NAV_STATE_KEY = "ndx-crash-nav-state";
export declare const CRASH_HISTORY_KEY = "ndx-crash-history";
export declare const RECOVERY_SHOWN_KEY = "ndx-crash-recovery-shown";
export declare const CRASH_LOOP_WINDOW_MS: number;
export declare const CRASH_LOOP_THRESHOLD = 2;
export declare const MAX_CRASH_HISTORY = 10;
