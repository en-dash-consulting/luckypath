/**
 * Preact hook for memory-aware refresh throttling.
 *
 * Provides reactive queue state to components so they can display
 * queue progress, memory-adjusted intervals, and estimated completion
 * times. Starts the refresh throttle on mount and cleans up on unmount.
 */
import type { MemoryLevel, RefreshQueueState, RefreshPriority } from "../performance/index.js";
export interface UseRefreshThrottleOptions {
    /** Base polling interval in milliseconds (default: 5000). */
    baseIntervalMs?: number;
    /** Average time a single refresh takes, for ETA estimation (default: 800ms). */
    avgRefreshMs?: number;
    /** Whether to start the throttle immediately (default: true). */
    enabled?: boolean;
}
export interface UseRefreshThrottleResult {
    /** Current queue state snapshot. */
    state: RefreshQueueState;
    /** Number of items waiting in the queue. */
    queueLength: number;
    /** Whether any refresh operations are active. */
    isProcessing: boolean;
    /** Whether the queue is paused due to memory pressure. */
    paused: boolean;
    /** Current memory level informing throttle decisions. */
    memoryLevel: MemoryLevel;
    /** Recommended polling interval for the current memory level. */
    recommendedIntervalMs: number;
    /** Estimated milliseconds until the queue is fully drained (-1 if unknown). */
    estimatedCompletionMs: number;
    /** Enqueue a refresh operation. Returns true if queued. */
    enqueue: (key: string, execute: () => Promise<void>, priority?: RefreshPriority) => boolean;
    /** Get the recommended interval for a given base interval. */
    getInterval: (baseMs?: number) => number;
}
/**
 * Hook that provides memory-aware refresh throttling state.
 *
 * Usage:
 * ```tsx
 * const { queueLength, paused, estimatedCompletionMs, enqueue } = useRefreshThrottle();
 * ```
 */
export declare function useRefreshThrottle(options?: UseRefreshThrottleOptions): UseRefreshThrottleResult;
