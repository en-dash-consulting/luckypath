/**
 * Virtual scrolling engine for the PRD tree.
 *
 * Flattens the hierarchical tree into a linear array respecting expansion
 * state and status filters, then computes which items fall within the
 * current scroll viewport plus a configurable buffer zone. Only those
 * items are rendered, dramatically reducing DOM node count for large trees.
 *
 * The module exposes:
 * - Pure functions for flattening and range computation (easily testable)
 * - A Preact hook (`useVirtualScroll`) for scroll state management
 *
 * @see ./prd-tree.ts — integrating component
 * @see ./compute.ts  — itemMatchesFilter used for visibility checks
 */
import type { PRDItemData, ItemStatus } from "./types.js";
/** A flattened tree node with depth and structural metadata for rendering. */
export interface FlatNode {
    /** The original PRD item data. */
    item: PRDItemData;
    /** Depth level in the tree (0 = root). */
    depth: number;
    /** Whether this node is currently expanded (children visible). */
    isExpanded: boolean;
    /** Whether this node has children (regardless of expansion state). */
    hasChildren: boolean;
}
/** Configuration for the virtual scroll engine. */
export interface VirtualScrollConfig {
    /** Estimated height per row in pixels. Default: DEFAULT_ITEM_HEIGHT. */
    itemHeight?: number;
    /** Extra items to render above and below viewport. Default: DEFAULT_BUFFER_COUNT. */
    bufferCount?: number;
}
/** Range of indices to render. */
export interface VisibleRange {
    /** First index to render (inclusive). */
    start: number;
    /** Last index to render (exclusive). */
    end: number;
    /** Pixel offset for the spacer before visible items. */
    offsetY: number;
}
/** Default estimated row height in pixels. */
export declare const DEFAULT_ITEM_HEIGHT = 40;
/** Default number of buffer items above and below viewport. */
export declare const DEFAULT_BUFFER_COUNT = 10;
/**
 * Flatten a hierarchical tree into a linear array of FlatNodes.
 *
 * Only includes nodes that:
 * 1. Match the status filter (or have descendants that match)
 * 2. Are within expanded parent branches
 *
 * The result preserves render order (depth-first, pre-order traversal).
 * This is the same ordering that the recursive TreeNodes renderer produced,
 * but in a flat array suitable for virtual scrolling.
 *
 * Complexity: O(V) where V = visible nodes in the expanded tree.
 */
export declare function flattenVisibleTree(items: PRDItemData[], expanded: Set<string>, activeStatuses: Set<ItemStatus>, depth?: number, searchVisibleIds?: Set<string>): FlatNode[];
/**
 * Compute the visible range of indices for the current scroll position.
 *
 * Returns start/end indices and the pixel offset for positioning.
 * Buffer items are included above and below the viewport to prevent
 * flashing during rapid scrolling.
 *
 * When containerHeight is 0 (unmeasured or jsdom), returns the full
 * range so all items render — virtual scrolling activates once the
 * container has a measured height.
 */
export declare function computeVisibleRange(scrollTop: number, containerHeight: number, totalCount: number, itemHeight?: number, bufferCount?: number): VisibleRange;
/**
 * Find the index of an item in the flat node list by ID.
 * Returns -1 if not found.
 */
export declare function findFlatNodeIndex(flatNodes: FlatNode[], itemId: string): number;
export interface UseVirtualScrollOptions {
    /** Flattened visible tree nodes. */
    flatNodes: FlatNode[];
    /** Ref to the scroll container element. */
    containerRef: {
        current: HTMLDivElement | null;
    };
    /** Virtual scroll configuration. */
    config?: VirtualScrollConfig;
}
export interface UseVirtualScrollResult {
    /** Subset of flatNodes currently visible in the viewport + buffer. */
    visibleNodes: FlatNode[];
    /** Total virtual height of the full tree in pixels. */
    totalHeight: number;
    /** Pixel offset for the spacer before visible items. */
    offsetY: number;
    /** Height in pixels for the spacer after visible items. */
    afterSpaceHeight: number;
    /** Scroll event handler to attach to the container. */
    onScroll: (e: Event) => void;
    /** Scroll the container to center a specific item index. */
    scrollToIndex: (index: number) => void;
    /** Number of items currently rendered. */
    renderedCount: number;
    /** Total number of items in the flattened tree. */
    totalCount: number;
    /** Whether virtual scrolling is active (container has measured height). */
    isActive: boolean;
}
/**
 * Preact hook that manages virtual scroll state.
 *
 * Observes the container element's height via ResizeObserver and
 * computes which items to render based on the current scroll position.
 *
 * When the container height is unmeasured (0), all items are returned
 * as visible — virtual scrolling activates once the browser reports
 * a real height. This handles initial render, jsdom tests, and SSR.
 */
export declare function useVirtualScroll({ flatNodes, containerRef, config, }: UseVirtualScrollOptions): UseVirtualScrollResult;
