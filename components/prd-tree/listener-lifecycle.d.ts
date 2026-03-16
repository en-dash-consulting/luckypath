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
/** A single tracked event listener registration. */
export interface ListenerRecord {
    target: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
}
/** Read-only diagnostic snapshot of manager state. */
export interface ListenerLifecycleState {
    /** Total number of active listeners tracked across all scopes. */
    totalListeners: number;
    /** Number of active scopes (typically = number of nodes with listeners). */
    activeScopeCount: number;
    /** Whether the manager has been disposed. */
    disposed: boolean;
}
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
export declare class ListenerLifecycleManager {
    private scopes;
    private _disposed;
    /**
     * Register a DOM event listener tied to a scope.
     *
     * The listener is added to the target immediately and tracked. Returns a
     * cleanup function that removes the listener and its tracking entry.
     * The cleanup function is idempotent — safe to call multiple times.
     *
     * After `dispose()`, this method is a no-op and returns a no-op cleanup.
     */
    addListener(scopeId: string, target: EventTarget, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Remove all listeners for a given scope and clear its tracking.
     *
     * Called when a node is destroyed or culled off-screen. Safe to call
     * with a scope that doesn't exist (no-op) or after dispose.
     */
    cleanupScope(scopeId: string): void;
    /** Whether a scope has any active tracked listeners. */
    hasScope(scopeId: string): boolean;
    /**
     * Dispose the manager, removing ALL tracked listeners across all scopes.
     *
     * After disposal, `addListener()` becomes a no-op. Safe to call multiple
     * times — subsequent calls are no-ops.
     */
    dispose(): void;
    /** Whether this manager has been disposed. */
    get disposed(): boolean;
    /** Get a diagnostic snapshot of current state. */
    getState(): ListenerLifecycleState;
}
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
export declare function useNodeListeners(manager: ListenerLifecycleManager | null, scopeId: string): (target: EventTarget, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
