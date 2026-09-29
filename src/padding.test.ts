import { describe, expect, it } from "vitest";
import { calculateWrapSegment } from "./geometry";
import {
  generateWrapOutline,
  type WrapOutline,
} from "./outline";
import { applyPadding } from "./padding";

describe("applyPadding", () => {
  it("adds bleed and seam overlap to a straight segment", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 8.1,
      bottomCircumference: 8.1,
      height: 5.9,
    });

    const outline: WrapOutline = [
      { x: 0, y: 0 },
      { x: 8.1, y: 0 },
      { x: 8.1, y: 5.9 },
      { x: 0, y: 5.9 },
    ];

    const result = applyPadding(
      outline,
      geometry,
      0.125,
      0.25,
    );

    expect(result).toEqual([
      { x: -0.125, y: -0.125 },
      { x: 8.475, y: -0.125 },
      { x: 8.475, y: 6.025 },
      { x: -0.125, y: 6.025 },
    ]);
  });

  it("adds bleed and a constant-width seam tab to a tapered segment", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 3.4,
      bottomCircumference: 8.1,
      height: 0.85,
    });

    const outline = generateWrapOutline(geometry);

    if (
      geometry.outerRadius === null ||
      geometry.innerRadius === null
    ) {
      throw new Error(
        "Expected tapered segment geometry",
      );
    }

    const originalPointCount = outline.length;
    const pointCount = originalPointCount / 2;

    const bleed = 0.125;
    const seamOverlap = 0.25;

    const result = applyPadding(
      outline,
      geometry,
      bleed,
      seamOverlap,
    );

    const paddedOuterRadius = Math.hypot(
      result[0].x,
      result[0].y,
    );

    const paddedInnerRadius = Math.hypot(
      result[pointCount + 2].x,
      result[pointCount + 2].y,
    );

    expect(result).toHaveLength(
      originalPointCount + 4,
    );

    expect(paddedOuterRadius).toBeCloseTo(
      geometry.outerRadius + bleed,
    );

    expect(paddedInnerRadius).toBeCloseTo(
      geometry.innerRadius - bleed,
    );

    const outerEnd = result[pointCount - 1];
    const shiftedOuterEnd = result[pointCount];

    const shiftedInnerEnd =
      result[pointCount + 1];
    const innerEnd = result[pointCount + 2];

    const outerEndExtension = Math.hypot(
      shiftedOuterEnd.x - outerEnd.x,
      shiftedOuterEnd.y - outerEnd.y,
    );

    const innerEndExtension = Math.hypot(
      shiftedInnerEnd.x - innerEnd.x,
      shiftedInnerEnd.y - innerEnd.y,
    );

    expect(outerEndExtension).toBeCloseTo(
      bleed + seamOverlap,
    );

    expect(innerEndExtension).toBeCloseTo(
      bleed + seamOverlap,
    );

    const outerStart = result[0];
    const innerStart =
      result[result.length - 3];

    const shiftedInnerStart =
      result[result.length - 2];

    const shiftedOuterStart =
      result[result.length - 1];

    const outerStartExtension = Math.hypot(
      shiftedOuterStart.x - outerStart.x,
      shiftedOuterStart.y - outerStart.y,
    );

    const innerStartExtension = Math.hypot(
      shiftedInnerStart.x - innerStart.x,
      shiftedInnerStart.y - innerStart.y,
    );

    expect(outerStartExtension).toBeCloseTo(
      bleed,
    );

    expect(innerStartExtension).toBeCloseTo(
      bleed,
    );
  });
});