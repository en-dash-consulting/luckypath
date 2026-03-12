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
    <div className="w-full max-w-lg flex items-center gap-2 sm:gap-3">
      {/* Back */}
      <button
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 text-emerald-800 hover:bg-white transition-colors text-lg font-bold shrink-0"
      >
        &larr;
      </button>

      {/* Level info */}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] sm:text-xs uppercase tracking-wider text-emerald-700/60 leading-none font-semibold">
          {worldName}
        </div>
        <div className="text-base sm:text-lg font-bold text-emerald-900 truncate">{levelName}</div>
      </div>

      {/* Status / Action */}
      <div className="flex items-center gap-2">
        {phase === "failure" && (
          <span className="text-xs sm:text-sm text-red-600 font-semibold max-w-[100px] sm:max-w-[160px] truncate hidden sm:block">
            {failReason}
          </span>
        )}

        {phase === "placing" && (
          <button
            onClick={onRun}
            className="
              px-4 sm:px-5 py-2 rounded-xl font-bold text-sm sm:text-base text-white
              bg-gradient-to-b from-emerald-400 to-emerald-600
              shadow-md shadow-emerald-500/20
              hover:shadow-lg hover:from-emerald-500 hover:to-emerald-700
              active:scale-95 transition-all whitespace-nowrap
            "
          >
            Send Lucky!
          </button>
        )}
        {phase === "running" && (
          <span className="text-sm text-emerald-700 animate-pulse font-semibold">
            Running...
          </span>
        )}
        {(phase === "failure" || phase === "success") && (
          <button
            onClick={onReset}
            className="
              px-4 sm:px-5 py-2 rounded-xl font-bold text-sm sm:text-base text-white
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
          <div className="text-lg font-bold text-emerald-900 tabular-nums">
            {tilesRemaining}
          </div>
          <div className="text-[11px] sm:text-xs text-emerald-700/50 leading-none font-semibold">left</div>
        </div>
      )}
    </div>
  );
}
