/**
 * Persistent status filter state for the PRD tree.
 *
 * Stores the active status filter selection in a module-level variable
 * so it survives component mount/unmount cycles (e.g. when the user
 * navigates from the PRD tree to the Rex Dashboard and back).
 *
 * The hook returns the current state and a setter, mirroring useState.
 */
import type { ItemStatus } from "../components/prd-tree/types.js";
export interface PersistentFilterState {
    /** Currently active (visible) statuses. */
    activeStatuses: Set<ItemStatus>;
    /** Update the active statuses (also persists across remounts). */
    setActiveStatuses: (statuses: Set<ItemStatus>) => void;
}
/**
 * Hook that provides filter state which persists across view switches.
 *
 * On first mount (or after a full page reload), the default "Active Work"
 * filter is used. Subsequent mounts within the same page session restore
 * the last selection.
 */
export declare function usePersistentFilter(): PersistentFilterState;
