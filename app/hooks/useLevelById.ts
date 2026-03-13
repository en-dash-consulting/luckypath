import { useMemo } from "react";
import { getLevelById } from "~/engine";
import type { LevelData } from "~/engine";

/**
 * Resolves a level ID to its LevelData via the engine, keeping routes
 * from importing engine query functions directly.
 *
 * Returns `undefined` when the ID doesn't match any known level.
 */
export function useLevelById(levelId: string): LevelData | undefined {
  return useMemo(() => getLevelById(levelId), [levelId]);
}
