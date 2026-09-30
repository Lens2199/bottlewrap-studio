import { describe, expect, it } from "vitest";
import { calculateWrapSegment } from "./geometry";
import { generateWrapOutline } from "./outline";
import { generateWrapPiece } from "./padding";
import { calculateBounds } from "./svg";

describe("generateWrapPiece", () => {
  it("creates separate cut and bleed outlines", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 8.1,
      bottomCircumference: 8.1,
      height: 5.9,
    });

    const originalOutline =
      generateWrapOutline(geometry);

    const result = generateWrapPiece(
      originalOutline,
      geometry,
      0.1,
      0.25,
    );

    expect(result.bleedOutline).not.toBeNull();

    if (result.bleedOutline === null) {
      throw new Error(
        "Expected a bleed outline",
      );
    }

    const cutBounds = calculateBounds(
      result.cutOutline,
    );

    const bleedBounds = calculateBounds(
      result.bleedOutline,
    );

    expect(cutBounds.minX).toBeCloseTo(0);
    expect(cutBounds.maxX).toBeCloseTo(
      8.35,
    );

    expect(cutBounds.minY).toBeCloseTo(0);
    expect(cutBounds.maxY).toBeCloseTo(
      5.9,
    );

    expect(bleedBounds.minX).toBeCloseTo(
      cutBounds.minX - 0.1,
    );

    expect(bleedBounds.maxX).toBeCloseTo(
      cutBounds.maxX + 0.1,
    );

    expect(bleedBounds.minY).toBeCloseTo(
      cutBounds.minY - 0.1,
    );

    expect(bleedBounds.maxY).toBeCloseTo(
      cutBounds.maxY + 0.1,
    );
  });

  it("does not create a bleed outline when bleed is zero", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const originalOutline =
      generateWrapOutline(geometry);

    const result = generateWrapPiece(
      originalOutline,
      geometry,
      0,
      0.25,
    );

    expect(result.bleedOutline).toBeNull();

    const cutBounds = calculateBounds(
      result.cutOutline,
    );

    expect(cutBounds.width).toBeCloseTo(
      12.25,
    );

    expect(cutBounds.height).toBeCloseTo(5);
  });

  it("creates cut and bleed outlines for a tapered segment", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 3.4,
      bottomCircumference: 8.1,
      height: 0.85,
    });

    const originalOutline =
      generateWrapOutline(geometry);

    const bleed = 0.125;
    const seamOverlap = 0.25;

    const result = generateWrapPiece(
      originalOutline,
      geometry,
      bleed,
      seamOverlap,
    );

    expect(result.bleedOutline).not.toBeNull();

    if (
      result.bleedOutline === null ||
      geometry.innerRadius === null ||
      geometry.outerRadius === null
    ) {
      throw new Error(
        "Expected tapered bleed geometry",
      );
    }

    const pointCount =
      originalOutline.length / 2;

    const bleedOuterRadius = Math.hypot(
      result.bleedOutline[0].x,
      result.bleedOutline[0].y,
    );

    const bleedInnerRadius = Math.hypot(
      result.bleedOutline[
        pointCount + 2
      ].x,
      result.bleedOutline[
        pointCount + 2
      ].y,
    );

    expect(bleedOuterRadius).toBeCloseTo(
      geometry.outerRadius + bleed,
    );

    expect(bleedInnerRadius).toBeCloseTo(
      geometry.innerRadius - bleed,
    );
  });
});