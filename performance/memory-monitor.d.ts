/**
 * Client-side memory usage monitoring and early warning system.
 *
 * Tracks browser memory consumption in real-time, detects approaching
 * memory limits, and triggers graceful degradation before OOM crashes.
 *
 * Uses `performance.memory` (Chrome/Edge) for precise readings and
 * falls back to heuristic-based estimation on other browsers.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useMemoryMonitor`) is provided separately.
 */
/** Memory usage snapshot at a point in time. */
export interface MemorySnapshot {
    /** JS heap currently used (bytes). -1 if unavailable. */
    usedJSHeapSize: number;
    /** Total JS heap allocated by the browser (bytes). -1 if unavailable. */
    totalJSHeapSize: number;
    /** JS heap size limit (bytes). -1 if unavailable. */
    jsHeapSizeLimit: number;
    /** Usage ratio: usedJSHeapSize / jsHeapSizeLimit (0–1). -1 if unavailable. */
    usageRatio: number;
    /** Current warning level based on threshold configuration. */
    level: MemoryLevel;
    /** ISO timestamp of when this snapshot was taken. */
    timestamp: string;
    /** Whether precise memory data is available (Chrome/Edge only). */
    precise: boolean;
}
/** Warning levels ordered by severity. */
export type MemoryLevel = "normal" | "elevated" | "warning" | "critical";
/** Threshold configuration for memory warning levels. */
export interface MemoryThresholds {
    /** Ratio above which level becomes "elevated" (default: 0.50). */
    elevated: number;
    /** Ratio above which level becomes "warning" (default: 0.70). */
    warning: number;
    /** Ratio above which level becomes "critical" (default: 0.85). */
    critical: number;
}
/** Callback invoked when memory level changes. */
export type MemoryLevelChangeHandler = (snapshot: MemorySnapshot, previousLevel: MemoryLevel) => void;
/** Configuration for the memory monitor. */
export interface MemoryMonitorConfig {
    /** Polling interval in milliseconds (default: 5000). */
    intervalMs: number;
    /** Warning thresholds (ratios 0–1). */
    thresholds: MemoryThresholds;
    /** Called when the memory level changes (e.g. normal → warning). */
    onLevelChange: MemoryLevelChangeHandler | null;
}
/** Check if the browser exposes precise memory metrics. */
export declare function hasPerformanceMemory(): boolean;
/** Determine the memory level for a given usage ratio. */
export declare function classifyLevel(ratio: number, thresholds: MemoryThresholds): MemoryLevel;
/** Take a memory snapshot using the best available API. */
export declare function takeSnapshot(thresholds?: MemoryThresholds): MemorySnapshot;
/** Format bytes as a human-readable string (e.g. "142.5 MB"). */
export declare function formatBytes(bytes: number): string;
/** Format a usage ratio as a percentage string (e.g. "72.3%"). */
export declare function formatRatio(ratio: number): string;
/** Subscribe to every new snapshot. Returns an unsubscribe function. */
export declare function onSnapshot(listener: (snapshot: MemorySnapshot) => void): () => void;
/**
 * Start the memory monitor with the given configuration overrides.
 * Safe to call multiple times — restarts with new config if already running.
 */
export declare function startMemoryMonitor(overrides?: Partial<MemoryMonitorConfig>): void;
/** Stop the memory monitor and clean up. */
export declare function stopMemoryMonitor(): void;
/** Get the most recent memory snapshot, or null if the monitor has not run. */
export declare function getLatestSnapshot(): MemorySnapshot | null;
/** Get the snapshot history (up to MAX_HISTORY_LENGTH entries). */
export declare function getSnapshotHistory(): readonly MemorySnapshot[];
/** Get the current memory warning level. */
export declare function getCurrentLevel(): MemoryLevel;
/** Reset all module state (for testing). */
export declare function resetMemoryMonitor(): void;
