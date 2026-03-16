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
import type { MemoryLevel } from "./memory-monitor.js";
/**
 * Features that can be individually degraded.
 *
 * Each feature maps to a user-facing capability that consumes significant
 * memory or CPU. The degradation manager disables features from the bottom
 * of the list upwards as memory pressure increases.
 */
export type DegradableFeature = "autoRefresh" | "deferredLoading" | "graphRendering" | "animations" | "detailPanel";
/** Read-only snapshot of the current degradation state. */
export interface DegradationState {
    /** Current degradation tier, mirrors the memory level. */
    readonly tier: MemoryLevel;
    /** Set of features currently disabled due to memory pressure. */
    readonly disabledFeatures: ReadonlySet<DegradableFeature>;
    /** Whether *any* degradation is active (tier !== "normal"). */
    readonly isDegraded: boolean;
    /** Human-readable summary of what's disabled and why. */
    readonly summary: string;
}
/** Callback invoked when the degradation state changes. */
export type DegradationChangeHandler = (state: DegradationState, previousTier: MemoryLevel) => void;
/** Configuration for the degradation manager. */
export interface DegradationConfig {
    /** Called when the degradation tier changes. */
    onChange: DegradationChangeHandler | null;
}
/**
 * Compute the disabled feature set for a given memory level.
 * Exported for testing.
 */
export declare function featuresForTier(tier: MemoryLevel): Set<DegradableFeature>;
/**
 * Get the human-readable summary for a given memory level.
 * Exported for testing.
 */
export declare function summaryForTier(tier: MemoryLevel): string;
/**
 * Start the degradation manager. Subscribes to the memory monitor and
 * immediately evaluates the current memory level.
 *
 * Safe to call multiple times — restarts with new config.
 */
export declare function startDegradation(overrides?: Partial<DegradationConfig>): void;
/** Stop the degradation manager and clean up subscriptions. */
export declare function stopDegradation(): void;
/** Subscribe to degradation state changes. Returns an unsubscribe function. */
export declare function onDegradationChange(listener: (state: DegradationState) => void): () => void;
/** Check whether a specific feature is currently disabled. */
export declare function isFeatureDisabled(feature: DegradableFeature): boolean;
/** Get the current degradation state. */
export declare function getDegradationState(): DegradationState;
/** Get the current degradation tier. */
export declare function getCurrentTier(): MemoryLevel;
/** Reset all module state (for testing). */
export declare function resetDegradation(): void;
