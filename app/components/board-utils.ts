/**
 * Shared board rendering constants and helpers used by GameBoard.
 *
 * Centralising these values ensures the board rendering components
 * stay visually consistent. This module is internal to the
 * game-board-rendering zone — external consumers should import
 * from the GameBoard component or the engine barrel instead.
 */
import type { Biome, BiomeCanvasColors } from "~/engine";
import { BIOME_THEMES } from "~/engine";

/** Pixel size of one board cell. */
export const CELL_SIZE = 80;

/** Padding around the board canvas. */
export const BOARD_PADDING = 20;

/** Original tile artwork dimension (pixels). */
const TILE_ARTWORK_SIZE = 64;

/** Scale factor relative to the original tile artwork design. */
export const SCALE = CELL_SIZE / TILE_ARTWORK_SIZE;

/**
 * Retrieve the canvas color palette for a given biome.
 *
 * This is a rendering concern (canvas-specific color lookup),
 * so it lives here rather than in the engine barrel.
 */
export function getBiomeCanvasColors(biome: Biome): BiomeCanvasColors {
  return BIOME_THEMES[biome].canvas;
}
