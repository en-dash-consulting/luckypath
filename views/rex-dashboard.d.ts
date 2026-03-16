/**
 * Rex Dashboard view — PRD status overview with completion stats,
 * per-epic progress bars, priority distribution, and next task highlight.
 *
 * Fetches data from /api/rex/dashboard which combines stats, epic-level
 * progress, priority distribution, and the next actionable task.
 */
import type { NavigateTo } from "../types.js";
export interface RexDashboardProps {
    navigateTo?: NavigateTo;
}
export declare function RexDashboard({ navigateTo }: RexDashboardProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
