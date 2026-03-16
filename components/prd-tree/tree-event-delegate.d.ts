/**
 * Event delegation hook for the PRD tree container.
 *
 * Replaces per-node click and keydown listeners with a single set of
 * delegated handlers on the `[role="tree"]` container. Each event
 * bubbles up and is routed to the correct callback by inspecting the target
 * and its closest `[data-node-id]` ancestor.
 *
 * Click delegation routes to the correct handler based on the target's
 * CSS class: `.prd-inline-add-btn` → add, `.prd-node-action-edit` → edit
 * (select), `.prd-node-action-status` → status picker,
 * `.prd-node-action-delete` → delete, `.prd-chevron` → toggle.
 *
 * Row clicks with keyboard modifiers drive multi-select: Ctrl/Cmd+click
 * toggles individual items, Shift+click extends a range selection, and
 * plain click selects a single item (deselecting all others).
 *
 * Net effect: from O(N * handlers-per-node) down to O(1) for click and
 * keydown — a dramatic reduction in total listener count for large trees.
 *
 * Individual NodeRow components only need `data-node-id` and
 * `data-has-children` attributes; no event handler props.
 *
 * @see ./prd-tree.ts — PRDTree component that consumes this hook
 */
import type { PRDItemData } from "./types.js";
/** Keyboard modifier state at the time of a click or keydown event. */
export interface SelectionModifiers {
    ctrlKey: boolean;
    shiftKey: boolean;
}
export interface TreeDelegationCallbacks {
    /** Look up an item by ID (should be O(1) — backed by a Map). */
    getItem: (id: string) => PRDItemData | null;
    /** Toggle expand/collapse for a node. */
    onToggle: (id: string) => void;
    /** Select an item for detail view (edit button). */
    onSelectItem?: (item: PRDItemData) => void;
    /**
     * Multi-select callback for bulk operations.
     * Replaces the previous checkbox-based toggle. The caller receives the
     * clicked item plus modifier state so it can implement ctrl-toggle,
     * shift-range, and plain-click-single-select semantics.
     */
    onBulkSelect?: (item: PRDItemData, modifiers: SelectionModifiers) => void;
    /** Open / toggle inline add form for a node. */
    onInlineAdd?: (item: PRDItemData) => void;
    /** Remove / delete an item. */
    onRemoveItem?: (item: PRDItemData) => void;
    /** Open inline status picker, passing the anchor button's bounding rect. */
    onStatusClick?: (item: PRDItemData, anchorRect: {
        left: number;
        top: number;
        bottom: number;
    }) => void;
    /** Set of currently expanded node IDs (for keyboard arrow logic). */
    expanded: Set<string>;
}
export interface TreeDelegationHandlers {
    onClick: (e: MouseEvent) => void;
    onKeyDown: (e: KeyboardEvent) => void;
}
/**
 * Returns stable delegated event handlers for the tree container.
 *
 * Uses a ref to always read the *latest* callbacks without recreating the
 * handler closures — so the returned handler objects are referentially
 * stable across renders.
 */
export declare function useTreeEventDelegation(cb: TreeDelegationCallbacks): TreeDelegationHandlers;
