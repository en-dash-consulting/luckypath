/**
 * Item selection hooks — single select, bulk multi-select, and navigation.
 *
 * Extracted from usePRDActions to isolate selection state management
 * from mutation logic. Handles plain click, ctrl+click toggle, and
 * shift+click range selection.
 *
 * @see ./use-prd-actions.ts — parent hook that composes this
 */
import type { PRDDocumentData, PRDItemData } from "../components/prd-tree/types.js";
import type { DetailItem } from "../types.js";
export interface ItemSelectionDeps {
    /** Current PRD document data. */
    data: PRDDocumentData | null;
    /** External callback for item selection (parent layout). */
    onSelectItem?: (detail: DetailItem | null) => void;
}
export interface ItemSelectionState {
    /** Currently selected item ID. */
    selectedItemId: string | null;
    /** Set the selected item ID directly (e.g. for clearing on delete). */
    setSelectedItemId: (id: string | null) => void;
    /** Set of item IDs selected for bulk operations. */
    bulkSelectedIds: Set<string>;
    /** Setter for bulk selection (for clearing from external code). */
    setBulkSelectedIds: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
    /** Items resolved from bulk selection (for merge preview). */
    selectedItems: PRDItemData[];
    /** Select an item (opens detail panel). */
    handleSelectItem: (item: PRDItemData) => void;
    /**
     * Multi-select handler for bulk operations.
     * Ctrl/Cmd+click toggles individual items, Shift+click selects a
     * contiguous range from the anchor, plain click selects only that item.
     * `visibleIds` provides the flat ordering of currently visible nodes.
     */
    handleBulkSelect: (item: PRDItemData, modifiers: {
        ctrlKey: boolean;
        shiftKey: boolean;
    }, visibleIds: string[]) => void;
    /** Clear all bulk-selected items. */
    clearBulkSelection: () => void;
    /** Navigate to an item by ID (from detail panel links). */
    handleNavigateToItem: (id: string) => void;
}
/**
 * Hook for item selection state — single select, bulk multi-select, and navigation.
 */
export declare function useItemSelection({ data, onSelectItem }: ItemSelectionDeps): ItemSelectionState;
