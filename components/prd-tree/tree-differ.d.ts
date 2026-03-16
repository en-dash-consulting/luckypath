/**
 * Structural sharing for PRD tree updates.
 *
 * When new PRD data arrives (from a fetch or WebSocket), this module diffs
 * the old and new trees and returns a structurally-shared copy where
 * unchanged items keep their original object references. This enables
 * Preact's memoized components to skip re-rendering unchanged subtrees.
 *
 * Algorithm: Walk old and new trees in parallel by item ID. For each item,
 * compare scalar fields. If a node and all its descendants are identical,
 * return the old reference. Otherwise, return a shallow copy with only
 * the changed children replaced.
 *
 * Complexity: O(N) where N is the total number of nodes in the tree.
 * Memory: Only allocates new objects along changed paths — unchanged
 * subtrees share memory with the previous render cycle.
 *
 * @see ./prd-tree.ts — memoized NodeRow component that benefits from this
 * @see ../../../views/prd.ts — PRDView that applies this on data updates
 */
import type { PRDItemData, PRDDocumentData } from "./types.js";
/**
 * Diff two item arrays and return a structurally-shared copy.
 *
 * For each item in `next`, looks up the corresponding item in `prev`
 * (by ID). If found and unchanged (including all descendants), the old
 * reference is reused. If the item changed or is new, a new object is
 * created with only the changed parts.
 *
 * Returns the original `prev` reference when nothing changed at all.
 */
export declare function diffItems(prev: PRDItemData[], next: PRDItemData[]): PRDItemData[];
/**
 * Diff two PRD documents and return a structurally-shared copy.
 *
 * The returned document reuses the old `items` reference if nothing
 * changed, enabling === checks in Preact components.
 */
export declare function diffDocument(prev: PRDDocumentData | null, next: PRDDocumentData): PRDDocumentData;
/**
 * Apply a partial update to a single item in the tree.
 *
 * Returns a structurally-shared copy where only the target item and
 * its ancestors are new objects. All other subtrees keep their old
 * references.
 *
 * Returns the original `items` reference if the target is not found.
 */
export declare function applyItemUpdate(items: PRDItemData[], itemId: string, updates: Partial<PRDItemData>): PRDItemData[];
/**
 * Remove an item from the tree by ID.
 *
 * Returns a structurally-shared copy. This is a re-export of the
 * existing `removeItemById` from tree-utils.ts for API consistency,
 * but consumers should prefer the tree-utils version directly.
 *
 * @see ./tree-utils.ts — removeItemById
 */
export { removeItemById } from "./tree-utils.js";
