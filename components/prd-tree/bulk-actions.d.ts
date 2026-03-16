/**
 * Bulk actions bar for PRD items.
 *
 * Shows a floating action bar when items are selected, with options
 * to bulk-update status across multiple items or merge/consolidate them.
 */
export interface BulkActionsProps {
    /** IDs of currently selected items. */
    selectedIds: Set<string>;
    /** Called to clear selection. */
    onClearSelection: () => void;
    /** Called after a bulk action completes (to refresh data). */
    onActionComplete: () => void;
    /** Called when user clicks "Merge" — opens merge preview panel. */
    onMerge?: () => void;
}
export declare function BulkActions({ selectedIds, onClearSelection, onActionComplete, onMerge }: BulkActionsProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}> | null;
