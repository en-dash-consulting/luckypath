/**
 * RexTaskLink — reusable component for rendering clickable Rex task references.
 *
 * Provides a consistent visual pattern for task links across the dashboard,
 * Hench runs view, and any other location that references a Rex task.
 *
 * Features:
 * - Status icon with color coding
 * - Clickable with hover/focus states
 * - Right-click context menu for quick actions (status change, view detail)
 * - Keyboard accessible (Enter/Space to click)
 * - Consistent styling via `.rex-task-link` CSS class
 */
import type { ViewId } from "../types.js";
export interface TaskRef {
    id: string;
    title: string;
    status: string;
    level?: string;
    priority?: string;
}
export interface RexTaskLinkProps {
    task: TaskRef;
    /** Navigate to a view. Used to go to the PRD view on click. */
    navigateTo?: (view: ViewId, opts?: {
        taskId?: string;
    }) => void;
    /** Optional additional CSS class. */
    class?: string;
    /** Show the level badge (e.g. "Epic", "Task"). Default: false */
    showLevel?: boolean;
    /** Show the priority badge. Default: false */
    showPriority?: boolean;
    /** Show the status icon. Default: true */
    showStatus?: boolean;
    /** Compact mode — smaller text, less padding. Default: false */
    compact?: boolean;
    /** Additional click handler (called alongside navigation). */
    onClick?: () => void;
}
export declare function RexTaskLink({ task, navigateTo, class: className, showLevel, showPriority, showStatus, compact, onClick, }: RexTaskLinkProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "button";
    tabIndex: number;
    onClick: (e: MouseEvent) => void;
    onKeyDown: (e: KeyboardEvent) => void;
    onContextMenu: (e: MouseEvent) => void;
    title: string;
    "aria-label": string;
}>;
