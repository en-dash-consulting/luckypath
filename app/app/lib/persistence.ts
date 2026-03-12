import type { SaveData } from "~/engine/types";

const SAVE_KEY = "luckypath_save";

export function getDefaultSave(): SaveData {
  return {
    completedLevels: {},
    unlockedWorlds: [1],
    settings: {
      fastMode: false,
      highContrast: false,
    },
  };
}

export function loadSave(): SaveData {
  if (typeof window === "undefined") return getDefaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return getDefaultSave();
    return { ...getDefaultSave(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSave();
  }
}

export function saveSave(data: SaveData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function completeLevel(
  levelId: string,
  clovers: number
): SaveData {
  const save = loadSave();
  const existing = save.completedLevels[levelId] || 0;
  save.completedLevels[levelId] = Math.max(existing, clovers);
  saveSave(save);
  return save;
}

export function isLevelUnlocked(
  levelId: string,
  allLevelIds: string[]
): boolean {
  const save = loadSave();
  const idx = allLevelIds.indexOf(levelId);
  if (idx === 0) return true;
  if (idx < 0) return false;
  const prevId = allLevelIds[idx - 1];
  return prevId in save.completedLevels;
}
