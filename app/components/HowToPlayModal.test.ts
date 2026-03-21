/**
 * HowToPlayModal — pure-data tests.
 *
 * Follows the project convention of testing exported pure values and
 * predicates without a DOM environment (no jsdom dependency).
 */
import { describe, expect, it } from "vitest";
import {
  INSTRUCTIONS,
  FOCUSABLE_SELECTOR,
  type InstructionStep,
} from "./HowToPlayModal";

/* ── INSTRUCTIONS content coverage ───────────────────────────── */

describe("INSTRUCTIONS", () => {
  /** Concatenate all titles and bodies for keyword assertions. */
  const allText = INSTRUCTIONS.map(
    (s) => `${s.title.toLowerCase()} ${s.body.toLowerCase()}`,
  ).join(" ");

  it("covers straight tile type", () => {
    expect(allText).toContain("straight");
  });

  it("covers curve tile type", () => {
    expect(allText).toContain("curve");
  });

  it("covers rotation mechanic", () => {
    expect(allText).toMatch(/rotat/);
  });

  it("covers path connection goal", () => {
    expect(allText).toContain("path");
  });

  it("covers the Go button", () => {
    expect(allText).toMatch(/\bgo\b/);
  });

  it("covers par scoring", () => {
    expect(allText).toContain("par");
  });

  it("covers clover scoring", () => {
    expect(allText).toContain("clover");
  });

  it("has at least one step", () => {
    expect(INSTRUCTIONS.length).toBeGreaterThan(0);
  });

  it("every step has a non-empty icon, title, and body", () => {
    for (const step of INSTRUCTIONS) {
      expect(step.icon.length, `icon should not be empty`).toBeGreaterThan(0);
      expect(step.title.length, `title should not be empty`).toBeGreaterThan(0);
      expect(step.body.length, `body should not be empty`).toBeGreaterThan(0);
    }
  });

  it("is frozen (runtime immutability)", () => {
    expect(Object.isFrozen(INSTRUCTIONS)).toBe(true);
  });

  it("each step satisfies the InstructionStep interface shape", () => {
    for (const step of INSTRUCTIONS) {
      // Runtime shape check — complements the compile-time type
      expect(typeof step.icon).toBe("string");
      expect(typeof step.title).toBe("string");
      expect(typeof step.body).toBe("string");
      // No extraneous keys
      expect(Object.keys(step).sort()).toEqual(["body", "icon", "title"]);
    }
  });
});

/* ── FOCUSABLE_SELECTOR correctness ──────────────────────────── */

describe("FOCUSABLE_SELECTOR", () => {
  it("includes anchor elements with href", () => {
    expect(FOCUSABLE_SELECTOR).toContain("a[href]");
  });

  it("includes enabled buttons", () => {
    expect(FOCUSABLE_SELECTOR).toContain("button:not([disabled])");
  });

  it("includes enabled text inputs", () => {
    expect(FOCUSABLE_SELECTOR).toContain("input:not([disabled])");
  });

  it("includes enabled textareas", () => {
    expect(FOCUSABLE_SELECTOR).toContain("textarea:not([disabled])");
  });

  it("includes enabled selects", () => {
    expect(FOCUSABLE_SELECTOR).toContain("select:not([disabled])");
  });

  it("includes elements with a non-negative tabindex", () => {
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])');
  });

  it("excludes disabled elements from every applicable tag", () => {
    // Every tag-based part that can be disabled should include :not([disabled])
    const tagParts = FOCUSABLE_SELECTOR.split(",").map((s) => s.trim());
    const disableable = tagParts.filter((p) =>
      /^(button|input|textarea|select)/.test(p),
    );
    for (const part of disableable) {
      expect(part).toContain(":not([disabled])");
    }
  });
});
