import { describe, it, expect } from "vitest";
import { posKey } from "./utils";

describe("posKey", () => {
  it("returns 'row,col' format", () => {
    expect(posKey(0, 0)).toBe("0,0");
    expect(posKey(3, 7)).toBe("3,7");
  });

  it("handles negative coordinates", () => {
    expect(posKey(-1, -2)).toBe("-1,-2");
  });

  it("produces unique keys for distinct positions", () => {
    const keys = new Set([posKey(1, 2), posKey(2, 1), posKey(1, 1)]);
    expect(keys.size).toBe(3);
  });
});
