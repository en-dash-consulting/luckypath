import { useParams, useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLevelById, levels, worlds } from "~/engine/levels";
import { useGameState } from "~/hooks/useGameState";
import { GameBoard } from "~/components/GameBoard";
import { TileInventory } from "~/components/TileInventory";
import { GameHUD } from "~/components/GameHUD";
import { LevelComplete } from "~/components/LevelComplete";
import { completeLevel, loadSave } from "~/lib/persistence";
import { posKey } from "~/engine/types";

export default function Play() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [currentLevelId, setCurrentLevelId] = useState(levelId);

  const level = useMemo(
    () => getLevelById(currentLevelId || ""),
    [currentLevelId]
  );

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-emerald-800 font-bold mb-2">Level not found</p>
          <button
            onClick={() => navigate("/worlds")}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            Back to levels
          </button>
        </div>
      </div>
    );
  }

  return <PlayLevel key={currentLevelId} level={level} onChangeLevel={setCurrentLevelId} />;
}

function PlayLevel({
  level,
  onChangeLevel,
}: {
  level: NonNullable<ReturnType<typeof getLevelById>>;
  onChangeLevel: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [showComplete, setShowComplete] = useState(false);
  const [settings, setSettings] = useState({ highContrast: false });
  const [removeMode, setRemoveMode] = useState(false);

  useEffect(() => {
    const save = loadSave();
    setSettings(save.settings);
  }, []);

  const {
    state,
    selectTile,
    placeTile,
    rotateTile,
    removeTile,
    runSimulation,
    resetBoard,
  } = useGameState(level);

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

      if (removeMode) {
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
    [state.phase, state.selectedTileType, state.placedTiles, level, placeTile, rotateTile, removeTile, removeMode]
  );

  const handleCellRightClick = useCallback(
    (row: number, col: number) => {
      removeTile(row, col);
    },
    [removeTile]
  );

  const currentIdx = levels.findIndex((l) => l.id === level.id);
  const nextLevel = currentIdx >= 0 && currentIdx < levels.length - 1
    ? levels[currentIdx + 1]
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 flex flex-col items-center px-4 py-3 gap-2 select-none">
      <GameHUD
        levelName={level.name}
        worldName={world?.name || ""}
        phase={state.phase}
        failReason={state.failReason}
        tilesRemaining={state.remainingInventory.straight + state.remainingInventory.curve}
        onRun={() => { setRemoveMode(false); runSimulation(); }}
        onReset={() => { setRemoveMode(false); resetBoard(); }}
        onBack={() => navigate("/worlds")}
      />

      {/* Hint */}
      {level.hint && state.phase === "placing" && tilesUsed === 0 && (
        <div className="text-xs text-amber-700/70 bg-amber-100/50 px-3 py-1.5 rounded-lg animate-slideUp">
          {level.hint}
        </div>
      )}

      {/* Board + Inventory */}
      <div className="flex items-start gap-0">
        <GameBoard
          level={level}
          state={state}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          highContrast={settings.highContrast}
        />

        <TileInventory
          remaining={state.remainingInventory}
          selectedType={state.selectedTileType}
          onSelect={(type) => {
            selectTile(type);
            if (type) setRemoveMode(false);
          }}
          disabled={state.phase !== "placing"}
          removeMode={removeMode}
          onToggleRemoveMode={() => setRemoveMode((r) => !r)}
        />
      </div>

      {showComplete && state.phase === "success" && (
        <LevelComplete
          levelName={level.name}
          tilesUsed={tilesUsed}
          par={level.par}
          clovers={clovers}
          hasNextLevel={!!nextLevel}
          onNext={() => {
            if (nextLevel) {
              onChangeLevel(nextLevel.id);
              navigate(`/play/${nextLevel.id}`, { replace: true });
            }
          }}
          onReplay={resetBoard}
          onBack={() => navigate("/worlds")}
        />
      )}
    </div>
  );
}
