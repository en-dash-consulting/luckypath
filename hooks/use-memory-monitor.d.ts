/**
 * Preact hook for client-side memory monitoring.
 *
 * Provides real-time memory usage data and warning levels to components.
 * Starts the memory monitor on mount, cleans up on unmount, and triggers
 * re-renders only when the snapshot changes.
 */
import type { MemorySnapshot, MemoryLevel, MemoryThresholds } from "../performance/memory-monitor.js";
export interface UseMemoryMonitorOptions {
    /** Polling interval in milliseconds (default: 5000). */
    intervalMs?: number;
    /** Custom warning thresholds. */
    thresholds?: Partial<MemoryThresholds>;
    /** Whether to start monitoring immediately (default: true). */
    enabled?: boolean;
}
export interface UseMemoryMonitorResult {
    /** Latest memory snapshot, or null if not yet available. */
    snapshot: MemorySnapshot | null;
    /** Current warning level. */
    level: MemoryLevel;
    /** Whether the warning banner should be shown (warning or critical). */
    showWarning: boolean;
    /** Whether the user has dismissed the current warning. */
    dismissed: boolean;
    /** Dismiss the current warning banner. Resets if level escalates. */
    dismiss: () => void;
    /** Snapshot history for debugging (readonly). */
    history: readonly MemorySnapshot[];
}
/**
 * Hook that provides real-time memory usage monitoring.
 *
 * Usage:
 * ```tsx
 * const { snapshot, level, showWarning, dismiss } = useMemoryMonitor();
 * ```
 */
export declare function useMemoryMonitor(options?: UseMemoryMonitorOptions): UseMemoryMonitorResult;
