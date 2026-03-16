/**
 * Execution panel — epic-by-epic execution controls and progress display.
 *
 * Provides a start button, live progress bars, pause/resume controls,
 * and per-epic status indicators. Polls execution status and listens
 * for WebSocket updates.
 */
export interface ExecutionPanelProps {
    /** Callback when execution changes PRD state (triggers dashboard refresh). */
    onPrdChanged?: () => void;
}
export declare function ExecutionPanel({ onPrdChanged }: ExecutionPanelProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
