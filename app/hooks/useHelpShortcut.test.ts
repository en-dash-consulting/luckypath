import { describe, expect, it } from "vitest";
import { isHelpToggleKey, isHelpCloseKey } from "./useHelpShortcut";

/* ── Fake event factory ────────────────────────────────────────── */

/** Minimal stand-in for KeyboardEvent — keeps tests node-only (no jsdom). */
function fakeKey(
  key: string,
  target?: { tagName?: string; isContentEditable?: boolean },
): KeyboardEvent {
  return {
    key,
    target: target ?? { tagName: "DIV", isContentEditable: false },
  } as unknown as KeyboardEvent;
}

/* ── isHelpToggleKey ───────────────────────────────────────────── */

describe("isHelpToggleKey", () => {
  it("returns true for '?' on a generic element", () => {
    expect(isHelpToggleKey(fakeKey("?"))).toBe(true);
  });

  it("returns false for any other key", () => {
    expect(isHelpToggleKey(fakeKey("a"))).toBe(false);
    expect(isHelpToggleKey(fakeKey("Shift"))).toBe(false);
    expect(isHelpToggleKey(fakeKey("/"))).toBe(false);
  });

  it("returns false when target is an <input>", () => {
    expect(isHelpToggleKey(fakeKey("?", { tagName: "INPUT" }))).toBe(false);
  });

  it("returns false when target is a <textarea>", () => {
    expect(isHelpToggleKey(fakeKey("?", { tagName: "TEXTAREA" }))).toBe(false);
  });

  it("returns false when target is a <select>", () => {
    expect(isHelpToggleKey(fakeKey("?", { tagName: "SELECT" }))).toBe(false);
  });

  it("returns false when target is contentEditable", () => {
    expect(
      isHelpToggleKey(fakeKey("?", { tagName: "DIV", isContentEditable: true })),
    ).toBe(false);
  });

  it("handles missing target gracefully", () => {
    const event = { key: "?" } as unknown as KeyboardEvent;
    expect(isHelpToggleKey(event)).toBe(true);
  });
});

/* ── isHelpCloseKey ────────────────────────────────────────────── */

describe("isHelpCloseKey", () => {
  it("returns true for Escape", () => {
    expect(isHelpCloseKey(fakeKey("Escape"))).toBe(true);
  });

  it("returns false for any other key", () => {
    expect(isHelpCloseKey(fakeKey("?"))).toBe(false);
    expect(isHelpCloseKey(fakeKey("Enter"))).toBe(false);
  });
});
