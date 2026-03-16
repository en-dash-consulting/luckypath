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
 * @see ./components/progressive-loader.ts — progressive load integration
 */
import { registerPollingSource, } from "../polling/index.js";
// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_INTERVAL_MS = 2000;
const DEFAULT_MAX_SNAPSHOTS = 120;
const DEFAULT_MAX_TIMINGS = 200;
const DEFAULT_MAX_COMPARISONS = 100;
/** Key used to register with the centralized polling state manager. */
const POLLING_STATE_KEY = "dom-performance-monitor";
// ─── Module state ────────────────────────────────────────────────────────────
let config = {
    intervalMs: DEFAULT_INTERVAL_MS,
    maxSnapshots: DEFAULT_MAX_SNAPSHOTS,
    maxTimings: DEFAULT_MAX_TIMINGS,
    maxComparisons: DEFAULT_MAX_COMPARISONS,
};
let pollTimer = null;
let stateUnsub = null;
let observedContainer = null;
let latestSnapshot = null;
let snapshotHistory = [];
let renderTimings = [];
let updateComparisons = [];
let snapshotListeners = [];
// ─── DOM counting ────────────────────────────────────────────────────────────
/**
 * Count all DOM nodes within a container element.
 *
 * Walks the subtree using a non-recursive stack to avoid
 * stack overflow on very deep trees. Returns counts for
 * total nodes, element-only nodes, and tree items.
 */
