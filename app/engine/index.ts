/**
 * Game Engine — public API
 *
 * Import from "~/engine" instead of reaching into individual files.
 * This barrel keeps the engine's internal structure decoupled from consumers.
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
export { BIOME_THEMES } from "./biome-theme";

// Levels & worlds
export { levels, getLevelById, getLevelsForWorld, worlds } from "./levels";
export type { WorldData } from "./levels";
