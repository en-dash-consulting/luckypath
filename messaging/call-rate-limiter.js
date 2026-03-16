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
/** Default minimum interval — 500ms ≈ 2 calls/sec. */
const DEFAULT_MIN_INTERVAL_MS = 500;
// ─── Factory ─────────────────────────────────────────────────────────────────
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
export function createCallRateLimiter(fn, config) {
    const minIntervalMs = config?.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
    let lastExecutionStartMs = 0;
    let executing = false;
    let pendingTimer = null;
    let pendingResolve = null;
    let pendingReject = null;
    let pendingPromise = null;
    let disposed = false;
    function executeNow() {
        lastExecutionStartMs = Date.now();
        executing = true;
        return fn().then((value) => {
            executing = false;
            return value;
        }, (err) => {
            executing = false;
            throw err;
        });
    }
    function execute() {
        if (disposed) {
            return Promise.reject(new Error("CallRateLimiter has been disposed"));
        }
        const now = Date.now();
        const elapsed = now - lastExecutionStartMs;
        if (elapsed >= minIntervalMs) {
            // Enough time since last execution start — fire immediately.
            return executeNow();
        }
        // Within rate limit cooldown — queue (deduplicated).
        if (pendingPromise !== null) {
            // Already queued — return the existing promise (dedup).
            return pendingPromise;
        }
        // Create a new queued execution.
        pendingPromise = new Promise((resolve, reject) => {
            pendingResolve = resolve;
            pendingReject = reject;
        });
        const delay = minIntervalMs - elapsed;
        pendingTimer = setTimeout(() => {
            const resolve = pendingResolve;
            const reject = pendingReject;
            pendingTimer = null;
            pendingResolve = null;
            pendingReject = null;
            pendingPromise = null;
            executeNow().then(resolve, reject);
        }, delay);
        return pendingPromise;
    }
    function isExecuting() {
        return executing;
    }
    function isPending() {
        return pendingPromise !== null;
    }
    function dispose() {
        disposed = true;
        if (pendingTimer !== null) {
            clearTimeout(pendingTimer);
            pendingTimer = null;
        }
        pendingResolve = null;
        pendingReject = null;
        pendingPromise = null;
        executing = false;
    }
    return { execute, isExecuting, isPending, dispose };
}
//# sourceMappingURL=call-rate-limiter.js.map