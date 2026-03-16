/**
 * Pruning interface for PRD items.
 *
 * Provides a dedicated pruning section with:
 *
 * 1. **Criteria configuration**: Age thresholds and completion status filters
 *    let users control which items are eligible for pruning.
 * 2. **Dry-run preview**: Shows exactly which items would be pruned without
 *    executing, including estimated storage savings.
 * 3. **Confirmation flow**: Multi-step confirmation with irreversibility warning,
 *    optional backup, and `confirmCount` staleness protection.
 * 4. **Result display**: Shows pruned count, archive location, and backup path.
 *
 * The criteria are sent as query params to GET /api/rex/prune/preview and as
 * body fields to POST /api/rex/prune, so the server handles all filtering.
 */
export interface PruneConfirmationProps {
    /** Called after a successful prune (to refresh data). */
    onPruneComplete: () => void;
    /** Called to close the panel without pruning. */
    onCancel: () => void;
}
export declare function PruneConfirmation({ onPruneComplete, onCancel }: PruneConfirmationProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
