/**
 * Inline status picker — compact popover for changing item status.
 *
 * Appears anchored below the status action button in a tree node row.
 * Designed to replace the old right-click context menu pattern with a
 * predictable, keyboard-accessible inline control.
 *
 * @see ./prd-tree.ts — PRDTree manages picker state at the tree level
 */
import type { ItemStatus } from "./types.js";
export interface InlineStatusPickerProps {
    /** Current status of the item. */
    currentStatus: ItemStatus;
    /** Viewport-relative position to anchor the picker. */
    anchorRect: {
        left: number;
        top: number;
        bottom: number;
    };
    /** Called when the user selects a new status. */
    onSelect: (status: ItemStatus) => void;
    /** Called when the picker should close (Escape, outside click). */
    onClose: () => void;
}
export declare function InlineStatusPicker({ currentStatus, anchorRect, onSelect, onClose }: InlineStatusPickerProps): import("preact").VNode<import("preact").ClassAttributes<HTMLDivElement> & {
    ref: import("preact").RefObject<HTMLDivElement>;
    class: string;
    style: Record<string, string>;
    role: "listbox";
    "aria-label": string;
}>;
