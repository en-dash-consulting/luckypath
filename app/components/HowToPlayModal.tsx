/**
 * How-to-Play modal — teaches core game mechanics without leaving
 * the game screen.
 *
 * Accessibility:
 *   - role="dialog" with aria-labelledby on the heading
 *   - Focus trapped inside the modal while open
 *   - Focus returned to the triggering element on close
 *   - Close via button, backdrop click, or Escape (handled by parent hook)
 *
 * Rendering:
 *   - Uses a fixed overlay that does NOT unmount or reset the canvas
 *   - Visually consistent with the existing LevelComplete modal pattern
 *
 * Pure data (INSTRUCTIONS, FOCUSABLE_SELECTOR) is exported for
 * testing without a DOM environment.
 */
import { useEffect, useRef, useCallback } from "react";

/* ── Instructional content (exported for testing) ────────────── */

export interface InstructionStep {
  icon: string;
  title: string;
  body: string;
}

/**
 * Ordered instruction steps covering every mechanic the acceptance
 * criteria require: tile types, rotation, path goal, Go button,
 * and par/clover scoring.
 */
export const INSTRUCTIONS: readonly InstructionStep[] = Object.freeze([
  {
    icon: "━",
    title: "Straight & Curve Tiles",
    body: "Pick a tile from your inventory and tap an empty cell to place it. Straight tiles continue the path forward; curve tiles turn it 90\u00B0.",
  },
  {
    icon: "\u21BB",
    title: "Rotate Tiles",
    body: "Right-click (or long-press on mobile) a placed tile to rotate it. Align each tile so the openings connect to its neighbors.",
  },
  {
    icon: "\uD83C\uDF40",
    title: "Connect the Path",
    body: "Build a continuous path from Lucky to the gold. Every tile must link to the next \u2014 no gaps allowed!",
  },
  {
    icon: "\u25B6",
    title: "Hit Go",
    body: "When your path looks ready, press Go. Lucky will walk it step by step. If the path is broken you\u2019ll see exactly where it failed.",
  },
  {
    icon: "\u2605",
    title: "Par & Clovers",
    body: "Each level has a par \u2014 the target number of tiles. Finish at or under par to earn up to 3 clovers per level!",
  },
]);

/* ── Focus-trap selector (exported for testing) ──────────────── */

/**
 * CSS selector matching all natively focusable interactive elements.
 * Used by the focus-trap logic to cycle Tab / Shift+Tab.
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ── Props ────────────────────────────────────────────────────── */

interface HowToPlayModalProps {
  onClose: () => void;
}

/* ── Component ────────────────────────────────────────────────── */

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  /* Save triggering element so focus can be restored on close */
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  /* Move focus into the modal panel on mount */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();
  }, []);

  /* Restore focus to the triggering element when the modal unmounts */
  useEffect(() => {
    return () => {
      const prev = previousFocusRef.current;
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, []);

  /* Focus trap: cycle Tab / Shift+Tab within the panel */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-scaleIn max-h-[85dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            id="how-to-play-title"
            className="text-xl font-bold text-emerald-800"
          >
            How to Play
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>

        {/* Instructions */}
        <ol className="space-y-4 mb-6">
          {INSTRUCTIONS.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span
                className="w-7 h-7 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-sm"
                aria-hidden="true"
              >
                {step.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {step.title}
                </p>
                <p className="text-sm text-emerald-700/80 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all"
          >
            Got it!
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">
              ?
            </kbd>{" "}
            anytime to reopen
          </p>
        </div>
      </div>
    </div>
  );
}
