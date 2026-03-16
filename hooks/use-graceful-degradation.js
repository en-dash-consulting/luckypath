/**
 * Preact hook for graceful degradation under memory pressure.
 *
 * Provides reactive degradation state to components so they can
 * conditionally disable resource-intensive features. Starts the
 * degradation manager on mount and cleans up on unmount.
 */
import { useState, useEffect, useCallback } from "preact/hooks";
import { startDegradation, stopDegradation, onDegradationChange, getDegradationState, isFeatureDisabled, } from "../performance/graceful-degradation.js";
/**
 * Hook that provides real-time graceful degradation state.
 *
 * Usage:
 * ```tsx
 * const { isDegraded, isDisabled, summary } = useGracefulDegradation();
 * if (isDisabled("graphRendering")) return h("p", null, "Graph disabled");
 * ```
 */
export function useGracefulDegradation() {
    const [state, setState] = useState(getDegradationState);
    useEffect(() => {
        startDegradation();
        const unsubscribe = onDegradationChange((newState) => {
            setState(newState);
        });
        // Sync with current state in case it changed between render and effect.
        setState(getDegradationState());
        return () => {
            unsubscribe();
            stopDegradation();
        };
    }, []);
    const isDisabled = useCallback((feature) => isFeatureDisabled(feature), 
    // Re-create when state changes so the closure captures fresh module state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]);
    return {
        tier: state.tier,
        isDegraded: state.isDegraded,
        summary: state.summary,
        disabledFeatures: state.disabledFeatures,
        isDisabled,
    };
}
//# sourceMappingURL=use-graceful-degradation.js.map