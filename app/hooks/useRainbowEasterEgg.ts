import { useState, useRef, useCallback } from "react";
import type React from "react";
import { getAllLevelIds, getAllWorldIds } from "~/engine";
import {
  computeArcProgress,
  REVEAL_THRESHOLD,
  PROGRESS_TOLERANCE,
} from "~/geometry/rainbow-arc";
import { useSave } from "~/hooks/useSave";

/** Return type for useRainbowEasterEgg. */
export interface UseRainbowEasterEggReturn {
  rainbowRef: React.RefObject<SVGSVGElement | null>;
  progress: number;
  potRevealed: boolean;
  unlocked: boolean;
  handleRainbowMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  /**
   * Click handler for the pot of gold.
   *
   * Side-effect: calls `updateSave` (via internal `useSave()`) to unlock all
   * levels and worlds.
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
 * Persistence: follows the project convention (see useSave.ts module doc) by
 * calling `useSave()` internally rather than accepting persistence functions
 * as parameters.
 *
 * Returns state and event handlers that should be wired to the SVG element.
 */
export function useRainbowEasterEgg(): UseRainbowEasterEggReturn {
  const { updateSave } = useSave();
  const [progress, setProgress] = useState(0);
  const [potRevealed, setPotRevealed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const rainbowRef = useRef<SVGSVGElement>(null);
  const maxProgress = useRef(0);

  const handleRainbowMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = rainbowRef.current;
      if (!svg || potRevealed) return;

      const t = computeArcProgress(
        e.clientX,
        e.clientY,
        svg.getBoundingClientRect(),
      );
      if (t === null) return;

      if (t > maxProgress.current - PROGRESS_TOLERANCE) {
        maxProgress.current = Math.max(maxProgress.current, t);
        setProgress(maxProgress.current);

        if (maxProgress.current > REVEAL_THRESHOLD) {
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
