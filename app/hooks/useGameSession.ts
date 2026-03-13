import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameState } from "~/hooks/useGameState";
import { useSave } from "~/hooks/useSave";
import { completeLevelUpdater } from "~/services/persistence";
import type { SaveData } from "~/services/persistence";
import type { GameState, LevelData, TileType, WorldData } from "~/engine";
import { getWorldById, getNextLevel, isCellForbidden, posKey } from "~/engine";

/**
 * Public contract for useGameSession.
 *
 * This zone is the sole integration point between three concerns:
 * state (useGameState), persistence (persistence.ts), and routing.
 * Defining an explicit return interface contains blast radius — any
 * schema change to useGameState or persistence.ts that alters this
 * surface is caught at compile time rather than silently propagating.
 *
 * Side-effects:
 *   - When `state.phase` transitions to `"success"`, the level completion
 *     and clover count are persisted via `updateSave`, keeping React state
 *     and localStorage in sync through the single reactive write path.
 */
export interface UseGameSessionReturn {
  state: GameState;
  settings: SaveData["settings"];
  world: WorldData | undefined;
  tilesUsed: number;
  tilesRemaining: number;
  clovers: number;
  showComplete: boolean;
  nextLevel: LevelData | null;
  handleCellClick: (row: number, col: number) => void;
  handleCellRightClick: (row: number, col: number) => void;
  handleRun: () => void;
  handleReset: () => void;
  handleSelectTile: (type: TileType | null) => void;
  toggleRemoveMode: () => void;
  moveTile: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

export function useGameSession(level: LevelData): UseGameSessionReturn {
  const [showComplete, setShowComplete] = useState(false);
  const { save, updateSave } = useSave();

  const gameState = useGameState(level);
  const { state, selectTile, toggleRemoveMode, placeTile, rotateTile, removeTile, runSimulation, resetBoard } = gameState;

  const world = getWorldById(level.worldId);
  const tilesUsed = state.placedTiles.size;
  const tilesRemaining = state.remainingInventory.straight + state.remainingInventory.curve;

  const clovers = useMemo(() => {
    if (state.phase !== "success") return 0;
    if (tilesUsed <= level.par) return 3;
    if (tilesUsed <= level.par + 1) return 2;
    return 1;
  }, [state.phase, tilesUsed, level.par]);

  useEffect(() => {
    if (state.phase === "success") {
      updateSave((current) => completeLevelUpdater(current, level.id, clovers));
      const timer = setTimeout(() => setShowComplete(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowComplete(false);
    }
  }, [state.phase, level.id, clovers, updateSave]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.phase !== "placing") return;
      if (isCellForbidden(level, row, col)) return;

      if (state.removeMode) {
        removeTile(row, col);
        return;
      }

      if (state.placedTiles.has(posKey(row, col))) {
        rotateTile(row, col);
        return;
      }

      if (state.selectedTileType) {
        placeTile(row, col);
      }
    },
    [state.phase, state.selectedTileType, state.placedTiles, state.removeMode, level, placeTile, rotateTile, removeTile]
  );

  const handleCellRightClick = useCallback(
    (row: number, col: number) => {
      removeTile(row, col);
    },
    [removeTile]
  );

  const handleRun = useCallback(() => {
    runSimulation();
  }, [runSimulation]);

  const handleReset = useCallback(() => {
    resetBoard();
  }, [resetBoard]);

  const handleSelectTile = useCallback(
    (type: TileType | null) => {
      selectTile(type);
    },
    [selectTile]
  );

  const nextLevel = useMemo(() => {
    const candidate = getNextLevel(level.id);
    if (!candidate) return null;
    // Guard: don't offer a next level whose world is locked
    if (candidate.worldId !== level.worldId) {
      if (!save.unlockedWorlds.includes(candidate.worldId)) {
        return null;
      }
    }
    return candidate;
  }, [level.id, level.worldId, save.unlockedWorlds]);

  return {
    state,
    settings: save.settings,
    world,
    tilesUsed,
    tilesRemaining,
    clovers,
    showComplete,
    nextLevel,
    handleCellClick,
    handleCellRightClick,
    handleRun,
    handleReset,
    handleSelectTile,
    toggleRemoveMode,
    moveTile: gameState.moveTile,
  };
}
