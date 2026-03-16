/**
 * Performance zone public interface.
 *
 * All cross-zone consumers should import from this barrel rather than
 * individual implementation files. Type-only imports are excluded per
 * the gateway pattern (erased at compile time, stay at call-site).
 */
// ── Graceful degradation ──────────────────────────────────────────────────────
export { isFeatureDisabled, onDegradationChange, } from "./graceful-degradation.js";
// ── Memory monitor ────────────────────────────────────────────────────────────
export { formatBytes, formatRatio, } from "./memory-monitor.js";
// ── DOM update gate ───────────────────────────────────────────────────────────
export { createDomUpdateGate, } from "./dom-update-gate.js";
// ── Response buffer gate ──────────────────────────────────────────────────────
export { createResponseBufferGate, } from "./response-buffer-gate.js";
// ── Update batcher ────────────────────────────────────────────────────────────
export { createUpdateBatcher, } from "./update-batcher.js";
// ── DOM performance monitor ──────────────────────────────────────────────────
export { countDOMNodes, readHeapUsage, formatDuration, formatNodeCount, formatDelta, recordRender, recordUpdate, measureOperation, takeDOMSnapshot, computeSummary, onDOMSnapshot, setObservedContainer, startDOMPerformanceMonitor, stopDOMPerformanceMonitor, getLatestDOMSnapshot, getDOMSnapshotHistory, getRenderTimings, getUpdateComparisons, getObservedContainer, resetDOMPerformanceMonitor, } from "./dom-performance-monitor.js";
//# sourceMappingURL=index.js.map