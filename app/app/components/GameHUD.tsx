interface GameHUDProps {
  levelName: string;
  worldName: string;
  phase: "placing" | "running" | "success" | "failure";
  failReason?: string;
  tilesRemaining: number;
  onRun: () => void;
  onReset: () => void;
  onBack: () => void;
}

export function GameHUD({
  levelName,
  worldName,
  phase,
  failReason,
  tilesRemaining,
  onRun,
  onReset,
  onBack,
}: GameHUDProps) {
  return (
    <div className="w-full max-w-lg flex items-center gap-3">
      {/* Back */}
      <button
        onClick={onBack}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/60 text-emerald-700 hover:bg-white transition-colors text-sm shrink-0"
      >
        &larr;
      </button>

      {/* Level info */}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-emerald-600/50 leading-none">
          {worldName}
        </div>
        <div className="text-sm font-bold text-emerald-800 truncate">{levelName}</div>
      </div>

      {/* Status / Action — center area */}
      <div className="flex items-center gap-2">
        {phase === "failure" && (
          <span className="text-xs text-red-500 font-medium max-w-[140px] truncate hidden sm:block">
            {failReason}
          </span>
        )}

        {phase === "placing" && (
          <button
            onClick={onRun}
            className="
              px-4 py-1.5 rounded-lg font-bold text-sm text-white
              bg-gradient-to-b from-emerald-400 to-emerald-600
              shadow-md shadow-emerald-500/20
              hover:shadow-lg hover:from-emerald-500 hover:to-emerald-700
              active:scale-95 transition-all
            "
          >
            Send Lucky!
          </button>
        )}
        {phase === "running" && (
          <span className="text-xs text-emerald-600 animate-pulse font-medium">
            Running...
          </span>
        )}
        {(phase === "failure" || phase === "success") && (
          <button
            onClick={onReset}
            className="
              px-4 py-1.5 rounded-lg font-bold text-sm text-white
              bg-gradient-to-b from-blue-400 to-blue-500
              shadow-md shadow-blue-500/20
              active:scale-95 transition-all
            "
          >
            Retry
          </button>
        )}
      </div>

      {/* Tiles remaining */}
      {tilesRemaining > 0 && phase === "placing" && (
        <div className="text-right shrink-0">
          <div className="text-sm font-bold text-emerald-800 tabular-nums">
            {tilesRemaining}
          </div>
          <div className="text-[10px] text-emerald-600/40 leading-none">left</div>
        </div>
      )}
    </div>
  );
}
