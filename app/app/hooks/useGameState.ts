import { useState, useCallback } from "react";
import type {
  GameState,
  LevelData,
  TileType,
  Rotation,
} from "~/engine/types";
import { posKey } from "~/engine/types";
import { simulateTraversal } from "~/engine/traversal";

function createInitialState(level: LevelData): GameState {
  return {
    placedTiles: new Map(),
    selectedTileType: null,
    remainingInventory: { ...level.inventory },
    phase: "placing",
    luckyPosition: null,
    luckyDirection: null,
    traversalPath: [],
  };
}

export function useGameState(level: LevelData) {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(level)
  );

  const selectTile = useCallback((type: TileType | null) => {
    setState((s) => ({ ...s, selectedTileType: type }));
  }, []);

  const placeTile = useCallback(
    (row: number, col: number) => {
      setState((s) => {
        if (s.phase !== "placing") return s;
        if (!s.selectedTileType) return s;

        const key = posKey(row, col);
        const startKey = posKey(level.start.row, level.start.col);
        const goalKey = posKey(level.goal.row, level.goal.col);
        const obstacleKeys = new Set(
          level.obstacles.map((o) => posKey(o.row, o.col))
        );
        if (key === startKey || key === goalKey || obstacleKeys.has(key))
          return s;

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
      });
    },
    [level]
  );

  const rotateTile = useCallback((row: number, col: number) => {
    setState((s) => {
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
    });
  }, []);

  const removeTile = useCallback((row: number, col: number) => {
    setState((s) => {
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
    });
  }, []);

  const runSimulation = useCallback(() => {
    setState((s) => {
      if (s.phase !== "placing") return s;
      const result = simulateTraversal(level, s.placedTiles);
      return {
        ...s,
        phase: result.success ? "success" : "failure",
        traversalPath: result.path,
        failReason: result.failReason,
      };
    });
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
    placeTile,
    rotateTile,
    removeTile,
    runSimulation,
    resetBoard,
    resetForLevel,
  };
}
