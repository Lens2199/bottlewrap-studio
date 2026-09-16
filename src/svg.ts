import type { WrapOutline } from "./outline";
import type { Point } from "./points";

export function pointsToString(points: Point[]): string {
  const coordinatePairs = points.map((point) => {
    return `${point.x},${point.y}`;
  });

  return coordinatePairs.join(" ");
}

export function generateSvg(outline: WrapOutline): string {
  const gap = 0.25;

  const bodyYValues = outline.body.map((point) => point.y);
  const bodyBottom = Math.max(...bodyYValues);

  let shiftedShoulder: Point[] | null;

  if (outline.shoulder === null) {
    shiftedShoulder = null;
  } else {
    const shoulderYValues = outline.shoulder.map((point) => point.y);
    const shoulderTop = Math.min(...shoulderYValues);

    // Position the shoulder below the body with a gap
    const shiftY = bodyBottom + gap - shoulderTop;

    shiftedShoulder = outline.shoulder.map((point) => ({
      x: point.x,
      y: point.y + shiftY,
    }));
  }

  const allPoints =
    shiftedShoulder === null
      ? outline.body
      : [...outline.body, ...shiftedShoulder];

  const xValues = allPoints.map((point) => point.x);
  const yValues = allPoints.map((point) => point.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const width = maxX - minX;
  const height = maxY - minY;

  const bodyPoints = pointsToString(outline.body);

  const shoulderPoints =
    shiftedShoulder === null ? null : pointsToString(shiftedShoulder);

  const shoulderPolygon =
    shoulderPoints === null
      ? ""
      : `<polygon points="${shoulderPoints}" fill="none" stroke="black" stroke-width="0.02" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg"
  width="${width}in"
  height="${height}in"
  viewBox="${minX} ${minY} ${width} ${height}">
  <polygon points="${bodyPoints}" fill="none" stroke="black" stroke-width="0.02" />
  ${shoulderPolygon}
</svg>`;
}