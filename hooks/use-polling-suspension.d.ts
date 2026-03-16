/**
 * Preact hook for tracking polling suspension state.
 *
 * Provides reactive state about whether polling is globally suspended
 * due to memory pressure. Components use this to display suspension
 * indicators and offer manual refresh options when auto-refresh is
 * disabled.
 */
export interface UsePollingSuspensionResult {
    /** Whether polling is currently globally suspended. */
    isSuspended: boolean;
    /** Number of sources currently in suspended state. */
    suspendedCount: number;
    /** Total number of registered polling sources. */
    sourceCount: number;
    /** Current generation counter (increments on suspend/resume cycles). */
    generation: number;
}
/**
 * Hook that provides real-time polling suspension state.
 *
 * Subscribes to the centralized polling-state manager and re-renders
 * when suspension state changes. Returns `isSuspended: false` when
 * no sources are registered or when polling is running normally.
 *
 * Usage:
 * ```tsx
 * const { isSuspended, suspendedCount } = usePollingSuspension();
 * if (isSuspended) return h(PollingSuspensionIndicator, { ... });
 * ```
 */
export declare function usePollingSuspension(): UsePollingSuspensionResult;
