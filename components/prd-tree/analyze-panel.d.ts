/**
 * Analyze panel — triggers Rex analysis and displays proposals.
 *
 * Provides a button to trigger analysis, shows real-time progress,
 * displays resulting proposals, and allows accepting them into the PRD.
 */
export interface AnalyzePanelProps {
    /** Called when proposals are accepted and PRD should be refreshed. */
    onPrdChanged: () => void;
}
export declare function AnalyzePanel({ onPrdChanged }: AnalyzePanelProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
