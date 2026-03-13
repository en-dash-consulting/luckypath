/**
 * Shared board rendering constants used by GameBoard and canvas-drawing.
 *
 * Centralising these values ensures the board rendering components
 * stay visually consistent. This module is internal to the
 * game-board-rendering zone.
 */
/** Pixel size of one board cell. */
export const CELL_SIZE = 80;

/** Padding around the board canvas. */
export const BOARD_PADDING = 20;

/** Original tile artwork dimension (pixels). */
const TILE_ARTWORK_SIZE = 64;

/** Scale factor relative to the original tile artwork design. */
export const SCALE = CELL_SIZE / TILE_ARTWORK_SIZE;

