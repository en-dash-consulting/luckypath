/**
 * Task detail panel for PRD items.
 *
 * Renders inside the existing DetailPanel when a PRD item is selected.
 * Shows description, acceptance criteria, metadata, and provides
 * controls for updating status, priority, and tags.
 */
import type { PRDItemData, ItemLevel, TaskUsageSummary, WeeklyBudgetResolution } from "./types.js";
import type { NavigateTo } from "../../types.js";
export interface TaskDetailProps {
    item: PRDItemData;
    /** Aggregated token usage for this task across associated runs. */
    taskUsage?: TaskUsageSummary;
    /** Shared resolved weekly budget used for deterministic utilization display. */
    weeklyBudget?: WeeklyBudgetResolution | null;
    /** Whether to show token budget UI (budget bar, percentage, limit label). */
    showTokenBudget?: boolean;
    /** All items in the document, for resolving dependency references. */
    allItems: PRDItemData[];
    /** Called when an item is updated via the API. */
    onUpdate?: (id: string, updates: Partial<PRDItemData>) => void;
    /** Called to navigate to a different item in the tree. */
    onNavigateToItem?: (id: string) => void;
    /** Called to trigger Hench execution for this task. */
    onExecuteTask?: (taskId: string) => Promise<void>;
    /** Called when PRD data may have changed (e.g. after execution completes). */
    onPrdChanged?: () => void;
    /** Called to add a child item under the current item. */
    onAddChild?: (data: {
        title: string;
        parentId: string;
        level: ItemLevel;
        description?: string;
        priority?: string;
    }) => Promise<void>;
    /** Called to remove/delete the current item and all its descendants. */
    onRemove?: (id: string) => Promise<void>;
    /** Navigation callback for deep-linking to other views (e.g. hench-runs). */
    navigateTo?: NavigateTo;
}
export declare function TaskDetail({ item, taskUsage, weeklyBudget, showTokenBudget, allItems, onUpdate, onNavigateToItem, onExecuteTask, onPrdChanged, onAddChild, onRemove, navigateTo }: TaskDetailProps): import("preact").VNode<import("preact").Attributes>;
