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

export function layoutWrapOutline(
  outline: WrapOutline,
): WrapOutline {
  const gap = 0.25;

  if (outline.shoulder === null) {
    return outline;
  }

  const bodyBottom = Math.max(
    ...outline.body.map((point) => point.y),
  );

  const shoulderTop = Math.min(
    ...outline.shoulder.map((point) => point.y),
  );

  const shiftY = bodyBottom + gap - shoulderTop;

  const shiftedShoulder = outline.shoulder.map((point) => ({
    x: point.x,
    y: point.y + shiftY,
  }));

  return {
    body: outline.body,
    shoulder: shiftedShoulder,
  };
}

export function generateSvg(
  outline: WrapOutline,
  unit: MeasurementUnit = "in",
): string {
  const laidOutOutline = layoutWrapOutline(outline);

  const allPoints =
    laidOutOutline.shoulder === null
      ? laidOutOutline.body
      : [
          ...laidOutOutline.body,
          ...laidOutOutline.shoulder,
        ];

  const bounds = calculateBounds(allPoints);

  const bodyPoints = pointsToString(laidOutOutline.body);

  const shoulderPoints =
    laidOutOutline.shoulder === null
      ? null
      : pointsToString(laidOutOutline.shoulder);

  const shoulderPolygon =
    shoulderPoints === null
      ? ""
      : `<polygon points="${shoulderPoints}" fill="none" stroke="black" stroke-width="0.02" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg"
  width="${bounds.width}${unit}"
  height="${bounds.height}${unit}"
  viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <polygon points="${bodyPoints}" fill="none" stroke="black" stroke-width="0.02" />
  ${shoulderPolygon}
</svg>`;
}