import { useState, useRef, useCallback } from "react";
import type React from "react";
import { getAllLevelIds, getAllWorldIds } from "~/engine";
import type { SaveData } from "~/lib/persistence";
import { ARC_CENTER_Y_RATIO } from "~/lib/rainbow-constants";

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
   * Side-effect: delegates to the caller's `updateSave` to unlock all levels
   * and worlds. The persistence write is handled by `useSave`.
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
 *   - `handlePotClick` delegates to the caller's `updateSave` to persist
 *     unlocked levels/worlds. This keeps all persistence writes flowing
 *     through the `useSave` coordinator.
 *
 * Returns state and event handlers that should be wired to the SVG element.
 */
export function useRainbowEasterEgg(
  updateSave: (updater: (current: SaveData) => SaveData) => void,
): UseRainbowEasterEggReturn {
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

    // Grant access to all levels without fabricating completion scores.
    // Delegates read-modify-write to the caller's updateSave so persistence
    // initialisation stays in the useSave coordinator.
    updateSave((current) => ({
      ...current,
      unlockedLevels: getAllLevelIds(),
      unlockedWorlds: getAllWorldIds(),
    }));
  }, [unlocked, updateSave]);

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
