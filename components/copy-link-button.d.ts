/**
 * CopyLinkButton — reusable component for generating and copying shareable deep-links.
 *
 * Builds a full URL from the current origin + the provided path, copies it to
 * the clipboard, and shows brief visual feedback ("Copied!").
 *
 * Used across:
 * - PRD item detail panels (task, feature, epic, subtask)
 * - Hench run detail views
 * - RexTaskLink context menus
 */
export interface CopyLinkButtonProps {
    /** Path portion of the shareable URL, e.g. "/prd/abc123" or "/hench-runs/xyz". */
    path: string;
    /** Optional CSS class to add. */
    class?: string;
    /** Label text. Default: "Copy Link" */
    label?: string;
    /** Compact variant — smaller text, icon-only on narrow screens. Default: false */
    compact?: boolean;
}
/** Build a full shareable URL from a path. Uses the current origin. */
export declare function buildShareableUrl(path: string): string;
export declare function CopyLinkButton({ path, class: className, label, compact, }: CopyLinkButtonProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    onClick: (e: MouseEvent) => void;
    title: string;
    "aria-label": string;
    type: string;
}>;
