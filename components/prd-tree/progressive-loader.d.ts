/**
 * Progressive tree loading for large PRD datasets.
 *
 * Renders tree nodes in configurable chunks rather than all at once. A flat
 * "node budget" controls how many visible nodes are rendered: the tree is
 * walked in render order and items beyond the budget are excluded. Parents
 * whose children are partially truncated keep their structural position so
 * scroll position is stable.
 *
 * The module exposes:
 * - Pure functions for counting and slicing visible nodes (easily testable)
 * - A Preact hook (`useProgressiveLoader`) for chunk state management
 * - A `LoadMoreIndicator` component for the "load more" UI
 *
 * Search and filter operations always work on the **full** item tree —
 * progressive loading only limits the **rendering** pass, not the data.
 *
 * @see ./prd-tree.ts   — integrating component
 * @see ./compute.ts    — itemMatchesFilter used for visibility checks
 */
import type { VNode } from "preact";
import type { PRDItemData, ItemStatus } from "./types.js";
/** Default number of nodes to render per chunk. */
export declare const DEFAULT_CHUNK_SIZE = 50;
/**
 * Minimum item count before progressive loading activates.
 * Trees smaller than this render in full without any chunking UI.
 */
export declare const PROGRESSIVE_THRESHOLD = 50;
/**
 * Count visible nodes in a tree, respecting the status filter.
 *
 * A node is "visible" when it (or any descendant) matches the active status
 * filter — the same logic `itemMatchesFilter` uses. Each visible node
 * contributes 1 to the count, and visible children are counted recursively.
 *
 * Complexity: O(N) where N = total nodes in tree.
 */
export declare function countVisibleNodes(items: PRDItemData[], activeStatuses: Set<ItemStatus>): number;
/**
 * Result of a progressive tree slice operation.
 */
export interface ProgressiveSlice {
    /** Items to render (may be a subset of the original tree). */
    items: PRDItemData[];
    /** Number of visible nodes in this slice. */
    renderedCount: number;
    /** Total visible nodes in the unsliced tree. */
    totalCount: number;
}
/**
 * Slice a tree to fit within a node budget.
 *
 * Returns the original `items` array unchanged when the total visible count
 * fits within the limit (common case for small trees).
 *
 * @param items          Full PRD item tree
 * @param activeStatuses Status filter (from StatusFilter component)
 * @param limit          Maximum number of visible nodes to include
 * @returns Progressive slice with rendered/total counts
 */
export declare function sliceVisibleTree(items: PRDItemData[], activeStatuses: Set<ItemStatus>, limit: number): ProgressiveSlice;
export interface ProgressiveLoaderState {
    /** Current node rendering limit. */
    limit: number;
    /** Whether there are more nodes beyond the current limit. */
    hasMore: boolean;
    /** Load the next chunk of nodes. */
    loadMore: () => void;
    /** Load all remaining nodes at once. */
    loadAll: () => void;
    /** Whether a chunk load is in progress (brief transition state). */
    isLoading: boolean;
    /** Number of visible nodes that will be rendered. */
    renderedCount: number;
    /** Total visible nodes in the full tree. */
    totalCount: number;
    /** Whether progressive loading is active (tree exceeds threshold). */
    isActive: boolean;
}
/**
 * Manages progressive loading state for a tree of the given size.
 *
 * The hook auto-resets the limit when `totalCount` changes (e.g. after a
 * filter change or data refresh), ensuring the user always starts from a
 * reasonable chunk size.
 *
 * A brief `isLoading` transition (one frame) is triggered on `loadMore` /
 * `loadAll` to give the browser a paint opportunity before the potentially
 * heavy render of additional nodes.
 *
 * @param totalCount Total visible nodes (from countVisibleNodes)
 * @param chunkSize  Number of nodes per chunk (DEFAULT_CHUNK_SIZE)
 */
export declare function useProgressiveLoader(totalCount: number, chunkSize?: number): ProgressiveLoaderState;
export interface LoadMoreIndicatorProps {
    /** Number of nodes currently rendered. */
    renderedCount: number;
    /** Total visible nodes in the tree. */
    totalCount: number;
    /** Number of nodes to add per chunk. */
    chunkSize: number;
    /** Whether a load operation is in progress. */
    isLoading: boolean;
    /** Load the next chunk. */
    onLoadMore: () => void;
    /** Load all remaining nodes. */
    onLoadAll: () => void;
}
/**
 * "Load More" indicator shown below the tree when progressive loading is
 * active and there are more nodes to reveal.
 */
export declare function LoadMoreIndicator({ renderedCount, totalCount, chunkSize, isLoading, onLoadMore, onLoadAll, }: LoadMoreIndicatorProps): VNode;
