/**
 * Concurrency Panel — displays real-time concurrent execution count,
 * configured limits, and queue status in the Hench dashboard section.
 *
 * Data comes from GET /api/hench/concurrency (initial + polling fallback)
 * and WebSocket "hench:concurrency-status" events (real-time updates).
 *
 * Shows:
 * - Current/max concurrent process count with a visual bar
 * - Slots available and utilization percentage
 * - Queue length and pending task count
 * - Visual indicators (color-coded) for approaching resource limits
 */
export declare function ConcurrencyPanel(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "region";
    "aria-label": string;
}> | null;
