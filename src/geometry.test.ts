import { describe, expect, it } from "vitest";
import { calculateWrapSegment } from "./geometry";

describe("calculateWrapSegment", () => {
  it("calculates a tapered segment", () => {
    const result = calculateWrapSegment({
      topCircumference: 3.4,
      bottomCircumference: 8.1,
      height: 0.85,
    });

    expect(result.height).toBe(0.85);
    expect(result.innerRadius).toBeCloseTo(0.819);
    expect(result.outerRadius).toBeCloseTo(1.951);
    expect(result.sweepAngle).toBeCloseTo(237.831);
  });

  it("returns rectangular geometry for a straight segment", () => {
    const result = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    expect(result.topCircumference).toBe(12);
    expect(result.bottomCircumference).toBe(12);
    expect(result.height).toBe(5);
    expect(result.innerRadius).toBeNull();
    expect(result.outerRadius).toBeNull();
    expect(result.sweepAngle).toBeNull();
  });

  it("handles a segment that is wider at the top", () => {
    const result = calculateWrapSegment({
      topCircumference: 11,
      bottomCircumference: 9,
      height: 6,
    });

    expect(result.innerRadius).not.toBeNull();
    expect(result.outerRadius).not.toBeNull();
    expect(result.sweepAngle).not.toBeNull();

    if (
      result.innerRadius === null ||
      result.outerRadius === null ||
      result.sweepAngle === null
    ) {
      throw new Error(
        "Expected tapered segment geometry",
      );
    }

    const innerArcLength =
      2 *
      Math.PI *
      result.innerRadius *
      (result.sweepAngle / 360);

    expect(innerArcLength).toBeCloseTo(9);
    expect(result.outerRadius).toBeGreaterThan(
      result.innerRadius,
    );
  });
});