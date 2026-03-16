/**
 * PRD hierarchy tree view component.
 *
 * Renders a collapsible/expandable tree of epics → features → tasks → subtasks
 * with status indicators, progress bars, completion percentages, and
 * modifier-key multi-select for bulk operations (status update, merge).
 *
 * Uses virtual scrolling to render only items within the viewport plus a
 * configurable buffer zone. The tree is flattened into a linear array
 * respecting expansion state and status filters, then only visible items
 * are rendered — dramatically reducing DOM node count for large trees.
 *
 * Event handling uses delegation: a single set of click / contextmenu / keydown
 * listeners on the `[role="tree"]` container replaces per-node handlers, reducing
 * total listener count from O(N × 6) to O(1).
 *
 * @see ./virtual-scroll.ts      — tree flattening and viewport computation
 * @see ./tree-event-delegate.ts  — delegated event handling hook
 */
import type { VNode } from "preact";
import type { PRDItemData, PRDDocumentData, ItemStatus, TaskUsageSummary, WeeklyBudgetResolution } from "./types.js";
import type { InlineAddInput } from "./inline-add-form.js";
export interface PRDTreeProps {
    /** PRD document data (items array + title). */
    document: PRDDocumentData;
    /** Aggregated task token usage keyed by task ID. */
    taskUsageById?: Record<string, TaskUsageSummary>;
    /** Shared resolved weekly budget used for deterministic utilization display. */
    weeklyBudget?: WeeklyBudgetResolution | null;
    /** Whether to show token budget UI (budget percentage in usage chip). */
    showTokenBudget?: boolean;
    /** How many levels to expand by default (0 = all collapsed). */
    defaultExpandDepth?: number;
    /** Called when an item is clicked for detail view. */
    onSelectItem?: (item: PRDItemData) => void;
    /** Currently selected item ID (highlights the row). */
    selectedItemId?: string | null;
    /** IDs of items selected for bulk operations (highlighted rows). */
    bulkSelectedIds?: Set<string>;
    /**
     * Multi-select callback for bulk operations. Receives the clicked item,
     * keyboard modifier state, and the ordered list of currently visible
     * item IDs so the consumer can implement ctrl-toggle, shift-range,
     * and plain-click-single-select semantics.
     */
    onBulkSelect?: (item: PRDItemData, modifiers: {
        ctrlKey: boolean;
        shiftKey: boolean;
    }, visibleIds: string[]) => void;
    /** Called when inline add form is submitted. */
    onInlineAddSubmit?: (data: InlineAddInput) => Promise<void>;
    /** ID of the item highlighted by a deep-link animation. */
    highlightedItemId?: string | null;
    /** IDs of ancestor nodes to force-expand for deep-link visibility. */
    deepLinkExpandIds?: Set<string> | null;
    /** Called to remove/delete an item from the tree. */
    onRemoveItem?: (item: PRDItemData) => void;
    /** Called to update an item's fields (e.g. status change from inline picker). */
    onUpdateItem?: (id: string, updates: Partial<PRDItemData>) => Promise<void>;
    /** ID of item currently being deleted (shows loading state). */
    deletingItemId?: string | null;
    /**
     * Controlled status filter: set of visible statuses.
     * When provided, the tree uses this instead of internal filter state.
     * The parent is responsible for rendering the StatusFilter component.
     */
    activeStatuses?: Set<ItemStatus>;
    /**
     * Search query for inline tree filtering. When set, only matching items
     * and their ancestors are shown, with matched text highlighted.
     */
    searchQuery?: string;
    /**
     * Set of item IDs visible during search (matches + ancestors).
     * When provided alongside searchQuery, filters the flat tree.
     */
    searchVisibleIds?: Set<string>;
    /**
     * Set of item IDs that directly matched the search query.
     * Used to apply a visual highlight class to matched rows.
     */
    searchMatchIds?: Set<string>;
    /**
     * @deprecated Virtual scrolling replaces progressive loading.
     * This prop is accepted for backward compatibility but has no effect.
     */
    chunkSize?: number;
}
export declare function PRDTree({ document: doc, taskUsageById, weeklyBudget, showTokenBudget, defaultExpandDepth, onSelectItem, selectedItemId, bulkSelectedIds, onBulkSelect, onInlineAddSubmit, highlightedItemId, deepLinkExpandIds, onRemoveItem, onUpdateItem, deletingItemId, activeStatuses: externalStatuses, searchQuery, searchVisibleIds, searchMatchIds, chunkSize }: PRDTreeProps): VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
