import { useState, useCallback } from "react";
import type React from "react";
import { loadSave, getDefaultSave, saveSave } from "~/services/persistence";
import type { SaveData } from "~/services/persistence";

/**
 * Public contract for useSave.
 *
 * Following the hook return type naming convention: all hooks in this zone
 * define a named exported interface `Use{HookName}Return` so consumers have
 * a stable, explicit type to depend on.
 */
export interface UseSaveReturn {
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  refreshSave: () => void;
  updateSave: (updater: (current: SaveData) => SaveData) => void;
}

/**
 * Centralized save-data primitive — the single initialization coordinator
 * for all hooks that need access to persisted save state.
 *
 * SSR-safe: falls back to `getDefaultSave()` on the server.
 *
 * If save validation, migration logic, or error recovery is ever needed,
 * this is the ONE place to add it instead of patching every consumer.
 */
export function useSave(): UseSaveReturn {
  const [save, setSave] = useState<SaveData>(() =>
    typeof window !== "undefined" ? loadSave() : getDefaultSave()
  );

  /**
   * Read-modify-write helper that loads a fresh copy from storage,
   * applies the updater, persists the result, and syncs React state.
   */
  const updateSave = useCallback(
    (updater: (current: SaveData) => SaveData) => {
      const fresh = loadSave();
      const updated = updater(fresh);
      saveSave(updated);
      setSave(updated);
    },
    [],
  );

  /**
   * Re-read save from storage into React state.
   * Use when an external call (e.g. `completeLevel`) wrote to storage
   * outside of `updateSave`.
   */
  const refreshSave = useCallback(() => {
    setSave(loadSave());
  }, []);

  return { save, setSave, refreshSave, updateSave } as const;
}
