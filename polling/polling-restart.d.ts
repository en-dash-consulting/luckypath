/**
 * Polling restart coordinator.
 *
 * Bridges the graceful-degradation system to the centralized polling-state
 * manager. When memory pressure disables the `autoRefresh` feature, this
 * module calls `suspendAllSources()` to halt all non-essential polling
 * sources in one atomic operation. When pressure subsides and `autoRefresh`
 * is re-enabled, it calls `resumeAllSources()` to restart everything at
 * original intervals.
 *
 * This provides a safety net that ensures **all** polling loops stop and
 * restart together, even if an individual component forgets to handle
 * degradation on its own. Components that also track degradation individually
 * (e.g. status-indicators, use-app-data) coexist harmlessly — suspending
 * an already-suspended source or resuming an already-active one is a no-op
 * in both polling-state and polling-manager.
 *
 * Flow:
 *
 *   memory-monitor  →  graceful-degradation  →  polling-restart
 *                                                     ↓
 *                                               polling-state
 *                                                ↓         ↓
 *                                          polling-manager  tick-timer
 *
 * Designed as a standalone module with zero framework dependencies.
 */
/**
 * Start the polling restart coordinator.
 *
 * Subscribes to degradation changes and evaluates the current state
 * immediately. If `autoRefresh` is already disabled (e.g. the coordinator
 * is started after memory pressure began), sources are suspended at once.
 *
 * Safe to call multiple times — restarts cleanly.
 */
export declare function startPollingRestart(): void;
/**
 * Stop the polling restart coordinator.
 *
 * Unsubscribes from degradation changes. If the coordinator had
 * triggered a global suspension, sources are resumed to avoid
 * leaving polling permanently frozen.
 */
export declare function stopPollingRestart(): void;
