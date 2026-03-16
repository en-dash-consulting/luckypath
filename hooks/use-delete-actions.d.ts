/**
 * Delete action hooks — optimistic removal, modal confirmation, and detail panel deletion.
 *
 * Extracted from usePRDActions to isolate delete state management and
 * the optimistic-delete-then-reconcile pattern from other mutations.
 *
 * @see ./use-prd-actions.ts — parent hook that composes this
 */
import type { VNode } from "preact";
import type { PRDDocumentData, PRDItemData } from "../components/prd-tree/types.js";
export interface DeleteActionsDeps {
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
    /** Currently selected item ID (to clear on delete). */
    selectedItemId: string | null;
    /** Set the selected item ID (to clear on delete). */
    setSelectedItemId: (id: string | null) => void;
    /** Setter for bulk selection (to clear deleted items). */
    setBulkSelectedIds: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    /** External callback for detail panel content (to clear on delete). */
    onDetailContent?: (content: VNode<any> | null) => void;
}
export interface DeleteActionsState {
    /** Item pending delete confirmation. */
    deleteTarget: PRDItemData | null;
    /** Set the item pending delete confirmation. */
    setDeleteTarget: (item: PRDItemData | null) => void;
    /** ID of item currently being deleted (loading state). */
    deletingItemId: string | null;
    /** Remove an item from the tree node (opens modal). */
    handleRemoveItemFromTree: (item: PRDItemData) => void;
    /** Confirm deletion from the modal dialog. */
    handleConfirmDelete: (id: string) => Promise<void>;
    /** Remove an item from the detail panel. */
    handleRemoveFromDetail: (id: string) => Promise<void>;
}
/**
 * Hook for delete actions — optimistic removal, modal confirmation, and detail panel deletion.
 */
export declare function useDeleteActions({ data, setData, fetchPRDData, fetchTaskUsage, showToast, selectedItemId, setSelectedItemId, setBulkSelectedIds, onDetailContent, }: DeleteActionsDeps): DeleteActionsState;
