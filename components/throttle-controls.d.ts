/**
 * Throttle Controls — manual execution throttling, pause/resume, and
 * emergency stop for hench processes.
 *
 * Provides:
 * - Concurrency limit slider to adjust max concurrent processes at runtime
 * - Pause/resume toggle for new task executions
 * - Emergency stop button (with confirmation) to kill all running processes
 * - Real-time state via WebSocket `hench:throttle-state` events
 *
 * Data comes from GET /api/hench/throttle (initial + polling fallback)
 * and WebSocket events for live updates.
 */
export declare function ThrottleControlsPanel(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "region";
    "aria-label": string;
}> | null;
