import { useState, useCallback } from "react";
import { loadSave, getDefaultSave, saveSave } from "~/lib/persistence";
import type { SaveData } from "~/lib/persistence";

/**
 * Centralized save-data primitive — the single initialization coordinator
 * for all hooks that need access to persisted save state.
 *
 * SSR-safe: falls back to `getDefaultSave()` on the server.
 *
 * If save validation, migration logic, or error recovery is ever needed,
 * this is the ONE place to add it instead of patching every consumer.
 */
export function useSave() {
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
