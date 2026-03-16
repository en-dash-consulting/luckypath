/**
 * Scoring — pure domain logic for clover calculation.
 *
 * Clovers (1–3 stars) are awarded based on how many tiles the player
 * used relative to the level's par value:
 *   - 3 clovers: at or under par
 *   - 2 clovers: one over par
 *   - 1 clover:  two or more over par
 *
 * Returns 0 when the level is not yet solved (caller guards on phase).
 */

/** Calculate clovers earned for a completed level. */
export function calculateClovers(tilesUsed: number, par: number): number {
  if (tilesUsed <= par) return 3;
  if (tilesUsed <= par + 1) return 2;
  return 1;
}
