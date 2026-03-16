/**
 * Call Graph — SVG box-and-line zone diagram.
 *
 * Zones rendered as rectangular boxes on a topology-aware grid,
 * connected by Bézier edges weighted by call traffic.
 * Zones expand on click to reveal file rows inside.
 * When expanded, file-level edges show which files bridge zones.
 */
import type { LoadedData, DetailItem, NavigateTo } from "../types.js";
interface CallGraphViewProps {
    data: LoadedData;
    onSelect: (detail: DetailItem | null) => void;
    selectedFile?: string | null;
    selectedZone?: string | null;
    navigateTo?: NavigateTo;
}
export declare function CallGraphView({ data, onSelect, navigateTo }: CallGraphViewProps): import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & {
    class: string;
}> | import("preact").VNode<import("preact").ClassAttributes<HTMLElement> & import("preact").HTMLAttributes<HTMLElement>>;
export {};
