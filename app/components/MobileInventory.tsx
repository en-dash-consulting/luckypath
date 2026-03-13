import { TILE_TYPE_DEFS } from "~/engine";
import { TilePreview } from "./TilePreview";
import type { InventoryProps } from "./inventory-shared";
import { getTileButtonState, handleTileButtonClick } from "./inventory-shared";

export function MobileInventory({
  remaining,
  selectedType,
  onSelect,
  disabled,
  removeMode,
  onToggleRemoveMode,
}: InventoryProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 py-2 px-3 flex items-center gap-3 mt-2">
      {TILE_TYPE_DEFS.map(({ type, invKey }) => {
        const btn = getTileButtonState(remaining, invKey, selectedType, type, removeMode, disabled);

        return (
          <button
            key={type}
            onClick={() => handleTileButtonClick(btn, type, removeMode, onToggleRemoveMode, onSelect)}
            disabled={!btn.available}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl transition-all select-none
              ${btn.isSelected
                ? "bg-teal-100 ring-2 ring-teal-500"
                : btn.isEmpty
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-teal-50 cursor-pointer"
              }
            `}
          >
            <TilePreview type={type} size={40} selected={btn.isSelected} />
            <span className={`text-base font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
              btn.isSelected ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-500"
            }`}>
              {btn.count}
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
