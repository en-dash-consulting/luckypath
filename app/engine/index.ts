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

// Direction constants
export { NORTH, EAST, SOUTH, WEST } from "./types";

// Traversal
export {
  opposite,
  getConnection,
  getExitSide,
  moveInDirection,
  simulateTraversal,
} from "./traversal";
export type { TraversalResult } from "./traversal";

// Utilities
export { posKey } from "./utils";

// Levels & worlds
export { levels, getLevelById, getLevelsForWorld, worlds } from "./levels";
