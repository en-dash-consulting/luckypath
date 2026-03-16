/**
 * requestAnimationFrame-based update batching for rapid UI state changes.
 *
 * When multiple WebSocket messages trigger state updates in quick succession,
 * this module batches them into a single animation frame to prevent unnecessary
 * intermediate renders. All queued updaters are composed per-setter and applied
 * once within one RAF callback, preserving final state consistency.
 *
 * Two operating modes:
 *
 *   **Enabled (default)** — updaters are queued and applied in the next RAF.
 *   Multiple `schedule()` calls for the same setter are composed in arrival
 *   order so the setter is invoked exactly once per frame. Different setters
 *   are invoked independently within the same frame.
 *
 *   **Disabled** — updaters are applied synchronously on each `schedule()`
 *   call, bypassing RAF entirely. Useful for debugging and testing where
 *   immediate state visibility is needed.
 *
 * Pipeline position:
 *
 *   ... → coalescer.onMessage → updateBatcher.schedule(setter, updater) → RAF → render
 *
 * Designed as a standalone module with zero framework dependencies.
 * The Preact integration lives in the consumer (views/prd.ts etc.).
 */
/** Configuration for the update batcher. */
export interface UpdateBatcherConfig {
    /**
     * When true, bypasses RAF batching and applies updates synchronously.
     * Useful for debugging and testing.
     * Default: false.
     */
    disabled?: boolean | undefined;
}
/** An update batcher instance. */
export interface UpdateBatcher {
    /**
     * Schedule a state update to be applied in the next animation frame.
     *
     * Multiple updates for the same setter are composed in order: each updater
     * receives the result of the previous, and the setter is called once with
     * the final composed value — identical to sequential application.
     *
     * When batching is disabled, the setter is called immediately.
     */
    schedule<T>(setter: (updater: (prev: T) => T) => void, updater: (prev: T) => T): void;
    /**
     * Force-flush all pending updates synchronously. Cancels any pending RAF.
     * No-op if no updates are pending.
     */
    flush(): void;
    /** Whether updates are currently pending in the batch queue. */
    hasPending(): boolean;
    /** Dispose: cancel pending RAF, clear queue, ignore future schedules. */
    dispose(): void;
}
/**
 * Create a new update batcher.
 *
 * Usage:
 * ```ts
 * const batcher = createUpdateBatcher();
 *
 * // In a WebSocket message handler:
 * coalescer.onMessage = (msg) => {
 *   if (msg.type === "rex:item-updated") {
 *     batcher.schedule(setData, (prev) => {
 *       const newItems = applyItemUpdate(prev.items, msg.itemId, msg.updates);
 *       return newItems === prev.items ? prev : { ...prev, items: newItems };
 *     });
 *   }
 * };
 *
 * // On component unmount:
 * batcher.dispose();
 * ```
 */
export declare function createUpdateBatcher(config?: UpdateBatcherConfig): UpdateBatcher;
