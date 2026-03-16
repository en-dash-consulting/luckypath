/**
 * Preact hook for DOM performance monitoring in tree components.
 *
 * Provides real-time DOM node counts, render timings, and before/after
 * comparison data. Starts the monitor on mount, cleans up on unmount,
 * and triggers re-renders only when the snapshot changes.
 *
 * @see ../performance/dom-performance-monitor.ts — standalone monitoring module
 */
import type { RefObject } from "preact";
import type { DOMNodeSnapshot, RenderTiming, UpdateComparison, PerformanceSummary } from "../performance/dom-performance-monitor.js";
export interface UseDOMPerformanceMonitorOptions {
    /** Polling interval in milliseconds (default: 2000). */
    intervalMs?: number;
    /** Maximum snapshots to retain (default: 120). */
    maxSnapshots?: number;
    /** Whether to start monitoring immediately (default: true). */
    enabled?: boolean;
}
export interface UseDOMPerformanceMonitorResult {
    /** Latest DOM performance snapshot, or null if not yet available. */
    snapshot: DOMNodeSnapshot | null;
    /** Snapshot history for trend analysis (readonly). */
    history: readonly DOMNodeSnapshot[];
    /** Recorded render timings (readonly). */
    timings: readonly RenderTiming[];
    /** Recorded update comparisons with before/after data (readonly). */
    comparisons: readonly UpdateComparison[];
    /** Aggregate performance summary. */
    summary: PerformanceSummary;
    /**
     * Record a render timing manually.
     *
     * Use when wrapping a render operation outside the automatic polling:
     * ```ts
     * const start = performance.now();
     * doRender();
     * perf.recordRender("my-render", performance.now() - start, domCount);
     * ```
     */
    recordRender: (label: string, durationMs: number, nodeCountAfter: number) => void;
    /**
     * Record a before/after update comparison manually.
     */
    recordUpdate: (label: string, durationMs: number, nodesBefore: number, nodesAfter: number, memoryBefore?: number, memoryAfter?: number) => void;
    /**
     * Measure an operation end-to-end with automatic DOM/memory capture.
     *
     * Wraps a synchronous function, recording DOM node count and memory
     * before and after execution.
     */
    measureOperation: <T>(label: string, fn: () => T) => T;
}
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
export declare function useDOMPerformanceMonitor(containerRef: RefObject<Element>, options?: UseDOMPerformanceMonitorOptions): UseDOMPerformanceMonitorResult;
