/**
 * Game Engine — public API
 *
 * Import from "~/engine" instead of reaching into individual files.
 * This barrel keeps the engine's internal structure decoupled from consumers.
 *
 * ⚠️  HIGH FAN-IN MODULE — imported by 10+ files across 3 zones (game-ui,
 * game-session, routes). Changes to this surface have wide ripple effects.
 *
 * Before modifying exports:
 *   1. Check all consumers (`grep -r 'from "~/engine"'`) for the symbol you
 *      are changing — removing or renaming an export WILL break downstream.
 *   2. Prefer additive changes (new exports) over modifications to existing ones.
 *   3. Type-only exports (`export type`) are safe to refactor since they have
 *      no runtime impact.
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

// Rainbow easter-egg geometry
export {
  SVG_WIDTH,
  SVG_HEIGHT,
  ARC_CENTER_Y_RATIO,
  ARC_MAX_R_RATIO,
  ARC_MIN_R_RATIO,
  REVEAL_THRESHOLD,
  PROGRESS_TOLERANCE,
} from "./rainbow-constants";

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
