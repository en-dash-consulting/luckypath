/**
 * Services barrel — public API for the persistence/services layer.
 *
 * This barrel formalizes the services zone as a tracked architectural layer,
 * matching the engine and hooks barrel patterns. The services layer sits
 * logically between engine and hooks in the dependency DAG:
 *
 *   geometry → engine → services → hooks → components → routes
 *
 * Only the hooks layer should import from services. Routes and components
 * must access persistence through hooks, enforced by ESLint rules in
 * eslint.config.ts and validated by zone-boundaries.test.ts.
 */

// Persistence I/O
export { loadSave, saveSave, getDefaultSave } from "./persistence";

// Pure updaters and predicates
export { completeLevelUpdater, isLevelUnlockedWithSave, isLevelUnlocked } from "./persistence";

// Types
export type { SaveData } from "./persistence";
