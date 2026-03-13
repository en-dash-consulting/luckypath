import type { LevelData } from "./types";

// Utility to create a position key for Map storage
export function posKey(row: number, col: number): string {
  return `${row},${col}`;
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
