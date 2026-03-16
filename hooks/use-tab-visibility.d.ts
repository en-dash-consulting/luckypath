/**
 * Preact hook for tab visibility state management.
 *
 * Provides reactive tab visibility state to components. Starts the
 * tab visibility monitor on mount, cleans up on unmount, and triggers
 * re-renders only when the visibility state changes.
 */
import { type TabVisibilityState, type TabVisibilitySnapshot, type VisibilityAPICapabilities } from "../polling/index.js";
export interface UseTabVisibilityResult {
    /** Current tab visibility state ("visible" or "hidden"). */
    state: TabVisibilityState;
    /** Whether the tab is currently visible (convenience boolean). */
    isVisible: boolean;
    /** Full visibility snapshot with timing information. */
    snapshot: TabVisibilitySnapshot;
    /** Browser API capabilities for the Page Visibility API. */
    capabilities: VisibilityAPICapabilities;
}
/**
 * Hook that provides real-time tab visibility state.
 *
 * Usage:
 * ```tsx
 * const { isVisible, state, capabilities } = useTabVisibility();
 * if (!isVisible) return null; // skip rendering when hidden
 * if (capabilities.usingFallback) {
 *   console.warn("Using focus/blur fallback — precision is reduced");
 * }
 * ```
 */
export declare function useTabVisibility(): UseTabVisibilityResult;
