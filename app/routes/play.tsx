import { useParams, useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLevelById, levels, worlds } from "~/engine/levels";
import { useGameState } from "~/hooks/useGameState";
import { GameBoard } from "~/components/GameBoard";
import { TileInventory, TilePreview } from "~/components/TileInventory";
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
          <p className="text-emerald-800 font-bold text-lg mb-3">Level not found</p>
          <button
            onClick={() => navigate("/worlds")}
            className="text-base text-emerald-600 hover:text-emerald-700 font-medium"
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
    moveTile,
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
    <div className="min-h-dvh bg-gradient-to-b from-green-100 via-emerald-50 to-amber-50/50 flex flex-col items-center px-2 sm:px-4 py-3 gap-2 select-none">
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
        <div className="text-sm text-amber-800 bg-amber-100/60 px-4 py-2 rounded-xl animate-slideUp max-w-md text-center">
          {level.hint}
        </div>
      )}

      {/* Board + Inventory */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0 w-full max-w-2xl">
        <div className="w-full sm:w-auto sm:flex-1 sm:min-w-0">
          <GameBoard
            level={level}
            state={state}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
            onMoveTile={moveTile}
            highContrast={settings.highContrast}
          />
        </div>

        {/* Desktop: vertical sidebar */}
        <div className="hidden sm:block shrink-0">
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

        {/* Mobile: horizontal bar below board */}
        <div className="sm:hidden">
          <MobileInventory
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

// Horizontal inventory for mobile
function MobileInventory({
  remaining,
  selectedType,
  onSelect,
  disabled,
  removeMode,
  onToggleRemoveMode,
}: {
  remaining: { straight: number; curve: number };
  selectedType: import("~/engine/types").TileType | null;
  onSelect: (type: import("~/engine/types").TileType | null) => void;
  disabled?: boolean;
  removeMode?: boolean;
  onToggleRemoveMode?: () => void;
}) {
  const tiles: { type: import("~/engine/types").TileType; key: "straight" | "curve" }[] = [
    { type: "straight", key: "straight" },
    { type: "curve", key: "curve" },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 py-2 px-3 flex items-center gap-3 mt-2">
      {tiles.map(({ type, key }) => {
        const count = remaining[key];
        const isSelected = selectedType === type && !removeMode;
        const isEmpty = count <= 0;
        const available = !disabled && !isEmpty;

        return (
          <button
            key={type}
            onClick={() => {
              if (!available) return;
              if (onToggleRemoveMode && removeMode) onToggleRemoveMode();
              onSelect(isSelected ? null : type);
            }}
            disabled={!available}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl transition-all select-none
              ${isSelected
                ? "bg-teal-100 ring-2 ring-teal-500"
                : isEmpty
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-teal-50 cursor-pointer"
              }
            `}
          >
            <TilePreview type={type} size={40} selected={isSelected} />
            <span className={`text-base font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
              isSelected ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-500"
            }`}>
              {count}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200" />

      {/* Remove */}
      <button
        onClick={() => {
          if (disabled) return;
          onSelect(null);
          onToggleRemoveMode?.();
        }}
        disabled={disabled}
        className={`
          p-2 rounded-xl transition-all select-none
          ${removeMode
            ? "bg-red-100 ring-2 ring-red-400"
            : disabled
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-red-50 cursor-pointer"
          }
        `}
        title="Remove placed tiles"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M6 6l10 10M16 6L6 16"
            stroke={removeMode ? "#ef4444" : "#9ca3af"}
            strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
