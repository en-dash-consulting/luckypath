/**
 * useZoneDrag — Zone box drag-and-drop positioning hook.
 *
 * Handles dragging zone boxes within the SVG diagram. Tracks drag offsets
 * per zone and distinguishes between click (toggle) and drag gestures.
 */
import { useState, useCallback, useRef } from "preact/hooks";
/**
 * Hook that manages zone box dragging within the SVG diagram.
 *
 * @param svgRef - Ref to the SVG element for coordinate conversion
 * @param viewBox - Current viewBox for screen-to-SVG coordinate scaling
 */
export function useZoneDrag(svgRef, viewBox) {
    const [dragOffsets, setDragOffsets] = useState(new Map());
    const zoneDrag = useRef(null);
    const isDragging = useCallback(() => zoneDrag.current !== null, []);
    const startDrag = useCallback((zoneId, e) => {
        const off = dragOffsets.get(zoneId) ?? { dx: 0, dy: 0 };
        zoneDrag.current = {
            zoneId,
            startX: e.clientX,
            startY: e.clientY,
            origDx: off.dx,
            origDy: off.dy,
            moved: false,
        };
    }, [dragOffsets]);
    const moveDrag = useCallback((e) => {
        if (!zoneDrag.current || !svgRef.current)
            return;
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = viewBox.w / rect.width;
        const scaleY = viewBox.h / rect.height;
        const dx = (e.clientX - zoneDrag.current.startX) * scaleX;
        const dy = (e.clientY - zoneDrag.current.startY) * scaleY;
        if (!zoneDrag.current.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
            zoneDrag.current.moved = true;
        }
        if (zoneDrag.current.moved) {
            const zid = zoneDrag.current.zoneId;
            const newDx = zoneDrag.current.origDx + dx;
            const newDy = zoneDrag.current.origDy + dy;
            setDragOffsets((prev) => {
                const next = new Map(prev);
                next.set(zid, { dx: newDx, dy: newDy });
                return next;
            });
        }
    }, [svgRef, viewBox.w, viewBox.h]);
    const endDrag = useCallback(() => {
        if (!zoneDrag.current)
            return null;
        const clickedZoneId = zoneDrag.current.moved ? null : zoneDrag.current.zoneId;
        zoneDrag.current = null;
        return clickedZoneId;
    }, []);
    return { dragOffsets, isDragging, startDrag, moveDrag, endDrag };
}
//# sourceMappingURL=use-zone-drag.js.map