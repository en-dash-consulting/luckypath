/**
 * Pure computation functions for PRD tree statistics.
 * No UI dependencies — easily testable.
 */
import type { PRDItemData, BranchStats, ItemStatus } from "./types.js";
/**
 * Compute stats for a list of items, counting only tasks and subtasks
 * (matching Rex's computeStats behavior).
 */
export declare function computeBranchStats(items: PRDItemData[]): BranchStats;
/**
 * Compute completion ratio (0–1) from branch stats.
 * Deleted items are already excluded from total, so the ratio
 * accurately reflects progress of active items only.
 */
export declare function completionRatio(stats: BranchStats): number;
/** Count direct children by status. */
export declare function countChildStatuses(children: PRDItemData[]): Record<ItemStatus, number>;
/**
 * Check if an item or any of its descendants match the status filter.
 * Container items (epics/features) are shown if any descendant matches.
 */
export declare function itemMatchesFilter(item: PRDItemData, activeStatuses: Set<ItemStatus>): boolean;
/**
 * Return a filtered copy of the item tree, keeping only nodes whose status
 * is in `activeStatuses` or that have at least one visible descendant.
 * Parent nodes that survive only because of their children retain only the
 * matching subset in their `children` array.
 */
export declare function filterTree(items: PRDItemData[], activeStatuses: Set<ItemStatus>): PRDItemData[];
/** Format a compact timestamp from ISO string. */
export declare function formatTimestamp(iso: string): string;
