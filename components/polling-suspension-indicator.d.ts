/**
 * Polling suspension status indicator component.
 *
 * Shows a compact floating indicator when polling is globally suspended
 * due to memory pressure. Informs users that auto-refresh is disabled,
 * explains why, and provides a manual refresh button so they can still
 * trigger data updates on demand.
 *
 * Hidden when polling is running normally.
 */
export interface PollingSuspensionIndicatorProps {
    /** Whether polling is currently globally suspended. */
    isSuspended: boolean;
    /** Number of polling sources currently suspended. */
    suspendedCount: number;
    /** Called when the user clicks the manual refresh button. */
    onRefresh: () => void;
}
export declare function PollingSuspensionIndicator({ isSuspended, suspendedCount, onRefresh, }: PollingSuspensionIndicatorProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "status";
    "aria-live": "polite";
    "aria-label": string;
}> | null;
