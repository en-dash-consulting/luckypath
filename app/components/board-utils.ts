/**
 * Shared board rendering constants and helpers used by GameBoard.
 *
 * Centralising these values ensures the board rendering components
 * stay visually consistent. This module is internal to the
 * game-board-rendering zone — external consumers should import
 * from the GameBoard component or the engine barrel instead.
 */
/** Pixel size of one board cell. */
export const CELL_SIZE = 80;

/** Padding around the board canvas. */
export const BOARD_PADDING = 20;

/** Original tile artwork dimension (pixels). */
const TILE_ARTWORK_SIZE = 64;

/** Scale factor relative to the original tile artwork design. */
export const SCALE = CELL_SIZE / TILE_ARTWORK_SIZE;

// Re-export for board-zone consumers — canonical implementation lives in engine/biome-theme.ts.
export { getBiomeCanvasColors } from "~/engine";
