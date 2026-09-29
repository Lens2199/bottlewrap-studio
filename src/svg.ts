import type { WrapOutline } from "./outline";
import type { Point } from "./points";

export type MeasurementUnit = "in" | "cm";

export type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

export function pointsToString(points: Point[]): string {
  const coordinatePairs = points.map((point) => {
    return `${point.x},${point.y}`;
  });

  return coordinatePairs.join(" ");
}

export function calculateBounds(points: Point[]): Bounds {
  if (points.length === 0) {
    throw new Error("Cannot calculate bounds for an empty point list");
  }

  const xValues = points.map((point) => point.x);

  const yValues = points.map((point) => point.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function layoutWrapOutline(outlines: WrapOutline[]): WrapOutline[] {
  const gap = 0.25;
  const laidOutOutlines: WrapOutline[] = [];

  let nextY = 0;

  for (const outline of outlines) {
    const bounds = calculateBounds(outline);
    const shiftX = -bounds.minX;
    const shiftY = nextY - bounds.minY;

    const shiftedOutline = outline.map((point) => ({
      x: point.x + shiftX,
      y: point.y + shiftY,
    }));

    laidOutOutlines.push(shiftedOutline);

    nextY += bounds.height + gap;
  }

  return laidOutOutlines;
}

export function generateSvg(
  outlines: WrapOutline[],
  unit: MeasurementUnit = "in",
): string {
  if (outlines.length === 0) {
    throw new Error("Cannot generate an SVG without an outline");
  }

  const laidOutOutlines = layoutWrapOutline(outlines);

  const allPoints = laidOutOutlines.flat();

  const bounds = calculateBounds(allPoints);

  const polygons = laidOutOutlines
    .map((outline) => {
      const points = pointsToString(outline);

      return `<polygon points="${points}" fill="none" stroke="black" stroke-width="0.02" />`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg"
  width="${bounds.width}${unit}"
  height="${bounds.height}${unit}"
  viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  ${polygons}
</svg>`;
}
