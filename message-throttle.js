/**
 * Per-type WebSocket message throttle with configurable debounce.
 *
 * Sits between the raw WebSocket and downstream handlers (e.g. the message
 * coalescer) to provide per-message-type trailing-edge debouncing. Each
 * configured type gets its own independent timer and delay, so different
 * message types can be throttled at different rates.
 *
 * Design decisions:
 *
 *   - **Trailing-edge debounce** — messages accumulate during the delay
 *     window and are forwarded once the timer fires. New messages of the
 *     same type reset the timer (like the coalescer, but per-type).
 *
 *   - **Per-type isolation** — timers are fully independent. A burst of
 *     rex:item-updated messages doesn't delay rex:prd-changed.
 *
 *   - **Bounded memory** — maxPendingPerType caps how many messages can
 *     accumulate per type before a force-flush, preventing unbounded growth
 *     during sustained bursts.
 *
 *   - **Pass-through** — message types not in the throttledTypes set are
 *     forwarded immediately with zero delay, preserving low-latency for
 *     types that don't need throttling.
 *
 * Standalone module with zero framework dependencies.
 * The Preact integration lives in the consumer (views/prd.ts etc.).
 */
// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_DELAY_MS = 250;
const DEFAULT_MAX_PENDING_PER_TYPE = 20;
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Create a new per-type message throttle.
 *
 * Usage:
 * ```ts
 * const throttle = createMessageThrottle({
 *   onMessage: (msg) => coalescer.push(msg),
 *   defaultDelayMs: 250,
 *   delays: {
 *     "rex:prd-changed": 500,    // slow — heavy reconciliation
 *     "rex:item-updated": 150,   // fast — targeted updates
 *   },
 *   throttledTypes: ["rex:prd-changed", "rex:item-updated", "rex:item-deleted"],
 *   maxPendingPerType: 20,
 * });
 *
 * ws.onmessage = (event) => {
 *   const msg = JSON.parse(event.data);
 *   throttle.push(msg);
 * };
 * ```
 */
export function createMessageThrottle(config) {
    const onMessage = config.onMessage;
    const defaultDelayMs = config.defaultDelayMs ?? DEFAULT_DELAY_MS;
    const delays = config.delays ?? {};
    const maxPending = config.maxPendingPerType ?? DEFAULT_MAX_PENDING_PER_TYPE;
    // Normalize throttledTypes into a Set, or null to mean "all types throttled"
    const throttledTypes = config.throttledTypes === undefined
        ? null // all types throttled
        : config.throttledTypes instanceof Set
            ? config.throttledTypes
            : new Set(config.throttledTypes);
    // Per-type state map
    const stateByType = new Map();
    let disposed = false;
    function isThrottled(type) {
        if (throttledTypes === null)
            return true; // all throttled
        return throttledTypes.has(type);
    }
    function getDelay(type) {
        return delays[type] ?? defaultDelayMs;
    }
    function getOrCreateState(type) {
        let state = stateByType.get(type);
        if (!state) {
            state = { pending: [], timer: null };
            stateByType.set(type, state);
        }
        return state;
    }
    function clearTypeTimer(state) {
        if (state.timer !== null) {
            clearTimeout(state.timer);
            state.timer = null;
        }
    }
    function flushType(type) {
        const state = stateByType.get(type);
        if (!state || state.pending.length === 0)
            return;
        clearTypeTimer(state);
        // Forward all pending messages for this type
        const messages = state.pending;
        state.pending = [];
        for (const msg of messages) {
            onMessage(msg);
        }
    }
    function scheduleFlush(type, state) {
        clearTypeTimer(state);
        state.timer = setTimeout(() => {
            state.timer = null;
            flushType(type);
        }, getDelay(type));
    }
    function push(msg) {
        if (disposed)
            return;
        const type = msg.type;
        // Pass-through for unthrottled types
        if (!isThrottled(type)) {
            onMessage(msg);
            return;
        }
        // Accumulate into the type's pending queue
        const state = getOrCreateState(type);
        state.pending.push(msg);
        // Force-flush if pending count exceeds the limit
        if (state.pending.length >= maxPending) {
            flushType(type);
            return;
        }
        // Reset the trailing-edge debounce timer for this type
        scheduleFlush(type, state);
    }
    function flush() {
        if (disposed)
            return;
        for (const type of stateByType.keys()) {
            flushType(type);
        }
    }
    function dispose() {
        disposed = true;
        for (const state of stateByType.values()) {
            clearTypeTimer(state);
            state.pending = [];
        }
        stateByType.clear();
    }
    return { push, flush, dispose };
}
//# sourceMappingURL=message-throttle.js.map