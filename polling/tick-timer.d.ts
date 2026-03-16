/**
 * Shared tick timer service for elapsed time updates.
 *
 * Manages a single setInterval that fires every second and distributes
 * tick events to all subscribed components. This eliminates the need for
 * individual per-component timers, reducing CPU overhead when many task
 * cards are visible simultaneously.
 *
 * The timer automatically starts when the first subscriber joins and
 * stops when the last subscriber leaves, ensuring zero overhead when
 * no components need elapsed time updates.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useTick`) is provided separately.
 */
/** Callback invoked on each tick with the current timestamp (Date.now()). */
export type TickListener = (now: number) => void;
/** Read-only view of the tick timer's current state. */
export interface TickTimerState {
    /** Number of active subscribers. */
    readonly subscriberCount: number;
    /** Whether the shared interval is currently running. */
    readonly running: boolean;
}
/**
 * Subscribe to 1-second tick events.
 *
 * The listener receives the current `Date.now()` timestamp on each tick.
 * The shared interval starts automatically when the first subscriber joins.
 *
 * Returns an unsubscribe function. When the last subscriber unsubscribes,
 * the shared interval is stopped.
 *
 * @param listener - Callback invoked on each tick.
 * @returns Unsubscribe function (safe to call multiple times).
 */
export declare function onTick(listener: TickListener): () => void;
/**
 * Suspend the tick timer.
 *
 * Clears the shared interval but keeps all listeners registered. The timer
 * can be resumed later with `resumeTickTimer()`. Used by the tick visibility
 * gate to pause elapsed time updates when the browser tab is hidden.
 *
 * No-op if the timer is already stopped.
 */
export declare function suspendTickTimer(): void;
/**
 * Resume a suspended tick timer.
 *
 * Restarts the shared interval if listeners exist. Fires an **immediate tick**
 * before restarting the interval so that elapsed time displays catch up to
 * the current wall-clock time without waiting up to 1 second for the next
 * regular tick.
 *
 * Used by the tick visibility gate to resume elapsed time updates when the
 * browser tab becomes visible again.
 *
 * No-op if the timer is already running or no listeners are registered.
 */
export declare function resumeTickTimer(): void;
/**
 * Get the current state of the tick timer.
 */
export declare function getTickTimerState(): TickTimerState;
/**
 * Reset all module state (for testing). Clears all listeners and
 * stops the interval.
 */
export declare function resetTickTimer(): void;
