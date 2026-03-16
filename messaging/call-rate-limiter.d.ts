/**
 * Call-level rate limiter with queue deduplication.
 *
 * Enforces a minimum interval between execution starts. Calls arriving
 * within the cooldown window are queued (deduplicated: only one pending
 * call exists at a time — subsequent callers share its promise).
 *
 * Designed to sit in front of `createRequestDedup`: the rate limiter
 * controls *when* calls happen, while the dedup handles concurrent
 * in-flight request sharing.
 *
 * Standalone module with zero framework dependencies.
 * Preact integration lives in the consumer (views/prd.ts).
 */
export interface CallRateLimiterConfig {
    /**
     * Minimum milliseconds between execution starts.
     * Default: 500 (allows max 2 calls per second).
     */
    minIntervalMs?: number;
}
/** A rate-limited, queue-deduplicated wrapper around an async function. */
export interface CallRateLimiter<T = void> {
    /**
     * Schedule execution. If within the rate limit cooldown, the call is
     * queued. Multiple callers hitting the queue share one promise (dedup).
     */
    execute(): Promise<T>;
    /** Whether the underlying function is currently executing. */
    isExecuting(): boolean;
    /** Whether a call is queued waiting for the rate limit cooldown. */
    isPending(): boolean;
    /** Clean up timers and pending state. Safe to call multiple times. */
    dispose(): void;
}
/**
 * Create a rate-limited, queue-deduplicated wrapper for an async function.
 *
 * Usage:
 * ```ts
 * const rateLimited = createCallRateLimiter(() => fetchData(), { minIntervalMs: 500 });
 *
 * rateLimited.execute(); // executes immediately (first call)
 * rateLimited.execute(); // queued — shares the same pending promise
 * rateLimited.execute(); // deduped to the already-queued call
 *
 * // After 500ms the queued call fires.
 * ```
 */
export declare function createCallRateLimiter<T = void>(fn: () => Promise<T>, config?: CallRateLimiterConfig): CallRateLimiter<T>;
