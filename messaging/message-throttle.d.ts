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
import type { ParsedWSMessage } from "./message-coalescer.js";
/** Configuration for the throttled message handler. */
export interface ThrottledHandlerConfig {
    /**
     * Called for each message after its type's debounce window expires.
     * For unthrottled types, called immediately.
     */
    onMessage: (msg: ParsedWSMessage) => void;
    /**
     * Default debounce delay in milliseconds for throttled types
     * that don't have an explicit entry in `delays`.
     * Default: 250ms.
     */
    defaultDelayMs?: number | undefined;
    /**
     * Per-message-type delay overrides. Keys are message type strings,
     * values are delay in milliseconds. Types not listed here fall back
     * to `defaultDelayMs`.
     */
    delays?: Partial<Record<string, number>> | undefined;
    /**
     * Message types to throttle. Types not in this set pass through
     * immediately to `onMessage`.
     *
     * If undefined (not provided), ALL types are throttled.
     * If an empty array/set, NO types are throttled (all pass through).
     */
    throttledTypes?: ReadonlySet<string> | readonly string[] | undefined;
    /**
     * Maximum pending messages per type before force-flushing.
     * Prevents unbounded memory growth during sustained bursts.
     * Default: 20.
     */
    maxPendingPerType?: number | undefined;
}
/** A throttled message handler instance. */
export interface MessageThrottle {
    /** Push a message through the throttle. */
    push(msg: ParsedWSMessage): void;
    /** Force-flush all pending messages across all types immediately. */
    flush(): void;
    /** Dispose: cancel all timers, clear all pending, ignore future pushes. */
    dispose(): void;
}
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
export declare function createMessageThrottle(config: ThrottledHandlerConfig): MessageThrottle;
