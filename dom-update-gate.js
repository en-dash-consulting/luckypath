/**
 * DOM update gate — prevents state updates and re-renders during tab inactivity.
 *
 * Wraps an UpdateBatcher to intercept `schedule()` calls when the tab is hidden.
 * Instead of creating RAF callbacks in background tabs (which still fire at
 * reduced frequency, wasting CPU and triggering unnecessary re-renders), the
 * gate queues all pending updaters per-setter and replays them in a single
 * batch when the tab becomes visible again.
 *
 * Pipeline position:
 *
 *   ... → coalescer.onMessage → **dom-update-gate**.schedule() → batcher → RAF → render
 *
 * When visible:  schedule() → batcher.schedule() (normal flow)
 * When hidden:   schedule() → internal queue (no RAF, no render)
 * On resume:     internal queue → batcher → flush → single render
 *
 * Lifecycle:
 *
 *   Tab goes hidden:
 *     1. Flush the underlying batcher (apply any pending updates immediately
 *        so state is consistent up to the point of suspension).
 *     2. Switch to queuing mode — all future schedule() calls are captured
 *        in an internal per-setter queue.
 *
 *   Tab becomes visible (after resume debounce):
 *     1. Replay all queued updaters through the batcher (preserving
 *        per-setter composition order).
 *     2. Immediately flush the batcher to apply them in one RAF frame.
 *     3. Call onResume if any updates were deferred.
 *
 * This module complements the response-buffer-gate (which drops WebSocket
 * messages during suspension) by also gating the DOM update pathway. Without
 * this, polling callbacks, optimistic updates, or any late-arriving schedule()
 * calls would still trigger RAF and re-renders in background tabs.
 *
 * Designed as a standalone module with zero framework dependencies.
 * The Preact integration lives in the consumer (views/prd.ts etc.).
 */
import { onVisibilityChange, isTabVisible, } from "./tab-visibility.js";
// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_RESUME_DEBOUNCE_MS = 100;
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Create a new DOM update gate.
 *
 * Usage:
 * ```ts
 * const batcher = createUpdateBatcher();
 * const gate = createDomUpdateGate({ batcher });
 *
 * // Use gate.schedule() instead of batcher.schedule()
 * coalescer.onMessage = (msg) => {
 *   if (msg.type === "rex:item-updated") {
 *     gate.schedule(setData, (prev) => applyItemUpdate(prev, msg));
 *   }
 * };
 *
 * // On component unmount:
 * gate.dispose();
 * batcher.dispose();
 * ```
 */
export function createDomUpdateGate(config) {
    const batcher = config.batcher;
    const onResume = config.onResume;
    const resumeDebounceMs = config.resumeDebounceMs ?? DEFAULT_RESUME_DEBOUNCE_MS;
    let open = true;
    let deferredQueue = new Map();
    let queuedCount = 0;
    let totalDeferred = 0;
    let suspensionCount = 0;
    let resumeTimer = null;
    let disposed = false;
    // ─── Internal helpers ─────────────────────────────────────────────
    function clearResumeTimer() {
        if (resumeTimer !== null) {
            clearTimeout(resumeTimer);
            resumeTimer = null;
        }
    }
    /**
     * Compose all queued updaters for a single setter into one function call.
     * Each updater receives the output of the previous — identical to
     * sequential application, just like the update-batcher's composition.
     */
    function composeUpdaters(updaters) {
        return (prev) => {
            let current = prev;
            for (const updater of updaters) {
                current = updater(current);
            }
            return current;
        };
    }
    /**
     * Replay all queued updates through the batcher, then flush.
     * This ensures all deferred updates are applied in a single synchronous
     * block, producing exactly one re-render per setter.
     */
    function replayQueue() {
        const entries = deferredQueue;
        const hadDeferred = entries.size > 0;
        deferredQueue = new Map();
        queuedCount = 0;
        // Replay each setter's accumulated updaters through the batcher.
        for (const entry of entries.values()) {
            batcher.schedule(entry.setter, composeUpdaters(entry.updaters));
        }
        // Flush immediately to apply in one synchronous block.
        if (hadDeferred) {
            batcher.flush();
        }
        // Notify consumer that deferred updates were applied.
        if (hadDeferred && onResume) {
            try {
                onResume();
            }
            catch {
                // Swallow errors from the resume callback.
            }
        }
    }
    /** Close the gate: flush the batcher and switch to queuing mode. */
    function suspend() {
        if (!open)
            return;
        open = false;
        queuedCount = 0;
        suspensionCount++;
        // Flush the underlying batcher so any pending updates are applied
        // before we go into suspension. This ensures state is consistent
        // up to the point of the tab going hidden.
        batcher.flush();
    }
    /** Re-open the gate and replay any deferred updates. */
    function resume() {
        if (open)
            return;
        open = true;
        replayQueue();
    }
    function handleVisibilityChange(snapshot) {
        if (disposed)
            return;
        if (snapshot.isVisible) {
            // Tab became visible — resume with debounce to prevent thrash.
            clearResumeTimer();
            resumeTimer = setTimeout(() => {
                resumeTimer = null;
                resume();
            }, resumeDebounceMs);
        }
        else {
            // Tab became hidden — suspend immediately.
            clearResumeTimer();
            suspend();
        }
    }
    // Subscribe to tab visibility changes.
    const unsubVisibility = onVisibilityChange(handleVisibilityChange);
    // If the tab is currently hidden, suspend immediately.
    if (!isTabVisible()) {
        suspend();
    }
    // ─── Public methods ─────────────────────────────────────────────────
    function schedule(setter, updater) {
        if (disposed)
            return;
        if (open) {
            // Gate is open — delegate to the batcher (normal flow).
            batcher.schedule(setter, updater);
            return;
        }
        // Gate is closed — queue the updater for replay on resume.
        const key = setter;
        let entry = deferredQueue.get(key);
        if (!entry) {
            entry = { setter: key, updaters: [] };
            deferredQueue.set(key, entry);
        }
        entry.updaters.push(updater);
        queuedCount++;
        totalDeferred++;
    }
    function flush() {
        if (disposed)
            return;
        if (open) {
            // Gate is open — just flush the batcher.
            batcher.flush();
            return;
        }
        // Gate is closed — compose queued updaters per-setter and apply
        // them directly, bypassing the batcher (since we don't want to
        // schedule RAF in a background tab).
        const entries = deferredQueue;
        deferredQueue = new Map();
        queuedCount = 0;
        for (const entry of entries.values()) {
            entry.setter(composeUpdaters(entry.updaters));
        }
        // Also flush the batcher in case it has anything pending.
        batcher.flush();
    }
    function hasPending() {
        return deferredQueue.size > 0 || batcher.hasPending();
    }
    function isOpenFn() {
        return open;
    }
    function getSnapshot() {
        return {
            isOpen: open,
            queuedCount,
            totalDeferred,
            suspensionCount,
        };
    }
    function dispose() {
        disposed = true;
        clearResumeTimer();
        unsubVisibility();
        deferredQueue = new Map();
        queuedCount = 0;
    }
    return { schedule, flush, hasPending, isOpen: isOpenFn, getSnapshot, dispose };
}
//# sourceMappingURL=dom-update-gate.js.map