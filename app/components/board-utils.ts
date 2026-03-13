/**
 * Shared board rendering constants and helpers used by both
 * GameBoard and TileInventory components.
 *
 * Centralising these values ensures the two primary board components
 * stay visually consistent and creates structural cohesion within the
 * core-game-board zone.
 */
import type { Direction, Biome, BiomeCanvasColors } from "~/engine";
import { NORTH, EAST, SOUTH, WEST, BIOME_THEMES } from "~/engine";

/** Pixel size of one board cell. */
export const CELL_SIZE = 80;

/** Padding around the board canvas. */
export const BOARD_PADDING = 20;

/** Scale factor relative to the original 64px cell design. */
export const SCALE = CELL_SIZE / 64;

/**
 * Returns the (x, y) pixel coordinate at the edge midpoint for a given
 * direction within a cell whose top-left corner is (cellX, cellY).
 *
 * Used by both GameBoard (canvas) and TileInventory (SVG) when drawing
 * tile connection endpoints.
 */
/**
 * Retrieve the canvas color palette for a given biome.
 *
 * This is a rendering concern (canvas-specific color lookup),
 * so it lives here rather than in the engine barrel.
 */
export function getBiomeCanvasColors(biome: Biome): BiomeCanvasColors {
  return BIOME_THEMES[biome].canvas;
}

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
