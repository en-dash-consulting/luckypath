/**
 * Proposal editor — editable tree for reviewing and modifying proposals
 * before accepting them into the PRD.
 *
 * Provides inline editing for titles, descriptions, and metadata.
 * Each node (epic/feature/task) can be independently selected or deselected.
 * Validates that selected items have non-empty titles before acceptance.
 */
export interface ProposalEditorProps {
    /** Proposals to edit — the raw data from analysis. */
    proposals: RawProposal[];
    /** Called when edited proposals are accepted and PRD should be refreshed. */
    onAccepted: () => void;
    /** Called to close the editor without accepting. */
    onCancel: () => void;
}
/** Raw proposal shape from the analyze endpoint. */
export interface RawProposal {
    epic: {
        title: string;
        source: string;
        description?: string;
    };
    features: RawProposalFeature[];
}
interface RawProposalFeature {
    title: string;
    source: string;
    description?: string;
    tasks: RawProposalTask[];
}
interface RawProposalTask {
    title: string;
    source: string;
    sourceFile: string;
    description?: string;
    acceptanceCriteria?: string[];
    priority?: string;
    tags?: string[];
}
export declare function ProposalEditor({ proposals: rawProposals, onAccepted, onCancel }: ProposalEditorProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};
