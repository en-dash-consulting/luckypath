/**
 * Facet filter state management with URL hash persistence.
 *
 * Manages active tag and status facets, syncing state to the URL hash
 * so filtered views are shareable. Reads initial state from the URL
 * on mount and writes back on every change.
 *
 * URL format: #facets=tag:foo,tag:bar,status:pending,status:blocked
 * Combined with existing hash params using & separator.
 *
 * @see ../components/prd-tree/facet-filter.ts — FacetFilter component
 * @see ../components/prd-tree/tree-search.ts — SearchFacets type
 */
import type { ItemStatus } from "../components/prd-tree/types.js";
import type { SearchFacets } from "../components/prd-tree/tree-search.js";
export interface FacetState {
    /** Currently active tag facets. */
    activeTags: Set<string>;
    /** Currently active status facets (for search narrowing, not the tree-level filter). */
    activeSearchStatuses: Set<ItemStatus>;
    /** Combined facets object for searchTree(). null when no facets are active. */
    searchFacets: SearchFacets | undefined;
    /** Update active tags. */
    setActiveTags: (tags: Set<string>) => void;
    /** Update active search statuses. */
    setActiveSearchStatuses: (statuses: Set<ItemStatus>) => void;
    /** Clear all facets. */
    clearFacets: () => void;
    /** Whether any facet is currently active. */
    hasFacets: boolean;
}
export declare function useFacetState(): FacetState;
