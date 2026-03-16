import type { Zone, ZoneCrossing } from "../external.js";
import type { NavigateTo } from "../types.js";
export interface ZoneSlideoutProps {
    /** Zone to display, or null to hide the panel. */
    zone: Zone | null;
    /** All crossings for computing dependencies. */
    crossings: ZoneCrossing[];
    /** Full zone list for color lookup and dependency name resolution. */
    allZones: Zone[];
    /** Close the slideout. */
    onClose: () => void;
    /** Navigate to a file when clicked. */
    onFileClick?: (path: string) => void;
    /** Navigate to a different view. */
    navigateTo?: NavigateTo;
}
export declare function ZoneSlideout({ zone, crossings, allZones, onClose, onFileClick, navigateTo, }: ZoneSlideoutProps): import("preact").VNode<import("preact").Attributes> | null;
