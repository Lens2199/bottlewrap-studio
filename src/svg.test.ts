import { describe, expect, it } from "vitest";
import { calculateBottleWrap } from "./geometry";
import { generateWrapOutline } from "./outline";
import { generateSvg, pointsToString } from "./svg";

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

describe("generateSvg", () => {
  it("creates two polygons for a tapered bottle", () => {
    const geometry = calculateBottleWrap({
      bodyCircumference: 8.1,
      neckCircumference: 3.4,
      shoulderHeight: 0.85,
      bodyHeight: 5.9,
      bleed: 0,
      seamOverlap: 0,
    });

    const outline = generateWrapOutline(geometry);
    const svg = generateSvg(outline);

    console.log(svg);

    const polygonCount = svg.split("<polygon").length - 1;

    expect(polygonCount).toBe(2);
  });

  it("creates one polygon for a cylinder", () => {
    const geometry = calculateBottleWrap({
      bodyCircumference: 12,
      neckCircumference: 12,
      shoulderHeight: 0,
      bodyHeight: 5,
      bleed: 0,
      seamOverlap: 0,
    });

    const outline = generateWrapOutline(geometry);
    const svg = generateSvg(outline);

    const polygonCount = svg.split("<polygon").length - 1;

    expect(polygonCount).toBe(1);
  });
});
