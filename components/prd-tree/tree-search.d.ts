/**
 * Pure search/filter functions for the PRD tree.
 *
 * Provides case-insensitive substring matching against item titles and
 * descriptions, with optional tag and status facet filters that narrow
 * results further. Returns both the set of matching item IDs and their
 * ancestor IDs (to preserve tree context in filtered views).
 *
 * @see ./prd-tree.ts — integrating component
 * @see ./virtual-scroll.ts — flattenVisibleTree respects search results
 */
import type { PRDItemData, ItemStatus } from "./types.js";
import type { ComponentChild } from "preact";
export interface TreeSearchResult {
    /** IDs of items whose title or description matched the query. */
    matchIds: Set<string>;
    /** IDs of ancestor nodes that should remain visible for tree context. */
    ancestorIds: Set<string>;
    /** Combined set: matchIds ∪ ancestorIds — all nodes to show. */
    visibleIds: Set<string>;
    /** IDs of all ancestors that should be auto-expanded to reveal matches. */
    expandIds: Set<string>;
    /** Total number of direct matches. */
    matchCount: number;
}
export interface SearchFacets {
    /** Active tag facets — item must have ALL of these tags (AND logic). */
    tags?: Set<string>;
    /** Active status facets — item must match ONE of these statuses (OR within group). */
    statuses?: Set<ItemStatus>;
}
/**
 * Search the PRD tree for items matching a query string and/or facet filters.
 *
 * Matching rules:
 * - Case-insensitive substring match against title and description
 * - Tag facets narrow results to items having ALL selected tags (AND)
 * - Status facets narrow results to items matching ANY selected status (OR)
 * - Text query and facets combine with AND logic
 * - Empty query with no facets returns an empty result (caller shows full tree)
 * - Ancestor nodes of matches are included in visibleIds/expandIds
 *
 * Complexity: O(N) where N = total tree nodes.
 */
export declare function searchTree(items: PRDItemData[], query: string, facets?: SearchFacets): TreeSearchResult;
/**
 * Collect all unique tags from the PRD tree, sorted alphabetically.
 * Used to populate tag facet chips dynamically.
 */
export declare function collectAllTags(items: PRDItemData[]): string[];
/**
 * Check if an item (or any descendant) is in the visible set.
 * Used by flattenVisibleTree when a search is active.
 */
export declare function itemMatchesSearch(item: PRDItemData, visibleIds: Set<string>): boolean;
/**
 * Highlight all occurrences of `query` within `text`, returning an array
 * of string and VNode fragments suitable for Preact rendering.
 *
 * Uses case-insensitive matching. Non-matching segments are plain strings;
 * matching segments are wrapped in `<mark class="prd-search-highlight">`.
 *
 * Returns `[text]` unchanged when query is empty.
 */
export declare function highlightSearchText(text: string, query: string): ComponentChild[];
