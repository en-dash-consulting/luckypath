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
// ─── Factory ─────────────────────────────────────────────────────────────────
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
export function createUpdateBatcher(config) {
    const disabled = config?.disabled ?? false;
    // Map from setter reference → array of updater functions.
    // Using a Map preserves insertion order for deterministic flush ordering.
    let queue = new Map();
    let rafId = null;
    let disposed = false;
    function applyAll() {
        const entries = queue;
        queue = new Map();
        rafId = null;
        for (const entry of entries.values()) {
            // Compose all updaters into a single function call.
            // Each updater receives the output of the previous one.
            const composed = (prev) => {
                let current = prev;
                for (const updater of entry.updaters) {
                    current = updater(current);
                }
                return current;
            };
            entry.setter(composed);
        }
    }
    function scheduleRAF() {
        if (rafId !== null)
            return; // Already scheduled
        rafId = requestAnimationFrame(applyAll);
    }
    function cancelRAF() {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }
    function schedule(setter, updater) {
        if (disposed)
            return;
        // Disabled mode: apply immediately, no batching.
        if (disabled) {
            setter(updater);
            return;
        }
        const key = setter;
        let entry = queue.get(key);
        if (!entry) {
            entry = { setter: key, updaters: [] };
            queue.set(key, entry);
        }
        entry.updaters.push(updater);
        scheduleRAF();
    }
    function flush() {
        if (disposed)
            return;
        if (queue.size === 0)
            return;
        cancelRAF();
        applyAll();
    }
    function hasPending() {
        return queue.size > 0;
    }
    function dispose() {
        disposed = true;
        cancelRAF();
        queue = new Map();
    }
    return { schedule, flush, hasPending, dispose };
}
//# sourceMappingURL=update-batcher.js.map