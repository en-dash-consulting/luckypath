/**
 * Fetch pipeline — composed request dedup + call rate limiter.
 *
 * Wraps an async function with two layers of protection:
 *   1. **Rate limiter** — caps execution frequency (e.g. max 2 calls/sec).
 *   2. **Request dedup** — concurrent callers share one in-flight request.
 *
 * This module captures the pattern used by `usePRDData` for both PRD and
 * task-usage fetching, reducing the coupling surface from two individual
 * messaging imports to one composed import.
 *
 * Standalone module with zero framework dependencies.
 */
import { createCallRateLimiter } from "./call-rate-limiter.js";
import { createRequestDedup } from "./request-dedup.js";
// ─── Factory ─────────────────────────────────────────────────────────────────
/**
 * Create a fetch pipeline that rate-limits and deduplicates an async function.
 *
 * Usage:
 * ```ts
 * const fetchPRD = createFetchPipeline(
 *   async () => {
 *     const res = await fetch("/data/prd.json");
 *     return res.json();
 *   },
 *   { minIntervalMs: 500 },
 * );
 *
 * // All three calls resolve to the same result — one actual fetch:
 * fetchPRD.execute();
 * fetchPRD.execute();
 * fetchPRD.execute();
 * ```
 */
export function createFetchPipeline(fn, config) {
    const dedup = createRequestDedup(fn);
    const rateLimiter = createCallRateLimiter(() => dedup.execute(), { minIntervalMs: config?.minIntervalMs });
    return {
        execute() {
            return rateLimiter.execute();
        },
        isExecuting() {
            return rateLimiter.isExecuting();
        },
        isPending() {
            return rateLimiter.isPending();
        },
        isInFlight() {
            return dedup.isInFlight();
        },
        dispose() {
            rateLimiter.dispose();
            dedup.dispose();
        },
    };
}
//# sourceMappingURL=fetch-pipeline.js.map