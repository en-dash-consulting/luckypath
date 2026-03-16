/**
 * Centralized polling state manager.
 *
 * Provides a single registry for all interval-based polling sources in the
 * application (polling-manager, memory-monitor, DOM performance monitor,
 * tick timer, etc.). Enables coordinated suspension, resumption, and
 * disposal of all polling sources from one location.
 *
 * Problems this solves:
 *
 *   1. **Orphaned intervals** — Without a central registry, independent
 *      modules that manage their own `setInterval` can leak timers if
 *      their stop functions are never called.
 *
 *   2. **No single "stop everything"** — Previously, shutting down all
 *      polling required calling individual stop functions across 4+
 *      modules. Now `disposeAllSources()` handles it.
 *
 *   3. **Component remount safety** — Module-level state persists across
 *      Preact component teardown/remount cycles. Generation IDs prevent
 *      stale callbacks from restarting disposed sources.
 *
 *   4. **Memory-pressure coordination** — Sources can be tagged as
 *      `essential` (e.g. memory-monitor must keep running to detect
 *      recovery) or non-essential (suspended during memory pressure).
 *
 * Generation tracking:
 *
 *   Each `suspendAllSources()` / `resumeAllSources()` cycle increments a
 *   generation counter. Callers can snapshot the generation before an
 *   async operation and compare afterward to detect whether a
 *   suspend/resume cycle occurred while they were waiting — preventing
 *   stale restarts from orphaned component lifecycles.
 *
 * Designed as a standalone module with zero framework dependencies.
 */
/** Status of an individual polling source. */
export type PollingSourceStatus = "active" | "suspended" | "disposed" | "idle";
/** Lifecycle callbacks for a registered polling source. */
export interface PollingSourceCallbacks {
    /** Suspend the source (stop its interval but keep state for resume). */
    suspend: () => void;
    /** Resume the source (restart its interval). */
    resume: () => void;
    /** Fully dispose the source (stop interval, clear state). */
    dispose: () => void;
    /** Return the source's current status. */
    getStatus: () => PollingSourceStatus;
}
/** Configuration for a polling source registration. */
export interface PollingSourceConfig {
    /**
     * Whether this source is essential and should NOT be suspended during
     * memory pressure. The memory monitor itself is essential — it must
     * keep running to detect when pressure subsides.
     */
    essential: boolean;
}
/** Read-only view of a registered polling source. */
export interface PollingSourceInfo {
    readonly key: string;
    readonly status: PollingSourceStatus;
    readonly essential: boolean;
    readonly registeredAt: string;
}
/** Read-only snapshot of the global polling state. */
export interface PollingStateSnapshot {
    /** All registered polling sources. */
    readonly sources: readonly PollingSourceInfo[];
    /** Number of registered sources. */
    readonly sourceCount: number;
    /** Number of currently active (running) sources. */
    readonly activeCount: number;
    /** Number of currently suspended sources. */
    readonly suspendedCount: number;
    /** Whether global suspension is active. */
    readonly globalSuspended: boolean;
    /** Current generation counter (increments on suspend/resume cycles). */
    readonly generation: number;
}
/** Callback invoked when the global polling state changes. */
export type PollingStateChangeHandler = (snapshot: PollingStateSnapshot) => void;
/**
 * Register a polling source with the centralized state manager.
 *
 * If a source with the same key already exists, it is disposed and replaced.
 * If global suspension is active and the source is not essential, it will
 * be immediately suspended after registration.
 *
 * Returns an unregister function that removes the source from the registry
 * WITHOUT calling dispose. This allows sources to voluntarily unregister
 * (e.g. during their own stop/shutdown) without triggering re-entrant
 * dispose calls. The `dispose` callback is only invoked by
 * `disposeAllSources()` or when the source is replaced by a new
 * registration with the same key.
 *
 * @param key - Unique identifier for this source.
 * @param callbacks - Lifecycle callbacks (suspend, resume, dispose, getStatus).
 * @param config - Source configuration (essential flag).
 */
export declare function registerPollingSource(key: string, callbacks: PollingSourceCallbacks, config?: Partial<PollingSourceConfig>): () => void;
/**
 * Remove a polling source from the registry WITHOUT calling dispose.
 *
 * Use this when the source is cleaning itself up voluntarily (e.g. a
 * module's own stop function). The source is responsible for its own
 * resource cleanup in this case. For forced cleanup, use
 * `disposeAllSources()`.
 */
export declare function unregisterPollingSource(key: string): void;
/**
 * Suspend all non-essential polling sources.
 *
 * Essential sources (e.g. memory-monitor) continue running so they can
 * detect when conditions improve. Increments the generation counter.
 */
export declare function suspendAllSources(): void;
/**
 * Resume all suspended polling sources.
 *
 * Restarts non-essential sources that were suspended. Essential sources
 * that were already running are unaffected. Increments the generation counter.
 */
export declare function resumeAllSources(): void;
/**
 * Dispose all registered polling sources and clear the registry.
 *
 * After this call, all intervals are stopped and all sources are removed.
 * The generation counter is incremented. New sources can still be registered.
 */
export declare function disposeAllSources(): void;
/**
 * Check if global suspension is active.
 */
export declare function isGlobalSuspended(): boolean;
/**
 * Get the current generation counter.
 *
 * The generation increments on every suspend/resume/dispose cycle.
 * Callers can snapshot this value before an async operation and compare
 * afterward to detect whether a lifecycle change occurred.
 */
export declare function getGeneration(): number;
/**
 * Check if a specific source is registered.
 */
export declare function isSourceRegistered(key: string): boolean;
/**
 * Get read-only information about a specific source, or null if not registered.
 */
export declare function getSourceInfo(key: string): PollingSourceInfo | null;
/**
 * Get a full snapshot of the global polling state.
 */
export declare function getPollingState(): PollingStateSnapshot;
/**
 * Subscribe to polling state changes. Returns an unsubscribe function.
 */
export declare function onPollingStateChange(listener: PollingStateChangeHandler): () => void;
/**
 * Get the number of registered polling sources.
 */
export declare function getSourceCount(): number;
/**
 * Validate that a generation value is still current.
 *
 * Returns `true` if the given generation matches the current generation,
 * meaning no suspend/resume/dispose cycle has occurred since the value
 * was captured. Useful for guarding against stale restarts in async code:
 *
 * ```ts
 * const gen = getGeneration();
 * await fetchData();
 * if (!isGenerationCurrent(gen)) return; // stale — bail out
 * ```
 */
export declare function isGenerationCurrent(gen: number): boolean;
/**
 * Reset all module state (for testing). Disposes all sources, clears
 * listeners, and resets the generation counter.
 */
export declare function resetPollingState(): void;
