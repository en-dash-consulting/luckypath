/**
 * Degradation notification banner component.
 *
 * Informs the user when features have been automatically disabled due to
 * memory pressure. Explains what's disabled and why, and provides a button
 * to dismiss the notice. Shows only when degradation is active (tier > normal)
 * and the memory warning banner is NOT already visible (to avoid stacking).
 */
import type { MemoryLevel, DegradableFeature } from "../performance/index.js";
export interface DegradationBannerProps {
    /** Current degradation tier. */
    tier: MemoryLevel;
    /** Whether degradation is active (tier !== "normal"). */
    isDegraded: boolean;
    /** Human-readable summary message. */
    summary: string;
    /** Set of disabled features. */
    disabledFeatures: ReadonlySet<DegradableFeature>;
    /** Whether this banner should be visible. */
    visible: boolean;
    /** Called when the user dismisses the banner. */
    onDismiss: () => void;
}
export declare function DegradationBanner({ tier, isDegraded, summary, disabledFeatures, visible, onDismiss, }: DegradationBannerProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "status";
    "aria-live": "polite";
}> | null;
