/**
 * Graceful degradation manager for memory-constrained environments.
 *
 * Subscribes to the memory monitor and progressively disables non-essential
 * features as memory usage rises through threshold levels. Features are
 * re-enabled automatically when memory pressure subsides.
 *
 * Degradation tiers (cumulative — each tier includes all previous restrictions):
 *
 *   normal   → All features active.
 *   elevated → Pause data polling, skip deferred module loading.
 *   warning  → Disable graph rendering & CSS animations.
 *   critical → Disable detail panel, reduce to minimal UI.
 *
 * Designed as a standalone module with zero framework dependencies —
 * the Preact hook (`useGracefulDegradation`) is provided separately.
 */
import { onSnapshot, getLatestSnapshot } from "./memory-monitor.js";
// ─── Constants ───────────────────────────────────────────────────────────────
/**
 * Which features to disable at each memory level.
 *
 * Degradation is cumulative: "warning" includes everything from "elevated"
 * plus its own additions.
 */
const TIER_FEATURES = {
    normal: [],
    elevated: ["autoRefresh", "deferredLoading"],
    warning: ["autoRefresh", "deferredLoading", "graphRendering", "animations"],
    critical: ["autoRefresh", "deferredLoading", "graphRendering", "animations", "detailPanel"],
};
const TIER_SUMMARIES = {
    normal: "",
    elevated: "Memory usage is elevated. Auto-refresh and background data loading have been paused to conserve memory.",
    warning: "High memory usage detected. The graph view and animations have been disabled. Close unused tabs or refresh the page.",
    critical: "Critical memory pressure. Most features are disabled to prevent a crash. Refresh the page to restore full functionality.",
};
const SEVERITY_ORDER = {
    normal: 0,
    elevated: 1,
    warning: 2,
    critical: 3,
};
// ─── Module state ────────────────────────────────────────────────────────────
let currentTier = "normal";
let disabledFeatures = new Set();
let config = { onChange: null };
let unsubscribeMonitor = null;
let listeners = [];
// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Build the DegradationState snapshot from current module state. */
function buildState() {
    return {
        tier: currentTier,
        disabledFeatures: new Set(disabledFeatures),
        isDegraded: currentTier !== "normal",
        summary: TIER_SUMMARIES[currentTier],
    };
}
function notifyListeners(state) {
    for (const listener of listeners) {
        try {
            listener(state);
        }
        catch (err) {
            console.error("[graceful-degradation] listener error:", err);
        }
    }
}
/**
 * Compute the disabled feature set for a given memory level.
 * Exported for testing.
 */
export function featuresForTier(tier) {
    return new Set(TIER_FEATURES[tier]);
}
/**
 * Get the human-readable summary for a given memory level.
 * Exported for testing.
 */
export function summaryForTier(tier) {
    return TIER_SUMMARIES[tier];
}
// ─── Snapshot handler ────────────────────────────────────────────────────────
function handleMemorySnapshot(snapshot) {
    const newTier = snapshot.level;
    if (newTier === currentTier)
        return;
    const previousTier = currentTier;
    currentTier = newTier;
    disabledFeatures = featuresForTier(newTier);
    const state = buildState();
    if (config.onChange) {
        config.onChange(state, previousTier);
    }
    notifyListeners(state);
}
// ─── Public API ──────────────────────────────────────────────────────────────
/**
 * Start the degradation manager. Subscribes to the memory monitor and
 * immediately evaluates the current memory level.
 *
 * Safe to call multiple times — restarts with new config.
 */
export function startDegradation(overrides = {}) {
    stopDegradation();
    config = {
        onChange: overrides.onChange ?? null,
    };
    // Subscribe to ongoing memory snapshots.
    unsubscribeMonitor = onSnapshot(handleMemorySnapshot);
    // Evaluate current state immediately from the latest snapshot.
    const latest = getLatestSnapshot();
    if (latest) {
        handleMemorySnapshot(latest);
    }
}
/** Stop the degradation manager and clean up subscriptions. */
export function stopDegradation() {
    if (unsubscribeMonitor) {
        unsubscribeMonitor();
        unsubscribeMonitor = null;
    }
}
/** Subscribe to degradation state changes. Returns an unsubscribe function. */
export function onDegradationChange(listener) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener);
    };
}
/** Check whether a specific feature is currently disabled. */
export function isFeatureDisabled(feature) {
    return disabledFeatures.has(feature);
}
/** Get the current degradation state. */
export function getDegradationState() {
    return buildState();
}
/** Get the current degradation tier. */
export function getCurrentTier() {
    return currentTier;
}
/** Reset all module state (for testing). */
export function resetDegradation() {
    stopDegradation();
    currentTier = "normal";
    disabledFeatures = new Set();
    config = { onChange: null };
    listeners = [];
}
//# sourceMappingURL=graceful-degradation.js.map