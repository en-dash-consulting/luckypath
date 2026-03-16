import type { GameState, LevelData, TileType, Rotation } from "./types";
import { posKey, isCellForbidden } from "./utils";
import { simulateTraversal } from "./traversal";

/* ── Pure state updaters ─────────────────────────────────────────── */

export function createInitialState(level: LevelData): GameState {
  return {
    placedTiles: new Map(),
    selectedTileType: null,
    remainingInventory: { ...level.inventory },
    phase: "placing",
    luckyPosition: null,
    luckyDirection: null,
    traversalPath: [],
    removeMode: false,
  };
}

export function selectTileUpdate(
  s: GameState,
  type: TileType | null
): GameState {
  return {
    ...s,
    selectedTileType: type,
    removeMode: type ? false : s.removeMode,
  };
}

export function toggleRemoveModeUpdate(s: GameState): GameState {
  return {
    ...s,
    removeMode: !s.removeMode,
    selectedTileType: null,
  };
}

export function placeTileUpdate(
  s: GameState,
  level: LevelData,
  row: number,
  col: number
): GameState {
  if (s.phase !== "placing") return s;
  if (!s.selectedTileType) return s;

  if (isCellForbidden(level, row, col)) return s;

  const key = posKey(row, col);
  const existing = s.placedTiles.get(key);
  const newInventory = { ...s.remainingInventory };

  // Return old tile to inventory if replacing
  if (existing) {
    newInventory[existing.type]++;
  }

  // Consume from inventory
  if (newInventory[s.selectedTileType] <= 0) return s;
  newInventory[s.selectedTileType]--;

  const newTiles = new Map(s.placedTiles);
  newTiles.set(key, { type: s.selectedTileType, rotation: 0 as Rotation });

  return {
    ...s,
    placedTiles: newTiles,
    remainingInventory: newInventory,
  };
}

export function rotateTileUpdate(
  s: GameState,
  row: number,
  col: number
): GameState {
  if (s.phase !== "placing") return s;
  const key = posKey(row, col);
  const tile = s.placedTiles.get(key);
  if (!tile) return s;

  const newTiles = new Map(s.placedTiles);
  newTiles.set(key, {
    ...tile,
    rotation: ((tile.rotation + 1) % 4) as Rotation,
  });
  return { ...s, placedTiles: newTiles };
}

export function moveTileUpdate(
  s: GameState,
  level: LevelData,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): GameState {
  if (s.phase !== "placing") return s;
  const fromKey = posKey(fromRow, fromCol);
  const toKey = posKey(toRow, toCol);
  if (fromKey === toKey) return s;

  const tile = s.placedTiles.get(fromKey);
  if (!tile) return s;

  // Can't drop on start, goal, obstacle, or existing tile
  if (isCellForbidden(level, toRow, toCol)) return s;
  if (s.placedTiles.has(toKey)) return s;

  // Bounds check
  if (toRow < 0 || toRow >= level.height || toCol < 0 || toCol >= level.width) return s;

  const newTiles = new Map(s.placedTiles);
  newTiles.delete(fromKey);
  newTiles.set(toKey, tile);

  return { ...s, placedTiles: newTiles };
}

export function removeTileUpdate(
  s: GameState,
  row: number,
  col: number
): GameState {
  if (s.phase !== "placing") return s;
  const key = posKey(row, col);
  const tile = s.placedTiles.get(key);
  if (!tile) return s;

  const newTiles = new Map(s.placedTiles);
  newTiles.delete(key);

  const newInventory = { ...s.remainingInventory };
  newInventory[tile.type]++;

  return {
    ...s,
    placedTiles: newTiles,
    remainingInventory: newInventory,
  };
}

export function runSimulationUpdate(
  s: GameState,
  level: LevelData
): GameState {
  if (s.phase !== "placing") return s;
  const result = simulateTraversal(level, s.placedTiles);
  return {
    ...s,
    phase: result.success ? "success" : "failure",
    traversalPath: result.path,
    failReason: result.failReason,
    removeMode: false,
  };
}
