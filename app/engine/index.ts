/**
 * Game Engine — public API (pure functions & types only)
 *
 * Import from "~/engine" instead of reaching into individual files.
 * This barrel keeps the engine's internal structure decoupled from consumers.
 *
 * CONTRACT: This barrel exports ONLY pure functions and type definitions.
 * It must never export React hooks, stateful singletons, or anything with
 * side effects. All runtime state management lives in the ~/hooks barrel,
 * which consumes engine exports and wraps them in React-aware hooks.
 *
 *   ~/engine  →  types, pure functions, constants  (stateless)
 *   ~/hooks   →  React hooks, providers, state      (stateful, imports ~/engine)
 *
 * DAG position:  geometry → **engine** → services → hooks → components → routes
 *
 * Layer access rules (enforced by ESLint in eslint.config.ts):
 *   - Components & hooks may import from this barrel (not deep files).
 *   - Routes must NOT import from engine — they access engine data through
 *     the ~/hooks barrel, which re-exports necessary types.
 *
 * ⚠️  HIGH FAN-IN MODULE — imported by 10+ files across 3 zones.
 * Changes to this surface have wide ripple effects.
 *
 * Before modifying exports:
 *   1. Check all consumers (`grep -r 'from "~/engine"'`) for the symbol you
 *      are changing — removing or renaming an export WILL break downstream.
 *   2. Prefer additive changes (new exports) over modifications to existing ones.
 *   3. Type-only exports (`export type`) are safe to refactor since they have
 *      no runtime impact.
 *   4. Never add React imports or hook exports here — those belong in ~/hooks.
 */

// Types
export type {
  Direction,
  Rotation,
  TileType,
  Position,
  PlacedTile,
  LevelCell,
  LevelData,
  GameState,
} from "./types";

// Direction constants & tile registry
export { NORTH, EAST, SOUTH, WEST, TILE_TYPE_DEFS } from "./types";
export type { TileTypeDef } from "./types";

// Traversal
export {
  opposite,
  getConnection,
  getExitSide,
  moveInDirection,
  simulateTraversal,
} from "./traversal";
export type { TraversalResult, TraversalOutcome } from "./traversal";
export { TRAVERSAL_MESSAGES } from "./traversal";

// Utilities
export { posKey, isCellForbidden, getEdgePoint } from "./utils";

// Biome themes
export type { Biome, BiomeTheme, BiomeCanvasColors } from "./biome-theme";
export { BIOME_THEMES, getBiomeCanvasColors } from "./biome-theme";

// Scoring
export { calculateClovers } from "./scoring";

// State updaters (pure game-state transition functions)
export {
  createInitialState,
  selectTileUpdate,
  toggleRemoveModeUpdate,
  placeTileUpdate,
  rotateTileUpdate,
  moveTileUpdate,
  removeTileUpdate,
  runSimulationUpdate,
} from "./state-updaters";

// Levels & worlds
export {
  getLevelById,
  getLevelsForWorld,
  getAllLevelIds,
  getNextLevel,
  getAllWorlds,
  getWorldById,
  getAllWorldIds,
} from "./levels";
export type { WorldData } from "./levels";

// Geometry (rainbow-arc constants & hit-detection)
export {
  SVG_WIDTH,
  SVG_HEIGHT,
  ARC_CX,
  ARC_BASELINE,
  computeArcProgress,
  REVEAL_THRESHOLD,
  PROGRESS_TOLERANCE,
} from "../geometry/rainbow-arc";
