import { useState, useCallback } from "react";
import type { GameState, LevelData, TileType, Rotation } from "~/engine";
import { posKey, isCellForbidden, simulateTraversal } from "~/engine";

/**
 * Public contract for useGameState.
 *
 * This interface is the explicit boundary between game-state-core and its
 * consumers (primarily useGameSession in game-session-persistence). Defining
 * it here ensures that schema changes to the hook's return value are caught
 * at compile time and don't silently break downstream zones.
 */
export interface UseGameStateReturn {
  state: GameState;
  selectTile: (type: TileType | null) => void;
  toggleRemoveMode: () => void;
  placeTile: (row: number, col: number) => void;
  rotateTile: (row: number, col: number) => void;
  moveTile: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  removeTile: (row: number, col: number) => void;
  runSimulation: () => void;
  resetBoard: () => void;
  resetForLevel: (newLevel: LevelData) => void;
}

/* ── Pure state updaters (exported for testing) ──────────────────── */

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

/* ── React hook (thin wrapper over pure updaters) ────────────────── */

export function useGameState(level: LevelData): UseGameStateReturn {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(level)
  );

  const selectTile = useCallback((type: TileType | null) => {
    setState((s) => selectTileUpdate(s, type));
  }, []);

  const toggleRemoveMode = useCallback(() => {
    setState((s) => toggleRemoveModeUpdate(s));
  }, []);

  const placeTile = useCallback(
    (row: number, col: number) => {
      setState((s) => placeTileUpdate(s, level, row, col));
    },
    [level]
  );

  const rotateTile = useCallback((row: number, col: number) => {
    setState((s) => rotateTileUpdate(s, row, col));
  }, []);

  const moveTile = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      setState((s) => moveTileUpdate(s, level, fromRow, fromCol, toRow, toCol));
    },
    [level]
  );

  const removeTile = useCallback((row: number, col: number) => {
    setState((s) => removeTileUpdate(s, row, col));
  }, []);

  const runSimulation = useCallback(() => {
    setState((s) => runSimulationUpdate(s, level));
  }, [level]);

  const resetBoard = useCallback(() => {
    setState(createInitialState(level));
  }, [level]);

  const resetForLevel = useCallback(
    (newLevel: LevelData) => {
      setState(createInitialState(newLevel));
    },
    []
  );

  return {
    state,
    selectTile,
    toggleRemoveMode,
    placeTile,
    rotateTile,
    moveTile,
    removeTile,
    runSimulation,
    resetBoard,
    resetForLevel,
  };
}
