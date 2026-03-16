/**
 * Hench Runs view — execution history showing past agent runs.
 *
 * Displays a list of runs with task name, status, duration, turns,
 * and token usage. Clicking a run shows the full summary/detail.
 * Each run links back to its Rex task.
 *
 * Data comes from GET /api/hench/runs (list) and
 * GET /api/hench/runs/:id (detail).
 */
import type { NavigateTo } from "../types.js";
export interface HenchRunsViewProps {
    navigateTo?: NavigateTo;
    /** When set, auto-select this run on mount (from deep-link URL). */
    initialRunId?: string | null;
}
export declare function HenchRunsView({ navigateTo, initialRunId }?: HenchRunsViewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
