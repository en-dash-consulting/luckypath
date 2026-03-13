import type { TileType } from "~/engine";

/**
 * Shared props interface for TileInventory and MobileInventory.
 *
 * Both components render the same logical tile-selection UI
 * (desktop sidebar vs mobile horizontal bar) and share this contract.
 */
export interface InventoryProps {
  remaining: { straight: number; curve: number };
  selectedType: TileType | null;
  onSelect: (type: TileType | null) => void;
  disabled?: boolean;
  removeMode?: boolean;
  onToggleRemoveMode?: () => void;
}

/**
 * Computed state for a single tile-type button in the inventory.
 * Extracted so tile-selection logic lives in one place.
 */
export interface TileButtonState {
  isSelected: boolean;
  isEmpty: boolean;
  available: boolean;
  count: number;
}

/**
 * Derive the display/interaction state for one tile-type button.
 */
export function getTileButtonState(
  remaining: InventoryProps["remaining"],
  invKey: keyof InventoryProps["remaining"],
  selectedType: TileType | null,
  type: TileType,
  removeMode: boolean | undefined,
  disabled: boolean | undefined,
): TileButtonState {
  const count = remaining[invKey];
  const isSelected = selectedType === type && !removeMode;
  const isEmpty = count <= 0;
  const available = !disabled && !isEmpty;
  return { isSelected, isEmpty, available, count };
}

/**
 * Handle a tile-type button click. Returns the new selection value,
 * and indicates whether remove mode should be toggled off.
 */
export function handleTileButtonClick(
  state: TileButtonState,
  type: TileType,
  removeMode: boolean | undefined,
  onToggleRemoveMode: (() => void) | undefined,
  onSelect: (type: TileType | null) => void,
): void {
  if (!state.available) return;
  if (onToggleRemoveMode && removeMode) onToggleRemoveMode();
  onSelect(state.isSelected ? null : type);
}
