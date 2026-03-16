/**
 * Preact hook for crash detection and recovery workflow.
 *
 * Runs crash detection on mount, saves navigation state on every view
 * change, and exposes the recovery result plus dismiss/restore actions
 * to the component tree.
 */
import { useState, useEffect, useCallback, useRef } from "preact/hooks";
import { detectCrash, saveNavigationState, clearSavedNavigationState, markRecoveryShown, wasRecoveryShown, } from "../crash/index.js";
/**
 * Hook that provides crash detection and recovery workflow.
 *
 * Usage:
 * ```tsx
 * const { showRecovery, recoveredState, dismiss, restore, crashLoop } = useCrashRecovery({
 *   view, selectedFile, selectedZone, selectedRunId, selectedTaskId,
 * });
 * ```
 */
export function useCrashRecovery(options) {
    const { view, selectedFile, selectedZone, selectedRunId, selectedTaskId, enabled = true, } = options;
    const [detection, setDetection] = useState(null);
    const [dismissed, setDismissed] = useState(false);
    const initialised = useRef(false);
    // Run crash detection once on mount.
    useEffect(() => {
        if (!enabled || initialised.current)
            return;
        initialised.current = true;
        const result = detectCrash();
        setDetection(result);
        // If recovery was already shown this session (e.g. hot-reload), don't show again.
        if (wasRecoveryShown()) {
            setDismissed(true);
        }
    }, [enabled]);
    // Save navigation state on every view/selection change.
    useEffect(() => {
        if (!enabled)
            return;
        saveNavigationState({
            view,
            selectedFile,
            selectedZone,
            selectedRunId,
            selectedTaskId,
        });
    }, [enabled, view, selectedFile, selectedZone, selectedRunId, selectedTaskId]);
    const dismiss = useCallback(() => {
        setDismissed(true);
        markRecoveryShown();
        clearSavedNavigationState();
    }, []);
    const restore = useCallback(() => {
        const state = detection?.recoveredState ?? null;
        setDismissed(true);
        markRecoveryShown();
        clearSavedNavigationState();
        return state;
    }, [detection]);
    const crashed = detection?.crashed ?? false;
    const crashLoop = detection?.crashLoop ?? false;
    const recentCrashCount = detection?.recentCrashCount ?? 0;
    const recoveredState = detection?.recoveredState ?? null;
    const showRecovery = crashed && !dismissed;
    return {
        crashed,
        crashLoop,
        recentCrashCount,
        recoveredState,
        showRecovery,
        dismiss,
        restore,
    };
}
//# sourceMappingURL=use-crash-recovery.js.map