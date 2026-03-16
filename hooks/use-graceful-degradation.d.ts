/**
 * Preact hook for graceful degradation under memory pressure.
 *
 * Provides reactive degradation state to components so they can
 * conditionally disable resource-intensive features. Starts the
 * degradation manager on mount and cleans up on unmount.
 */
import type { MemoryLevel, DegradableFeature } from "../performance/index.js";
export interface UseGracefulDegradationResult {
    /** Current degradation tier (mirrors memory level). */
    tier: MemoryLevel;
    /** Whether any degradation is active. */
    isDegraded: boolean;
    /** Human-readable summary of disabled features. */
    summary: string;
    /** Set of currently disabled features. */
    disabledFeatures: ReadonlySet<DegradableFeature>;
    /** Check whether a specific feature is disabled. */
    isDisabled: (feature: DegradableFeature) => boolean;
}
/**
 * Hook that provides real-time graceful degradation state.
 *
 * Usage:
 * ```tsx
 * const { isDegraded, isDisabled, summary } = useGracefulDegradation();
 * if (isDisabled("graphRendering")) return h("p", null, "Graph disabled");
 * ```
 */
export declare function useGracefulDegradation(): UseGracefulDegradationResult;
