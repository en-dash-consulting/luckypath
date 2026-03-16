/**
 * Active Tasks Panel — shows currently executing tasks prominently at the
 * top of the Hench UI.
 *
 * Combines data from two sources:
 * 1. Hench runs with status "running" (from /api/hench/runs)
 * 2. Active task executions triggered via the dashboard (from /api/hench/execute/status)
 *
 * Updates in real-time via WebSocket ("hench:task-execution-progress" events)
 * and periodic polling as a fallback.
 *
 * Displays task title, start time, elapsed duration (live-ticking), and
 * health status (stale detection).
 */
import type { NavigateTo } from "../types.js";
export interface ActiveRun {
    id: string;
    taskId: string;
    taskTitle: string;
    taskStatus?: string;
    startedAt: string;
    lastActivityAt?: string;
    status: string;
    turns: number;
    model: string;
}
export interface ActiveTasksPanelProps {
    /** Running runs from the parent (from /api/hench/runs with status=running). */
    runs: ActiveRun[];
    navigateTo?: NavigateTo;
}
export declare function ActiveTasksPanel({ runs, navigateTo }: ActiveTasksPanelProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "region";
    "aria-label": string;
}> | null;
