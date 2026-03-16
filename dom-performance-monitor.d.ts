/**
 * DOM performance monitoring for tree components.
 *
 * Tracks active DOM node counts, render/update timing, and memory usage
 * for tree operations. Provides before/after comparison data for measuring
 * the impact of DOM optimizations (progressive loading, node culling, etc.).
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useDOMPerformanceMonitor`) is provided separately.
 *
 * @see ./memory-monitor.ts — complementary heap-level memory monitoring
 * @see ./components/prd-tree/node-culler.ts — off-screen culling integration
 * @see ./components/prd-tree/progressive-loader.ts — progressive load integration
 */
/** DOM node count snapshot at a point in time. */
export interface DOMNodeSnapshot {
    /** Total DOM node count within the observed container. */
    totalNodes: number;
    /** Number of element nodes (excludes text, comment nodes). */
    elementNodes: number;
    /** Number of tree item elements (role="treeitem"). */
    treeItemCount: number;
    /** Maximum nesting depth within the container. */
    maxDepth: number;
    /** ISO timestamp of when this snapshot was taken. */
    timestamp: string;
}
/** Timing data for a single render or update operation. */
export interface RenderTiming {
    /** Label identifying the operation (e.g. "initial-render", "filter-change"). */
    label: string;
    /** Duration in milliseconds. */
    durationMs: number;
    /** DOM node count after the operation completed. */
    nodeCountAfter: number;
    /** ISO timestamp of when the operation was measured. */
    timestamp: string;
}
/** Before/after comparison for a tree operation. */
export interface UpdateComparison {
    /** Label identifying the operation. */
    label: string;
    /** DOM node count before the operation. */
    nodesBefore: number;
    /** DOM node count after the operation. */
    nodesAfter: number;
    /** Change in DOM node count (positive = growth, negative = reduction). */
    nodeDelta: number;
    /** Duration of the operation in milliseconds. */
    durationMs: number;
    /** Memory usage before (bytes, -1 if unavailable). */
    memoryBefore: number;
    /** Memory usage after (bytes, -1 if unavailable). */
    memoryAfter: number;
    /** Change in memory usage (bytes, -1 if unavailable). */
    memoryDelta: number;
    /** ISO timestamp of the operation. */
    timestamp: string;
}
/** Aggregate performance summary computed from collected metrics. */
export interface PerformanceSummary {
    /** Average render time across all recorded timings. */
    avgRenderMs: number;
    /** Peak render time across all recorded timings. */
    peakRenderMs: number;
    /** Average DOM node count across snapshots. */
    avgNodeCount: number;
    /** Peak DOM node count across snapshots. */
    peakNodeCount: number;
    /** Total number of recorded render timings. */
    renderCount: number;
    /** Total number of recorded update comparisons. */
    updateCount: number;
    /** Total number of DOM snapshots taken. */
    snapshotCount: number;
}
/** Configuration for the DOM performance monitor. */
export interface DOMPerformanceConfig {
    /** Polling interval in milliseconds for automatic snapshots (default: 2000). */
    intervalMs: number;
    /** Maximum number of snapshots to retain in history (default: 120). */
    maxSnapshots: number;
    /** Maximum number of render timings to retain (default: 200). */
    maxTimings: number;
    /** Maximum number of update comparisons to retain (default: 100). */
    maxComparisons: number;
}
/** Callback invoked when a new DOM snapshot is taken. */
export type DOMSnapshotHandler = (snapshot: DOMNodeSnapshot) => void;
/**
 * Count all DOM nodes within a container element.
 *
 * Walks the subtree using a non-recursive stack to avoid
 * stack overflow on very deep trees. Returns counts for
 * total nodes, element-only nodes, and tree items.
 */
export declare function countDOMNodes(container: Element): DOMNodeSnapshot;
/** Read current JS heap usage in bytes, or -1 if unavailable. */
export declare function readHeapUsage(): number;
/** Format a duration in milliseconds (e.g. "12.3 ms"). */
export declare function formatDuration(ms: number): string;
/** Format a node count with thousands separator. */
export declare function formatNodeCount(count: number): string;
/** Format a delta with sign prefix (e.g. "+42" or "−18"). */
export declare function formatDelta(delta: number): string;
/**
 * Record a render timing measurement.
 *
 * Call this after a render completes with the operation label,
 * elapsed time, and current DOM node count.
 */
export declare function recordRender(label: string, durationMs: number, nodeCountAfter: number): void;
/**
 * Record a before/after update comparison.
 *
 * Call this after a tree operation completes to capture the
 * DOM node delta, timing, and memory change.
 */
export declare function recordUpdate(label: string, durationMs: number, nodesBefore: number, nodesAfter: number, memoryBefore?: number, memoryAfter?: number): void;
/**
 * Measure a tree operation end-to-end.
 *
 * Captures DOM node count and memory before/after executing `fn`,
 * records the comparison, and returns the function's result.
 *
 * The container must be set via `startDOMPerformanceMonitor` or
 * `setObservedContainer` before calling this function.
 */
export declare function measureOperation<T>(label: string, fn: () => T): T;
/** Take a DOM performance snapshot of the observed container. */
export declare function takeDOMSnapshot(): DOMNodeSnapshot | null;
/** Compute an aggregate performance summary from collected metrics. */
export declare function computeSummary(): PerformanceSummary;
/** Subscribe to every new DOM snapshot. Returns an unsubscribe function. */
export declare function onDOMSnapshot(listener: DOMSnapshotHandler): () => void;
/** Set the container element to observe for DOM metrics. */
export declare function setObservedContainer(container: Element | null): void;
/**
 * Start the DOM performance monitor.
 *
 * Begins periodic DOM node counting on the specified container.
 * Safe to call multiple times — restarts with new config if already running.
 */
export declare function startDOMPerformanceMonitor(container: Element, overrides?: Partial<DOMPerformanceConfig>): void;
/** Stop the DOM performance monitor and clean up polling. */
export declare function stopDOMPerformanceMonitor(): void;
/** Get the most recent DOM snapshot, or null if not yet taken. */
export declare function getLatestDOMSnapshot(): DOMNodeSnapshot | null;
/** Get the DOM snapshot history (bounded ring buffer). */
export declare function getDOMSnapshotHistory(): readonly DOMNodeSnapshot[];
/** Get all recorded render timings (bounded ring buffer). */
export declare function getRenderTimings(): readonly RenderTiming[];
/** Get all recorded update comparisons (bounded ring buffer). */
export declare function getUpdateComparisons(): readonly UpdateComparison[];
/** Get the currently observed container element, or null. */
export declare function getObservedContainer(): Element | null;
/** Reset all module state (for testing). */
export declare function resetDOMPerformanceMonitor(): void;
