/**
 * Hook to subscribe to a specific feature toggle value from the API.
 *
 * Fetches the toggle state once on mount and re-fetches whenever the
 * feature-toggles view saves a change (listens for the custom
 * `feature-toggle-changed` event on `window`).
 *
 * @see ../views/feature-toggles.ts — emits `feature-toggle-changed`
 * @see ../../server/routes-features.ts — GET /api/features
 */
/**
 * Subscribe to a single feature toggle by key.
 *
 * @param key - Fully-qualified toggle key (e.g. `"rex.showTokenBudget"`).
 * @param defaultValue - Value to use until the first fetch completes (and on error).
 * @returns Current toggle value (updates reactively when changed via the UI).
 */
export declare function useFeatureToggle(key: string, defaultValue: boolean): boolean;
