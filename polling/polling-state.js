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
// ─── Module state ────────────────────────────────────────────────────────────
const sources = new Map();
let globalSuspended = false;
let generation = 0;
let listeners = [];
// ─── Internal helpers ────────────────────────────────────────────────────────
/** Build a snapshot from current module state. */
function buildSnapshot() {
    const infos = [];
    let activeCount = 0;
    let suspendedCount = 0;
    for (const entry of sources.values()) {
        const status = entry.callbacks.getStatus();
        infos.push({
            key: entry.key,
            status,
            essential: entry.config.essential,
            registeredAt: entry.registeredAt,
        });
        if (status === "active")
            activeCount++;
        if (status === "suspended")
            suspendedCount++;
    }
    return {
        sources: infos,
        sourceCount: sources.size,
        activeCount,
        suspendedCount,
        globalSuspended,
        generation,
    };
}
function notifyListeners() {
    const snapshot = buildSnapshot();
    for (const listener of listeners) {
        try {
            listener(snapshot);
        }
        catch (err) {
            console.warn("[polling-state] listener error:", err);
        }
    }
}
// ─── Public API ──────────────────────────────────────────────────────────────
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
export function registerPollingSource(key, callbacks, config = {}) {
    // Dispose existing source with the same key (prevents orphaned intervals).
    const existing = sources.get(key);
    if (existing) {
        try {
            existing.callbacks.dispose();
        }
        catch (err) {
            console.warn(`[polling-state] failed to dispose replaced source "${key}":`, err);
        }
    }
    const entry = {
        key,
        callbacks,
        config: {
            essential: config.essential ?? false,
        },
        registeredAt: new Date().toISOString(),
    };
    sources.set(key, entry);
    // If global suspension is active and this source is not essential,
    // suspend it immediately to maintain consistent state.
    if (globalSuspended && !entry.config.essential) {
        try {
            callbacks.suspend();
        }
        catch (err) {
            console.warn(`[polling-state] failed to suspend new source "${key}":`, err);
        }
    }
    notifyListeners();
    return () => unregisterPollingSource(key);
}
/**
 * Remove a polling source from the registry WITHOUT calling dispose.
 *
 * Use this when the source is cleaning itself up voluntarily (e.g. a
 * module's own stop function). The source is responsible for its own
 * resource cleanup in this case. For forced cleanup, use
 * `disposeAllSources()`.
 */
export function unregisterPollingSource(key) {
    if (!sources.has(key))
        return;
    sources.delete(key);
    notifyListeners();
}
/**
 * Suspend all non-essential polling sources.
 *
 * Essential sources (e.g. memory-monitor) continue running so they can
 * detect when conditions improve. Increments the generation counter.
 */
export function suspendAllSources() {
    if (globalSuspended)
        return;
    globalSuspended = true;
    generation++;
    for (const entry of sources.values()) {
        if (entry.config.essential)
            continue;
        try {
            entry.callbacks.suspend();
        }
        catch (err) {
            console.warn(`[polling-state] failed to suspend source "${entry.key}":`, err);
        }
    }
    notifyListeners();
}
/**
 * Resume all suspended polling sources.
 *
 * Restarts non-essential sources that were suspended. Essential sources
 * that were already running are unaffected. Increments the generation counter.
 */
export function resumeAllSources() {
    if (!globalSuspended)
        return;
    globalSuspended = false;
    generation++;
    for (const entry of sources.values()) {
        if (entry.config.essential)
            continue;
        try {
            entry.callbacks.resume();
        }
        catch (err) {
            console.warn(`[polling-state] failed to resume source "${entry.key}":`, err);
        }
    }
    notifyListeners();
}
/**
 * Dispose all registered polling sources and clear the registry.
 *
 * After this call, all intervals are stopped and all sources are removed.
 * The generation counter is incremented. New sources can still be registered.
 */
export function disposeAllSources() {
    generation++;
    for (const entry of sources.values()) {
        try {
            entry.callbacks.dispose();
        }
        catch (err) {
            console.warn(`[polling-state] failed to dispose source "${entry.key}":`, err);
        }
    }
    sources.clear();
    globalSuspended = false;
    notifyListeners();
}
/**
 * Check if global suspension is active.
 */
export function isGlobalSuspended() {
    return globalSuspended;
}
/**
 * Get the current generation counter.
 *
 * The generation increments on every suspend/resume/dispose cycle.
 * Callers can snapshot this value before an async operation and compare
 * afterward to detect whether a lifecycle change occurred.
 */
export function getGeneration() {
    return generation;
}
/**
 * Check if a specific source is registered.
 */
export function isSourceRegistered(key) {
    return sources.has(key);
}
/**
 * Get read-only information about a specific source, or null if not registered.
 */
export function getSourceInfo(key) {
    const entry = sources.get(key);
    if (!entry)
        return null;
    return {
        key: entry.key,
        status: entry.callbacks.getStatus(),
        essential: entry.config.essential,
        registeredAt: entry.registeredAt,
    };
}
/**
 * Get a full snapshot of the global polling state.
 */
export function getPollingState() {
    return buildSnapshot();
}
/**
 * Subscribe to polling state changes. Returns an unsubscribe function.
 */
export function onPollingStateChange(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
/**
 * Get the number of registered polling sources.
 */
export function getSourceCount() {
    return sources.size;
}
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
export function isGenerationCurrent(gen) {
    return gen === generation;
}
/**
 * Reset all module state (for testing). Disposes all sources, clears
 * listeners, and resets the generation counter.
 */
export function resetPollingState() {
    // Dispose all sources without incrementing generation
    // (reset is a testing utility, not a lifecycle event).
    for (const entry of sources.values()) {
        try {
            entry.callbacks.dispose();
        }
        catch (err) {
            console.warn(`[polling-state] failed to dispose source "${entry.key}" during reset:`, err);
        }
    }
    sources.clear();
    globalSuspended = false;
    generation = 0;
    listeners = [];
}
//# sourceMappingURL=polling-state.js.map