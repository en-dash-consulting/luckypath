/**
 * Batch import panel — upload or paste multiple ideas for consolidated
 * smart-add processing.
 *
 * Supports:
 * - File uploads (drag & drop or file picker): text, markdown, JSON
 * - Manual text entries with per-entry format selection
 * - Expandable file preview with metadata (lines, words, size)
 * - Stage-based progress indicator during processing
 * - Consolidated proposal preview with confidence scoring
 * - Hands off to ProposalEditor for review before acceptance
 */
export interface BatchImportPanelProps {
    /** Called when proposals are accepted and PRD should be refreshed. */
    onPrdChanged: () => void;
}
/** An individual item queued for batch processing. */
export interface BatchItem {
    id: string;
    content: string;
    format: "text" | "markdown" | "json";
    source: string;
}
export declare function BatchImportPanel({ onPrdChanged }: BatchImportPanelProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export interface BatchItemRowProps {
    item: BatchItem;
    onUpdate: (id: string, updates: Partial<BatchItem>) => void;
    onRemove: (id: string) => void;
}
export declare function BatchItemRow({ item, onUpdate, onRemove }: BatchItemRowProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
