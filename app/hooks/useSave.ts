/**
 * @module useSave
 *
 * ## Hook Persistence Convention
 *
 * **Rule: hooks that need persistence always call `useSave()` internally.**
 *
 * Every hook that reads or writes save state must compose `useSave()`
 * directly rather than accepting `updateSave` (or `save`) as a parameter.
 * This keeps persistence initialization centralized: validation, migration,
 * and error recovery live in one coordinator instead of being scattered
 * across call sites.
 *
 * ```
 * // ✅ Correct — hook owns its persistence dependency
 * function useMyFeature() {
 *   const { save, updateSave } = useSave();
 *   // ...
 * }
 *
 * // ❌ Avoid — caller must know which persistence primitives the hook needs
 * function useMyFeature(updateSave: ...) {
 *   // ...
 * }
 * ```
 *
 * Why not dependency injection?
 * - `useSave()` is intentionally cheap (single `useState` + `useCallback`).
 * - Injecting `updateSave` forces every call site to destructure and forward
 *   the right subset of persistence primitives, adding coupling with no
 *   testability benefit (hooks can be tested with a stubbed localStorage).
 * - A single initialization path means future concerns (schema migration,
 *   cross-tab sync, error telemetry) propagate automatically.
 *
 * Routes and components should never pass persistence functions between
 * hooks. If a route needs data from two hooks that both call `useSave()`,
 * each hook manages its own instance — React state deduplication keeps
 * this safe in practice.
 */

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

  return { save, setSave, updateSave } as const;
}
