/**
 * Persistent status filter state for the PRD tree.
 *
 * Stores the active status filter selection in a module-level variable
 * so it survives component mount/unmount cycles (e.g. when the user
 * navigates from the PRD tree to the Rex Dashboard and back).
 *
 * The hook returns the current state and a setter, mirroring useState.
 */
import { useState, useCallback } from "preact/hooks";
import { defaultStatusFilter } from "../components/prd-tree/status-filter.js";
// ── Module-level persistent state ────────────────────────────────────
//
// This variable outlives any single component instance. When the PRD
// view unmounts (e.g. navigating to the dashboard) and remounts, the
// hook reads from here instead of resetting to the default.
let persistedStatuses = null;
/** Get the persisted filter state, or the default if none has been set. */
function getPersistedStatuses() {
    return persistedStatuses ?? defaultStatusFilter();
}
/**
 * Hook that provides filter state which persists across view switches.
 *
 * On first mount (or after a full page reload), the default "Active Work"
 * filter is used. Subsequent mounts within the same page session restore
 * the last selection.
 */
export function usePersistentFilter() {
    const [activeStatuses, setActiveStatusesLocal] = useState(getPersistedStatuses);
    const setActiveStatuses = useCallback((statuses) => {
        persistedStatuses = statuses;
        setActiveStatusesLocal(statuses);
    }, []);
    return { activeStatuses, setActiveStatuses };
}
//# sourceMappingURL=use-persistent-filter.js.map