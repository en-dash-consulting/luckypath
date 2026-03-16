/**
 * useZoneDrag — Zone box drag-and-drop positioning hook.
 *
 * Handles dragging zone boxes within the SVG diagram. Tracks drag offsets
 * per zone and distinguishes between click (toggle) and drag gestures.
 */
import type { RefObject } from "preact";
import type { ViewBox } from "./use-pan-zoom.js";
export interface ZoneDragState {
    /** Per-zone position offsets from drag operations */
    dragOffsets: Map<string, {
        dx: number;
        dy: number;
    }>;
    /** Whether a zone drag is currently active */
    isDragging: () => boolean;
    /** Start a zone drag from mousedown on a zone box */
    startDrag: (zoneId: string, e: MouseEvent) => void;
    /** Continue a zone drag during mousemove */
    moveDrag: (e: MouseEvent) => void;
    /** End a zone drag on mouseup, returning the zone ID if it was a click (not drag) */
    endDrag: () => string | null;
}
/**
 * Hook that manages zone box dragging within the SVG diagram.
 *
 * @param svgRef - Ref to the SVG element for coordinate conversion
 * @param viewBox - Current viewBox for screen-to-SVG coordinate scaling
 */
export declare function useZoneDrag(svgRef: RefObject<SVGSVGElement>, viewBox: ViewBox): ZoneDragState;
