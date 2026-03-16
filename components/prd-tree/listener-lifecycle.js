/**
 * Event listener lifecycle manager for tree node DOM elements.
 *
 * Provides centralized tracking and scope-based cleanup of event listeners
 * registered on per-node DOM elements. Each listener is associated with a
 * "scope" (typically a node ID) so that all listeners for a node can be
 * batch-removed when the node is destroyed or culled off-screen.
 *
 * The manager ensures:
 * - Event listeners are removed when nodes are destroyed (cull or unmount)
 * - No memory leaks from orphaned listeners after tree data changes
 * - Listener count stays proportional to visible nodes
 * - Diagnostic state is available for memory profiling
 *
 * Framework-agnostic core — the Preact hook `useNodeListeners` is provided
 * below for convenient integration with component lifecycles.
 *
 * @see ./prd-tree.ts    — PRDTree component that owns the manager instance
 */
import { useEffect, useRef, useCallback } from "preact/hooks";
// ─── ListenerLifecycleManager ────────────────────────────────────────────────
/**
 * Centralized event listener lifecycle manager.
 *
 * Organizes listeners by scope (node ID). When a node is culled or destroyed,
 * `cleanupScope()` removes all its listeners in one call. On tree unmount,
 * `dispose()` cleans up everything.
 *
 * Usage:
 * ```ts
 * const manager = new ListenerLifecycleManager();
 *
 * // Register a listener tied to a node
 * const cleanup = manager.addListener("node-1", element, "click", handler);
 *
 * // Remove all listeners for a node (e.g. when culled)
 * manager.cleanupScope("node-1");
 *
 * // Tear down on tree unmount
 * manager.dispose();
 * ```
 */
export class ListenerLifecycleManager {
    scopes = new Map();
    _disposed = false;
    /**
     * Register a DOM event listener tied to a scope.
     *
     * The listener is added to the target immediately and tracked. Returns a
     * cleanup function that removes the listener and its tracking entry.
     * The cleanup function is idempotent — safe to call multiple times.
     *
     * After `dispose()`, this method is a no-op and returns a no-op cleanup.
     */
    addListener(scopeId, target, event, handler, options) {
        if (this._disposed)
            return () => { };
        target.addEventListener(event, handler, options);
        const record = { target, event, handler, options };
        let records = this.scopes.get(scopeId);
        if (!records) {
            records = [];
            this.scopes.set(scopeId, records);
        }
        records.push(record);
        let removed = false;
        return () => {
            if (removed)
                return;
            removed = true;
            target.removeEventListener(event, handler, options);
            const recs = this.scopes.get(scopeId);
            if (recs) {
                const idx = recs.indexOf(record);
                if (idx >= 0)
                    recs.splice(idx, 1);
                if (recs.length === 0)
                    this.scopes.delete(scopeId);
            }
        };
    }
    /**
     * Remove all listeners for a given scope and clear its tracking.
     *
     * Called when a node is destroyed or culled off-screen. Safe to call
     * with a scope that doesn't exist (no-op) or after dispose.
     */
    cleanupScope(scopeId) {
        const records = this.scopes.get(scopeId);
        if (!records)
            return;
        for (const { target, event, handler, options } of records) {
            target.removeEventListener(event, handler, options);
        }
        this.scopes.delete(scopeId);
    }
    /** Whether a scope has any active tracked listeners. */
    hasScope(scopeId) {
        const records = this.scopes.get(scopeId);
        return !!records && records.length > 0;
    }
    /**
     * Dispose the manager, removing ALL tracked listeners across all scopes.
     *
     * After disposal, `addListener()` becomes a no-op. Safe to call multiple
     * times — subsequent calls are no-ops.
     */
    dispose() {
        if (this._disposed)
            return;
        this._disposed = true;
        for (const records of this.scopes.values()) {
            for (const { target, event, handler, options } of records) {
                target.removeEventListener(event, handler, options);
            }
        }
        this.scopes.clear();
    }
    /** Whether this manager has been disposed. */
    get disposed() {
        return this._disposed;
    }
    /** Get a diagnostic snapshot of current state. */
    getState() {
        let totalListeners = 0;
        for (const records of this.scopes.values()) {
            totalListeners += records.length;
        }
        return {
            totalListeners,
            activeScopeCount: this.scopes.size,
            disposed: this._disposed,
        };
    }
}
// ─── Preact hook ─────────────────────────────────────────────────────────────
/**
 * Hook for registering scope-aware event listeners with automatic cleanup.
 *
 * Returns an `addListener` function that registers listeners through the
 * lifecycle manager. All listeners registered via this hook are automatically
 * removed when the component unmounts or when the scope/manager changes.
 *
 * When no manager is provided (null), listeners are added directly to the
 * target and tracked locally for cleanup on unmount — a safe fallback that
 * still prevents leaks.
 *
 * @param manager  Shared lifecycle manager, or null to use local tracking only
 * @param scopeId  Scope identifier (typically a node ID)
 */
export function useNodeListeners(manager, scopeId) {
    const cleanupsRef = useRef([]);
    // Cleanup on unmount or scope/manager change.
    useEffect(() => {
        return () => {
            for (const cleanup of cleanupsRef.current)
                cleanup();
            cleanupsRef.current = [];
        };
    }, [manager, scopeId]);
    return useCallback((target, event, handler, options) => {
        if (manager) {
            const cleanup = manager.addListener(scopeId, target, event, handler, options);
            cleanupsRef.current.push(cleanup);
        }
        else {
            // Fallback: track locally without a manager
            target.addEventListener(event, handler, options);
            cleanupsRef.current.push(() => target.removeEventListener(event, handler, options));
        }
    }, [manager, scopeId]);
}
//# sourceMappingURL=listener-lifecycle.js.map