/**
 * WebSocket message coalescing for rapid sequential updates.
 *
 * When multiple WebSocket messages arrive in quick succession (e.g. a batch
 * of rex:item-updated events during a bulk operation), this module batches
 * them into a single flush to avoid redundant fetch calls.
 *
 * Two-callback design:
 *
 *   onMessage(msg)  — fires immediately for each message, enabling optimistic
 *                     UI updates with no delay.
 *   onFlush(batch)  — fires once per throttle window (trailing edge), after
 *                     messages stop arriving. The batch includes all message
 *                     types seen, counts per type, and the full ordered list.
 *                     Consumers use this to trigger a single reconciliation
 *                     (e.g. fetchPRDData + fetchTaskUsage) instead of N calls.
 *
 * Designed as a standalone module with zero framework dependencies.
 * The Preact integration lives in the consumer (views/prd.ts etc.).
 */
// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_WINDOW_MS = 150;
const DEFAULT_MAX_BATCH_SIZE = 50;
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Create a new message coalescer.
 *
 * Usage:
 * ```ts
 * const coalescer = createMessageCoalescer({
 *   onMessage: (msg) => {
 *     // Immediate optimistic update
 *     if (msg.type === "rex:item-updated") applyItemUpdate(msg);
 *   },
 *   onFlush: (batch) => {
 *     // Coalesced reconciliation — runs once per window
 *     if (batch.types.has("rex:item-updated") || batch.types.has("rex:prd-changed")) {
 *       fetchPRDData();
 *       fetchTaskUsage();
 *     }
 *   },
 * });
 *
 * ws.onmessage = (event) => {
 *   const msg = JSON.parse(event.data);
 *   coalescer.push(msg);
 * };
 * ```
 */
export function createMessageCoalescer(config) {
    const windowMs = config.windowMs ?? DEFAULT_WINDOW_MS;
    const maxBatchSize = config.maxBatchSize ?? DEFAULT_MAX_BATCH_SIZE;
    const onFlush = config.onFlush;
    const onMessage = config.onMessage ?? null;
    let messages = [];
    let types = new Set();
    let countByType = new Map();
    let timer = null;
    let disposed = false;
    function clearTimer() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }
    function buildBatch() {
        return {
            types,
            countByType,
            messages,
            size: messages.length,
        };
    }
    function resetBatch() {
        messages = [];
        types = new Set();
        countByType = new Map();
    }
    function doFlush() {
        clearTimer();
        if (messages.length === 0)
            return;
        const batch = buildBatch();
        resetBatch();
        onFlush(batch);
    }
    function scheduleFlush() {
        clearTimer();
        timer = setTimeout(doFlush, windowMs);
    }
    function push(msg) {
        if (disposed)
            return;
        // Immediate per-message callback (for optimistic updates)
        if (onMessage)
            onMessage(msg);
        // Accumulate into the current batch
        messages.push(msg);
        types.add(msg.type);
        countByType.set(msg.type, (countByType.get(msg.type) ?? 0) + 1);
        // Force flush if batch size limit reached
        if (messages.length >= maxBatchSize) {
            doFlush();
            return;
        }
        // Reset the trailing-edge debounce timer
        scheduleFlush();
    }
    function flush() {
        if (disposed)
            return;
        doFlush();
    }
    function dispose() {
        disposed = true;
        clearTimer();
        resetBatch();
    }
    return { push, flush, dispose };
}
//# sourceMappingURL=message-coalescer.js.map