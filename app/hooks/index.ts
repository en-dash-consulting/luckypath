/**
 * Hooks barrel — public API for the hooks adapter layer.
 *
 * This barrel formalizes the hooks zone as a first-class architectural layer,
 * matching the engine barrel pattern (engine/index.ts). All route access to
 * engine data flows through hooks in this layer, enforced by ESLint rules in
 * eslint.config.ts and validated by zone-boundaries.test.ts.
 *
 * DAG position:  geometry → engine → **hooks** → components → routes
 *
 * Consumers (routes) should import from this barrel or from individual hook
 * files — both are valid. The barrel exists to make the hooks layer discoverable
 * as a cohesive unit rather than a scattered collection of files.
 */

// Route-facing hooks — bridge engine data to routes
export { useWorldSession } from "./useWorldSession";
export type { UseWorldSessionReturn } from "./useWorldSession";

export { useRainbowEasterEgg } from "./useRainbowEasterEgg";
export type { UseRainbowEasterEggReturn } from "./useRainbowEasterEgg";

export { useGameSession } from "./useGameSession";
export type { UseGameSessionReturn } from "./useGameSession";

export { useLevelById } from "./useLevelById";

// Shared persistence primitive — composed internally by other hooks
export { useSave } from "./useSave";
export type { UseSaveReturn } from "./useSave";

// Re-exported types so routes can import domain types through hooks
// without reaching into engine directly
export type { SaveData, WorldData } from "./useWorldSession";
