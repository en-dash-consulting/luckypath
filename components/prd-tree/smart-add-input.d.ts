/**
 * Smart add input — natural language input with debounced proposal generation.
 *
 * Provides a text input field that sends debounced requests to the
 * smart-add-preview API endpoint. Displays loading states, structured
 * proposal previews with hierarchy, and confidence indicators.
 * Includes context selection (scope proposals under an epic/feature),
 * real-time character count, and example prompts for better input.
 * Proposals can be sent to the ProposalEditor for review or accepted directly.
 */
export interface SmartAddInputProps {
    /** Called when proposals are accepted and PRD should be refreshed. */
    onPrdChanged: () => void;
    /** When true, renders in a compact layout suitable for dashboard embedding. */
    compact?: boolean;
}
export declare function SmartAddInput({ onPrdChanged, compact }: SmartAddInputProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
