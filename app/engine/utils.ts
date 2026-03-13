import type { Direction, LevelData } from "./types";
import { NORTH, SOUTH, EAST, WEST } from "./types";

// Utility to create a position key for Map storage
export function posKey(row: number, col: number): string {
  return `${row},${col}`;
}

/**
 * Returns the (x, y) coordinate at the edge midpoint for a given direction
 * within a cell whose top-left corner is (cellX, cellY).
 *
 * This function is **coordinate-system agnostic** — it works in any 2D space
 * (canvas pixels, SVG viewBox units, etc.) as long as the caller passes a
 * consistent `cellSize`. GameBoard uses it with CELL_SIZE for canvas rendering;
 * TilePreview uses it with the SVG viewBox size for SVG rendering.
 */
export function getEdgePoint(
  side: Direction,
  cellX: number,
  cellY: number,
  cellSize: number,
  inset = 4,
): [number, number] {
  const cx = cellX + cellSize / 2;
  const cy = cellY + cellSize / 2;
  switch (side) {
    case NORTH:
      return [cx, cellY + inset];
    case SOUTH:
      return [cx, cellY + cellSize - inset];
    case EAST:
      return [cellX + cellSize - inset, cy];
    case WEST:
      return [cellX + inset, cy];
  }
}

/**
 * Returns true if a cell is forbidden for tile placement.
 *
 * A cell is forbidden if it is the start, goal, or an obstacle position.
 * This is the single source of truth for the placement constraint — used by
 * both the game-state core (placeTile / moveTile) and the session layer.
 */
export function isCellForbidden(level: LevelData, row: number, col: number): boolean {
  if (row === level.start.row && col === level.start.col) return true;
  if (row === level.goal.row && col === level.goal.col) return true;
  return level.obstacles.some((o) => o.row === row && o.col === col);
}
