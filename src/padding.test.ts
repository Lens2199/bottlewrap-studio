import { describe, expect, it } from "vitest";
import { calculateBottleWrap } from "./geometry";
import { generateWrapOutline, type WrapOutline } from "./outline";
import { applyPadding } from "./padding";

describe("applyPadding", () => {
  it("adds bleed and seam overlap to the body rectangle", () => {
    const geometry = calculateBottleWrap({
      bodyCircumference: 8.1,
      neckCircumference: 8.1,
      shoulderHeight: 0,
      bodyHeight: 5.9,
      bleed: 0,
      seamOverlap: 0,
    });

    const outline: WrapOutline = {
      body: [
        { x: 0, y: 0 },
        { x: 8.1, y: 0 },
        { x: 8.1, y: 5.9 },
        { x: 0, y: 5.9 },
      ],
      shoulder: null,
    };

    const result = applyPadding(outline, geometry, 0.125, 0.25);

    expect(result.body).toEqual([
      { x: -0.125, y: -0.125 },
      { x: 8.475, y: -0.125 },
      { x: 8.475, y: 6.025 },
      { x: -0.125, y: 6.025 },
    ]);

    expect(result.shoulder).toBeNull();
  });

  it("adds bleed and a constant-width seam tab to the shoulder band", () => {
    const geometry = calculateBottleWrap({
      bodyCircumference: 8.1,
      neckCircumference: 3.4,
      shoulderHeight: 0.85,
      bodyHeight: 5.9,
      bleed: 0,
      seamOverlap: 0,
    });

    const outline = generateWrapOutline(geometry);

    if (outline.shoulder === null) {
      throw new Error("Expected a shoulder outline");
    }

    const originalPointCount = outline.shoulder.length;
    const pointCount = originalPointCount / 2;

    const originalOuterRadius = Math.hypot(
      outline.shoulder[0].x,
      outline.shoulder[0].y,
    );

    const originalInnerRadius = Math.hypot(
      outline.shoulder[originalPointCount - 1].x,
      outline.shoulder[originalPointCount - 1].y,
    );

    const bleed = 0.125;
    const seamOverlap = 0.25;

    const result = applyPadding(outline, geometry, bleed, seamOverlap);

    if (result.shoulder === null) {
      throw new Error("Expected a padded shoulder");
    }

    const paddedShoulder = result.shoulder;

    const paddedOuterRadius = Math.hypot(
      paddedShoulder[0].x,
      paddedShoulder[0].y,
    );

    const paddedInnerRadius = Math.hypot(
      paddedShoulder[pointCount + 2].x,
      paddedShoulder[pointCount + 2].y,
    );

    expect(paddedShoulder).toHaveLength(originalPointCount + 4);

    expect(paddedOuterRadius).toBeCloseTo(originalOuterRadius + bleed);

    expect(paddedInnerRadius).toBeCloseTo(originalInnerRadius - bleed);

    const outerEnd = paddedShoulder[pointCount - 1];
    const shiftedOuterEnd = paddedShoulder[pointCount];

    const shiftedInnerEnd = paddedShoulder[pointCount + 1];
    const innerEnd = paddedShoulder[pointCount + 2];

    const outerEndExtension = Math.hypot(
      shiftedOuterEnd.x - outerEnd.x,
      shiftedOuterEnd.y - outerEnd.y,
    );

    const innerEndExtension = Math.hypot(
      shiftedInnerEnd.x - innerEnd.x,
      shiftedInnerEnd.y - innerEnd.y,
    );

    expect(outerEndExtension).toBeCloseTo(bleed + seamOverlap);

    expect(innerEndExtension).toBeCloseTo(bleed + seamOverlap);

    const outerStart = paddedShoulder[0];
    const innerStart = paddedShoulder[paddedShoulder.length - 3];

    const shiftedInnerStart = paddedShoulder[paddedShoulder.length - 2];

    const shiftedOuterStart = paddedShoulder[paddedShoulder.length - 1];

    const outerStartExtension = Math.hypot(
      shiftedOuterStart.x - outerStart.x,
      shiftedOuterStart.y - outerStart.y,
    );

    const innerStartExtension = Math.hypot(
      shiftedInnerStart.x - innerStart.x,
      shiftedInnerStart.y - innerStart.y,
    );

    expect(outerStartExtension).toBeCloseTo(bleed);
    expect(innerStartExtension).toBeCloseTo(bleed);
  });
});
