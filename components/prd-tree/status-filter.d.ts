/**
 * Status filter controls for the PRD tree view.
 *
 * Renders a row of toggleable status chips that control which items
 * are visible in the tree. All statuses are enabled by default.
 * Quick filter presets provide one-click access to common combinations.
 */
import type { ItemStatus } from "./types.js";
/** All available statuses in display order. */
export declare const ALL_STATUSES: ItemStatus[];
export interface FilterPreset {
    /** Unique key for the preset. */
    key: string;
    /** Label shown on the button. */
    label: string;
    /** Tooltip describing the preset. */
    title: string;
    /** Statuses included in this preset. */
    statuses: ReadonlySet<ItemStatus>;
}
/** Predefined filter presets in display order. */
export declare const FILTER_PRESETS: readonly FilterPreset[];
/**
 * Determine which preset (if any) matches the current active statuses.
 * Returns the preset key or null if no preset matches exactly.
 */
export declare function activePresetKey(activeStatuses: Set<ItemStatus>): string | null;
export interface StatusFilterProps {
    /** Currently active (visible) statuses. */
    activeStatuses: Set<ItemStatus>;
    /** Called when the set of active statuses changes. */
    onChange: (statuses: Set<ItemStatus>) => void;
}
export declare function StatusFilter({ activeStatuses, onChange }: StatusFilterProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    role: "group";
    "aria-label": string;
}>;
/** Default set of visible statuses (active work: pending, in progress, failing, blocked). */
export declare function defaultStatusFilter(): Set<ItemStatus>;
