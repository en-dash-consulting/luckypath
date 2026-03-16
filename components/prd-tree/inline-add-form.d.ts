/**
 * Inline add form for creating child items directly within the PRD tree.
 *
 * Renders a lightweight form below a parent node, auto-inferring the child
 * level from the parent. Supports title, description, and priority fields
 * with keyboard shortcuts (Enter to submit, Escape to cancel).
 */
import type { ItemLevel } from "./types.js";
export interface InlineAddFormProps {
    /** The level of the parent item (used to infer child level). */
    parentLevel: ItemLevel;
    /** The ID of the parent item. */
    parentId: string;
    /** Tree depth for indentation alignment. */
    depth: number;
    /** Called when the form is submitted. */
    onSubmit: (data: InlineAddInput) => Promise<void>;
    /** Called when the form is cancelled. */
    onCancel: () => void;
}
export interface InlineAddInput {
    title: string;
    parentId: string;
    level: ItemLevel;
    description?: string;
    priority?: string;
}
export declare function InlineAddForm({ parentLevel, parentId, depth, onSubmit, onCancel }: InlineAddFormProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    style: string;
    onKeyDown: (e: KeyboardEvent) => void;
}> | null;
