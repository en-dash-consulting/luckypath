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
import type { UpdateBatcher } from "./update-batcher.js";
/** Configuration for the DOM update gate. */
export interface DomUpdateGateConfig {
    /**
     * The underlying batcher to delegate to when the gate is open.
     * The gate does NOT own this batcher — the caller is responsible
     * for disposal of the batcher separately.
     */
    batcher: UpdateBatcher;
    /**
     * Called when the gate re-opens after suspension, but only if updates
     * were deferred while the gate was closed. Use this to trigger any
     * additional reconciliation work needed after deferred updates are applied.
     *
     * Optional — most consumers rely on the deferred updates themselves.
     */
    onResume?: (() => void) | undefined;
    /**
     * Debounce delay in milliseconds before re-opening the gate after the
     * tab becomes visible. Prevents thrashing on rapid tab switches.
     * Default: 100ms (matches polling-manager and buffer-gate debounce).
     */
    resumeDebounceMs?: number | undefined;
}
/** Read-only snapshot of the gate's current state. */
export interface DomUpdateGateSnapshot {
    /** Whether the gate is currently open (delegating to the batcher). */
    readonly isOpen: boolean;
    /** Number of updaters queued during the current or most recent suspension. */
    readonly queuedCount: number;
    /** Total updaters deferred across all suspensions since creation. */
    readonly totalDeferred: number;
    /** Number of times the gate has been suspended. */
    readonly suspensionCount: number;
}
/** A DOM update gate instance. Extends UpdateBatcher with visibility gating. */
export interface DomUpdateGate {
    /**
     * Schedule a state update.
     *
     * When the gate is open (tab visible): delegates to the underlying batcher.
     * When the gate is closed (tab hidden): queues the updater internally.
     * Multiple updates for the same setter are composed in order on replay.
     */
    schedule<T>(setter: (updater: (prev: T) => T) => void, updater: (prev: T) => T): void;
    /**
     * Force-flush all pending updates synchronously.
     *
     * When the gate is open: flushes the underlying batcher.
     * When the gate is closed: composes queued updaters per-setter and applies
     * them directly (bypassing the batcher), then flushes the batcher.
     */
    flush(): void;
    /** Whether updates are pending (in the batcher or in the deferred queue). */
    hasPending(): boolean;
    /** Whether the gate is currently open (tab visible, accepting updates). */
    isOpen(): boolean;
    /** Get a snapshot of the gate's current state. */
    getSnapshot(): DomUpdateGateSnapshot;
    /** Dispose: unsubscribe from visibility events, clear queue, clear timers. */
    dispose(): void;
}
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
export declare function createDomUpdateGate(config: DomUpdateGateConfig): DomUpdateGate;
