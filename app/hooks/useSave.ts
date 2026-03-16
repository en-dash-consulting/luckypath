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
 * ## SaveProvider: Mandatory vs Optional
 *
 * | Scenario                                        | SaveProvider | Why                                          |
 * |-------------------------------------------------|--------------|----------------------------------------------|
 * | Single hook calls `useSave()` in the subtree    | **Optional** | No sibling to diverge from; standalone is fine. |
 * | Multiple sibling hooks call `useSave()` in the  | **Required** | Without it each hook gets its own `useState`;   |
 * |   same subtree (e.g. `useWorldSession` +        |              | mutations in one are invisible to the other     |
 * |   `useRainbowEasterEgg` in worlds.tsx)           |              | until the next render cycle (silent divergence).|
 * | Parent already wrapped in `<SaveProvider>`       | **Omit**     | Nesting providers is redundant — the outer one  |
 * |                                                  |              | already shares state to the whole subtree.      |
 *
 * **TL;DR:** Count the number of _independent_ `useSave()` compositions
 * that will mount as siblings. If the answer is ≥ 2, wrap them in a
 * single `<SaveProvider>`. If it's 1, skip the provider — adding one is
 * harmless but unnecessary. A runtime dev-mode warning fires when
 * multiple standalone instances are detected (see `__standaloneInstanceCount`).
 *
 * ```
 * // ✅ Multiple save-consuming hooks — provider required
 * <SaveProvider>
 *   <MyComponent />   // hooks inside share the same SaveData
 * </SaveProvider>
 *
 * // ✅ Single save-consuming hook — provider optional
 * <MySimpleComponent />
 *
 * // ❌ Redundant nesting — outer provider already covers the subtree
 * <SaveProvider>
 *   <SaveProvider>
 *     <MyComponent />
 *   </SaveProvider>
 * </SaveProvider>
 * ```
 *
 * `useSave()` checks for a surrounding `SaveProvider` and returns the
 * shared instance when present. When no provider exists, it falls back
 * to creating its own state — backward compatible with single-hook routes.
 */

import { useState, useCallback, useEffect, createContext, useContext, createElement } from "react";
import type React from "react";
import { loadSave, getDefaultSave, saveSave, completeLevelUpdater } from "~/services/persistence";
import type { SaveData } from "~/services/persistence";

/**
 * Runtime invariant: tracks how many standalone useSave instances are mounted
 * without a SaveProvider. If more than one is active simultaneously, a dev-mode
 * warning fires — catching the "silent mutation divergence" bug at the point of
 * misuse rather than downstream in an unrelated symptom.
 *
 * @internal Exported only for testing.
 */
export let __standaloneInstanceCount = 0;

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
  /** Persist a level completion, keeping the best clover count. */
  completeLevel: (levelId: string, clovers: number) => void;
}

/** @internal Sentinel value — context is `null` when no provider wraps the tree. */
const SaveContext = createContext<UseSaveReturn | null>(null);

/**
 * Provider that shares a single save-state instance across all `useSave()`
 * consumers in its subtree. Use in routes where multiple hooks compose
 * `useSave()` independently (e.g. worlds.tsx).
 */
export function SaveProvider({ children }: { children: React.ReactNode }) {
  const value = useSaveInternal(/* fromProvider */ true);
  return createElement(SaveContext.Provider, { value }, children);
}

/**
 * Centralized save-data primitive — the single initialization coordinator
 * for all hooks that need access to persisted save state.
 *
 * When wrapped in a `<SaveProvider>`, returns the shared context instance.
 * Otherwise creates its own state (backward compatible).
 *
 * SSR-safe: falls back to `getDefaultSave()` on the server.
 *
 * If save validation, migration logic, or error recovery is ever needed,
 * this is the ONE place to add it instead of patching every consumer.
 */
export function useSave(): UseSaveReturn {
  const ctx = useContext(SaveContext);
  if (ctx !== null) return ctx;
  return useSaveInternal();
}

/**
 * Standalone save state — used by SaveProvider and as fallback.
 *
 * @param fromProvider  `true` when called by SaveProvider (skips divergence check).
 */
function useSaveInternal(fromProvider = false): UseSaveReturn {
  const [save, setSave] = useState<SaveData>(() =>
    typeof window !== "undefined" ? loadSave() : getDefaultSave()
  );

  // Runtime invariant: detect multiple standalone instances (no provider).
  useEffect(() => {
    if (fromProvider) return;
    __standaloneInstanceCount++;
    if (process.env.NODE_ENV !== "production" && __standaloneInstanceCount > 1) {
      console.warn(
        "[useSave] Multiple standalone useSave instances detected without a " +
          "<SaveProvider>. Save mutations will silently diverge between hooks. " +
          "Wrap the consuming component tree in <SaveProvider> to share state.",
      );
    }
    return () => {
      __standaloneInstanceCount--;
    };
  }, [fromProvider]);

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

  const completeLevel = useCallback(
    (levelId: string, clovers: number) => {
      updateSave((current) => completeLevelUpdater(current, levelId, clovers));
    },
    [updateSave],
  );

  return { save, setSave, updateSave, completeLevel } as const;
}
