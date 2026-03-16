/**
 * Reorganize panel — slide-out panel for reviewing and applying
 * structural and LLM-powered reorganization proposals.
 *
 * Fetches proposals from /api/rex/reorganize and allows selective
 * or bulk application via /api/rex/reorganize/apply.
 */
interface ReorganizePanelProps {
    open: boolean;
    onClose: () => void;
    onApplied?: () => void;
}
export declare function ReorganizePanel({ open, onClose, onApplied }: ReorganizePanelProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}> | null;
export {};
