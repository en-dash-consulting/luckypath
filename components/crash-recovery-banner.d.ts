/**
 * Crash recovery banner component.
 *
 * Displays after a detected crash to inform the user what happened and
 * offer to restore their previous navigation state. The banner adapts
 * its messaging based on whether the crash is a one-off or part of a
 * crash loop (multiple recent crashes).
 */
import type { SavedNavigationState } from "../crash/index.js";
export interface CrashRecoveryBannerProps {
    /** Whether the banner should be visible. */
    visible: boolean;
    /** Whether the app is in a crash loop (multiple recent crashes). */
    crashLoop: boolean;
    /** Number of recent crashes. */
    recentCrashCount: number;
    /** Recovered navigation state (null if nothing to restore). */
    recoveredState: SavedNavigationState | null;
    /** Called when the user dismisses the banner. */
    onDismiss: () => void;
    /** Called when the user chooses to restore their previous state. */
    onRestore: () => void;
}
export declare function CrashRecoveryBanner({ visible, crashLoop, recentCrashCount, recoveredState, onDismiss, onRestore, }: CrashRecoveryBannerProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "alert";
    "aria-live": "assertive";
}> | null;
