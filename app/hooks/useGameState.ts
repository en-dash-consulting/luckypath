import { useState, useCallback } from "react";
import type { GameState, LevelData, TileType } from "~/engine";
import {
  createInitialState,
  selectTileUpdate,
  toggleRemoveModeUpdate,
  placeTileUpdate,
  rotateTileUpdate,
  moveTileUpdate,
  removeTileUpdate,
  runSimulationUpdate,
} from "~/engine";

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

/* ── React hook (thin wrapper over pure updaters in ~/engine) ────── */

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
