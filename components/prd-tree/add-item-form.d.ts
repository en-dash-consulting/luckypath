/**
 * Add item form for creating new PRD items.
 *
 * Provides a form with type selection, title input, optional description,
 * priority, and parent constraint. The form validates level/parent
 * relationships and provides real-time feedback.
 */
import type { PRDItemData } from "./types.js";
export interface AddItemFormProps {
    /** All items in the document, for parent selection. */
    allItems: PRDItemData[];
    /** Called when the form is submitted. */
    onSubmit: (data: AddItemInput) => Promise<void>;
    /** Called when the form is cancelled/closed. */
    onCancel: () => void;
    /** Pre-selected parent ID (e.g., from right-clicking an item). */
    defaultParentId?: string | null;
}
export interface AddItemInput {
    title: string;
    level?: string;
    parentId?: string;
    description?: string;
    priority?: string;
    tags?: string[];
    acceptanceCriteria?: string[];
}
export declare function AddItemForm({ allItems, onSubmit, onCancel, defaultParentId }: AddItemFormProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    onSubmit: (e: Event) => Promise<void>;
}>;
