/**
 * Zones — SVG box-and-line zone diagram with slideout details.
 *
 * Zones rendered as rectangular boxes on a topology-aware grid,
 * connected by Bézier edges weighted by call traffic.
 * Zones expand on click to reveal file rows inside.
 * When expanded, file-level edges show which files bridge zones.
 * Clicking a zone opens a slideout panel with details.
 */
import type { LoadedData, DetailItem, NavigateTo } from "../types.js";
import type { Zone, ZoneCrossing } from "../external.js";
import type { ZoneData, FlowEdge, ZoneBreadcrumb } from "./zone-types.js";
export type { ZoneData, BoxRect, FlowEdge, FileConnectionMap, FileToFileMap, ZoneBreadcrumb } from "./zone-types.js";
interface ZonesViewProps {
    data: LoadedData;
    onSelect: (detail: DetailItem | null) => void;
    navigateTo?: NavigateTo;
}
/**
 * Convert raw Zone sub-zones into ZoneData for drill-down display.
 * Uses zone metadata only (file counts, descriptions) since full call
 * graph enrichment is scoped to the top-level analysis.
 *
 * @internal Exported for testing.
 */
export declare function convertSubZones(subZones: Zone[]): ZoneData[];
/**
 * Convert ZoneCrossing[] to FlowEdge[] (aggregate by zone pair).
 *
 * @internal Exported for testing.
 */
export declare function convertCrossings(crossings?: ZoneCrossing[]): FlowEdge[];
/**
 * Drill-down breadcrumb trail rendered above the zone diagram.
 *
 * Hidden at root level (drillPath has only the root entry).
 * Clicking a crumb navigates back to that level by truncating the drill path.
 *
 * @internal Exported for testing.
 */
export declare function ZoneBreadcrumbNav({ drillPath, onNavigate, }: {
    drillPath: ZoneBreadcrumb[];
    onNavigate: (depth: number) => void;
}): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
    "aria-label": string;
}> | null;
export declare function ZonesView({ data, onSelect, navigateTo }: ZonesViewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & import("preact").HTMLAttributes<HTMLElement>> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}>;
