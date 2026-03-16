/**
 * Merge preview panel for PRD items.
 *
 * Shows a preview of what will happen when items are consolidated:
 * - Which item survives (the target)
 * - Which items are absorbed (removed)
 * - Combined acceptance criteria, tags, description
 * - Children that will be reparented
 * - Dependencies that will be rewritten
 *
 * Lets the user optionally override the merged title/description
 * before confirming.
 */
import type { PRDItemData } from "./types.js";
export interface MergePreviewProps {
    /** All selected items to merge (must be siblings at the same level). */
    selectedItems: PRDItemData[];
    /** Called after a successful merge (to refresh data). */
    onMergeComplete: () => void;
    /** Called to close the preview without merging. */
    onCancel: () => void;
}
export declare function MergePreview({ selectedItems, onMergeComplete, onCancel }: MergePreviewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
