/**
 * PRD deep-link resolution hook.
 *
 * Handles auto-selection and highlighting of a specific task when the
 * view loads with an initialTaskId (from a shareable URL like /prd/:id).
 *
 * Responsibilities:
 * - Finds the target item in the tree once data is loaded
 * - Expands ancestor nodes so the target is visible
 * - Selects and highlights the target with a timed animation
 * - Shows an error banner if the task ID is not found
 * - Cleans up the URL on error (reverts to /prd)
 *
 * Extracted from PRDView to isolate deep-link side effects from the
 * component's render and CRUD logic.
 */
import type { PRDDocumentData, PRDItemData } from "../components/prd-tree/types.js";
export interface PRDDeepLinkDeps {
    /** Task ID from the URL, or null if no deep link. */
    initialTaskId?: string | null;
    /** True while the initial data fetch is in flight. */
    loading: boolean;
    /** Current PRD document data. */
    data: PRDDocumentData | null;
    /** Callback to select/open a PRD item. */
    onSelectItem: (item: PRDItemData) => void;
}
export interface PRDDeepLinkState {
    /** Error message when the deep-linked task is not found. */
    deepLinkError: string | null;
    /** Dismiss the deep-link error banner. */
    setDeepLinkError: (error: string | null) => void;
    /** Task ID currently highlighted by the deep-link animation. */
    highlightedTaskId: string | null;
    /** IDs to force-expand in the tree (ancestors of the deep-linked task). */
    deepLinkExpandIds: Set<string> | null;
}
/**
 * Hook that resolves deep-link navigation for PRD tasks.
 *
 * Consumes the initialTaskId exactly once after data loads. If the
 * target exists, it expands ancestors, selects the item, and runs a
 * highlight animation. If not found, shows an error banner.
 */
export declare function usePRDDeepLink({ initialTaskId, loading, data, onSelectItem, }: PRDDeepLinkDeps): PRDDeepLinkState;
