/**
 * Hooks barrel — public API for React runtime state (stateful layer).
 *
 * CONTRACT: This barrel exports React hooks, context providers, and the
 * runtime state they manage. It is the ONLY layer that bridges the pure
 * engine (~/engine) into React's stateful world. The engine barrel exports
 * pure functions and types; this barrel wraps them with React lifecycle,
 * context, and side-effect management.
 *
 *   ~/engine  →  types, pure functions, constants  (stateless)
 *   ~/hooks   →  React hooks, providers, state      (stateful, imports ~/engine)
 *
 * DAG position:  geometry → engine → services → **hooks** → components → routes
 *
 * Layer access rules (enforced by ESLint in eslint.config.ts):
 *   - Routes & components must import from this barrel — not from individual
 *     hook files. Enforced by ESLint and validated by zone-boundaries.test.ts.
 *   - Routes must NOT import from ~/engine directly; this barrel re-exports
 *     any engine types that routes need (e.g., SaveData, WorldData).
 *   - Intra-zone imports (hook → hook) may use direct paths to avoid circular refs.
 */

// Route-facing hooks — bridge engine data to routes
export { useWorldSession } from "./useWorldSession";
export type { UseWorldSessionReturn } from "./useWorldSession";

export { useRainbowEasterEgg } from "./useRainbowEasterEgg";
export type { UseRainbowEasterEggReturn } from "./useRainbowEasterEgg";

export { useGameSession } from "./useGameSession";
export type { UseGameSessionReturn } from "./useGameSession";

export { useLevelById } from "./useLevelById";

export { useHelpShortcut } from "./useHelpShortcut";

// Shared persistence primitive — composed internally by other hooks
export { useSave, SaveProvider } from "./useSave";
export type { UseSaveReturn } from "./useSave";

// Re-exported types so routes can import domain types through hooks
// without reaching into engine or services directly.
// SaveData is imported directly from services (not transitively via useWorldSession)
// to make the intentional exposure self-documenting and immune to hook refactors.
export type { SaveData } from "~/services";
export type { WorldData } from "./useWorldSession";
