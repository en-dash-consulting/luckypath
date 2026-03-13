/**
 * Shared geometry constants for the rainbow easter-egg arc.
 *
 * These are consumed by both the RainbowArc presentation component
 * (SVG viewBox) and the useRainbowEasterEgg hook (hit-detection math).
 * Placed in the engine layer so both hooks and components can import
 * without violating the architecture DAG.
 */

/** SVG viewBox width for the rainbow arc. */
export const SVG_WIDTH = 320;

/** SVG viewBox height for the rainbow arc. */
export const SVG_HEIGHT = 140;

/** Vertical center of the arc as a ratio of SVG_HEIGHT (used for hit-detection). */
export const ARC_CENTER_Y_RATIO = 0.78;

/* ── Hit-detection & progress parameters ─────────────────────────── */

/** Outer hit-zone radius as a fraction of the SVG element width. */
export const ARC_MAX_R_RATIO = 0.48;

/** Inner hit-zone radius as a fraction of the SVG element width. */
export const ARC_MIN_R_RATIO = 0.12;

/** Progress fraction (0-1) at which the pot of gold is revealed. */
export const REVEAL_THRESHOLD = 0.9;

/** Allowed backward-progress tolerance before the trace resets. */
export const PROGRESS_TOLERANCE = 0.05;
