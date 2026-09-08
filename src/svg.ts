import type { Point } from "./points";

export function pointsToString(
  points: Point[],
): string {
  const coordinatePairs = points.map((point) => {
    return `${point.x},${point.y}`;
  });

  return coordinatePairs.join(" ");
}