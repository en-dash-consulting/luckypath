/**
 * Client-side crash detection and automatic recovery.
 *
 * Detects memory-related browser crashes using a sessionStorage heartbeat:
 * a "running" flag is set on page load and cleared on clean unload. If the
 * flag is still present at next load, the previous session ended abnormally
 * — most likely an OOM crash or browser-killed tab (error code 5).
 *
 * Tracks crash history to detect crash loops and preserves the user's
 * navigation state so it can be restored after recovery.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useCrashRecovery`) is provided separately.
 */
import type { ViewId } from "./types.js";
/** Saved navigation state that survives a crash. */
export interface SavedNavigationState {
    view: ViewId;
    selectedFile: string | null;
    selectedZone: string | null;
    selectedRunId: string | null;
    selectedTaskId: string | null;
    timestamp: string;
}
/** Result of crash detection performed at page load. */
export interface CrashDetectionResult {
    /** Whether a crash was detected (previous session didn't unload cleanly). */
    crashed: boolean;
    /** Whether multiple crashes happened recently (crash loop). */
    crashLoop: boolean;
    /** Number of recent crashes within the loop window. */
    recentCrashCount: number;
    /** Recovered navigation state from before the crash, if available. */
    recoveredState: SavedNavigationState | null;
}
/** Crash history entry persisted across reloads. */
interface CrashRecord {
    timestamp: string;
}
declare function storageAvailable(): boolean;
declare function getJSON<T>(key: string): T | null;
declare function setJSON(key: string, value: unknown): void;
declare function getCrashHistory(): CrashRecord[];
declare function addCrashRecord(): CrashRecord[];
declare function getRecentCrashCount(history: CrashRecord[]): number;
/** Set the heartbeat flag — call once at page startup. */
declare function setHeartbeat(): void;
/** Clear the heartbeat flag — called on clean page unload. */
declare function clearHeartbeat(): void;
/** Check whether the heartbeat was left set from a previous load. */
declare function heartbeatPresent(): boolean;
/**
 * Detect whether the previous session ended in a crash.
 *
 * Must be called **once** early in page startup (before any clean unload
 * has a chance to clear the heartbeat). Returns the detection result and
 * installs the heartbeat + unload handler for this session.
 *
 * Safe to call multiple times — returns the cached result after first call.
 */
export declare function detectCrash(): CrashDetectionResult;
/**
 * Save the current navigation state so it can be restored after a crash.
 *
 * Call this on every view change to keep the saved state fresh.
 */
export declare function saveNavigationState(state: Omit<SavedNavigationState, "timestamp">): void;
/**
 * Clear the saved navigation state (e.g. after successful recovery).
 */
export declare function clearSavedNavigationState(): void;
/**
 * Mark that the recovery banner has been shown/dismissed in this session.
 */
export declare function markRecoveryShown(): void;
/**
 * Check if recovery was already shown in this session.
 */
export declare function wasRecoveryShown(): boolean;
/** Get the cached crash detection result (null if detectCrash hasn't been called). */
export declare function getDetectionResult(): CrashDetectionResult | null;
/** Clear the crash history. */
export declare function clearCrashHistory(): void;
/** Reset all module state (for testing). */
export declare function resetCrashDetector(): void;
/** @internal Exported for testing only. */
export declare const _testHelpers: {
    HEARTBEAT_KEY: string;
    NAV_STATE_KEY: string;
    CRASH_HISTORY_KEY: string;
    RECOVERY_SHOWN_KEY: string;
    CRASH_LOOP_WINDOW_MS: number;
    CRASH_LOOP_THRESHOLD: number;
    MAX_CRASH_HISTORY: number;
    storageAvailable: typeof storageAvailable;
    getJSON: typeof getJSON;
    setJSON: typeof setJSON;
    getCrashHistory: typeof getCrashHistory;
    addCrashRecord: typeof addCrashRecord;
    getRecentCrashCount: typeof getRecentCrashCount;
    setHeartbeat: typeof setHeartbeat;
    clearHeartbeat: typeof clearHeartbeat;
    heartbeatPresent: typeof heartbeatPresent;
};
export {};
