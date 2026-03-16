/**
 * Preact hook for client-side memory monitoring.
 *
 * Provides real-time memory usage data and warning levels to components.
 * Starts the memory monitor on mount, cleans up on unmount, and triggers
 * re-renders only when the snapshot changes.
 */
import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import { startMemoryMonitor, stopMemoryMonitor, onSnapshot, getLatestSnapshot, getSnapshotHistory, } from "../performance/memory-monitor.js";
/**
 * Hook that provides real-time memory usage monitoring.
 *
 * Usage:
 * ```tsx
 * const { snapshot, level, showWarning, dismiss } = useMemoryMonitor();
 * ```
 */
export function useMemoryMonitor(options = {}) {
    const { intervalMs = 5000, thresholds, enabled = true } = options;
    const [snapshot, setSnapshot] = useState(getLatestSnapshot);
    const [dismissed, setDismissed] = useState(false);
    const dismissedLevelRef = useRef(null);
    useEffect(() => {
        if (!enabled)
            return;
        startMemoryMonitor({
            intervalMs,
            thresholds: thresholds,
            onLevelChange: (snap, prevLevel) => {
                // If the level escalates beyond what was dismissed, re-show the warning.
                if (dismissedLevelRef.current &&
                    isMoreSevere(snap.level, dismissedLevelRef.current)) {
                    setDismissed(false);
                    dismissedLevelRef.current = null;
                }
            },
        });
        const unsubscribe = onSnapshot((snap) => {
            setSnapshot(snap);
        });
        return () => {
            unsubscribe();
            stopMemoryMonitor();
        };
    }, [enabled, intervalMs, thresholds]);
    const dismiss = useCallback(() => {
        setDismissed(true);
        dismissedLevelRef.current = snapshot?.level ?? null;
    }, [snapshot]);
    const level = snapshot?.level ?? "normal";
    const shouldWarn = level === "warning" || level === "critical";
    const showWarning = shouldWarn && !dismissed;
    return {
        snapshot,
        level,
        showWarning,
        dismissed,
        dismiss,
        history: getSnapshotHistory(),
    };
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
const SEVERITY_ORDER = {
    normal: 0,
    elevated: 1,
    warning: 2,
    critical: 3,
};
/** Returns true if `a` is strictly more severe than `b`. */
function isMoreSevere(a, b) {
    return SEVERITY_ORDER[a] > SEVERITY_ORDER[b];
}
//# sourceMappingURL=use-memory-monitor.js.map