/**
 * Centralized tab visibility state manager.
 *
 * Wraps the Page Visibility API to provide a single source of truth for
 * browser tab visibility state. All polling components subscribe to this
 * module instead of independently listening for visibility changes.
 *
 * Browser compatibility:
 *
 *   1. Standard API    — `document.visibilityState` + `visibilitychange`
 *   2. Webkit prefix   — `document.webkitVisibilityState` + `webkitvisibilitychange`
 *   3. MS prefix       — `document.msVisibilityState` + `msvisibilitychange`
 *   4. Focus/blur      — `window.focus` / `window.blur` (fallback when no API)
 *
 * State transitions:
 *
 *   visible -> hidden   Tab is backgrounded, minimized, or screen-locked.
 *   hidden  -> visible  Tab regains focus or is foregrounded.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useTabVisibility`) is provided separately.
 */
/** Tab visibility state, mirrors `document.visibilityState`. */
export type TabVisibilityState = "visible" | "hidden";
/** Snapshot of the current tab visibility state at a point in time. */
export interface TabVisibilitySnapshot {
    /** Current visibility state. */
    readonly state: TabVisibilityState;
    /** Whether the tab is currently visible (convenience boolean). */
    readonly isVisible: boolean;
    /** ISO timestamp of when the current state began. */
    readonly since: string;
    /** Milliseconds spent in the current state. */
    readonly durationMs: number;
    /** ISO timestamp of when this snapshot was taken. */
    readonly timestamp: string;
}
/** Callback invoked when tab visibility changes. */
export type VisibilityChangeHandler = (snapshot: TabVisibilitySnapshot, previousState: TabVisibilityState) => void;
/** Configuration for the tab visibility monitor. */
export interface TabVisibilityConfig {
    /** Called when tab visibility changes. */
    onChange: VisibilityChangeHandler | null;
}
/** Detection method used for tab visibility tracking. */
export type VisibilityDetectionMethod = "standard" | "webkit" | "ms" | "focus-blur" | "none";
/** Browser capability report for the Page Visibility API. */
export interface VisibilityAPICapabilities {
    /** Whether any visibility detection method is available. */
    readonly supported: boolean;
    /** Which detection method is in use. */
    readonly method: VisibilityDetectionMethod;
    /** Whether the native Page Visibility API is available (standard or prefixed). */
    readonly nativeAPI: boolean;
    /** Whether using the focus/blur fallback instead of the native API. */
    readonly usingFallback: boolean;
    /** The event name being listened to (e.g. "visibilitychange", "webkitvisibilitychange"). */
    readonly eventName: string | null;
}
/** A single state transition record for history tracking. */
export interface VisibilityTransition {
    /** The state that was entered. */
    readonly state: TabVisibilityState;
    /** The state that was left. */
    readonly from: TabVisibilityState;
    /** ISO timestamp of the transition. */
    readonly timestamp: string;
}
/**
 * Probe the runtime environment for the best available Page Visibility API
 * variant. Called once on first use, result is cached.
 *
 * Priority:
 *   1. Standard API (`document.visibilityState`)
 *   2. Webkit prefix (`document.webkitVisibilityState`)
 *   3. MS prefix (`document.msVisibilityState`)
 *   4. Focus/blur fallback (window events)
 *   5. None (SSR or non-browser environment)
 */
export declare function detectVisibilityAPI(): {
    method: VisibilityDetectionMethod;
    eventName: string | null;
};
/**
 * Start the tab visibility monitor. Detects the best available browser API
 * and begins listening for state changes.
 *
 * Safe to call multiple times — restarts with new config.
 */
export declare function startTabVisibilityMonitor(overrides?: Partial<TabVisibilityConfig>): void;
/** Stop the tab visibility monitor and remove all event listeners. */
export declare function stopTabVisibilityMonitor(): void;
/** Subscribe to visibility change events. Returns an unsubscribe function. */
export declare function onVisibilityChange(listener: (snapshot: TabVisibilitySnapshot) => void): () => void;
/** Get the current tab visibility state. */
export declare function getTabVisibility(): TabVisibilityState;
/** Get a full snapshot of the current tab visibility state. */
export declare function getTabVisibilitySnapshot(): TabVisibilitySnapshot;
/** Convenience check: is the tab currently visible? */
export declare function isTabVisible(): boolean;
/**
 * Get the browser's Page Visibility API capabilities.
 * Reports which detection method is in use and whether fallbacks are active.
 */
export declare function getVisibilityCapabilities(): VisibilityAPICapabilities;
/**
 * Get the recent transition history (up to 50 entries).
 * Useful for debugging visibility state patterns.
 */
export declare function getTransitionHistory(): readonly VisibilityTransition[];
/** Reset all module state (for testing). */
export declare function resetTabVisibility(): void;
