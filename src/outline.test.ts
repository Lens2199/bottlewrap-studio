import { describe, expect, it } from "vitest";
import { calculateWrapSegment } from "./geometry";
import { generateWrapOutline } from "./outline";

describe("generateWrapOutline", () => {
  it("creates separate body and shoulder pieces for the original bottle", () => {
    const bodyGeometry = calculateWrapSegment({
      topCircumference: 8.1,
      bottomCircumference: 8.1,
      height: 5.9,
    });

    const shoulderGeometry = calculateWrapSegment({
      topCircumference: 3.4,
      bottomCircumference: 8.1,
      height: 0.85,
    });

    const bodyOutline =
      generateWrapOutline(bodyGeometry);

    const shoulderOutline =
      generateWrapOutline(shoulderGeometry);

    expect(bodyOutline).toHaveLength(4);
    expect(shoulderOutline).toHaveLength(80);
  });

  it("creates a rectangle for a straight segment", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 12,
      bottomCircumference: 12,
      height: 5,
    });

    const outline = generateWrapOutline(geometry);

    expect(outline).toEqual([
      { x: 0, y: 0 },
      { x: 12, y: 0 },
      { x: 12, y: 5 },
      { x: 0, y: 5 },
    ]);
  });

  it("creates a curved outline when the top is wider", () => {
    const geometry = calculateWrapSegment({
      topCircumference: 11,
      bottomCircumference: 9,
      height: 6,
    });

    const outline = generateWrapOutline(geometry);

    expect(outline).toHaveLength(80);
  });
});