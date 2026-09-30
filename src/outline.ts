import type { WrapSegmentGeometry } from "./geometry";
import {
  generateArcPoints,
  type Point,
} from "./points";

export type WrapOutline = Point[];

export type WrapPiece = {
  cutOutline: WrapOutline;
  bleedOutline: WrapOutline | null;
};

export function generateWrapOutline(
  geometry: WrapSegmentGeometry,
): WrapOutline {
  const isStraightSegment =
    geometry.innerRadius === null &&
    geometry.outerRadius === null &&
    geometry.sweepAngle === null;

  if (isStraightSegment) {
    return [
      { x: 0, y: 0 },
      {
        x: geometry.topCircumference,
        y: 0,
      },
      {
        x: geometry.topCircumference,
        y: geometry.height,
      },
      {
        x: 0,
        y: geometry.height,
      },
    ];
  }

  if (
    geometry.innerRadius === null ||
    geometry.outerRadius === null ||
    geometry.sweepAngle === null
  ) {
    throw new Error(
      "Tapered segment geometry is incomplete",
    );
  }

  const pointCount = 40;

  const outerArc = generateArcPoints(
    geometry.outerRadius,
    geometry.sweepAngle,
    pointCount,
  );

  const innerArc = generateArcPoints(
    geometry.innerRadius,
    geometry.sweepAngle,
    pointCount,
  );

  innerArc.reverse();

  return [...outerArc, ...innerArc];
}