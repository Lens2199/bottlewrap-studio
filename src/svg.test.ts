import { describe, expect, it } from "vitest";
import { pointsToString } from "./svg";

describe("pointsToString", () => {
  it("converts points into an SVG points string", () => {
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];

    const result = pointsToString(points);

    expect(result).toBe("1,2 3,4");
  });
});