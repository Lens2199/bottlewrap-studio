import type { BottleWrapOutput } from "./geometry";
import type { WrapOutline } from "./outline";
import { generateArcPoints, type Point } from "./points";
import { calculateBounds } from "./svg";

export function applyPadding(
  outline: WrapOutline,
  geometry: BottleWrapOutput,
  bleed: number,
  seamOverlap: number,
): WrapOutline {
  const bounds = calculateBounds(outline.body);

  const paddedBody: Point[] = [
    {
      x: bounds.minX - bleed,
      y: bounds.minY - bleed,
    },
    {
      x: bounds.maxX + bleed + seamOverlap,
      y: bounds.minY - bleed,
    },
    {
      x: bounds.maxX + bleed + seamOverlap,
      y: bounds.maxY + bleed,
    },
    {
      x: bounds.minX - bleed,
      y: bounds.maxY + bleed,
    },
  ];

  if (outline.shoulder === null) {
    return {
      body: paddedBody,
      shoulder: null,
    };
  }

  const { outerRadius, innerRadius, sweepAngle } = geometry;

  if (outerRadius === null || innerRadius === null || sweepAngle === null) {
    throw new Error("Missing shoulder geometry");
  }

  const paddedInnerRadius = innerRadius - bleed;

  if (paddedInnerRadius <= 0) {
    throw new Error("Bleed is too large for the shoulder inner radius");
  }

  const pointCount = outline.shoulder.length / 2;
  const sweepRadians = sweepAngle * (Math.PI / 180);

  const paddedOuterArc = generateArcPoints(
    outerRadius + bleed,
    sweepAngle,
    pointCount,
  );

  const paddedInnerArc = generateArcPoints(
    paddedInnerRadius,
    sweepAngle,
    pointCount,
  );

  paddedInnerArc.reverse();

  const paddedOuterStart = paddedOuterArc[0];
  const paddedOuterEnd = paddedOuterArc[paddedOuterArc.length - 1];

  const paddedInnerEnd = paddedInnerArc[0];
  const paddedInnerStart = paddedInnerArc[paddedInnerArc.length - 1];

  // Outside the starting edge points toward angles below zero.
  const startOutwardX = 0;
  const startOutwardY = -1;

  // Outside the ending edge points toward angles above the sweep.
  const endOutwardX = -Math.sin(sweepRadians);
  const endOutwardY = Math.cos(sweepRadians);

  const startDistance = bleed;
  const endDistance = bleed + seamOverlap;

  const shiftedOuterEnd: Point = {
    x: paddedOuterEnd.x + endOutwardX * endDistance,
    y: paddedOuterEnd.y + endOutwardY * endDistance,
  };

  const shiftedInnerEnd: Point = {
    x: paddedInnerEnd.x + endOutwardX * endDistance,
    y: paddedInnerEnd.y + endOutwardY * endDistance,
  };

  const shiftedInnerStart: Point = {
    x: paddedInnerStart.x + startOutwardX * startDistance,
    y: paddedInnerStart.y + startOutwardY * startDistance,
  };

  const shiftedOuterStart: Point = {
    x: paddedOuterStart.x + startOutwardX * startDistance,
    y: paddedOuterStart.y + startOutwardY * startDistance,
  };

  const paddedShoulder: Point[] = [
    ...paddedOuterArc,
    shiftedOuterEnd,
    shiftedInnerEnd,
    ...paddedInnerArc,
    shiftedInnerStart,
    shiftedOuterStart,
  ];

  return {
    body: paddedBody,
    shoulder: paddedShoulder,
  };
}
