/**
 * Rainbow arc hit-detection constants and utilities.
 *
 * This module lives in app/geometry/ — a shared layer below both hooks and
 * components — so both can import without a DAG bypass.
 *
 * Only hit-detection parameters and logic belong here. SVG viewBox dimensions
 * (SVG_WIDTH, SVG_HEIGHT) are presentation concerns owned by RainbowArc.tsx.
 */

/* ── Hit-detection & progress parameters ─────────────────────────── */

/** Vertical center of the arc as a ratio of the element's height (used for hit-detection). */
export const ARC_CENTER_Y_RATIO = 0.78;

/** Outer hit-zone radius as a fraction of the SVG element width. */
export const ARC_MAX_R_RATIO = 0.48;

/** Inner hit-zone radius as a fraction of the SVG element width. */
export const ARC_MIN_R_RATIO = 0.12;

/** Progress fraction (0-1) at which the pot of gold is revealed. */
export const REVEAL_THRESHOLD = 0.9;

/** Allowed backward-progress tolerance before the trace resets. */
export const PROGRESS_TOLERANCE = 0.05;

/* ── Arc hit-detection ───────────────────────────────────────────── */

/**
 * Compute the user's trace progress along the rainbow arc.
 *
 * Given mouse coordinates (client-space) and the SVG element's bounding rect,
 * returns the arc progress (0–1, left-to-right) or `null` if the pointer is
 * outside the arc hit zone.
 *
 * This isolates pixel-level geometry math from hook state management so that
 * the consuming hook only needs to handle interaction state and unlock logic.
 */
export function computeArcProgress(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): number | null {
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * ARC_CENTER_Y_RATIO;
  const dx = clientX - cx;
  const dy = -(clientY - cy);

  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = rect.width * ARC_MAX_R_RATIO;
  const minR = rect.width * ARC_MIN_R_RATIO;
  if (dist < minR || dist > maxR) return null;

  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += Math.PI * 2;
  if (angle > Math.PI) return null;

  return 1 - angle / Math.PI;
}
