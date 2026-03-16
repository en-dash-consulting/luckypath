/**
 * Tag and status facet filter chips for the PRD tree search.
 *
 * Renders toggleable chip rows below the search input so users can
 * narrow results by tag and/or status. Tag chips are populated
 * dynamically from the current PRD data; status chips use the
 * canonical status list.
 *
 * Tags use a searchable typeahead instead of a flat chip list to
 * handle PRDs with hundreds of unique tags. Selected tags appear as
 * dismissable chips; unselected tags are revealed via a text filter.
 *
 * Facets combine with AND logic: selecting a tag AND a status shows
 * only items that have that tag AND that status. Within the tag group,
 * AND logic applies (item must have ALL selected tags). Within the
 * status group, OR logic applies (item matches ANY selected status).
 *
 * @see ./tree-search.ts — SearchFacets type and searchTree integration
 * @see ./status-filter.ts — reuses status display config
 */
import type { ItemStatus } from "./types.js";
export interface FacetFilterProps {
    /** All unique tags found in the PRD (sorted). */
    availableTags: string[];
    /** Currently selected tag facets. */
    activeTags: Set<string>;
    /** Currently selected status facets. */
    activeStatuses: Set<ItemStatus>;
    /** Called when the set of active tags changes. */
    onTagsChange: (tags: Set<string>) => void;
    /** Called when the set of active statuses changes. */
    onStatusesChange: (statuses: Set<ItemStatus>) => void;
    /** Called to clear all facets. */
    onClearAll: () => void;
}
export declare function FacetFilter({ availableTags, activeTags, activeStatuses, onTagsChange, onStatusesChange, onClearAll, }: FacetFilterProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "group";
    "aria-label": string;
}>;
