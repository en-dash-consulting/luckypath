import type { TileType, Rotation } from "~/engine";
import { NORTH, EAST, SOUTH, WEST, getConnection } from "~/engine";
import { getEdgePoint } from "./board-utils";

/**
 * SVG preview of a single tile piece.
 *
 * Renders at any `size` — the SVG viewBox matches the given dimensions,
 * making this component usable in both desktop (64px) and mobile (40px)
 * inventory layouts.
 *
 * Extracted to its own file so that both TileInventory and MobileInventory
 * import from a neutral location rather than one depending on the other.
 */
export function TilePreview({ type, size, selected }: { type: TileType; size: number; selected?: boolean }) {
  const half = size / 2;
  const pad = 6;
  const pathColor = selected ? "#0d9488" : "#a7f3d0";
  const pathStroke = selected ? "#115e59" : "#14b8a6";
  const dotColor = selected ? "#134e4a" : "#0d9488";
  const bgColor = selected ? "#ccfbf1" : "#f0fdfa";
  const borderColor = selected ? "#5eead4" : "#d1d5db";

  const [sideA, sideB] = getConnection(type, 0 as Rotation);

  const [ax, ay] = getEdgePoint(sideA, 0, 0, size, pad);
  const [bx, by] = getEdgePoint(sideB, 0, 0, size, pad);

  const arrowSize = 5;
  const getArrow = (side: number, ex: number, ey: number): string => {
    switch (side) {
      case NORTH: return `M${ex - arrowSize},${ey + arrowSize} L${ex},${ey} L${ex + arrowSize},${ey + arrowSize}`;
      case SOUTH: return `M${ex - arrowSize},${ey - arrowSize} L${ex},${ey} L${ex + arrowSize},${ey - arrowSize}`;
      case EAST: return `M${ex - arrowSize},${ey - arrowSize} L${ex},${ey} L${ex - arrowSize},${ey + arrowSize}`;
      case WEST: return `M${ex + arrowSize},${ey - arrowSize} L${ex},${ey} L${ex + arrowSize},${ey + arrowSize}`;
      default: return "";
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={1} y={1} width={size - 2} height={size - 2} rx={8}
        fill={bgColor} stroke={borderColor} strokeWidth={1.5} />
      {type === "straight" ? (
        <>
          <line x1={ax} y1={ay} x2={bx} y2={by}
            stroke={pathColor} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
          <line x1={ax} y1={ay} x2={bx} y2={by}
            stroke={pathStroke} strokeWidth={5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d={`M${ax},${ay} Q${half},${half} ${bx},${by}`}
            fill="none" stroke={pathColor} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
          <path d={`M${ax},${ay} Q${half},${half} ${bx},${by}`}
            fill="none" stroke={pathStroke} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
      <path d={getArrow(sideA, ax, ay)} fill="none" stroke={dotColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={getArrow(sideB, bx, by)} fill="none" stroke={dotColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
