/**
 * Preact hook for DOM performance monitoring in tree components.
 *
 * Provides real-time DOM node counts, render timings, and before/after
 * comparison data. Starts the monitor on mount, cleans up on unmount,
 * and triggers re-renders only when the snapshot changes.
 *
 * @see ../performance/dom-performance-monitor.ts — standalone monitoring module
 */
import { useState, useEffect, useCallback } from "preact/hooks";
import { startDOMPerformanceMonitor, stopDOMPerformanceMonitor, onDOMSnapshot, getLatestDOMSnapshot, getDOMSnapshotHistory, getRenderTimings, getUpdateComparisons, recordRender, recordUpdate, measureOperation, computeSummary, } from "../performance/dom-performance-monitor.js";
/**
 * Hook that provides real-time DOM performance monitoring for tree components.
 *
 * Usage:
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const perf = useDOMPerformanceMonitor(containerRef);
 *
 * // Access metrics
 * perf.snapshot?.totalNodes
 * perf.summary.avgRenderMs
 * perf.comparisons[0]?.nodeDelta
 * ```
 */
export function useDOMPerformanceMonitor(containerRef, options = {}) {
    const { intervalMs = 2000, maxSnapshots, enabled = true } = options;
    const [snapshot, setSnapshot] = useState(getLatestDOMSnapshot);
    // Use a counter to force re-reads of ring buffers on snapshot change.
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!enabled || !containerRef.current)
            return;
        startDOMPerformanceMonitor(containerRef.current, {
            intervalMs,
            maxSnapshots,
        });
        const unsubscribe = onDOMSnapshot((snap) => {
            setSnapshot(snap);
            setTick((t) => t + 1);
        });
        return () => {
            unsubscribe();
            stopDOMPerformanceMonitor();
        };
    }, [enabled, intervalMs, maxSnapshots, containerRef.current]);
    const wrappedRecordRender = useCallback((label, durationMs, nodeCountAfter) => {
        recordRender(label, durationMs, nodeCountAfter);
        setTick((t) => t + 1);
    }, []);
    const wrappedRecordUpdate = useCallback((label, durationMs, nodesBefore, nodesAfter, memoryBefore, memoryAfter) => {
        recordUpdate(label, durationMs, nodesBefore, nodesAfter, memoryBefore, memoryAfter);
        setTick((t) => t + 1);
    }, []);
    const wrappedMeasure = useCallback((label, fn) => {
        const result = measureOperation(label, fn);
        setTick((t) => t + 1);
        return result;
    }, []);
    return {
        snapshot,
        history: getDOMSnapshotHistory(),
        timings: getRenderTimings(),
        comparisons: getUpdateComparisons(),
        summary: computeSummary(),
        recordRender: wrappedRecordRender,
        recordUpdate: wrappedRecordUpdate,
        measureOperation: wrappedMeasure,
    };
}
//# sourceMappingURL=use-dom-performance-monitor.js.map