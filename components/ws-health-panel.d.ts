/**
 * WebSocket Health Panel — displays real-time WebSocket connection health,
 * cleanup metrics, and resource usage in the Hench dashboard section.
 *
 * Data comes from GET /api/ws/health (initial + polling fallback)
 * and WebSocket "ws:health-status" events (real-time updates).
 *
 * Shows:
 * - Active vs peak connection counts with a visual indicator
 * - Cleanup success rate and breakdown by reason
 * - Broadcast statistics and write failure rate
 * - Connection duration and health level
 */
export declare function WsHealthPanel(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "region";
    "aria-label": string;
}> | null;
