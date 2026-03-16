/**
 * Task Audit view — detailed execution information and administrative controls.
 *
 * Shows process IDs, system resource usage, execution logs, and
 * termination controls for active tasks.
 *
 * Data comes from:
 *   GET  /api/hench/audit           — active tasks with PIDs, resource usage
 *   GET  /api/hench/runs/:id        — full run detail (for log viewing)
 *   POST /api/hench/execute/:taskId/terminate — task termination
 */
import type { NavigateTo } from "../types.js";
export interface TaskAuditViewProps {
    navigateTo?: NavigateTo;
}
export declare function TaskAuditView({ navigateTo }?: TaskAuditViewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