export function countDOMNodes(container) {
    let totalNodes = 0;
    let elementNodes = 0;
    let treeItemCount = 0;
    let maxDepth = 0;
    // Non-recursive DFS using an explicit stack: [node, depth]
    const stack = [[container, 0]];
    while (stack.length > 0) {
        const [node, depth] = stack.pop();
        totalNodes++;
        if (depth > maxDepth) {
            maxDepth = depth;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            elementNodes++;
            const el = node;
            if (el.getAttribute("role") === "treeitem") {
                treeItemCount++;
            }
        }
        // Push children in reverse so the first child is processed first
        const children = node.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push([children[i], depth + 1]);
        }
    }
    return {
        totalNodes,
        elementNodes,
        treeItemCount,
        maxDepth,
        timestamp: new Date().toISOString(),
    };
}
// ─── Memory reading ──────────────────────────────────────────────────────────
/** Read current JS heap usage in bytes, or -1 if unavailable. */
export function readHeapUsage() {
    const perf = performance;
    if (perf.memory && typeof perf.memory.usedJSHeapSize === "number") {
        return perf.memory.usedJSHeapSize;
    }
    return -1;
}
// ─── Formatting ──────────────────────────────────────────────────────────────
/** Format a duration in milliseconds (e.g. "12.3 ms"). */
export function formatDuration(ms) {
    if (ms < 0)
        return "N/A";
    if (ms < 1)
        return `${(ms * 1000).toFixed(0)} µs`;
    if (ms < 1000)
        return `${ms.toFixed(1)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}
/** Format a node count with thousands separator. */
export function formatNodeCount(count) {
    if (count < 0)
        return "N/A";
    return count.toLocaleString("en-US");
}
/** Format a delta with sign prefix (e.g. "+42" or "−18"). */
export function formatDelta(delta) {
    if (delta > 0)
        return `+${delta.toLocaleString("en-US")}`;
    if (delta < 0)
        return `−${Math.abs(delta).toLocaleString("en-US")}`;
    return "0";
}
// ─── Recording operations ────────────────────────────────────────────────────
/**
 * Record a render timing measurement.
 *
 * Call this after a render completes with the operation label,
 * elapsed time, and current DOM node count.
 */
export function recordRender(label, durationMs, nodeCountAfter) {
    const timing = {
        label,
        durationMs,
        nodeCountAfter,
        timestamp: new Date().toISOString(),
    };
    renderTimings.push(timing);
    if (renderTimings.length > config.maxTimings) {
        renderTimings = renderTimings.slice(-config.maxTimings);
    }
}
/**
 * Record a before/after update comparison.
 *
 * Call this after a tree operation completes to capture the
 * DOM node delta, timing, and memory change.
 */
export function recordUpdate(label, durationMs, nodesBefore, nodesAfter, memoryBefore = -1, memoryAfter = -1) {
    const comparison = {
        label,
        nodesBefore,
        nodesAfter,
        nodeDelta: nodesAfter - nodesBefore,
        durationMs,
        memoryBefore,
        memoryAfter,
        memoryDelta: memoryBefore >= 0 && memoryAfter >= 0
            ? memoryAfter - memoryBefore
            : -1,
        timestamp: new Date().toISOString(),
    };
    updateComparisons.push(comparison);
    if (updateComparisons.length > config.maxComparisons) {
        updateComparisons = updateComparisons.slice(-config.maxComparisons);
    }
}
/**
 * Measure a tree operation end-to-end.
 *
 * Captures DOM node count and memory before/after executing `fn`,
 * records the comparison, and returns the function's result.
 *
 * The container must be set via `startDOMPerformanceMonitor` or
 * `setObservedContainer` before calling this function.
 */
export function measureOperation(label, fn) {
    const container = observedContainer;
    const memBefore = readHeapUsage();
    const nodesBefore = container ? countDOMNodes(container).totalNodes : -1;
    const start = performance.now();
    const result = fn();
    const elapsed = performance.now() - start;
    const nodesAfter = container ? countDOMNodes(container).totalNodes : -1;
    const memAfter = readHeapUsage();
    if (nodesBefore >= 0 && nodesAfter >= 0) {
        recordUpdate(label, elapsed, nodesBefore, nodesAfter, memBefore, memAfter);
    }
    recordRender(label, elapsed, nodesAfter >= 0 ? nodesAfter : 0);
    return result;
}
// ─── Snapshot ────────────────────────────────────────────────────────────────
/** Take a DOM performance snapshot of the observed container. */
export function takeDOMSnapshot() {
    if (!observedContainer)
        return null;
    return countDOMNodes(observedContainer);
}
// ─── Summary ─────────────────────────────────────────────────────────────────
/** Compute an aggregate performance summary from collected metrics. */
export function computeSummary() {
    const timings = renderTimings;
    const snapshots = snapshotHistory;
    let avgRenderMs = 0;
    let peakRenderMs = 0;
    if (timings.length > 0) {
        let sum = 0;
        for (const t of timings) {
            sum += t.durationMs;
            if (t.durationMs > peakRenderMs)
                peakRenderMs = t.durationMs;
        }
        avgRenderMs = sum / timings.length;
    }
    let avgNodeCount = 0;
    let peakNodeCount = 0;
    if (snapshots.length > 0) {
        let sum = 0;
        for (const s of snapshots) {
            sum += s.totalNodes;
            if (s.totalNodes > peakNodeCount)
                peakNodeCount = s.totalNodes;
        }
        avgNodeCount = sum / snapshots.length;
    }
    return {
        avgRenderMs,
        peakRenderMs,
        avgNodeCount,
        peakNodeCount,
        renderCount: timings.length,
        updateCount: updateComparisons.length,
        snapshotCount: snapshots.length,
    };
}
// ─── Monitor lifecycle ───────────────────────────────────────────────────────
/** Subscribe to every new DOM snapshot. Returns an unsubscribe function. */
export function onDOMSnapshot(listener) {
    snapshotListeners.push(listener);
    return () => {
        snapshotListeners = snapshotListeners.filter((l) => l !== listener);
    };
}
function notifyListeners(snapshot) {
    for (const listener of snapshotListeners) {
        listener(snapshot);
    }
}
function poll() {
    const snapshot = takeDOMSnapshot();
    if (!snapshot)
        return;
    latestSnapshot = snapshot;
    snapshotHistory.push(snapshot);
    if (snapshotHistory.length > config.maxSnapshots) {
        snapshotHistory = snapshotHistory.slice(-config.maxSnapshots);
    }
    notifyListeners(snapshot);
}
/** Set the container element to observe for DOM metrics. */
export function setObservedContainer(container) {
    observedContainer = container;
}
/**
 * Start the DOM performance monitor.
 *
 * Begins periodic DOM node counting on the specified container.
 * Safe to call multiple times — restarts with new config if already running.
 */
export function startDOMPerformanceMonitor(container, overrides = {}) {
    stopDOMPerformanceMonitor();
    observedContainer = container;
    config = {
        intervalMs: overrides.intervalMs ?? DEFAULT_INTERVAL_MS,
        maxSnapshots: overrides.maxSnapshots ?? DEFAULT_MAX_SNAPSHOTS,
        maxTimings: overrides.maxTimings ?? DEFAULT_MAX_TIMINGS,
        maxComparisons: overrides.maxComparisons ?? DEFAULT_MAX_COMPARISONS,
    };
    // Take an immediate snapshot on start.
    poll();
    pollTimer = setInterval(poll, config.intervalMs);
    // Register with centralized polling state for coordinated lifecycle.
    stateUnsub = registerPollingSource(POLLING_STATE_KEY, {
        suspend: () => stopPollTimer(),
        resume: () => {
            if (pollTimer === null && observedContainer) {
                pollTimer = setInterval(poll, config.intervalMs);
            }
        },
        dispose: () => {
            stopPollTimer();
            stateUnsub = null;
        },
        getStatus: () => (pollTimer !== null ? "active" : "idle"),
    });
}
/** Stop the poll interval timer without touching polling-state registration. */
function stopPollTimer() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}
/** Stop the DOM performance monitor and clean up polling. */
export function stopDOMPerformanceMonitor() {
    stopPollTimer();
    // Deregister from centralized polling state. Nullify first to
    // prevent re-entrant dispose.
    if (stateUnsub) {
        const unsub = stateUnsub;
        stateUnsub = null;
        unsub();
    }
}
/** Get the most recent DOM snapshot, or null if not yet taken. */
export function getLatestDOMSnapshot() {
    return latestSnapshot;
}
/** Get the DOM snapshot history (bounded ring buffer). */
export function getDOMSnapshotHistory() {
    return snapshotHistory;
}
/** Get all recorded render timings (bounded ring buffer). */
export function getRenderTimings() {
    return renderTimings;
}
/** Get all recorded update comparisons (bounded ring buffer). */
export function getUpdateComparisons() {
    return updateComparisons;
}
/** Get the currently observed container element, or null. */
export function getObservedContainer() {
    return observedContainer;
}
/** Reset all module state (for testing). */
export function resetDOMPerformanceMonitor() {
    stopDOMPerformanceMonitor();
    observedContainer = null;
    stateUnsub = null;
    latestSnapshot = null;
    snapshotHistory = [];
    renderTimings = [];
    updateComparisons = [];
    snapshotListeners = [];
    config = {
        intervalMs: DEFAULT_INTERVAL_MS,
        maxSnapshots: DEFAULT_MAX_SNAPSHOTS,
        maxTimings: DEFAULT_MAX_TIMINGS,
        maxComparisons: DEFAULT_MAX_COMPARISONS,
    };
}
//# sourceMappingURL=dom-performance-monitor.js.map