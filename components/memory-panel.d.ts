/**
 * Memory Panel — displays system memory usage, per-process memory consumption,
 * and resource health indicators in the Hench dashboard section.
 *
 * Data comes from GET /api/hench/memory (initial + polling fallback)
 * and WebSocket "hench:memory-status" events (real-time updates).
 *
 * Shows:
 * - System memory usage percentage with a visual bar
 * - Server process (n-dx web) memory consumption
 * - Per-task process memory for active executions
 * - Resource health indicators (healthy/warning/critical)
 * - Memory pressure warnings when usage is high
 */
export declare function MemoryPanel(): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "region";
    "aria-label": string;
}> | null;
