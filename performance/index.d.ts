/**
 * Performance zone public interface.
 *
 * All cross-zone consumers should import from this barrel rather than
 * individual implementation files. Type-only imports are excluded per
 * the gateway pattern (erased at compile time, stay at call-site).
 */
export { isFeatureDisabled, onDegradationChange, type DegradableFeature, type DegradationState, type DegradationChangeHandler, } from "./graceful-degradation.js";
export { formatBytes, formatRatio, type MemorySnapshot, type MemoryLevel, } from "./memory-monitor.js";
export { createDomUpdateGate, type DomUpdateGate, type DomUpdateGateConfig, } from "./dom-update-gate.js";
export { createResponseBufferGate, type ResponseBufferGate, type ResponseBufferGateConfig, } from "./response-buffer-gate.js";
export { createUpdateBatcher, type UpdateBatcher, type UpdateBatcherConfig, } from "./update-batcher.js";
export { type RefreshQueueState, type RefreshPriority, } from "./refresh-throttle.js";
export { countDOMNodes, readHeapUsage, formatDuration, formatNodeCount, formatDelta, recordRender, recordUpdate, measureOperation, takeDOMSnapshot, computeSummary, onDOMSnapshot, setObservedContainer, startDOMPerformanceMonitor, stopDOMPerformanceMonitor, getLatestDOMSnapshot, getDOMSnapshotHistory, getRenderTimings, getUpdateComparisons, getObservedContainer, resetDOMPerformanceMonitor, type DOMNodeSnapshot, type RenderTiming, type UpdateComparison, type PerformanceSummary, type DOMPerformanceConfig, type DOMSnapshotHandler, } from "./dom-performance-monitor.js";
