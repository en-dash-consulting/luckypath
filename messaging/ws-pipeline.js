/**
 * WebSocket message processing pipeline — composed throttle + coalescer.
 *
 * Both `usePRDWebSocket` and `useProjectStatus` build the same two-layer
 * pipeline: per-type throttle → message coalescer. This module captures
 * that pattern as a single factory, reducing the coupling surface from
 * two individual messaging imports to one composed import.
 *
 * The pipeline handles:
 *   1. **Throttle** — per-type trailing-edge debounce with independent timers.
 *   2. **Coalescer** — batches throttled output into a single flush.
 *
 * Consumers configure which message types to throttle, their delays, and
 * provide an `onMessage` (immediate/optimistic) and `onFlush` (batched
 * reconciliation) callback.
 *
 * Standalone module with zero framework dependencies.
 */
import { createMessageThrottle } from "./message-throttle.js";
import { createMessageCoalescer } from "./message-coalescer.js";
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Create a WebSocket message processing pipeline.
 *
 * Usage:
 * ```ts
 * const pipeline = createWSPipeline({
 *   onMessage: (msg) => applyOptimisticUpdate(msg),
 *   onFlush: (batch) => {
 *     if (batch.types.has("rex:prd-changed")) fetchPRDData();
 *   },
 *   throttledTypes: ["rex:prd-changed", "rex:item-updated"],
 *   delays: { "rex:prd-changed": 300, "rex:item-updated": 200 },
 * });
 *
 * ws.onmessage = (event) => {
 *   pipeline.push(JSON.parse(event.data));
 * };
 * ```
 */
export function createWSPipeline(config) {
    const coalescer = createMessageCoalescer({
        onMessage: config.onMessage,
        onFlush: config.onFlush,
        windowMs: config.coalescerWindowMs,
    });
    const throttle = createMessageThrottle({
        onMessage: (msg) => coalescer.push(msg),
        defaultDelayMs: config.defaultDelayMs,
        delays: config.delays,
        throttledTypes: config.throttledTypes,
        maxPendingPerType: config.maxPendingPerType,
    });
    return {
        push(msg) {
            throttle.push(msg);
        },
        flush() {
            throttle.flush();
            coalescer.flush();
        },
        dispose() {
            throttle.dispose();
            coalescer.dispose();
        },
    };
}
//# sourceMappingURL=ws-pipeline.js.map