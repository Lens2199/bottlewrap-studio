import type { BottleWrapOutput } from "./geometry";
import { generateArcPoints } from "./points";
import type { Point } from "./points";

export type WrapOutline = {
  body: Point[];
  shoulder: Point[] | null;
};

export function generateWrapOutline(geometry: BottleWrapOutput): WrapOutline {
  const body: Point[] = [];

  body.push({
    x: 0,
    y: 0,
  });

  body.push({
    x: geometry.bodyCircumference,
    y: 0,
  });

  body.push({
    x: geometry.bodyCircumference,
    y: geometry.bodyHeight,
  });

  body.push({
    x: 0,
    y: geometry.bodyHeight,
  });

  if (
    geometry.outerRadius === null ||
    geometry.innerRadius === null ||
    geometry.sweepAngle === null
  ) {
    return {
      body,
      shoulder: null,
    };
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

  const shoulder: Point[] = [...outerArc, ...innerArc];

  return {
    body,
    shoulder,
  };
}
