import { describe, expect, it } from "vitest";
import { calculateBottleWrap } from "./geometry";

describe("calculateBottleWrap", () => {
  it("calculates a tapered bottle wrap", () => {
    const result = calculateBottleWrap({
      bodyCircumference: 8.1,
      neckCircumference: 3.4,
      shoulderHeight: 0.85,
      bodyHeight: 5.9,
      bleed: 0,
      seamOverlap: 0,
    });

    expect(result.totalWrapHeight).toBe(6.75);
    expect(result.innerRadius).toBeCloseTo(0.819);
    expect(result.outerRadius).toBeCloseTo(1.951);
    expect(result.sweepAngle).toBeCloseTo(237.831);
  });

  it("returns a rectangular wrap for a cylinder", () => {
    const result = calculateBottleWrap({
      bodyCircumference: 12,
      neckCircumference: 12,
      shoulderHeight: 0,
      bodyHeight: 5,
      bleed: 0,
      seamOverlap: 0,
    });

    expect(result.totalWrapHeight).toBe(5);
    expect(result.innerRadius).toBeNull();
    expect(result.outerRadius).toBeNull();
    expect(result.sweepAngle).toBeNull();
  });

  it("throws when the neck is larger than the body", () => {
    const badInput = {
      bodyCircumference: 5,
      neckCircumference: 8,
      shoulderHeight: 1,
      bodyHeight: 5,
      bleed: 0,
      seamOverlap: 0,
    };

    expect(() => calculateBottleWrap(badInput)).toThrow(
      "neck must be smaller than body",
    );
  });
});