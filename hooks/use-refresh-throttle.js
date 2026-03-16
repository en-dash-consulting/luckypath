/**
 * Preact hook for memory-aware refresh throttling.
 *
 * Provides reactive queue state to components so they can display
 * queue progress, memory-adjusted intervals, and estimated completion
 * times. Starts the refresh throttle on mount and cleans up on unmount.
 */
import { useState, useEffect, useCallback } from "preact/hooks";
import { startRefreshThrottle, stopRefreshThrottle, onQueueChange, getQueueState, enqueueRefresh, getRecommendedInterval, } from "../performance/refresh-throttle.js";
/**
 * Hook that provides memory-aware refresh throttling state.
 *
 * Usage:
 * ```tsx
 * const { queueLength, paused, estimatedCompletionMs, enqueue } = useRefreshThrottle();
 * ```
 */
export function useRefreshThrottle(options = {}) {
    const { baseIntervalMs = 5000, avgRefreshMs = 800, enabled = true } = options;
    const [queueState, setQueueState] = useState(getQueueState);
    useEffect(() => {
        if (!enabled)
            return;
        startRefreshThrottle({ baseIntervalMs, avgRefreshMs });
        const unsubscribe = onQueueChange((newState) => {
            setQueueState(newState);
        });
        // Sync in case state changed between render and effect.
        setQueueState(getQueueState());
        return () => {
            unsubscribe();
            stopRefreshThrottle();
        };
    }, [enabled, baseIntervalMs, avgRefreshMs]);
    const enqueue = useCallback((key, execute, priority) => enqueueRefresh(key, execute, priority), []);
    const getInterval = useCallback((baseMs) => getRecommendedInterval(baseMs), 
    // Re-create when state changes so the closure captures fresh module state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queueState]);
    return {
        state: queueState,
        queueLength: queueState.queueLength,
        isProcessing: queueState.activeCount > 0,
        paused: queueState.paused,
        memoryLevel: queueState.memoryLevel,
        recommendedIntervalMs: queueState.recommendedIntervalMs,
        estimatedCompletionMs: queueState.estimatedCompletionMs,
        enqueue,
        getInterval,
    };
}
//# sourceMappingURL=use-refresh-throttle.js.map