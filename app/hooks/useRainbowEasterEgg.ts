import { useState, useRef, useCallback } from "react";
import type React from "react";
import { getAllLevelIds, getAllWorldIds } from "~/engine";
import { loadSave, saveSave } from "~/lib/persistence";
import type { SaveData } from "~/lib/persistence";

/** SVG viewBox dimensions for the rainbow arc — shared with worlds.tsx. */
export const SVG_WIDTH = 320;
export const SVG_HEIGHT = 140;

/** Vertical center of the arc as a ratio of SVG_HEIGHT (used for hit-detection). */
export const ARC_CENTER_Y_RATIO = 0.78;

/** Return type for useRainbowEasterEgg — makes the persistence mutation visible. */
export interface UseRainbowEasterEggReturn {
  rainbowRef: React.RefObject<SVGSVGElement | null>;
  progress: number;
  potRevealed: boolean;
  unlocked: boolean;
  handleRainbowMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  /**
   * Click handler for the pot of gold.
   *
   * Side-effect: writes to localStorage via saveSave() to unlock all levels
   * and worlds, then invokes the onSaveChanged callback so the caller can
   * react to the updated save state.
   */
  handlePotClick: () => void;
  handleRainbowLeave: () => void;
}

/**
 * Encapsulates the rainbow-tracing easter egg interaction.
 *
 * The user traces along a rainbow arc SVG; once progress exceeds 90 %,
 * a pot of gold is revealed. Clicking the pot unlocks all levels.
 *
 * Side-effects:
 *   - `handlePotClick` writes to localStorage via `saveSave()` to persist
 *     unlocked levels/worlds, then invokes the provided `onSaveChanged`
 *     callback so callers can refresh their save state.
 *
 * Returns state and event handlers that should be wired to the SVG element.
 */
export function useRainbowEasterEgg(onSaveChanged: (save: SaveData) => void): UseRainbowEasterEggReturn {
  const [progress, setProgress] = useState(0);
  const [potRevealed, setPotRevealed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const rainbowRef = useRef<SVGSVGElement>(null);
  const maxProgress = useRef(0);

  const handleRainbowMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = rainbowRef.current;
      if (!svg || potRevealed) return;

      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * ARC_CENTER_Y_RATIO;
      const dx = e.clientX - cx;
      const dy = -(e.clientY - cy);

      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = rect.width * 0.48;
      const minR = rect.width * 0.12;
      if (dist < minR || dist > maxR) return;

      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;
      if (angle > Math.PI) return;

      const t = 1 - angle / Math.PI;

      if (t > maxProgress.current - 0.05) {
        maxProgress.current = Math.max(maxProgress.current, t);
        setProgress(maxProgress.current);

        if (maxProgress.current > 0.9) {
          setPotRevealed(true);
          setProgress(1);
        }
      }
    },
    [potRevealed],
  );

  const handlePotClick = useCallback(() => {
    if (unlocked) return;
    setUnlocked(true);

    const freshSave = loadSave();
    // Grant access to all levels without fabricating completion scores
    freshSave.unlockedLevels = getAllLevelIds();
    freshSave.unlockedWorlds = getAllWorldIds();
    saveSave(freshSave);
    onSaveChanged({ ...freshSave });
  }, [unlocked, onSaveChanged]);

  const handleRainbowLeave = useCallback(() => {
    if (!potRevealed) {
      setProgress(0);
      maxProgress.current = 0;
    }
  }, [potRevealed]);

  return {
    rainbowRef,
    progress,
    potRevealed,
    unlocked,
    handleRainbowMove,
    handlePotClick,
    handleRainbowLeave,
  } as const;
}
