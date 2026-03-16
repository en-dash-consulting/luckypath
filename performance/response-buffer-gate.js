/**
 * Response buffer gate — suspends message pipeline during tab inactivity.
 *
 * Sits at the front of the WebSocket message pipeline to prevent memory
 * buildup from accumulating response data while the browser tab is hidden.
 * When the tab becomes inactive:
 *
 *   1. Flushes all pending data from downstream buffers (throttle, coalescer,
 *      batcher) so they release references immediately.
 *   2. Drops all subsequent incoming messages silently — no accumulation.
 *   3. Tracks that messages were dropped during suspension.
 *
 * When the tab becomes visible again:
 *
 *   1. Opens the gate to accept new messages normally.
 *   2. If any messages were dropped, calls `onResume` so the consumer can
 *      trigger a single full reconciliation (e.g. fetchPRDData + fetchTaskUsage)
 *      to restore data integrity.
 *
 * This module complements the polling-manager (which suspends fetch intervals)
 * by also stopping the *response processing* side. Without this, WebSocket
 * messages arriving during a background tab would still accumulate in the
 * message-throttle pending arrays, coalescer batch, and update-batcher queue.
 *
 * Pipeline position:
 *
 *   raw WebSocket → **response-buffer-gate** → throttle → coalescer → batcher → render
 *
 * Designed as a standalone module with zero framework dependencies.
 * The Preact integration lives in the consumer (views/prd.ts etc.).
 */
import { onVisibilityChange, isTabVisible, } from "../polling/index.js";
// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_RESUME_DEBOUNCE_MS = 100;
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Create a new response buffer gate.
 *
 * Usage:
 * ```ts
 * const gate = createResponseBufferGate({
 *   flushDownstream: [
 *     () => throttle.flush(),
 *     () => coalescer.flush(),
 *     () => batcher.flush(),
 *   ],
 *   onResume: () => {
 *     fetchPRDData();
 *     fetchTaskUsage();
 *   },
 * });
 *
 * ws.onmessage = (event) => {
 *   const msg = JSON.parse(event.data);
 *   if (!gate.accept()) return; // Dropped — tab is hidden
 *   throttle.push(msg);
 * };
 * ```
 */
export function createResponseBufferGate(config) {
    const flushDownstream = config.flushDownstream;
    const onResume = config.onResume;
    const resumeDebounceMs = config.resumeDebounceMs ?? DEFAULT_RESUME_DEBOUNCE_MS;
    // Start as visible; the initial-state check below may immediately suspend.
    let open = true;
    let droppedCount = 0;
    let totalDropped = 0;
    let suspensionCount = 0;
    let resumeTimer = null;
    let disposed = false;
    function clearResumeTimer() {
        if (resumeTimer !== null) {
            clearTimeout(resumeTimer);
            resumeTimer = null;
        }
    }
    /** Flush all downstream buffers to release buffered data from memory. */
    function flushAllDownstream() {
        for (const flush of flushDownstream) {
            try {
                flush();
            }
            catch {
                // Swallow errors from individual flushes.
            }
        }
    }
    /** Close the gate: flush downstream buffers and start dropping. */
    function suspend() {
        if (!open)
            return;
        open = false;
        droppedCount = 0;
        suspensionCount++;
        // Flush downstream buffers to release buffered data from memory.
        // This ensures the throttle's pending arrays, the coalescer's batch,
        // and the batcher's queue are all cleared immediately.
        flushAllDownstream();
    }
    /** Re-open the gate and trigger reconciliation if data was dropped. */
    function resume() {
        if (open)
            return;
        const hadDrops = droppedCount > 0;
        open = true;
        // Trigger reconciliation if any messages were lost during suspension.
        // This ensures the UI shows the latest state from the server.
        if (hadDrops) {
            try {
                onResume();
            }
            catch {
                // Swallow errors from the resume callback.
            }
        }
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
    // If the tab is currently hidden, suspend immediately. This runs the
    // full suspend path (flush + mark closed) even on initial creation.
    if (!isTabVisible()) {
        suspend();
    }
    // ─── Public methods ─────────────────────────────────────────────────
    function accept() {
        if (disposed)
            return false;
        if (!open) {
            droppedCount++;
            totalDropped++;
            return false;
        }
        return true;
    }
    function isOpenFn() {
        return open;
    }
    function getSnapshot() {
        return {
            isOpen: open,
            droppedCount,
            totalDropped,
            suspensionCount,
        };
    }
    function dispose() {
        disposed = true;
        clearResumeTimer();
        unsubVisibility();
    }
    return { accept, isOpen: isOpenFn, getSnapshot, dispose };
}
//# sourceMappingURL=response-buffer-gate.js.map