import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameState } from "~/hooks/useGameState";
import { completeLevel, loadSave } from "~/lib/persistence";
import type { LevelData } from "~/engine";
import { levels, worlds, posKey } from "~/engine";

export function useGameSession(level: LevelData) {
  const [showComplete, setShowComplete] = useState(false);
  const [settings, setSettings] = useState({ highContrast: false });

  useEffect(() => {
    const save = loadSave();
    setSettings(save.settings);
  }, []);

  const gameState = useGameState(level);
  const { state, selectTile, toggleRemoveMode, placeTile, rotateTile, removeTile, runSimulation, resetBoard } = gameState;

  const world = worlds.find((w) => w.id === level.worldId);
  const tilesUsed = state.placedTiles.size;

  const clovers = useMemo(() => {
    if (state.phase !== "success") return 0;
    if (tilesUsed <= level.par) return 3;
    if (tilesUsed <= level.par + 1) return 2;
    return 1;
  }, [state.phase, tilesUsed, level.par]);

  useEffect(() => {
    if (state.phase === "success") {
      completeLevel(level.id, clovers);
      const timer = setTimeout(() => setShowComplete(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowComplete(false);
    }
  }, [state.phase, level.id, clovers]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.phase !== "placing") return;

      const key = posKey(row, col);
      const startKey = posKey(level.start.row, level.start.col);
      const goalKey = posKey(level.goal.row, level.goal.col);
      const obstacleKeys = new Set(
        level.obstacles.map((o) => posKey(o.row, o.col))
      );

      if (key === startKey || key === goalKey || obstacleKeys.has(key)) return;

      if (state.removeMode) {
        if (state.placedTiles.has(key)) removeTile(row, col);
        return;
      }

      if (state.placedTiles.has(key)) {
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
    (type: import("~/engine").TileType | null) => {
      selectTile(type);
    },
    [selectTile]
  );

  const currentIdx = levels.findIndex((l) => l.id === level.id);
  const nextLevel = currentIdx >= 0 && currentIdx < levels.length - 1
    ? levels[currentIdx + 1]
    : null;

  return {
    state,
    settings,
    world,
    tilesUsed,
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
