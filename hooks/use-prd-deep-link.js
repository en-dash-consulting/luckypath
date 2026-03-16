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
import { useState, useEffect, useRef } from "preact/hooks";
import { findItemById, getAncestorIds } from "../components/prd-tree/tree-utils.js";
/**
 * Hook that resolves deep-link navigation for PRD tasks.
 *
 * Consumes the initialTaskId exactly once after data loads. If the
 * target exists, it expands ancestors, selects the item, and runs a
 * highlight animation. If not found, shows an error banner.
 */
export function usePRDDeepLink({ initialTaskId, loading, data, onSelectItem, }) {
    const [deepLinkError, setDeepLinkError] = useState(null);
    const [highlightedTaskId, setHighlightedTaskId] = useState(null);
    const [deepLinkExpandIds, setDeepLinkExpandIds] = useState(null);
    /** Whether the initial deep-link has been consumed. */
    const deepLinkConsumedRef = useRef(false);
    // Wrap onSelectItem in a ref to avoid re-triggering the effect
    const onSelectItemRef = useRef(onSelectItem);
    onSelectItemRef.current = onSelectItem;
    useEffect(() => {
        if (deepLinkConsumedRef.current || !initialTaskId || loading || !data)
            return;
        deepLinkConsumedRef.current = true;
        const item = findItemById(data.items, initialTaskId);
        if (!item) {
            setDeepLinkError(`Task "${initialTaskId}" not found`);
            // Clean URL back to /prd
            history.replaceState({ view: "prd", file: null, zone: null, runId: null, taskId: null }, "", "/prd");
            return;
        }
        // Expand ancestor nodes so the target is visible
        const ancestors = getAncestorIds(data.items, initialTaskId);
        if (ancestors.length > 0) {
            setDeepLinkExpandIds(new Set(ancestors));
        }
        // Select and highlight the item
        setHighlightedTaskId(initialTaskId);
        onSelectItemRef.current(item);
        // Clear highlight after animation completes
        const timer = setTimeout(() => setHighlightedTaskId(null), 3000);
        return () => clearTimeout(timer);
    }, [initialTaskId, loading, data]);
    return { deepLinkError, setDeepLinkError, highlightedTaskId, deepLinkExpandIds };
}
//# sourceMappingURL=use-prd-deep-link.js.map