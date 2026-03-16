/**
 * Preact hook for crash detection and recovery workflow.
 *
 * Runs crash detection on mount, saves navigation state on every view
 * change, and exposes the recovery result plus dismiss/restore actions
 * to the component tree.
 */
import type { ViewId } from "../external.js";
import { type SavedNavigationState } from "../crash/index.js";
export interface UseCrashRecoveryOptions {
    /** Current active view. */
    view: ViewId;
    /** Current selected file (if any). */
    selectedFile: string | null;
    /** Current selected zone (if any). */
    selectedZone: string | null;
    /** Current selected run ID (if any). */
    selectedRunId: string | null;
    /** Current selected task ID (if any). */
    selectedTaskId: string | null;
    /** Whether crash recovery is enabled (default: true). */
    enabled?: boolean;
}
export interface UseCrashRecoveryResult {
    /** Whether a crash was detected from the previous session. */
    crashed: boolean;
    /** Whether the app is in a crash loop. */
    crashLoop: boolean;
    /** Number of recent crashes. */
    recentCrashCount: number;
    /** The saved navigation state from before the crash, if recoverable. */
    recoveredState: SavedNavigationState | null;
    /** Whether the recovery banner should be shown. */
    showRecovery: boolean;
    /** Dismiss the recovery banner without restoring state. */
    dismiss: () => void;
    /** Restore the saved navigation state and dismiss the banner. */
    restore: () => SavedNavigationState | null;
}
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
export declare function useCrashRecovery(options: UseCrashRecoveryOptions): UseCrashRecoveryResult;
