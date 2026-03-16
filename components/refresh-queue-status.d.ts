/**
 * Refresh queue status indicator component.
 *
 * Shows current queue depth, memory-adjusted refresh state, and estimated
 * completion time when refresh operations are queued or throttled. Hidden
 * when the queue is empty and no throttling is active.
 */
import type { RefreshQueueState } from "../performance/index.js";
export interface RefreshQueueStatusProps {
    /** Current queue state from the refresh throttle. */
    state: RefreshQueueState;
    /** Whether this indicator should be visible. */
    visible: boolean;
}
export declare function RefreshQueueStatus({ state, visible, }: RefreshQueueStatusProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "status";
    "aria-live": "polite";
    "aria-label": string;
}> | null;
