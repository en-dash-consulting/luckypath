/**
 * Shared tree traversal utilities for browser-side PRD code.
 *
 * These operate on the viewer's PRDItemData type (which mirrors the
 * canonical Rex types but is duplicated intentionally for browser bundling).
 * Previously, each viewer file that needed tree search had its own copy.
 *
 * @see ./types.ts — PRDItemData definition
 * @see packages/rex/src/tree.ts — canonical server-side equivalents
 */
import type { PRDItemData } from "./types.js";
/**
 * Walk the tree to find an item by ID.
 * Returns the item or null if not found.
 */
export declare function findItemById(items: PRDItemData[], id: string): PRDItemData | null;
/**
 * Count total descendants (children, grandchildren, etc.) of an item.
 * Returns 0 if the item has no children.
 */
export declare function countDescendants(item: PRDItemData): number;
/**
 * Collect the IDs of all ancestors of the target item (excluding the target itself).
 * Returns an empty array if the target is not found or is a root item.
 */
export declare function getAncestorIds(items: PRDItemData[], targetId: string): string[];
/**
 * Collect the IDs of an item and all its descendants (children, grandchildren, etc.).
 * Returns a Set containing the item's own ID plus every descendant ID.
 */
export declare function collectSubtreeIds(item: PRDItemData): Set<string>;
/**
 * Immutably remove an item by ID from a tree, returning a new array.
 * If the item is found, it and all its descendants are excluded.
 * Returns the original `items` reference when nothing changed (structural sharing).
 * Parent objects are shallow-copied only along the path to the removed item.
 */
export declare function removeItemById(items: PRDItemData[], id: string): PRDItemData[];
