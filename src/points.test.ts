import { describe, expect, it } from "vitest";
import { generateArcPoints } from "./points";

describe("generateArcPoints", () => {
  it("generates the correct endpoints for a 90-degree arc", () => {
    const points = generateArcPoints(1, 90, 3);

    // The first point is at 0 degrees: (1, 0)
    expect(points[0].x).toBeCloseTo(1);
    expect(points[0].y).toBeCloseTo(0);

    // The last point is at 90 degrees: (0, 1)
    expect(points[2].x).toBeCloseTo(0);
    expect(points[2].y).toBeCloseTo(1);
  });

  it("throws when pointCount is less than 2", () => {
    expect(() => generateArcPoints(1, 90, 1)).toThrow(
      "pointCount must be at least 2",
    );
  });
});