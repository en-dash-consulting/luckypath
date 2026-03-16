import type { Zone, ZoneCrossing } from "../../external.js";
/**
 * Zone Map - A hierarchical visualization of zones and their connections.
 * Shows zones as grouped boxes with connection lines between them.
 */
interface ZoneMapProps {
    zones: Zone[];
    crossings: ZoneCrossing[];
    selectedZone?: string | null;
    onZoneClick?: (zoneId: string) => void;
}
export declare function ZoneMap({ zones, crossings, selectedZone, onZoneClick }: ZoneMapProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
/**
 * Zone Detail Popup - Shows detailed info when a zone is selected.
 */
interface ZoneDetailProps {
    zone: Zone;
    crossings: ZoneCrossing[];
    allZones: Zone[];
    onClose: () => void;
    onFileClick?: (path: string) => void;
}
export declare function ZoneDetail({ zone, crossings, allZones, onClose, onFileClick }: ZoneDetailProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
export {};
