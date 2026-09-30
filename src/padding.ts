import type { WrapSegmentGeometry } from "./geometry";
import type {
  WrapOutline,
  WrapPiece,
} from "./outline";
import {
  generateArcPoints,
  type Point,
} from "./points";
import { calculateBounds } from "./svg";

function generatePaddedOutline(
  outline: WrapOutline,
  geometry: WrapSegmentGeometry,
  bleed: number,
  seamOverlap: number,
): WrapOutline {
  if (bleed === 0 && seamOverlap === 0) {
    return outline;
  }

  const isStraightSegment =
    geometry.innerRadius === null &&
    geometry.outerRadius === null &&
    geometry.sweepAngle === null;

  if (isStraightSegment) {
    const bounds = calculateBounds(outline);

    return [
      {
        x: bounds.minX - bleed,
        y: bounds.minY - bleed,
      },
      {
        x:
          bounds.maxX +
          bleed +
          seamOverlap,
        y: bounds.minY - bleed,
      },
      {
        x:
          bounds.maxX +
          bleed +
          seamOverlap,
        y: bounds.maxY + bleed,
      },
      {
        x: bounds.minX - bleed,
        y: bounds.maxY + bleed,
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

  const paddedInnerRadius =
    geometry.innerRadius - bleed;

  if (paddedInnerRadius <= 0) {
    throw new Error(
      "Bleed is too large for the segment inner radius",
    );
  }

  const paddedOuterRadius =
    geometry.outerRadius + bleed;

  const pointCount = outline.length / 2;

  const paddedOuterArc = generateArcPoints(
    paddedOuterRadius,
    geometry.sweepAngle,
    pointCount,
  );

  const paddedInnerArc = generateArcPoints(
    paddedInnerRadius,
    geometry.sweepAngle,
    pointCount,
  );

  paddedInnerArc.reverse();

  const sweepRadians =
    geometry.sweepAngle * (Math.PI / 180);

  const startOutwardX = 0;
  const startOutwardY = -1;

  const endOutwardX = -Math.sin(
    sweepRadians,
  );

  const endOutwardY = Math.cos(
    sweepRadians,
  );

  const startDistance = bleed;
  const endDistance = bleed + seamOverlap;

  const paddedOuterStart = paddedOuterArc[0];

  const paddedOuterEnd =
    paddedOuterArc[paddedOuterArc.length - 1];

  const paddedInnerEnd = paddedInnerArc[0];

  const paddedInnerStart =
    paddedInnerArc[paddedInnerArc.length - 1];

  const shiftedOuterEnd: Point = {
    x:
      paddedOuterEnd.x +
      endOutwardX * endDistance,
    y:
      paddedOuterEnd.y +
      endOutwardY * endDistance,
  };

  const shiftedInnerEnd: Point = {
    x:
      paddedInnerEnd.x +
      endOutwardX * endDistance,
    y:
      paddedInnerEnd.y +
      endOutwardY * endDistance,
  };

  const shiftedInnerStart: Point = {
    x:
      paddedInnerStart.x +
      startOutwardX * startDistance,
    y:
      paddedInnerStart.y +
      startOutwardY * startDistance,
  };

  const shiftedOuterStart: Point = {
    x:
      paddedOuterStart.x +
      startOutwardX * startDistance,
    y:
      paddedOuterStart.y +
      startOutwardY * startDistance,
  };

  return [
    ...paddedOuterArc,
    shiftedOuterEnd,
    shiftedInnerEnd,
    ...paddedInnerArc,
    shiftedInnerStart,
    shiftedOuterStart,
  ];
}

export function generateWrapPiece(
  originalOutline: WrapOutline,
  geometry: WrapSegmentGeometry,
  bleed: number,
  seamOverlap: number,
): WrapPiece {
  const cutOutline = generatePaddedOutline(
    originalOutline,
    geometry,
    0,
    seamOverlap,
  );

  const bleedOutline =
    bleed === 0
      ? null
      : generatePaddedOutline(
          originalOutline,
          geometry,
          bleed,
          seamOverlap,
        );

  return {
    cutOutline,
    bleedOutline,
  };
}