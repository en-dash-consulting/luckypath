import { describe, expect, it } from "vitest";
import { calculateClovers } from "./scoring";

describe("calculateClovers", () => {
  it("returns 3 clovers when tiles used equals par", () => {
    expect(calculateClovers(5, 5)).toBe(3);
  });

  it("returns 3 clovers when tiles used is under par", () => {
    expect(calculateClovers(3, 5)).toBe(3);
  });

  it("returns 2 clovers when tiles used is one over par", () => {
    expect(calculateClovers(6, 5)).toBe(2);
  });

  it("returns 1 clover when tiles used is two over par", () => {
    expect(calculateClovers(7, 5)).toBe(1);
  });

  it("returns 1 clover when tiles used is many over par", () => {
    expect(calculateClovers(20, 5)).toBe(1);
  });

  it("handles par of 0", () => {
    expect(calculateClovers(0, 0)).toBe(3);
    expect(calculateClovers(1, 0)).toBe(2);
    expect(calculateClovers(2, 0)).toBe(1);
  });
});
