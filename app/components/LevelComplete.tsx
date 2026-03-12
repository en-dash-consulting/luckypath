interface LevelCompleteProps {
  levelName: string;
  tilesUsed: number;
  par: number;
  clovers: number;
  hasNextLevel: boolean;
  onNext: () => void;
  onReplay: () => void;
  onBack: () => void;
}

export function LevelComplete({
  levelName,
  tilesUsed,
  par,
  clovers,
  hasNextLevel,
  onNext,
  onReplay,
  onBack,
}: LevelCompleteProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-scaleIn">
        <h2 className="text-2xl font-bold text-emerald-900 mb-1">
          Level Complete!
        </h2>
        <p className="text-sm text-emerald-700/60 mb-4 font-medium">{levelName}</p>

        {/* Clover rating */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                i <= clovers
                  ? "bg-emerald-400 shadow-sm"
                  : "bg-gray-100"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 14 14">
                <circle cx="4" cy="4.5" r="2.8" fill={i <= clovers ? "white" : "#d1d5db"} />
                <circle cx="10" cy="4.5" r="2.8" fill={i <= clovers ? "white" : "#d1d5db"} />
                <circle cx="7" cy="2.5" r="2.8" fill={i <= clovers ? "white" : "#d1d5db"} />
                <line x1="7" y1="6" x2="7.5" y2="12" stroke={i <= clovers ? "white" : "#d1d5db"} strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="font-bold text-emerald-800">{tilesUsed}</span> tiles
          <span className="text-gray-300 mx-1.5">/</span>
          <span className="font-medium">{par} par</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {hasNextLevel && (
            <button
              onClick={onNext}
              className="
                w-full px-6 py-3 rounded-xl font-bold text-base text-white
                bg-gradient-to-b from-emerald-400 to-emerald-600
                shadow-md shadow-emerald-500/20
                active:scale-95 transition-all
              "
            >
              Next Level
            </button>
          )}
          <button
            onClick={onReplay}
            className="
              w-full px-5 py-2.5 rounded-xl text-base font-semibold text-emerald-800
              bg-emerald-50 hover:bg-emerald-100
              active:scale-95 transition-all
            "
          >
            Replay
          </button>
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium mt-1"
          >
            Level Select
          </button>
        </div>
      </div>
    </div>
  );
}
