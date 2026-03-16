/**
 * Visual diff tree for pruning operations.
 *
 * Renders the full PRD tree with prunable items highlighted in red with
 * strikethrough styling, and shows before/after completion stats per epic.
 * Supports expand/collapse to let users drill into affected subtrees.
 *
 * Data flow:
 * 1. Parent provides `prunableIds` (Set<string>) from the prune preview endpoint
 * 2. Parent provides `epicImpact` with before/after stats per affected epic
 * 3. This component fetches the full PRD tree from /data/prd.json
 * 4. Each node is annotated as "prunable" or "affected-parent" based on the IDs
 */
export interface EpicImpact {
    id: string;
    title: string;
    before: {
        total: number;
        completed: number;
        pct: number;
    };
    after: {
        total: number;
        completed: number;
        pct: number;
    };
    removedCount: number;
}
export interface PruneDiffTreeProps {
    /** Set of all item IDs that will be pruned (includes descendants). */
    prunableIds: Set<string>;
    /** Per-epic before/after completion impact. */
    epicImpact: EpicImpact[];
    /** Callback when the tree data loads. */
    onLoad?: () => void;
}
export declare function PruneDiffTree({ prunableIds, epicImpact, onLoad }: PruneDiffTreeProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
