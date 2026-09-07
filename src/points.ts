export type Point = {
  x: number;
  y: number;
};

export function generateArcPoints(
  radius: number,
  sweepAngle: number,
  pointCount: number,
): Point[] {
  const points: Point[] = [];

  if(pointCount < 2){
    throw new Error("pointCount must be at least 2")
  }

  // Calculate the angle between consecutive points
  const step = sweepAngle / (pointCount - 1);

  for (let i = 0; i < pointCount; i++) {
    const angleInDegrees = i * step;
    const angleInRadians = angleInDegrees * (Math.PI / 180);

    const x = radius * Math.cos(angleInRadians);
    const y = radius * Math.sin(angleInRadians);

    points.push({
      x,
      y,
    });
  }

  return points;
}
