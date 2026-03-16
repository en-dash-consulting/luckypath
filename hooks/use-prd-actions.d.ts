/**
 * PRD CRUD action hooks — item update, add, delete, merge, and prune.
 *
 * Composes focused sub-hooks for selection and deletion, adding
 * mutation handlers (update, add, execute) and detail panel sync.
 *
 * Each handler follows the optimistic update pattern:
 *
 * 1. Apply the change locally for instant UI feedback
 * 2. Send the request to the server
 * 3. Reconcile with authoritative server state
 * 4. On failure, revert by re-fetching from server
 *
 * @see ./use-item-selection.ts — selection, bulk select, navigation
 * @see ./use-delete-actions.ts — optimistic delete, modal, detail panel remove
 * @see ../components/prd-tree/tree-differ.ts — applyItemUpdate (structural sharing)
 */
import type { VNode } from "preact";
import type { PRDDocumentData, PRDItemData } from "../components/prd-tree/types.js";
import type { TaskUsageSummary, WeeklyBudgetResolution } from "../components/prd-tree/types.js";
import type { AddItemInput } from "../components/prd-tree/add-item-form.js";
import type { InlineAddInput } from "../components/prd-tree/inline-add-form.js";
import type { DetailItem, NavigateTo } from "../types.js";
/** Active tab in the command bar. */
export type CommandTab = null | "add" | "merge" | "prune";
export interface PRDActionsDeps {
    /** Current PRD document data. */
    data: PRDDocumentData | null;
    /** Setter for optimistic local state updates. */
    setData: (updater: PRDDocumentData | null | ((prev: PRDDocumentData | null) => PRDDocumentData | null)) => void;
    /** Fetch/reconcile PRD data from server. */
    fetchPRDData: () => Promise<void>;
    /** Fetch/reconcile task usage data from server. */
    fetchTaskUsage: () => Promise<void>;
    /** Show a toast notification. */
    showToast: (message: string, type?: "success" | "error", duration?: number) => void;
    /** External callback for item selection (parent layout). */
    onSelectItem?: (detail: DetailItem | null) => void;
    /** External callback for detail panel content (parent layout). */
    onDetailContent?: (content: VNode<any> | null) => void;
    /** Per-task usage summaries. */
    taskUsageById: Record<string, TaskUsageSummary>;
    /** Resolved weekly budget. */
    weeklyBudget: WeeklyBudgetResolution | null;
    /** Whether to show token budget UI (budget bar, percentage, limit label). */
    showTokenBudget?: boolean;
    /** Navigation callback for deep-linking to other views (e.g. hench-runs). */
    navigateTo?: NavigateTo;
}
export interface PRDActionsState {
    /** Currently selected item ID. */
    selectedItemId: string | null;
    /** Active command bar tab. */
    activeTab: CommandTab;
    /** Set the active command bar tab. */
    setActiveTab: (tab: CommandTab) => void;
    /** Parent ID for the add-item form. */
    addParentId: string | null;
    /** Set the parent ID for the add-item form. */
    setAddParentId: (id: string | null) => void;
    /** Set of item IDs selected for bulk operations. */
    bulkSelectedIds: Set<string>;
    /** Items resolved from bulk selection (for merge preview). */
    selectedItems: PRDItemData[];
    /** Item pending delete confirmation. */
    deleteTarget: PRDItemData | null;
    /** Set the item pending delete confirmation. */
    setDeleteTarget: (item: PRDItemData | null) => void;
    /** ID of item currently being deleted (loading state). */
    deletingItemId: string | null;
    /** Update an item's fields (optimistic + server reconciliation). */
    handleItemUpdate: (id: string, updates: Partial<PRDItemData>) => Promise<void>;
    /** Select an item (opens detail panel). */
    handleSelectItem: (item: PRDItemData) => void;
    /**
     * Multi-select handler for bulk operations.
     * Ctrl/Cmd+click toggles individual items, Shift+click selects a
     * contiguous range from the anchor, plain click selects only that item.
     * `visibleIds` provides the flat ordering of currently visible nodes
     * (needed for shift-range computation).
     */
    handleBulkSelect: (item: PRDItemData, modifiers: {
        ctrlKey: boolean;
        shiftKey: boolean;
    }, visibleIds: string[]) => void;
    /** Clear all bulk-selected items. */
    clearBulkSelection: () => void;
    /** Navigate to an item by ID (from detail panel links). */
    handleNavigateToItem: (id: string) => void;
    /** Add a child item from the detail panel. */
    handleAddChild: (input: {
        title: string;
        parentId: string;
        level: string;
        description?: string;
        priority?: string;
    }) => Promise<void>;
    /** Start a hench execution for a task. */
    handleExecuteTask: (taskId: string) => Promise<void>;
    /** Add an item from the command bar form. */
    handleAddItem: (input: AddItemInput) => Promise<void>;
    /** Add an item from the inline tree form. */
    handleInlineAddItem: (input: InlineAddInput) => Promise<void>;
    /** Remove an item from the tree node (opens modal). */
    handleRemoveItemFromTree: (item: PRDItemData) => void;
    /** Confirm deletion from the modal dialog. */
    handleConfirmDelete: (id: string) => Promise<void>;
    /** Remove an item from the detail panel. */
    handleRemoveFromDetail: (id: string) => Promise<void>;
    /** Called when merge completes successfully. */
    handleMergeComplete: () => void;
    /** Called when prune completes successfully. */
    handlePruneComplete: () => void;
    /** Open the merge preview panel. */
    handleOpenMerge: () => void;
    /** Synchronize the detail panel content with current state. */
    syncDetailContent: () => void;
}
/**
 * Hook providing all PRD CRUD action handlers and related UI state.
 *
 * Composes {@link useItemSelection} for selection/navigation and
 * {@link useDeleteActions} for optimistic deletion, then adds
 * mutation handlers and detail panel synchronization.
 */
export declare function usePRDActions({ data, setData, fetchPRDData, fetchTaskUsage, showToast, onSelectItem, onDetailContent, taskUsageById, weeklyBudget, showTokenBudget, navigateTo, }: PRDActionsDeps): PRDActionsState;
