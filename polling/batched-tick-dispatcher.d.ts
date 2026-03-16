/**
 * Batched tick dispatcher for elapsed time state updates.
 *
 * Sits between the shared tick timer and individual `useTick` hook instances.
 * Instead of N separate `onTick` listeners each calling `setState` independently,
 * this dispatcher:
 *
 *   1. Subscribes to the tick timer **once** (regardless of how many components
 *      display elapsed time).
 *   2. On each tick, computes all new values synchronously (read-only phase).
 *   3. Filters out unchanged values via equality check (skip phase).
 *   4. Schedules a single `requestAnimationFrame` to apply all state updates
 *      in one synchronous block (write phase).
 *
 * This two-phase (compute → RAF write) approach ensures:
 *
 *   - All `setState` calls occur within the same synchronous execution context
 *     inside the RAF callback, allowing Preact to batch them into a single
 *     reconciliation pass.
 *   - State updates are aligned with the browser's paint cycle, eliminating
 *     wasted intermediate renders.
 *   - With 20+ visible task cards, the re-render count drops from N individual
 *     renders to one batched reconciliation per tick.
 *
 * Auto-lifecycle: subscribes to the tick timer when the first component
 * registers, unsubscribes when the last one unregisters. Zero overhead
 * when no elapsed time displays are mounted.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact integration lives in the `useTick` hook.
 */
/** Function that computes the current formatted elapsed time string. */
type ComputeFn = () => string;
/** Preact state setter for the display value. */
type SetDisplayFn = (value: string) => void;
/** Mutable ref object (matches Preact's useRef shape). */
interface MutableRef<T> {
    current: T;
}
/** Read-only snapshot of the dispatcher's current state (for testing/monitoring). */
export interface BatchedTickDispatcherState {
    /** Number of active registrations. */
    readonly registrationCount: number;
    /** Whether a RAF callback is currently pending. */
    readonly hasPendingRAF: boolean;
    /** Number of state updates queued for the next RAF. */
    readonly pendingUpdateCount: number;
}
/**
 * Register an elapsed time updater with the batched dispatcher.
 *
 * The dispatcher will call `compute()` on each tick, compare the result
 * against `lastValueRef.current`, and — if changed — schedule a batched
 * RAF update that calls `setDisplay(newValue)`.
 *
 * The `lastValueRef` is shared with the calling hook so that both the
 * dispatcher and the hook's immediate-update effect (for `startedAt`
 * prop changes) stay in sync.
 *
 * Returns an unregister function. When the last registration is removed,
 * the dispatcher unsubscribes from the tick timer automatically.
 *
 * @param compute      - Pure function returning the current formatted string.
 * @param setDisplay   - Preact state setter for the display value.
 * @param lastValueRef - Mutable ref tracking the last emitted value.
 * @returns Unregister function (safe to call multiple times).
 */
export declare function registerTickUpdater(compute: ComputeFn, setDisplay: SetDisplayFn, lastValueRef: MutableRef<string>): () => void;
/**
 * Get the current state of the batched tick dispatcher (for testing/monitoring).
 */
export declare function getBatchedTickDispatcherState(): BatchedTickDispatcherState;
/**
 * Force-flush all pending RAF updates synchronously.
 * Cancels any pending RAF. No-op if nothing is pending.
 */
export declare function flushBatchedTicks(): void;
/**
 * Reset all dispatcher state (for testing). Unsubscribes from the tick
 * timer, cancels pending RAF, and clears all registrations.
 */
export declare function resetBatchedTickDispatcher(): void;
export {};
