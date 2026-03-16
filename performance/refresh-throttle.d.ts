/**
 * Memory-aware refresh throttling and queuing.
 *
 * Provides intelligent refresh scheduling that considers current memory usage
 * and queues or delays refresh operations when memory pressure is high.
 *
 * Behaviour by memory level:
 *
 *   normal   → Full-speed refresh, max concurrency (3 parallel fetches).
 *   elevated → 2× interval, reduced concurrency (2 parallel fetches).
 *   warning  → 4× interval, serial execution only (1 at a time).
 *   critical → All refreshes paused, queue frozen until memory subsides.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useRefreshThrottle`) is provided separately.
 */
import type { MemoryLevel } from "./memory-monitor.js";
/** Priority levels for refresh operations — higher number = higher priority. */
export type RefreshPriority = "low" | "normal" | "high";
/** A single queued refresh operation. */
export interface QueuedRefresh {
    /** Unique key to deduplicate same-resource refreshes. */
    readonly key: string;
    /** The async work to perform. */
    readonly execute: () => Promise<void>;
    /** Priority determines dequeue order (high first). */
    readonly priority: RefreshPriority;
    /** ISO timestamp when the request entered the queue. */
    readonly enqueuedAt: string;
}
/** Read-only snapshot of the current queue state. */
export interface RefreshQueueState {
    /** Number of items waiting in the queue. */
    readonly queueLength: number;
    /** Number of refresh operations currently in flight. */
    readonly activeCount: number;
    /** Whether the queue is paused due to memory pressure. */
    readonly paused: boolean;
    /** Current memory level informing throttle decisions. */
    readonly memoryLevel: MemoryLevel;
    /** Recommended polling interval in milliseconds for the current level. */
    readonly recommendedIntervalMs: number;
    /** Maximum concurrent refresh operations allowed at the current level. */
    readonly maxConcurrency: number;
    /** Estimated milliseconds until the queue is fully drained (-1 if unknown). */
    readonly estimatedCompletionMs: number;
    /** Total refreshes completed since the throttle was started. */
    readonly completedCount: number;
}
/** Callback invoked when the queue state changes. */
export type QueueChangeHandler = (state: RefreshQueueState) => void;
/** Configuration for the refresh throttle. */
export interface RefreshThrottleConfig {
    /** Base polling interval in milliseconds (default: 5000). */
    baseIntervalMs: number;
    /** Average time a single refresh takes, for ETA estimation (default: 800ms). */
    avgRefreshMs: number;
    /** Called when the queue state changes. */
    onChange: QueueChangeHandler | null;
}
/**
 * Start the refresh throttle. Subscribes to the memory monitor and
 * immediately evaluates the current memory level.
 *
 * Safe to call multiple times — restarts with new config.
 */
export declare function startRefreshThrottle(overrides?: Partial<RefreshThrottleConfig>): void;
/** Stop the refresh throttle and clean up subscriptions. */
export declare function stopRefreshThrottle(): void;
/**
 * Enqueue a refresh operation. If an entry with the same key already exists
 * in the queue, it is replaced (deduplication). The operation will be
 * executed when concurrency allows and memory pressure permits.
 *
 * Returns `true` if the item was queued, `false` if executed immediately.
 */
export declare function enqueueRefresh(key: string, execute: () => Promise<void>, priority?: RefreshPriority): boolean;
/**
 * Get the recommended polling interval for the current memory level.
 * Callers can use this to dynamically adjust their setInterval timing.
 */
export declare function getRecommendedInterval(baseIntervalMs?: number): number;
/** Subscribe to queue state changes. Returns an unsubscribe function. */
export declare function onQueueChange(listener: (state: RefreshQueueState) => void): () => void;
/** Get the current queue state. */
export declare function getQueueState(): RefreshQueueState;
/** Get the current memory level being used for throttle decisions. */
export declare function getThrottleLevel(): MemoryLevel;
/** Reset all module state (for testing). */
export declare function resetRefreshThrottle(): void;
