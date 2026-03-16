/**
 * Centralized polling manager with tab visibility integration.
 *
 * Provides a registry for all polling intervals across the application.
 * When the browser tab is backgrounded, all registered pollers are
 * suspended to conserve resources. When the tab regains focus, pollers
 * are resumed with their original intervals.
 *
 * Rapid visibility changes (e.g. quick alt-tab sequences) are debounced
 * to avoid thrashing interval creation/destruction.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`usePolling`) is provided separately.
 */
/** Read-only view of a registered poller for external inspection. */
export interface PollerInfo {
    readonly key: string;
    readonly intervalMs: number;
    readonly active: boolean;
}
/**
 * Start the polling manager. Subscribes to tab visibility changes
 * and enables automatic suspend/resume of registered pollers.
 *
 * Safe to call multiple times — restarts cleanly.
 */
export declare function startPollingManager(): void;
/**
 * Stop the polling manager. Unsubscribes from visibility changes
 * but does NOT clear registered pollers or their timers.
 */
export declare function stopPollingManager(): void;
/**
 * Register a polling interval. The callback will be called every
 * `intervalMs` milliseconds while the tab is visible.
 *
 * If the tab is currently hidden and the manager is started,
 * the poller is registered but not activated until the tab becomes visible.
 *
 * Returns an unregister function for cleanup.
 *
 * @param key - Unique identifier for this poller. Re-registering with the
 *              same key replaces the previous entry.
 * @param callback - Function to call on each tick.
 * @param intervalMs - Polling interval in milliseconds.
 */
export declare function registerPoller(key: string, callback: () => void, intervalMs: number): () => void;
/**
 * Remove a poller from the registry and clear its interval.
 */
export declare function unregisterPoller(key: string): void;
/**
 * Suspend all registered pollers. Clears their interval timers
 * but keeps them in the registry for later resumption.
 */
export declare function suspendAll(): void;
/**
 * Resume all registered pollers. Restarts their interval timers
 * with their original intervals.
 */
export declare function resumeAll(): void;
/**
 * Check if the polling manager is currently in a suspended state.
 */
export declare function isSuspended(): boolean;
/**
 * Check if a specific poller is actively running (has a timer).
 */
export declare function isPollerActive(key: string): boolean;
/**
 * Get read-only information about all registered pollers.
 */
export declare function getRegisteredPollers(): readonly PollerInfo[];
/**
 * Get the number of registered pollers.
 */
export declare function getPollerCount(): number;
/**
 * Reset all module state (for testing). Clears all pollers, stops the
 * manager, and resets the suspended flag.
 */
export declare function resetPollingManager(): void;
