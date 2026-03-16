/**
 * Global search overlay — Ctrl+K / Cmd+K to open.
 *
 * Features:
 * - Full-text search against the /api/search endpoint
 * - Filter by item type (epic, feature, task, subtask)
 * - Filter by status (pending, in_progress, completed, blocked)
 * - Filter by priority (critical, high, medium, low)
 * - Search term highlighting with context snippets
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 *
 * @module viewer/components/search-overlay
 */
import type { NavigateTo } from "../types.js";
export interface SearchOverlayProps {
    visible: boolean;
    onClose: () => void;
    navigateTo: NavigateTo;
}
export declare function SearchOverlay({ visible, onClose, navigateTo }: SearchOverlayProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "dialog";
    "aria-label": string;
    "aria-modal": "true";
    onClick: (e: MouseEvent) => void;
}> | null;
/**
 * Hook to register the global Ctrl+K / Cmd+K shortcut.
 * Returns [isOpen, open, close] controls.
 */
export declare function useSearchOverlay(): [boolean, () => void, () => void];
