import { describe, expect, it } from "vitest";
import { calculateWrapSegment } from "./geometry";
import { generateWrapOutline } from "./outline";
import type { WrapOutline } from "./outline";
import {
  calculateBounds,
  generateSvg,
  layoutWrapOutline,
  pointsToString,
} from "./svg";

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

describe("layoutWrapOutline", () => {
  it("stacks any number of pieces with a gap", () => {
    const firstPiece: WrapOutline = [
      { x: 0, y: 10 },
      { x: 2, y: 10 },
      { x: 2, y: 12 },
      { x: 0, y: 12 },
    ];

    const secondPiece: WrapOutline = [
      { x: 0, y: -5 },
      { x: 3, y: -5 },
      { x: 3, y: -1 },
      { x: 0, y: -1 },
    ];

    const result = layoutWrapOutline([
      firstPiece,
      secondPiece,
    ]);

    const firstBounds = calculateBounds(
      result[0],
    );

    const secondBounds = calculateBounds(
      result[1],
    );

    expect(firstBounds.minY).toBeCloseTo(0);
    expect(firstBounds.maxY).toBeCloseTo(2);

    expect(secondBounds.minY).toBeCloseTo(
      2.25,
    );

    expect(secondBounds.maxY).toBeCloseTo(
      6.25,
    );
  });
});

describe("generateSvg", () => {
  it("creates two polygons for the original bottle", () => {
    const bodyGeometry = calculateWrapSegment({
      topCircumference: 8.1,
      bottomCircumference: 8.1,
      height: 5.9,
    });

    const shoulderGeometry =
      calculateWrapSegment({
        topCircumference: 3.4,
        bottomCircumference: 8.1,
        height: 0.85,
      });

    const bodyOutline =
      generateWrapOutline(bodyGeometry);

    const shoulderOutline =
      generateWrapOutline(shoulderGeometry);

    const svg = generateSvg([
      bodyOutline,
      shoulderOutline,
    ]);

    const polygonCount =
      svg.split("<polygon").length - 1;

    expect(polygonCount).toBe(2);
  });

  it("creates one polygon for a straight segment in inches", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline =
      generateWrapOutline(geometry);

    const svg = generateSvg([outline]);

    const polygonCount =
      svg.split("<polygon").length - 1;

    expect(polygonCount).toBe(1);
    expect(svg).toContain('width="12in"');
    expect(svg).toContain('height="5in"');
  });

  it("uses centimeters when centimeters are selected", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline =
      generateWrapOutline(geometry);

    const svg = generateSvg(
      [outline],
      "cm",
    );

    expect(svg).toContain('width="12cm"');
    expect(svg).toContain('height="5cm"');
  });
});