/**
 * Modal confirmation dialog for deleting PRD items.
 *
 * Renders a centered overlay dialog that warns users about deletion
 * consequences (including child items that will be removed) and
 * requires explicit confirmation before proceeding.
 */
import type { PRDItemData } from "./types.js";
export interface DeleteConfirmationProps {
    /** The item targeted for deletion. */
    item: PRDItemData;
    /** Called with the item ID when the user confirms deletion. */
    onConfirm: (id: string) => Promise<void>;
    /** Called when the user cancels (closes the dialog). */
    onCancel: () => void;
}
export declare function DeleteConfirmation({ item, onConfirm, onCancel }: DeleteConfirmationProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    onClick: (e: MouseEvent) => void;
    role: "dialog";
    "aria-modal": "true";
    "aria-labelledby": string;
}>;
