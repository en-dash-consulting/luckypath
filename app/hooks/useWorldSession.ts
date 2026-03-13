import { useState } from "react";
import { levels } from "~/engine";
import { loadSave, getDefaultSave, isLevelUnlockedWithSave } from "~/lib/persistence";
import type { SaveData } from "~/lib/persistence";

/**
 * Encapsulates save-data loading and level-unlock checks for the worlds route.
 *
 * Extracting this from worlds.tsx decouples the route handler from
 * persistence details and keeps the route focused on layout/rendering.
 */
export function useWorldSession() {
  // Initialise directly from loadSave() with an SSR guard to avoid the
  // two-phase init flash (getDefaultSave → useEffect → loadSave).
  const [save, setSave] = useState<SaveData>(() =>
    typeof window !== "undefined" ? loadSave() : getDefaultSave()
  );

  const allLevelIds = levels.map((l) => l.id);

  function isLevelUnlocked(levelId: string): boolean {
    return isLevelUnlockedWithSave(save, levelId, allLevelIds);
  }

  function getClovers(levelId: string): number {
    return save.completedLevels[levelId] || 0;
  }

  return {
    save,
    setSave,
    isLevelUnlocked,
    getClovers,
  };
}
