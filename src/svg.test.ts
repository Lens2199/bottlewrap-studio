import { describe, expect, it } from "vitest";
import { calculateWrapSegment } from "./geometry";
import {
  generateWrapOutline,
  type WrapPiece,
} from "./outline";
import { generateWrapPiece } from "./padding";
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

    expect(pointsToString(points)).toBe(
      "1,2 3,4",
    );
  });
});

describe("layoutWrapOutline", () => {
  it("shifts the cut and bleed outlines together", () => {
    const piece: WrapPiece = {
      cutOutline: [
        { x: 1, y: 1 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 1, y: 3 },
      ],
      bleedOutline: [
        { x: 0.9, y: 0.9 },
        { x: 3.1, y: 0.9 },
        { x: 3.1, y: 3.1 },
        { x: 0.9, y: 3.1 },
      ],
    };

    const result =
      layoutWrapOutline([piece]);

    const cutBounds = calculateBounds(
      result[0].cutOutline,
    );

    if (
      result[0].bleedOutline === null
    ) {
      throw new Error(
        "Expected a bleed outline",
      );
    }

    const bleedBounds = calculateBounds(
      result[0].bleedOutline,
    );

    expect(bleedBounds.minX).toBeCloseTo(0);
    expect(bleedBounds.minY).toBeCloseTo(0);

    expect(cutBounds.minX).toBeCloseTo(0.1);
    expect(cutBounds.minY).toBeCloseTo(0.1);
  });

  it("stacks multiple pieces vertically", () => {
    const firstPiece: WrapPiece = {
      cutOutline: [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: 2 },
        { x: 0, y: 2 },
      ],
      bleedOutline: null,
    };

    const secondPiece: WrapPiece = {
      cutOutline: [
        { x: -5, y: -5 },
        { x: -2, y: -5 },
        { x: -2, y: -1 },
        { x: -5, y: -1 },
      ],
      bleedOutline: null,
    };

    const result = layoutWrapOutline([
      firstPiece,
      secondPiece,
    ]);

    const firstBounds = calculateBounds(
      result[0].cutOutline,
    );

    const secondBounds = calculateBounds(
      result[1].cutOutline,
    );

    expect(firstBounds.minY).toBeCloseTo(0);
    expect(firstBounds.maxY).toBeCloseTo(2);

    expect(secondBounds.minY).toBeCloseTo(
      2.25,
    );

    expect(secondBounds.minX).toBeCloseTo(0);
  });
});

describe("generateSvg", () => {
  it("creates named bleed and cut groups", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline =
      generateWrapOutline(geometry);

    const piece = generateWrapPiece(
      outline,
      geometry,
      0.1,
      0.25,
    );

    const svg = generateSvg([piece]);

    expect(svg).toContain('<g id="bleed">');
    expect(svg).toContain('<g id="cut">');
    expect(svg).toContain('stroke="red"');
    expect(svg).toContain('stroke="black"');

    const polygonCount =
      svg.split("<polygon").length - 1;

    expect(polygonCount).toBe(2);
  });

  it("skips the bleed polygon when bleed is zero", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline =
      generateWrapOutline(geometry);

    const piece = generateWrapPiece(
      outline,
      geometry,
      0,
      0,
    );

    const svg = generateSvg([piece]);

    const polygonCount =
      svg.split("<polygon").length - 1;

    expect(polygonCount).toBe(1);
    expect(svg).not.toContain(
      'stroke="red"',
    );
  });

  it("uses inches by default", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline =
      generateWrapOutline(geometry);

    const piece = generateWrapPiece(
      outline,
      geometry,
      0,
      0,
    );

    const svg = generateSvg([piece]);

    expect(svg).toContain('width="12in"');
    expect(svg).toContain('height="5in"');
  });

  it("uses centimeters when selected", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline =
      generateWrapOutline(geometry);

    const piece = generateWrapPiece(
      outline,
      geometry,
      0,
      0,
    );

    const svg = generateSvg(
      [piece],
      "cm",
    );

    expect(svg).toContain('width="12cm"');
    expect(svg).toContain('height="5cm"');
  });
});