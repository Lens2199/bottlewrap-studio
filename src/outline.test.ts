import { describe, expect, it } from "vitest";
import { calculateBottleWrap } from "./geometry";
import { generateWrapOutline } from "./outline";

describe("generateWrapOutline", () => {
  it("creates body and shoulder outlines for a real bottle", () => {
    const geometry = calculateBottleWrap({
      bodyCircumference: 8.1,
      neckCircumference: 3.4,
      shoulderHeight: 0.85,
      bodyHeight: 5.9,
      bleed: 0,
      seamOverlap: 0,
    });

    const outline = generateWrapOutline(geometry);

    expect(outline.body).toHaveLength(4);
    expect(outline.shoulder).not.toBeNull();
    expect(outline.shoulder).toHaveLength(80);
  });

  it("returns no shoulder outline for a cylinder", () => {
    const geometry = calculateBottleWrap({
      bodyCircumference: 12,
      neckCircumference: 12,
      shoulderHeight: 0,
      bodyHeight: 5,
      bleed: 0,
      seamOverlap: 0,
    });

    const outline = generateWrapOutline(geometry);

    expect(outline.body).toHaveLength(4);
    expect(outline.shoulder).toBeNull();
  });
});