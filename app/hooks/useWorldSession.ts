import { useSave } from "~/hooks/useSave";
import { getAllLevelIds, getAllWorlds, getLevelsForWorld } from "~/engine";
import type { LevelData, WorldData } from "~/engine";
import { isLevelUnlockedWithSave } from "~/lib/persistence";
import type { SaveData } from "~/lib/persistence";

/**
 * Encapsulates save-data loading, level-unlock checks, and world/level
 * queries for the worlds route.
 *
 * This is the sole gateway to engine world/level data for routes —
 * routes should not import engine query functions directly.
 *
 * Delegates persistence initialisation to `useSave` so validation,
 * migration, and error recovery live in a single coordinator.
 */
export function useWorldSession() {
  const { save, setSave, updateSave } = useSave();

  const allLevelIds = getAllLevelIds();
  const worlds = getAllWorlds();

  function isLevelUnlocked(levelId: string): boolean {
    return isLevelUnlockedWithSave(save, levelId, allLevelIds);
  }

  function getClovers(levelId: string): number {
    return save.completedLevels[levelId] || 0;
  }

  function getLevels(worldId: number): LevelData[] {
    return getLevelsForWorld(worldId);
  }

  return {
    save,
    setSave,
    updateSave,
    worlds,
    isLevelUnlocked,
    getClovers,
    getLevels,
  };
}

export type { SaveData, WorldData };
