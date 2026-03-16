/**
 * usePanZoom — SVG viewport panning and zooming hook.
 *
 * Handles:
 * - Trackpad/mouse wheel scrolling (pan) and pinch-to-zoom (ctrl+wheel)
 * - Mouse-drag panning on the SVG background
 * - Programmatic zoom-in, zoom-out, and fit-to-content controls
 */
import type { RefObject } from "preact";
export interface ViewBox {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface PanZoomState {
    viewBox: ViewBox;
    panning: boolean;
    svgRef: RefObject<SVGSVGElement>;
    handleWheel: (e: WheelEvent) => void;
    startPan: (e: MouseEvent) => void;
    movePan: (e: MouseEvent) => void;
    endPan: () => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleFit: () => void;
}
/**
 * Hook that manages SVG pan/zoom state and interaction handlers.
 *
 * @param fitVB - The "fit to content" viewBox dimensions
 */
export declare function usePanZoom(fitVB: ViewBox): PanZoomState;
