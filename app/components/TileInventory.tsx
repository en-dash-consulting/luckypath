import { TILE_TYPE_DEFS } from "~/engine";
import { TilePreview } from "./TilePreview";
import type { InventoryProps } from "./inventory-shared";
import { getTileButtonState, handleTileButtonClick } from "./inventory-shared";

export function TileInventory({
  remaining,
  selectedType,
  onSelect,
  disabled,
  removeMode,
  onToggleRemoveMode,
}: InventoryProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-r-2xl shadow-lg border border-l-0 border-gray-200 py-3 px-3 flex flex-col gap-2.5 -ml-3 mt-4">
      {/* Tile pieces */}
      {TILE_TYPE_DEFS.map(({ type, invKey }) => {
        const btn = getTileButtonState(remaining, invKey, selectedType, type, removeMode, disabled);

        return (
          <button
            key={type}
            onClick={() => handleTileButtonClick(btn, type, removeMode, onToggleRemoveMode, onSelect)}
            disabled={!btn.available}
            className={`
              relative flex flex-col items-center gap-1
              p-2 rounded-xl transition-all duration-150 select-none
              ${btn.isSelected
                ? "bg-teal-100 ring-2 ring-teal-500 shadow-md scale-105"
                : btn.isEmpty
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-teal-50 hover:scale-105 cursor-pointer"
              }
            `}
          >
            <TilePreview type={type} size={64} selected={btn.isSelected} />

            {/* Count display */}
            <span className={`text-lg font-bold tabular-nums ${
              btn.isSelected ? "text-teal-700" : "text-gray-500"
            }`}>
              {btn.count}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-1" />

      {/* Remove tool */}
      <button
        onClick={() => {
          if (disabled) return;
          onSelect(null);
          onToggleRemoveMode?.();
        }}
        disabled={disabled}
        className={`
          flex flex-col items-center justify-center gap-1
          p-2 rounded-xl transition-all duration-150 select-none
          ${removeMode
            ? "bg-red-100 ring-2 ring-red-400 scale-105"
            : disabled
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-red-50 hover:scale-105 cursor-pointer"
          }
        `}
        title="Remove placed tiles"
      >
        <div className={`w-16 h-16 flex items-center justify-center rounded-lg ${
          removeMode ? "bg-red-50" : "bg-gray-50"
        }`}>
          <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
            <path d="M6 6l10 10M16 6L6 16"
              stroke={removeMode ? "#ef4444" : "#9ca3af"}
              strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </button>
    </div>
  );
}
