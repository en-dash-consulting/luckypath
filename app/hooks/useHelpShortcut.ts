/**
 * Help-modal keyboard shortcut hook.
 *
 * Listens for '?' to toggle and Escape to close a help overlay.
 * Skips events originating from form controls so game keyboard
 * shortcuts never conflict with text entry.
 *
 * Pure helpers (isHelpToggleKey, isHelpCloseKey) are exported for
 * testing without a DOM environment.
 */
import { useState, useEffect, useCallback } from "react";

/* ── Form-control tag names that should swallow keystrokes ────── */

const FORM_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/* ── Pure predicates (tested in useHelpShortcut.test.ts) ─────── */

/**
 * Returns `true` when the event represents a help-toggle keystroke
 * ('?') that did NOT originate from a form control.
 */
export function isHelpToggleKey(event: KeyboardEvent): boolean {
  if (event.key !== "?") return false;

  const target = event.target as Element | null;
  if (target && FORM_TAGS.has(target.tagName)) return false;
  if ((target as HTMLElement | null)?.isContentEditable) return false;

  return true;
}

/** Returns `true` when the event is the Escape key. */
export function isHelpCloseKey(event: KeyboardEvent): boolean {
  return event.key === "Escape";
}

/* ── Hook ─────────────────────────────────────────────────────── */

/**
 * Manages help-modal open state driven by keyboard shortcuts.
 *
 * - `?` toggles the modal open / closed.
 * - `Escape` closes the modal (only captured when open).
 *
 * The document-level listener is attached on mount and removed on
 * unmount, preventing memory leaks.
 *
 * @returns A tuple of `[isOpen, toggle]` where `toggle` is a stable
 *          callback suitable for passing as an `onClick` handler.
 */
export function useHelpShortcut(): [boolean, () => void] {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isHelpToggleKey(event)) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }
      if (isOpen && isHelpCloseKey(event)) {
        event.preventDefault();
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return [isOpen, toggle];
}
